import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Stethoscope,
  Star,
  Video,
  MapPin,
  Calendar,
  Languages,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useTreatment } from '../../treatment/treatment-store';

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  languages: string[];
  hospital: string;
  fee: number;
  availableSlot: string;
  avatarText: string;
  bio: string;
}

const DOCTORS_DIRECTORY: DoctorProfile[] = [
  {
    id: 'doc-mehta',
    name: 'Dr. Arvind Mehta, MD',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology), FACC',
    experienceYears: 16,
    rating: 4.9,
    reviewsCount: 342,
    languages: ['English', 'Hindi', 'Gujarati'],
    hospital: 'Apex Heart & Vascular Institute',
    fee: 45,
    availableSlot: 'Today, 04:30 PM',
    avatarText: 'AM',
    bio: 'Specialist in preventive cardiology, hypertensive vascular disease, and coronary rhythm management.',
  },
  {
    id: 'doc-sharma',
    name: 'Dr. Priya Sharma, MD',
    specialty: 'Endocrinology & Diabetes',
    qualifications: 'MBBS, MD (Medicine), Fellowship in Endocrinology (AIIMS)',
    experienceYears: 12,
    rating: 4.8,
    reviewsCount: 219,
    languages: ['English', 'Hindi', 'Punjabi'],
    hospital: 'Metabolic & Endocrine Center',
    fee: 40,
    availableSlot: 'Tomorrow, 10:00 AM',
    avatarText: 'PS',
    bio: 'Expert in glycemic regulation, insulin resistance, thyroid disorders, and lifestyle metabolic optimization.',
  },
  {
    id: 'doc-rao',
    name: 'Dr. Rajesh Rao, MD',
    specialty: 'General Internal Medicine',
    qualifications: 'MBBS, MD (General Medicine)',
    experienceYears: 20,
    rating: 4.9,
    reviewsCount: 512,
    languages: ['English', 'Hindi', 'Kannada'],
    hospital: 'City Life Care Multi-Specialty',
    fee: 35,
    availableSlot: 'Today, 06:00 PM',
    avatarText: 'RR',
    bio: 'Comprehensive primary care, multi-morbid chronic disease management, and adult preventive wellness.',
  },
  {
    id: 'doc-sen',
    name: 'Dr. Ananya Sen, MD',
    specialty: 'Dermatology & Skin Care',
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 9,
    rating: 4.7,
    reviewsCount: 184,
    languages: ['English', 'Hindi', 'Bengali'],
    hospital: 'DermaCare Laser & Aesthetics',
    fee: 38,
    availableSlot: 'Tomorrow, 02:30 PM',
    avatarText: 'AS',
    bio: 'Clinical dermatology, allergic skin conditions, acne management, and hair & nail pathologies.',
  },
];

export function DoctorDiscoveryPage() {
  const navigate = useNavigate();
  const { bookAppointment } = useTreatment();
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [reason, setReason] = useState('');
  const [bookingTime, setBookingTime] = useState('04:30 PM');
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredDoctors = DOCTORS_DIRECTORY.filter((doc) => {
    const matchSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.languages.some((l) => l.toLowerCase().includes(search.toLowerCase()));
    const matchSpecialty = specialtyFilter === 'All' || doc.specialty.includes(specialtyFilter);
    return matchSearch && matchSpecialty;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    bookAppointment({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      patientId: '00000000-0000-4000-8000-000000000001',
      patientName: 'Sarah Jenkins',
      scheduledAt: `${new Date().toISOString().split('T')[0]}T16:30:00.000Z`,
      durationMinutes: 30,
      mode: 'video',
      status: 'scheduled',
      reasonForVisit: reason || 'Routine follow-up and clinical review',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setSelectedDoctor(null);
      setIsSuccess(false);
      navigate('/patient/appointments');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Find & Consult Verified Doctors</h1>
        <p className="mt-1 text-sm text-slate-600">
          Book instant video consultations or in-person visits with board-certified healthcare specialists.
        </p>
      </div>

      {/* Search & Specialty Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, specialty, or language..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Cardiology', 'Endocrinology', 'General Medicine', 'Dermatology'].map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(spec)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                specialtyFilter === spec
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div>
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-lg font-bold text-white shadow-xs">
                  {doc.avatarText}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 truncate">{doc.name}</h3>
                    <ShieldCheck className="size-4 text-brand-600 shrink-0" />
                  </div>
                  <p className="text-xs font-semibold text-brand-700">{doc.specialty}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">{doc.qualifications}</p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" /> {doc.rating}
                    </span>
                    <span>• {doc.experienceYears} yrs exp</span>
                    <span>• {doc.hospital}</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                {doc.bio}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Languages className="size-3.5 text-slate-400" />
                  {doc.languages.join(', ')}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <span className="text-[11px] text-slate-400">Consultation Fee</span>
                <div className="text-base font-extrabold text-slate-900">${doc.fee}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800 transition-colors"
                >
                  <Video className="size-3.5" /> Book Video Visit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Book Video Consultation</h2>
                <p className="text-xs text-slate-500">with {selectedDoctor.name} ({selectedDoctor.specialty})</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-7" />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Appointment Confirmed!</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Redirecting to your appointments schedule...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-brand-700" />
                    <span className="text-xs font-bold text-slate-900">Next Slot Available</span>
                  </div>
                  <span className="text-xs font-semibold text-brand-700">{selectedDoctor.availableSlot}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Select Time</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="04:30 PM">04:30 PM (Today)</option>
                    <option value="05:30 PM">05:30 PM (Today)</option>
                    <option value="10:00 AM">10:00 AM (Tomorrow)</option>
                    <option value="02:30 PM">02:30 PM (Tomorrow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Reason for Consultation
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Follow-up on blood pressure, review recent lipid profile results, dosage check..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-500 focus:outline-hidden"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-700">Total Consultation Fee:</span>
                  <span className="text-base font-bold text-slate-900">${selectedDoctor.fee}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-700 px-5 py-2 text-xs font-bold text-white hover:bg-brand-800 shadow-xs"
                  >
                    Confirm & Book Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
