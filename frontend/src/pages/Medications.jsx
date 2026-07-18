import { useState } from 'react';
import {
  useMedications,
  useCreateMedication,
  useUpdateMedication,
  useLogAdherence,
  useAdherenceSummary,
} from '../api/hooks';
import AdherenceChart from '../components/charts/AdherenceChart';
import { PageHeader, Card, Button, EmptyState } from '../components/ui';

const MED_TYPES = ['NRT Patch', 'NRT Gum', 'NRT Lozenge', 'Varenicline', 'Bupropion', 'Other'];

export default function Medications() {
  const { data: regimens, isLoading } = useMedications();
  const { data: adherence } = useAdherenceSummary(7);
  const [showForm, setShowForm] = useState(false);

  const active = regimens?.filter((r) => r.active) ?? [];

  return (
    <div className="safe-top animate-fade-up px-5">
      <PageHeader title="Medications" subtitle="Track your pharmacotherapy regimen and daily doses." />

      {active.length === 0 && !isLoading && (
        <Card className="mt-4">
          <EmptyState>No active regimen yet. Add one below, or complete the Fagerström Test for a tailored suggestion.</EmptyState>
        </Card>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {active.map((regimen) => (
          <RegimenCard key={regimen.id} regimen={regimen} />
        ))}
      </div>

      <div className="mt-3">
        {showForm ? (
          <NewRegimenForm onDone={() => setShowForm(false)} />
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setShowForm(true)}>
            + Add medication
          </Button>
        )}
      </div>

      {active.length > 0 && (
        <Card className="mt-5">
          <p className="text-sm font-semibold text-ink">7-day adherence</p>
          {adherence ? <AdherenceChart data={adherence.series} /> : <EmptyState>Loading…</EmptyState>}
        </Card>
      )}

      {/* FR-6.5: evidence callout */}
      <Card className="mt-4 mb-8 border-brand-400/20 bg-brand-400/[0.06]">
        <p className="text-sm text-ink-secondary">
          <strong className="text-brand-200">Why medication helps:</strong> combining medication with behavioral
          support roughly doubles quit success compared with behavioral support alone (USPSTF cessation
          guidelines).
        </p>
      </Card>
    </div>
  );
}

function RegimenCard({ regimen }) {
  const updateMedication = useUpdateMedication();
  const logAdherence = useLogAdherence();
  const [takenToday, setTakenToday] = useState(null); // optimistic local flag

  async function markTaken() {
    await logAdherence.mutateAsync({ id: regimen.id, taken: true });
    setTakenToday(true);
  }

  async function toggleReminders() {
    await updateMedication.mutateAsync({ id: regimen.id, remindersEnabled: !regimen.reminders_enabled });
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{regimen.medication_type}</p>
          <p className="text-base font-bold text-ink">{regimen.medication_name}</p>
          <p className="text-sm text-ink-secondary">{regimen.dose_schedule}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={markTaken}
          disabled={logAdherence.isPending}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
            takenToday
              ? 'bg-gradient-to-r from-brand-400 to-cyan-glow text-[#01201d] shadow-[0_0_16px_-4px_rgba(45,212,191,0.7)]'
              : 'glass-panel text-brand-300 hover:border-brand-400/40'
          }`}
        >
          {takenToday ? '✓ Taken today' : "Mark today's dose taken"}
        </button>

        <label className="flex items-center gap-2 text-xs text-ink-secondary">
          Reminders
          <input type="checkbox" checked={regimen.reminders_enabled} onChange={toggleReminders} className="h-4 w-4 accent-brand-400" />
        </label>
      </div>
    </Card>
  );
}

function NewRegimenForm({ onDone }) {
  const createMedication = useCreateMedication();
  const [medicationType, setMedicationType] = useState(MED_TYPES[0]);
  const [medicationName, setMedicationName] = useState('');
  const [doseSchedule, setDoseSchedule] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (!medicationName || !doseSchedule) return;
    await createMedication.mutateAsync({ medicationType, medicationName, doseSchedule, remindersEnabled: false });
    onDone();
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <select
          value={medicationType}
          onChange={(e) => setMedicationType(e.target.value)}
          className="input-glass"
        >
          {MED_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#10151f] text-ink">
              {t}
            </option>
          ))}
        </select>
        <input
          placeholder="Name (e.g. Nicotine Patch 21mg)"
          value={medicationName}
          onChange={(e) => setMedicationName(e.target.value)}
          className="input-glass"
        />
        <input
          placeholder="Dose schedule (e.g. 1 patch daily, PRN gum as needed)"
          value={doseSchedule}
          onChange={(e) => setDoseSchedule(e.target.value)}
          className="input-glass"
        />
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onDone} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={createMedication.isPending} className="flex-1">
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
}
