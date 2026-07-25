import React from 'react'
import { AppShell } from '../components/AppShell'

const UsersPage: React.FC = () => (
  <AppShell>
    <div className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-bold">Users</h3>
      <p className="text-slate-300">Manage team members, roles, and access permissions.</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        User management is coming soon. You'll be able to add team members, assign roles, and control access from this page.
      </div>
    </div>
  </AppShell>
)

export default UsersPage
