import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { PrescriptionSlipModal } from '../components/PrescriptionSlipModal';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Activity,
  ShieldCheck,
  Send,
  ClipboardList,
  Sparkles,
  Maximize2,
  Stethoscope,
  Heart,
} from 'lucide-react';
import type { TreatmentConsultation, TreatmentPrescription } from '../types';

export function ConsultationRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consultations, prescriptions } = useTreatmentStore();

  const fallbackConsultation: TreatmentConsultation = {
    id: 'con-101',
    appointmentId: 'apt-101',
    doctorId: '00000000-0000-4000-8000-000000000002',
    doctorName: 'Dr. Arvind Mehta, MD',
    doctorSpecialty: 'Cardiology & Preventive Medicine',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    mode: 'video',
    status: 'in_progress',
    date: new Date().toISOString().split('T')[0] ?? '2026-10-03',
    chiefComplaint: 'Blood pressure readings fluctuating around 138/88 mmHg.',
    vitals: {
      bpSystolic: 136,
      bpDiastolic: 86,
      heartRate: 74,
      spo2: 98,
      temperatureF: 98.4,
      weightKg: 68.5,
    },
    clinicalNotes:
      'Patient advised initiation of Telmisartan 40mg + continuation of lipid lowering therapy.',
    diagnosis: 'Essential Stage 1 Hypertension (ICD-10: I10)',
    prescriptionsIssued: ['rx-201'],
    labTestsOrdered: [],
    chatMessages: [],
  };

  const consultation: TreatmentConsultation =
    consultations.find((c) => c.id === id) ?? consultations[0] ?? fallbackConsultation;

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'vitals' | 'prescription'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [selectedRx, setSelectedRx] = useState<any>(null);

  const linkedPrescription = prescriptions.find(
    (p) => p.consultationId === consultation.id || consultation.prescriptionsIssued?.includes(p.id),
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    treatmentStore.addConsultationMessage(
      consultation.id,
      chatInput.trim(),
      'patient',
      'Sarah Jenkins',
    );
    setChatInput('');

    // Simulate friendly doctor response after 1 second
    setTimeout(() => {
      treatmentStore.addConsultationMessage(
        consultation.id,
        'Understood Sarah. Your medication plan is updated in your profile and sent to our partner pharmacy.',
        'doctor',
        consultation.doctorName,
      );
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Telehealth Consultation Room
            </h1>
            <Badge tone="success" className="gap-1 animate-pulse">
              <span className="size-2 rounded-full bg-emerald-500 inline-block" /> Live Encrypted Call
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulting with <span className="font-semibold text-slate-800">{consultation.doctorName}</span> ({consultation.doctorSpecialty})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/patient/consultations">
            <Button variant="outline" size="sm">
              Back to Consultations
            </Button>
          </Link>
        </div>
      </div>

      <TreatmentFlowBanner currentStep="consultation" />

      {/* Main Video & Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Virtual Video Screen */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden min-h-[460px]">
          {/* Top Bar inside Video */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 text-white border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span className="font-semibold">End-to-End Encrypted HD Video (HIPAA & FHIR Compliant)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="inline-block size-2 rounded-full bg-rose-500 animate-ping" />
              <span>REC 00:14:32</span>
            </div>
          </div>

          {/* Video Feed Simulation */}
          <div className="flex-1 relative flex items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-slate-950">
            {videoOn ? (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="size-28 sm:size-36 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 p-1 shadow-2xl flex items-center justify-center">
                    <div className="size-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white uppercase tracking-wider">
                      Dr. AM
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-2 rounded-full bg-emerald-500 ring-4 ring-slate-900 size-5 flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-white text-base tracking-wide">
                  {consultation.doctorName}
                </h3>
                <p className="text-xs text-sky-300 font-medium">{consultation.doctorSpecialty}</p>
                <div className="mt-2 flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-[11px] text-slate-300 border border-slate-700">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Speaking • High Quality 1080p</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <VideoOff className="size-12 mx-auto mb-2 text-slate-500" />
                <p className="text-sm">Video Paused</p>
              </div>
            )}

            {/* Self-view PIP floating window */}
            <div className="absolute bottom-4 right-4 size-28 sm:size-32 rounded-xl bg-slate-800 border-2 border-slate-700 shadow-lg overflow-hidden flex flex-col justify-end p-2 text-white">
              <span className="text-[10px] font-semibold bg-slate-950/80 px-1.5 py-0.5 rounded w-fit">
                You (Sarah)
              </span>
            </div>
          </div>

          {/* Bottom Call Controls Toolbar */}
          <div className="flex items-center justify-center gap-3 bg-slate-900 p-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setMicOn(!micOn)}
              className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                micOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-rose-600 text-white'
              }`}
              title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
            </button>

            <button
              type="button"
              onClick={() => setVideoOn(!videoOn)}
              className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                videoOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-rose-600 text-white'
              }`}
              title={videoOn ? 'Stop Camera' : 'Start Camera'}
            >
              {videoOn ? <VideoIcon className="size-5" /> : <VideoOff className="size-5" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className="flex size-11 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              title="Open Chat"
            >
              <MessageSquare className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                treatmentStore.updateAppointmentStatus(consultation.appointmentId, 'completed');
                navigate('/patient/consultations');
              }}
              className="flex size-11 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg"
              title="Leave Consultation"
            >
              <PhoneOff className="size-5" />
            </button>
          </div>
        </div>

        {/* Right Col: Consultation Workspace (Chat, Vitals, Prescription) */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Tab selector */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeTab === 'chat'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Doctor Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeTab === 'vitals'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Live Vitals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prescription')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeTab === 'prescription'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Prescription
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[380px]">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-3 mb-3">
                  <div className="rounded-lg bg-slate-100 p-2.5 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">NexusCare System:</span>
                    Consultation started at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Audio/video channels connected.
                  </div>

                  {consultation.chatMessages?.map((msg: NonNullable<TreatmentConsultation['chatMessages']>[number]) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'patient' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-2xs ${
                          msg.sender === 'patient'
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

                <form onSubmit={handleSendMessage} className="mt-auto flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message to your doctor..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                  <Button type="submit" size="sm" className="px-3" disabled={!chatInput.trim()}>
                    <Send className="size-3.5" />
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-3 text-xs">
                <div className="rounded-lg bg-brand-50 p-3 border border-brand-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-brand-600 animate-pulse" />
                    <div>
                      <span className="font-bold text-slate-900 block">Connected Device Telemetry</span>
                      <span className="text-[11px] text-slate-600">NexusCare Smart Health Monitor</span>
                    </div>
                  </div>
                  <Badge tone="success">Synced</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Systolic / Diastolic</span>
                    <span className="font-bold text-base text-slate-900">
                      {consultation.vitals.bpSystolic}/{consultation.vitals.bpDiastolic} mmHg
                    </span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">Stage 1 Hypertensive</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Pulse Heart Rate</span>
                    <span className="font-bold text-base text-slate-900">
                      {consultation.vitals.heartRate} bpm
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Normal Sinus</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Blood Oxygen (SpO2)</span>
                    <span className="font-bold text-base text-slate-900">
                      {consultation.vitals.spo2}%
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Optimal</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Temperature</span>
                    <span className="font-bold text-base text-slate-900">
                      {consultation.vitals.temperatureF}°F
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Afebrile</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                  <span className="font-semibold text-slate-800 block mb-1">Doctor Diagnosis:</span>
                  <p className="font-bold text-brand-900">{consultation.diagnosis}</p>
                </div>
              </div>
            )}

            {activeTab === 'prescription' && (
              <div className="space-y-3 text-xs">
                {linkedPrescription ? (
                  <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-900 flex items-center gap-1.5">
                        <ClipboardList className="size-4" /> Prescription #{linkedPrescription.id.toUpperCase()}
                      </span>
                      <Badge tone="success">Issued</Badge>
                    </div>

                    <div className="space-y-1.5">
                      {linkedPrescription.items.map((item, i) => (
                        <div key={i} className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900">{item.medicineName}</span>{' '}
                          <span className="text-slate-500">({item.strength})</span>
                          <p className="text-[11px] text-slate-600">
                            {item.dosage} • {item.frequency} • {item.instructions}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRx(linkedPrescription)}
                        className="w-full gap-1"
                      >
                        <ClipboardList className="size-3.5" />
                        View Full Prescription Slip
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          treatmentStore.loadPrescriptionIntoPharmacyCart(linkedPrescription.id);
                          navigate('/patient/pharmacy/cart');
                        }}
                        className="w-full"
                      >
                        Order via Pharmacy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
                    <ClipboardList className="size-8 mx-auto mb-2 text-slate-400" />
                    <p>Doctor has not finalized prescription items yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Slip Modal */}
      {selectedRx ? (
        <PrescriptionSlipModal prescription={selectedRx} onClose={() => setSelectedRx(null)} />
      ) : null}
    </div>
  );
}
