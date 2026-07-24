import React from 'react'
import { AppShell } from '../components/AppShell'

const ReportsPage: React.FC = () => (
  <AppShell>
    <div className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-bold">Reports</h3>
      <p className="text-slate-300">Report navigation is shown only for roles that should see analytics and performance views.</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        This integration proves role-based navigation, while the main data flow stays on the dashboard table.
      </div>
    </div>
  </AppShell>
)

export default ReportsPage
