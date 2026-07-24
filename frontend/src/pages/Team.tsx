import React from 'react'
import { AppShell } from '../components/AppShell'

const TeamPage: React.FC = () => (
  <AppShell>
    <div className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-bold">Team Pipeline</h3>
      <p className="text-slate-300">This section is role-aware navigation connected to the authenticated backend session.</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        The backend currently exposes lead data only. Use this navigation slot for role-specific team workflow screens.
      </div>
    </div>
  </AppShell>
)

export default TeamPage
