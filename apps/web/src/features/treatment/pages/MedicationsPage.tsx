import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import {
  Pill,
  BellRing,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Plus,
  Clock,
  Calendar,
  Flame,
  AlertTriangle,
  Stethoscope,
  Filter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { TreatmentMedicine } from '../types';

export function MedicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') === 'reminders' ? 'reminders' : 'medicines';

  const { medicines, reminders } = useTreatmentStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'stopped'>('all');
  const [addMedicineModal, setAddMedicineModal] = useState(false);
  const [refillToast, setRefillToast] = useState<string | null>(null);

  // New medicine form state
  const [newName, setNewName] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newSlot, setNewSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [newInstructions, setNewInstructions] = useState('');

  const filteredMedicines = medicines.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const takenCount = reminders.filter((r) => r.status === 'taken').length;
  const adherenceRate = Math.round((takenCount / (reminders.length || 1)) * 100);

  const handleRefill = (med: TreatmentMedicine) => {
    const product = treatmentStore.refillMedicine(med.id);
    setRefillToast(`Added 30-day supply of ${med.name} to your pharmacy cart.`);
    setTimeout(() => setRefillToast(null), 4000);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMedId = `med-${Date.now()}`;
    const newMed: TreatmentMedicine = {
      id: newMedId,
      patientId: '00000000-0000-4000-8000-000000000001',
      name: newName.trim(),
      brand: newName.trim(),
      strength: newStrength.trim() || 'Standard Dose',
      dosageForm: 'Tablet',
      instructions: `${newDosage} (${newInstructions || 'As directed'})`,
      source: 'self_reported',
      status: 'active',
      refillsRemaining: 1,
      daysSupplyRemaining: 30,
      startedOn: new Date().toISOString().split('T')[0] ?? '2026-10-03',
      dailySlots: [newSlot],
    };

    treatmentStore.uploadMedicalRecord({
      patientId: '00000000-0000-4000-8000-000000000001',
      type: 'clinical_note',
      title: `Medication Added: ${newMed.name}`,
      labOrClinic: 'Self-Reported by Patient',
      recordDate: new Date().toISOString().split('T')[0] ?? '2026-10-03',
      description: `Added ${newMed.name} ${newMed.strength} to active medication regimen.`,
      sizeBytes: 12000,
      mimeType: 'text/plain',
      hiddenFromDoctors: false,
      tags: ['Medicine', 'Self-Reported'],
      uploadedBy: 'Sarah Jenkins',
    });

    // Also add to reminders
    const timeText =
      newSlot === 'morning'
        ? '08:30 AM'
        : newSlot === 'afternoon'
          ? '01:30 PM'
          : '09:00 PM';

    treatmentStore.getState().medicines.push(newMed);
    treatmentStore.getState().reminders.push({
      id: `rem-${Date.now()}`,
      medicineId: newMedId,
      medicineName: `${newMed.name} ${newMed.strength}`,
      dosage: newDosage,
      timeSlot: newSlot,
      scheduledTime: timeText,
      timing: newInstructions || 'With water',
      status: 'pending',
      date: new Date().toISOString().split('T')[0] ?? '2026-10-03',
    });

    setAddMedicineModal(false);
    setNewName('');
    setNewStrength('');
  };

  return (
    <>
      <PageHeader
        title="Medications & Daily Dose Schedule"
        description="Track active medications, log daily doses taken or missed, monitor adherence, and request pharmacy refills."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/patient/pharmacy/cart')}
              className="gap-1.5"
            >
              <ShoppingBag className="size-4" />
              Go to Pharmacy Cart
            </Button>
            <Button onClick={() => setAddMedicineModal(true)} className="gap-1.5">
              <Plus className="size-4" />
              Add Medicine
            </Button>
          </div>
        }
      />

      <TreatmentFlowBanner currentStep={activeTab === 'reminders' ? 'reminders' : 'medicines'} />

      {/* Refill Success Notification */}
      {refillToast ? (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span className="font-semibold">{refillToast}</span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/patient/pharmacy/cart')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
          >
            Review Cart & Checkout →
          </Button>
        </div>
      ) : null}

      {/* Tab Switcher */}
      <div className="mb-6 flex border-b border-slate-200 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'medicines' })}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'medicines'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Pill className="size-4" />
          <span>Current Medicines ({medicines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'reminders' })}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'reminders'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BellRing className="size-4" />
          <span>Daily Schedule & Reminders</span>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-800 font-bold">
            {takenCount}/{reminders.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CURRENT MEDICINES */}
      {activeTab === 'medicines' && (
        <div className="space-y-6">
          {/* Low Supply Alert */}
          {medicines.some((m) => m.daysSupplyRemaining <= 7) ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="size-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-amber-900 block">Refill Reminder</span>
                  <span className="text-amber-800">
                    You have medications running low (&le; 7 days supply remaining). Order your refills early to avoid missing doses.
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const lowMed = medicines.find((m) => m.daysSupplyRemaining <= 7);
                  if (lowMed) handleRefill(lowMed);
                  navigate('/patient/pharmacy/cart');
                }}
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
              >
                1-Click Refill All Low Meds
              </Button>
            </div>
          ) : null}

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'paused', 'stopped'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st} Medicines
              </button>
            ))}
          </div>

          {/* Medicines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicines.map((med) => {
              const isRunningLow = med.daysSupplyRemaining <= 7;

              return (
                <Card key={med.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                          <Pill className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{med.name}</h3>
                            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-800 border border-brand-200">
                              {med.strength}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{med.brand} • {med.dosageForm}</p>
                        </div>
                      </div>

                      <Badge
                        tone={
                          med.status === 'active'
                            ? 'success'
                            : med.status === 'paused'
                              ? 'warning'
                              : 'neutral'
                        }
                        className="capitalize"
                      >
                        {med.status}
                      </Badge>
                    </div>

                    <div className="mt-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700 block mb-0.5">Instructions:</span>
                      <p className="text-slate-600">{med.instructions}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-slate-500 text-[11px] block">Days Supply Left</span>
                        <span
                          className={`font-bold ${
                            isRunningLow ? 'text-amber-700' : 'text-slate-900'
                          }`}
                        >
                          {med.daysSupplyRemaining} days left {isRunningLow && '⚠️'}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-slate-500 text-[11px] block">Refills Authorized</span>
                        <span className="font-bold text-slate-900">
                          {med.refillsRemaining} refills left
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500">
                      Prescribed by:{' '}
                      <span className="font-medium text-slate-700">
                        {med.prescribedBy || 'Self-Reported'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Refill button & status switcher */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <select
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-brand-500"
                      value={med.status}
                      onChange={(e) =>
                        treatmentStore.updateMedicineStatus(med.id, e.target.value as any)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="stopped">Stopped</option>
                    </select>

                    <Button
                      size="sm"
                      onClick={() => handleRefill(med)}
                      className="bg-brand-600 hover:bg-brand-700 text-xs gap-1.5 font-semibold"
                    >
                      <ShoppingBag className="size-3.5" />
                      Refill Medicine
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY SCHEDULE & REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Adherence Streak Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-sky-700 p-5 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs">
                    <Flame className="size-3.5 text-amber-300 fill-amber-300" />
                    14-Day Streak
                  </span>
                  <span className="text-xs text-brand-100">Today's Pill Schedule</span>
                </div>
                <h3 className="mt-2 text-xl font-bold">
                  {takenCount} of {reminders.length} Doses Taken Today ({adherenceRate}%)
                </h3>
                <p className="text-xs text-brand-100 mt-0.5">
                  Consistent timing helps stabilize cardiovascular pressure and cholesterol management.
                </p>
              </div>

              {/* Progress Bar Circle / Stat */}
              <div className="flex items-center gap-3">
                <div className="size-16 rounded-full border-4 border-white/30 flex items-center justify-center font-bold text-lg bg-white/10">
                  {adherenceRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Time Slot Groups */}
          <div className="space-y-5">
            {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
              const slotReminders = reminders.filter((r) => r.timeSlot === slot);
              if (slotReminders.length === 0) return null;

              const slotTitle =
                slot === 'morning'
                  ? 'Morning Dose (08:00 AM - 09:30 AM)'
                  : slot === 'afternoon'
                    ? 'Afternoon Dose (01:00 PM - 02:00 PM)'
                    : 'Night / Bedtime Dose (08:30 PM - 09:30 PM)';

              return (
                <div key={slot} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-brand-600" />
                    {slotTitle}
                  </h4>

                  <div className="space-y-3">
                    {slotReminders.map((rem) => {
                      const isTaken = rem.status === 'taken';
                      const isMissed = rem.status === 'missed';

                      return (
                        <div
                          key={rem.id}
                          className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                            isTaken
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : isMissed
                                ? 'bg-rose-50/60 border-rose-300'
                                : 'bg-white border-slate-200 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                                isTaken
                                  ? 'bg-emerald-200 text-emerald-800'
                                  : isMissed
                                    ? 'bg-rose-200 text-rose-800'
                                    : 'bg-brand-100 text-brand-700'
                              }`}
                            >
                              <Pill className="size-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">
                                  {rem.medicineName}
                                </h5>
                                <span className="text-xs text-slate-500 font-medium">({rem.dosage})</span>
                                {isTaken ? (
                                  <Badge tone="success" className="gap-1">
                                    <CheckCircle2 className="size-3" /> Taken at {rem.takenAt}
                                  </Badge>
                                ) : isMissed ? (
                                  <Badge tone="danger" className="gap-1">
                                    <XCircle className="size-3" /> Missed
                                  </Badge>
                                ) : (
                                  <Badge tone="brand">Scheduled: {rem.scheduledTime}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                Instructions: <span className="font-medium">{rem.timing}</span>
                              </p>
                            </div>
                          </div>

                          {/* Taken / Missed Toggle Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isTaken && (
                              <Button
                                size="sm"
                                onClick={() => treatmentStore.markReminderStatus(rem.id, 'taken')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 text-xs"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Mark as Taken
                              </Button>
                            )}

                            {!isMissed && !isTaken && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => treatmentStore.markReminderStatus(rem.id, 'missed')}
                                className="text-rose-700 hover:bg-rose-50 text-xs gap-1"
                              >
                                <XCircle className="size-3.5" />
                                Mark as Missed
                              </Button>
                            )}

                            {(isTaken || isMissed) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => treatmentStore.markReminderStatus(rem.id, 'pending')}
                                className="text-slate-600 text-xs gap-1"
                                title="Reset status to pending"
                              >
                                <RotateCcw className="size-3" />
                                Reset
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Medicine Dialog */}
      <Dialog open={addMedicineModal} onOpenChange={setAddMedicineModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medication to Your Schedule</DialogTitle>
            <DialogDescription>
              Record an ongoing medicine to receive daily dose reminders and track compliance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMedicine} className="space-y-4 mt-2">
            <Field label="Medicine Name" required>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Paracetamol, Metformin, Vitamin B12"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Strength" required>
                <Input
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="e.g. 500mg, 10mg"
                  required
                />
              </Field>

              <Field label="Dosage Form">
                <Select
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  options={[
                    { value: '1 Tablet', label: '1 Tablet' },
                    { value: '2 Tablets', label: '2 Tablets' },
                    { value: '1 Capsule', label: '1 Capsule' },
                    { value: '5 ml Syrup', label: '5 ml Syrup' },
                    { value: '1 Drop / Spray', label: '1 Drop / Spray' },
                  ]}
                />
              </Field>
            </div>

            <Field label="Daily Time Slot">
              <Select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value as any)}
                options={[
                  { value: 'morning', label: 'Morning (08:30 AM)' },
                  { value: 'afternoon', label: 'Afternoon (01:30 PM)' },
                  { value: 'evening', label: 'Night / Dinner (09:00 PM)' },
                ]}
              />
            </Field>

            <Field label="Timing Instructions">
              <Input
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                placeholder="e.g. Take after breakfast with water"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setAddMedicineModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newName.trim()}>
                Add Medication
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
