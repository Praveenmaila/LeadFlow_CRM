import React from 'react'
import { AppShell } from '../components/AppShell'

const TeamPage: React.FC = () => (
  <AppShell>
    <div className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-bold">Leads</h3>
      <p className="text-slate-300">View and manage all leads assigned to your team.</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        Use the Dashboard to search, filter, and click into individual leads. This page will be expanded with team-level pipeline views in a future update.
      </div>
    </div>
  </AppShell>
)

export default TeamPage
