import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { PrescriptionSlipModal } from '../components/PrescriptionSlipModal';
import {
  Stethoscope,
  Video,
  Activity,
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle2,
  User,
  ShieldCheck,
  Send,
  PhoneOff,
  Mic,
  MicOff,
} from 'lucide-react';
import type { TreatmentPrescriptionItem, TreatmentVitals } from '../types';

export function DoctorConsultationsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { consultations, prescriptions } = useTreatmentStore();

  const conIdParam = searchParams.get('conId');
  const activeConsultation =
    consultations.find((c) => c.id === conIdParam) ?? consultations[0];

  // Clinical form state
  const [bpSys, setBpSys] = useState(activeConsultation?.vitals?.bpSystolic ?? 136);
  const [bpDia, setBpDia] = useState(activeConsultation?.vitals?.bpDiastolic ?? 86);
  const [hr, setHr] = useState(activeConsultation?.vitals?.heartRate ?? 74);
  const [spo2, setSpo2] = useState(activeConsultation?.vitals?.spo2 ?? 98);
  const [temp, setTemp] = useState(activeConsultation?.vitals?.temperatureF ?? 98.4);
  const [weight, setWeight] = useState(activeConsultation?.vitals?.weightKg ?? 68.5);

  const [clinicalNotes, setClinicalNotes] = useState(
    activeConsultation?.clinicalNotes ||
      'Patient reports consistent morning elevations in BP. S1/S2 distinct, no carotid bruits. Peripheral pulses bilaterally intact. Advised initiation of Telmisartan 40mg + continuation of lipid lowering therapy.',
  );
  const [diagnosis, setDiagnosis] = useState(
    activeConsultation?.diagnosis || 'Essential Stage 1 Hypertension (ICD-10: I10); Borderline Dyslipidemia',
  );
  const [instructions, setInstructions] = useState(
    'Take blood pressure medication consistently every morning after breakfast. Monitor home BP 3x weekly. Avoid excessive dietary sodium (<2g/day).',
  );

  // Prescription items state
  const [rxItems, setRxItems] = useState<Omit<TreatmentPrescriptionItem, 'id'>[]>([
    {
      medicineName: 'Telmisartan',
      strength: '40 mg',
      dosage: '1 Tablet',
      frequency: 'Once daily (OD)',
      timing: 'after_meal',
      duration: '30 days',
      instructions: 'Take in the morning with water after breakfast',
      pharmacyProductId: 'prod-telmisartan-40',
    },
    {
      medicineName: 'Atorvastatin',
      strength: '10 mg',
      dosage: '1 Tablet',
      frequency: 'Once daily at night (HS)',
      timing: 'after_meal',
      duration: '30 days',
      instructions: 'Take after dinner before bedtime',
      pharmacyProductId: 'prod-atorvastatin-10',
    },
  ]);

  const [chatInput, setChatInput] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [previewRx, setPreviewRx] = useState<any>(null);

  const handleAddMedicationRow = () => {
    setRxItems([
      ...rxItems,
      {
        medicineName: '',
        strength: '',
        dosage: '1 Tablet',
        frequency: 'Once daily',
        timing: 'after_meal',
        duration: '14 days',
        instructions: 'Take as advised',
      },
    ]);
  };

  const handleRemoveMedicationRow = (idx: number) => {
    setRxItems(rxItems.filter((_, i) => i !== idx));
  };

  const handleUpdateMedItem = (idx: number, field: string, value: string) => {
    setRxItems(
      rxItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConsultation) return;

    treatmentStore.addConsultationMessage(
      activeConsultation.id,
      chatInput.trim(),
      'doctor',
      'Dr. Arvind Mehta, MD',
    );
    setChatInput('');
  };

  const handleCompleteAndPrescribe = () => {
    if (!activeConsultation) return;

    const vitals: TreatmentVitals = {
      bpSystolic: Number(bpSys),
      bpDiastolic: Number(bpDia),
      heartRate: Number(hr),
      spo2: Number(spo2),
      temperatureF: Number(temp),
      weightKg: Number(weight),
    };

    const validRxItems = rxItems.filter((i) => i.medicineName.trim().length > 0);

    const createdPrescription = treatmentStore.completeConsultationWithPrescription(
      activeConsultation.id,
      clinicalNotes,
      diagnosis,
      vitals,
      validRxItems,
      instructions,
    );

    setCompletedSuccess(true);
    if (createdPrescription) {
      setPreviewRx(createdPrescription);
    }
  };

  if (!activeConsultation) {
    return (
      <div className="p-8 text-center">
        <p>No active consultations.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Doctor Clinical Telehealth Workspace
            </h1>
            <Badge tone="brand">Doctor Console</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: <span className="font-semibold text-slate-800">{activeConsultation.patientName}</span> • Consultation ID: {activeConsultation.id}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/doctor/prescriptions')}
          className="text-xs"
        >
          View All Issued Prescriptions
        </Button>
      </div>

      <TreatmentFlowBanner currentStep="consultation" isDoctor={true} />

      {completedSuccess ? (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-300 p-6 text-center space-y-3">
          <CheckCircle2 className="size-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">
            Consultation Completed & Digital Prescription Issued!
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            The consultation summary and signed digital prescription has been archived into Sarah Jenkins's medical records, synchronized to her daily medication reminders, and sent to the online pharmacy.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {previewRx ? (
              <Button size="sm" onClick={() => setPreviewRx(previewRx)} className="gap-1.5 font-semibold">
                <ClipboardList className="size-4" />
                View Generated Prescription Slip
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/doctor/appointments')}
            >
              Back to Appointments
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Clinical Consultation Screen & Prescription Writer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mini Video Feed Simulator */}
          <div className="rounded-2xl bg-slate-950 text-white p-4 overflow-hidden border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                Live Video Connection with {activeConsultation.patientName}
              </span>
              <span className="text-slate-400">HD 1080p • HIPAA Protected</span>
            </div>

            <div className="py-8 flex items-center justify-center">
              <div className="text-center">
                <div className="size-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-white mx-auto shadow-inner">
                  SJ
                </div>
                <h4 className="mt-2 font-bold text-sm text-slate-200">
                  {activeConsultation.patientName}
                </h4>
                <p className="text-xs text-slate-400">Audio/Video Feed Active</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMicOn(!micOn)}
                className={`p-2 rounded-full text-xs transition-colors ${
                  micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </button>
            </div>
          </div>

          {/* Vitals Input & Verification */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Activity className="size-4 text-brand-600" />
              Patient Recorded Clinical Vitals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <Field label="BP Systolic">
                <Input
                  type="number"
                  value={bpSys}
                  onChange={(e) => setBpSys(Number(e.target.value))}
                />
              </Field>

              <Field label="BP Diastolic">
                <Input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(Number(e.target.value))}
                />
              </Field>

              <Field label="Heart Rate (bpm)">
                <Input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                />
              </Field>

              <Field label="SpO2 (%)">
                <Input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                />
              </Field>

              <Field label="Temp (°F)">
                <Input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                />
              </Field>

              <Field label="Weight (kg)">
                <Input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </Field>
            </div>
          </Card>

          {/* Clinical Findings & Diagnosis */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope className="size-4 text-brand-600" />
              Clinical Notes & Confirmed Diagnosis
            </h3>

            <Field label="Confirmed Medical Diagnosis" required>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Stage 1 Hypertension (ICD-10: I10)"
                required
              />
            </Field>

            <Field label="Doctor's Clinical Examination Findings" required>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                required
              />
            </Field>
          </Card>

          {/* Write & Issue Prescription */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ClipboardList className="size-4 text-brand-600" />
                Write Digital Prescription (Rx)
              </h3>
              <Button size="sm" variant="outline" onClick={handleAddMedicationRow} className="gap-1 text-xs">
                <Plus className="size-3.5" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-3">
              {rxItems.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">Medicine #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicationRow(idx)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Remove row"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Field label="Medicine Name">
                      <Input
                        value={item.medicineName}
                        onChange={(e) => handleUpdateMedItem(idx, 'medicineName', e.target.value)}
                        placeholder="e.g. Telmisartan"
                      />
                    </Field>

                    <Field label="Strength">
                      <Input
                        value={item.strength}
                        onChange={(e) => handleUpdateMedItem(idx, 'strength', e.target.value)}
                        placeholder="e.g. 40 mg"
                      />
                    </Field>

                    <Field label="Dosage">
                      <Input
                        value={item.dosage}
                        onChange={(e) => handleUpdateMedItem(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 1 Tablet"
                      />
                    </Field>

                    <Field label="Frequency">
                      <Input
                        value={item.frequency}
                        onChange={(e) => handleUpdateMedItem(idx, 'frequency', e.target.value)}
                        placeholder="e.g. Once daily (OD)"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field label="Duration">
                      <Input
                        value={item.duration}
                        onChange={(e) => handleUpdateMedItem(idx, 'duration', e.target.value)}
                        placeholder="e.g. 30 days"
                      />
                    </Field>

                    <Field label="Instructions & Meal Timing">
                      <Input
                        value={item.instructions}
                        onChange={(e) => handleUpdateMedItem(idx, 'instructions', e.target.value)}
                        placeholder="e.g. Take in the morning after breakfast"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <Field label="General Advice & Patient Lifestyle Guidance">
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </Field>
            </div>

            {/* Complete & Sign Action */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-3">
              <Button
                size="lg"
                onClick={handleCompleteAndPrescribe}
                className="bg-brand-600 hover:bg-brand-700 font-bold gap-2 text-sm shadow-md"
              >
                <ShieldCheck className="size-4" />
                Sign Prescription & Complete Consultation
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Col: Consultation Live Chat with Patient */}
        <div className="space-y-4">
          <Card className="p-4 flex flex-col h-[520px]">
            <h4 className="font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>Patient Chat & Messaging</span>
              <Badge tone="success" className="text-[10px]">Online</Badge>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeConsultation.chatMessages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'doctor' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-2xs ${
                      msg.sender === 'doctor'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="font-semibold text-[10px] block opacity-80 mb-0.5">
                      {msg.senderName} • {msg.timestamp}
                    </span>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 pt-2 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Reply to patient..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              />
              <Button type="submit" size="sm" disabled={!chatInput.trim()}>
                <Send className="size-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {previewRx ? (
        <PrescriptionSlipModal prescription={previewRx} onClose={() => setPreviewRx(null)} />
      ) : null}
    </>
  );
}
