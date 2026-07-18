import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFagerstromQuestions, useSubmitFagerstrom } from '../api/hooks';
import { Button, ErrorText } from '../components/ui';

export default function Fagerstrom() {
  const { data, isLoading } = useFagerstromQuestions();
  const submit = useSubmitFagerstrom();

  const [step, setStep] = useState(0); // 0..n-1 questions, n = result
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (isLoading || !data) {
    return <div className="safe-top relative z-10 px-5 py-10 text-center text-ink-secondary">Loading assessment…</div>;
  }

  const { questions, disclaimer } = data;

  if (result) return <ResultScreen result={result} disclaimer={disclaimer} />;

  if (step >= questions.length) {
    return (
      <ReviewScreen
        questions={questions}
        answers={answers}
        onBack={() => setStep(questions.length - 1)}
        onSubmit={async () => {
          setError('');
          try {
            const payload = questions.map((q) => ({ questionId: q.id, optionIndex: answers[q.id] }));
            const res = await submit.mutateAsync(payload);
            setResult(res);
          } catch {
            setError('Could not submit your assessment. Please try again.');
          }
        }}
        submitting={submit.isPending}
        error={error}
      />
    );
  }

  const question = questions[step];
  const selected = answers[question.id];

  return (
    <div className="safe-top animate-fade-up relative z-10 flex min-h-screen flex-col px-6 pb-10">
      <div className="pt-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
          Question {step + 1} of {questions.length}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-cyan-glow shadow-[0_0_10px_-1px_rgba(45,212,191,0.8)] transition-[width] duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="mt-6 text-xl font-bold text-ink">{question.question}</h1>

      <div className="mt-6 flex flex-col gap-2">
        {question.options.map((label, idx) => (
          <button
            key={label}
            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: idx }))}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
              selected === idx
                ? 'border-brand-400/50 bg-brand-400/15 text-brand-200 shadow-[0_0_16px_-6px_rgba(45,212,191,0.7)]'
                : 'glass-panel text-ink hover:border-white/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex gap-2 pt-8">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button disabled={selected === undefined} onClick={() => setStep((s) => s + 1)} className="flex-1">
          {step === questions.length - 1 ? 'Review' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

function ReviewScreen({ questions, answers, onBack, onSubmit, submitting, error }) {
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  return (
    <div className="safe-top animate-fade-up relative z-10 flex min-h-screen flex-col px-6 pb-10">
      <h1 className="mt-2 text-xl font-bold text-ink">Review your answers</h1>
      <div className="mt-4 flex flex-col gap-2">
        {questions.map((q) => (
          <div key={q.id} className="glass-panel rounded-xl px-4 py-3">
            <p className="text-xs text-ink-muted">{q.question}</p>
            <p className="text-sm font-semibold text-ink">
              {answers[q.id] !== undefined ? q.options[answers[q.id]] : '—'}
            </p>
          </div>
        ))}
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-auto flex gap-2 pt-6">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button disabled={!allAnswered || submitting} onClick={onSubmit} className="flex-1">
          {submitting ? 'Scoring…' : 'See my results'}
        </Button>
      </div>
    </div>
  );
}

function ResultScreen({ result, disclaimer }) {
  const navigate = useNavigate();
  return (
    <div className="safe-top animate-fade-up relative z-10 flex min-h-screen flex-col px-6 pb-10 text-center">
      <div className="flex-1">
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-300">Your result</p>
        <p className="mt-2 bg-gradient-to-r from-brand-300 to-cyan-glow bg-clip-text text-5xl font-extrabold text-transparent">
          {result.result.score}
          <span className="text-2xl text-ink-muted">/10</span>
        </p>
        <p className="mt-1 text-lg font-bold text-ink">{result.result.dependence_level}</p>

        <div className="glass-panel mt-6 rounded-xl px-4 py-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">Recommendation</p>
          <p className="mt-1 text-sm text-ink">{result.recommendation}</p>
        </div>

        <p className="mt-4 text-xs text-ink-muted">{disclaimer}</p>
      </div>

      {/* FR-5.4: routes directly into medication setup */}
      <div className="flex flex-col gap-2 pt-6">
        <Button onClick={() => navigate('/medications', { replace: true })} className="w-full">
          Set up medication tracking
        </Button>
        <Link to="/" className="text-sm font-semibold text-ink-secondary hover:text-ink">
          Back to home
        </Link>
      </div>
    </div>
  );
}
