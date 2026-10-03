import { useState } from 'react';
import { Users, Search, ShieldCheck, UserX, UserCheck, Mail, Filter } from 'lucide-react';
import type { AppRole } from '@nexuscare/shared';

interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  status: 'active' | 'suspended';
  createdDate: string;
  lastLogin: string;
}

const INITIAL_USERS: AdminUserRow[] = [
  {
    id: 'usr-1',
    fullName: 'Sarah Jenkins',
    email: 'patient@nexuscare.example',
    role: 'patient',
    status: 'active',
    createdDate: '2026-08-10',
    lastLogin: 'Today, 02:15 PM',
  },
  {
    id: 'usr-2',
    fullName: 'Dr. Arvind Mehta, MD',
    email: 'doctor@nexuscare.example',
    role: 'doctor',
    status: 'active',
    createdDate: '2026-07-22',
    lastLogin: 'Today, 03:30 PM',
  },
  {
    id: 'usr-3',
    fullName: 'David Jenkins',
    email: 'family@nexuscare.example',
    role: 'caregiver',
    status: 'active',
    createdDate: '2026-09-15',
    lastLogin: 'Today, 01:00 PM',
  },
  {
    id: 'usr-4',
    fullName: 'System Administrator',
    email: 'admin@nexuscare.example',
    role: 'admin',
    status: 'active',
    createdDate: '2026-01-01',
    lastLogin: 'Just now',
  },
  {
    id: 'usr-5',
    fullName: 'Dr. Priya Sharma, MD',
    email: 'priya.sharma@example.com',
    role: 'doctor',
    status: 'active',
    createdDate: '2026-09-01',
    lastLogin: 'Yesterday',
  },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage platform accounts, role assignments, and account status across Nexus Care.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'patient', 'doctor', 'caregiver', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {role === 'caregiver' ? 'Family' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-brand-800">
                        {user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.fullName}</div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.createdDate}</td>
                  <td className="px-4 py-4 text-slate-600">{user.lastLogin}</td>
                  <td className="px-5 py-4 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          user.status === 'active'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <>
                            <UserX className="size-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-3.5" /> Reactivate
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
