import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck,
  Building,
  Award,
  Clock,
  Eye,
  Search,
} from 'lucide-react';

interface PendingDoctor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  medicalLicenseNumber: string;
  medicalCouncil: string;
  experienceYears: number;
  qualifications: string;
  appliedDate: string;
  status: 'pending' | 'verified' | 'rejected';
}

const INITIAL_DOCTORS: PendingDoctor[] = [
  {
    id: 'doc-app-1',
    fullName: 'Dr. Rajesh Rao, MD',
    email: 'rajesh.rao@example.com',
    phone: '+1 (555) 987-6543',
    specialty: 'General Internal Medicine',
    medicalLicenseNumber: 'MCI-REG-2012-98442',
    medicalCouncil: 'State Medical Council of Internal Medicine',
    experienceYears: 20,
    qualifications: 'MBBS, MD (General Medicine)',
    appliedDate: '2026-10-01',
    status: 'pending',
  },
  {
    id: 'doc-app-2',
    fullName: 'Dr. Ananya Sen, MD',
    email: 'ananya.sen@example.com',
    phone: '+1 (555) 654-3210',
    specialty: 'Dermatology & Skin Care',
    medicalLicenseNumber: 'MCI-REG-2018-44912',
    medicalCouncil: 'Board of Dermatological Specialists',
    experienceYears: 9,
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    appliedDate: '2026-10-02',
    status: 'pending',
  },
  {
    id: 'doc-app-3',
    fullName: 'Dr. Arvind Mehta, MD',
    email: 'doctor@nexuscare.example',
    phone: '+1 (555) 456-7890',
    specialty: 'Cardiology',
    medicalLicenseNumber: 'MCI-REG-2008-11234',
    medicalCouncil: 'National Board of Cardiology Examiners',
    experienceYears: 16,
    qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology), FACC',
    appliedDate: '2026-07-20',
    status: 'verified',
  },
];

export function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<PendingDoctor[]>(INITIAL_DOCTORS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

  const filtered = doctors.filter((d) => filter === 'all' || d.status === filter);

  const handleApprove = (id: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'verified' } : d)),
    );
  };

  const handleReject = (id: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Verification Queue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Verify medical licenses, certifications, and specialty credentials before enabling doctor patient bookings.
          </p>
        </div>

        <div className="flex gap-2">
          {(['pending', 'verified', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-lg font-bold text-white shadow-xs">
                  {doc.fullName
                    .replace('Dr. ', '')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{doc.fullName}</h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        doc.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status === 'verified'
                        ? '✓ Verified'
                        : doc.status === 'rejected'
                          ? 'Declined'
                          : '⏳ Pending Review'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-brand-700 mt-0.5">{doc.specialty}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.qualifications} • {doc.experienceYears} Years Clinical Experience</p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">License Number:</span> {doc.medicalLicenseNumber}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Medical Council:</span> {doc.medicalCouncil}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Email:</span> {doc.email}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Phone:</span> {doc.phone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end md:self-start">
                {doc.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(doc.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="size-4" /> Approve & Verify
                    </button>
                    <button
                      onClick={() => handleReject(doc.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle className="size-4" /> Decline
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    Application Processed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
