import React from 'react'
import { AppShell } from '../components/AppShell'

const ReportsPage: React.FC = () => (
  <AppShell>
    <div className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-bold">Reports</h3>
      <p className="text-slate-300">Review sales performance, pipeline health, and team activity.</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        Reports and analytics are coming soon. You'll be able to track conversion rates, deal values, and team performance from this page.
      </div>
    </div>
  </AppShell>
)

export default ReportsPage
