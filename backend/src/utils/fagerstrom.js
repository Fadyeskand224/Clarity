// Standard 6-item Fagerström Test for Nicotine Dependence (FTND).
// Scoring is the single source of truth used by the assessment route, the
// medication recommendation, and the clinician PDF export (BRD 4.7).

export const FAGERSTROM_QUESTIONS = [
  {
    id: 'time_to_first_cigarette',
    question: 'How soon after you wake up do you smoke your first cigarette?',
    options: [
      { label: 'Within 5 minutes', points: 3 },
      { label: '6–30 minutes', points: 2 },
      { label: '31–60 minutes', points: 1 },
      { label: 'After 60 minutes', points: 0 },
    ],
  },
  {
    id: 'difficult_refrain',
    question:
      'Do you find it difficult to refrain from smoking in places where it is forbidden (e.g., library, cinema, place of worship)?',
    options: [
      { label: 'Yes', points: 1 },
      { label: 'No', points: 0 },
    ],
  },
  {
    id: 'hate_to_give_up',
    question: 'Which cigarette would you hate most to give up?',
    options: [
      { label: 'The first one in the morning', points: 1 },
      { label: 'Any other', points: 0 },
    ],
  },
  {
    id: 'cigarettes_per_day',
    question: 'How many cigarettes per day do you smoke?',
    options: [
      { label: '10 or fewer', points: 0 },
      { label: '11–20', points: 1 },
      { label: '21–30', points: 2 },
      { label: '31 or more', points: 3 },
    ],
  },
  {
    id: 'more_frequent_morning',
    question:
      'Do you smoke more frequently during the first hours after waking than during the rest of the day?',
    options: [
      { label: 'Yes', points: 1 },
      { label: 'No', points: 0 },
    ],
  },
  {
    id: 'smoke_when_ill',
    question: 'Do you smoke even if you are so ill that you are in bed most of the day?',
    options: [
      { label: 'Yes', points: 1 },
      { label: 'No', points: 0 },
    ],
  },
];

export function scoreFagerstrom(answers) {
  // answers: [{ questionId, optionIndex }]
  if (!Array.isArray(answers) || answers.length !== FAGERSTROM_QUESTIONS.length) {
    throw new Error('answers must include a response for all 6 questions');
  }

  let score = 0;
  const normalized = [];

  for (const q of FAGERSTROM_QUESTIONS) {
    const answer = answers.find((a) => a.questionId === q.id);
    if (!answer || typeof answer.optionIndex !== 'number' || !q.options[answer.optionIndex]) {
      throw new Error(`Missing or invalid answer for question "${q.id}"`);
    }
    const option = q.options[answer.optionIndex];
    score += option.points;
    normalized.push({ questionId: q.id, optionIndex: answer.optionIndex, label: option.label, points: option.points });
  }

  const { level, recommendation } = classify(score);
  return { score, dependenceLevel: level, recommendation, answers: normalized };
}

export function recommendationForScore(score) {
  return classify(score);
}

function classify(score) {
  if (score <= 2) {
    return {
      level: 'Very Low Dependence',
      recommendation:
        'Behavioral tools (craving management, breathing sessions, trigger tracking) are likely sufficient on their own. Medication is optional — discuss with a clinician if cravings are still difficult to manage.',
    };
  }
  if (score <= 4) {
    return {
      level: 'Low Dependence',
      recommendation:
        'Behavioral support is the foundation. A single-agent nicotine replacement therapy (NRT), such as gum or lozenge, may help with breakthrough cravings.',
    };
  }
  if (score === 5) {
    return {
      level: 'Moderate Dependence',
      recommendation:
        'Consider a single-agent NRT (patch, gum, or lozenge) alongside behavioral support. Combining medication with behavioral support roughly doubles quit success versus behavioral support alone.',
    };
  }
  if (score <= 7) {
    return {
      level: 'High Dependence',
      recommendation:
        'Combination NRT (patch plus PRN gum or lozenge) is commonly recommended. Discuss varenicline or bupropion with a clinician as an alternative or addition.',
    };
  }
  return {
    level: 'Very High Dependence',
    recommendation:
      'Combination NRT is strongly recommended, and discussing varenicline with a clinician is worth prioritizing. Closer follow-up during the first few weeks tends to help at this dependence level.',
  };
}

export const FAGERSTROM_DISCLAIMER =
  'This score is self-reported and intended to support — not replace — a full clinical assessment. Recommendations are informational, not prescriptive; discuss any medication decision with a licensed clinician.';
