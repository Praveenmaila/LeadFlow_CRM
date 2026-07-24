import React from 'react'
import { AppShell } from '../components/AppShell'

const UsersPage: React.FC = () => (
  <AppShell>
    <div className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-bold">User Access</h3>
      <p className="text-slate-300">Admin-only navigation can point to access control or team management screens.</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        The login response provides the user role, and the sidebar uses that role to decide whether this item appears.
      </div>
    </div>
  </AppShell>
)

export default UsersPage
