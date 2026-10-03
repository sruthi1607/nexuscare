import { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  HeartHandshake,
  Trash2,
  Lock,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useFamily } from '../family-store';
import type { FamilyPermissions, FamilyMember } from '../types';

export function PatientFamilyPage() {
  const { members, addMember, updatePermissions, removeMember } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form state for adding member
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Spouse');
  const [isEmergencyContact, setIsEmergencyContact] = useState(true);
  const [permissions, setPermissions] = useState<FamilyPermissions>({
    viewPrescriptions: true,
    viewLabReports: true,
    viewVitals: true,
    receiveEmergencyAlerts: true,
    manageAppointments: true,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    addMember({
      fullName,
      email,
      phone: phone || '+1 (555) 000-0000',
      relationship,
      isEmergencyContact,
      permissions,
    });

    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family & Caregivers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Invite trusted family members or caregivers and configure granular permissions for shared health data.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-800 transition-colors"
        >
          <UserPlus className="size-4" />
          Add Family Member
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-blue-900">
        <ShieldCheck className="size-5 shrink-0 text-blue-600 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold">Privacy & Access Protection</p>
          <p className="mt-0.5 text-blue-800">
            You remain in total control of your healthcare records. You can modify what each caregiver can see or revoke access at any time.
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {member.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{member.fullName}</h3>
                      {member.isEmergencyContact && (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                          Emergency Contact
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{member.relationship}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      member.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                    }`}
                  >
                    {member.status === 'active' ? 'Active' : 'Pending Invite'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-slate-400" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Granted Permissions:</span>
                  <button
                    onClick={() => setEditingMember(member)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-brand-800"
                  >
                    <SlidersHorizontal className="size-3" /> Edit
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {member.permissions.viewVitals && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      ✓ Live Vitals
                    </span>
                  )}
                  {member.permissions.receiveEmergencyAlerts && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      ✓ Emergency Alerts
                    </span>
                  )}
                  {member.permissions.viewPrescriptions && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      ✓ Prescriptions
                    </span>
                  )}
                  {member.permissions.viewLabReports && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      ✓ Lab Reports
                    </span>
                  )}
                  {member.permissions.manageAppointments && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      ✓ Appointments
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Linked since {member.joinedDate}</span>
              <button
                onClick={() => removeMember(member.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Add Family Member / Caregiver</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. David Jenkins"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="david@example.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmergencyContact}
                      onChange={(e) => setIsEmergencyContact(e.target.checked)}
                      className="size-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    Designate as Primary Emergency Contact
                  </label>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-bold text-slate-800">Select Sharing Permissions</h4>
                <div className="mt-2.5 space-y-2">
                  {[
                    { key: 'viewVitals', label: 'View Real-Time Vitals & IoT Monitoring' },
                    { key: 'receiveEmergencyAlerts', label: 'Receive Critical & Emergency Health Alerts' },
                    { key: 'viewPrescriptions', label: 'View Active Prescriptions & Medications' },
                    { key: 'viewLabReports', label: 'View Uploaded Lab Reports & Test Results' },
                    { key: 'manageAppointments', label: 'View & Assist with Doctor Appointments' },
                  ].map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(permissions as any)[p.key]}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [p.key]: e.target.checked })
                        }
                        className="size-3.5 rounded text-brand-600 focus:ring-brand-500"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800 shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">
              Edit Permissions for {editingMember.fullName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Customize what {editingMember.fullName} ({editingMember.relationship}) can access.
            </p>

            <div className="mt-4 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {[
                { key: 'viewVitals', label: 'View Real-Time Vitals & IoT Monitoring' },
                { key: 'receiveEmergencyAlerts', label: 'Receive Critical & Emergency Health Alerts' },
                { key: 'viewPrescriptions', label: 'View Active Prescriptions & Medications' },
                { key: 'viewLabReports', label: 'View Uploaded Lab Reports & Test Results' },
                { key: 'manageAppointments', label: 'View & Assist with Doctor Appointments' },
              ].map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editingMember.permissions as any)[p.key]}
                    onChange={(e) => {
                      const updated = {
                        ...editingMember.permissions,
                        [p.key]: e.target.checked,
                      };
                      setEditingMember({ ...editingMember, permissions: updated });
                      updatePermissions(editingMember.id, { [p.key]: e.target.checked });
                    }}
                    className="size-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  {p.label}
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setEditingMember(null)}
                className="rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
