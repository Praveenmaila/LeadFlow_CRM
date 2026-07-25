import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

const navByRole: Record<string, Array<{ label: string; to: string }>> = {
  ADMIN: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Leads', to: '/team' },
    { label: 'Users', to: '/users' },
    { label: 'Reports', to: '/reports' }
  ],
  MANAGER: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Leads', to: '/team' },
    { label: 'Team', to: '/reports' },
    { label: 'Reports', to: '/reports' }
  ],
  SALES_REP: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Leads', to: '/team' }
  ]
}

const roleDisplayName: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  SALES_REP: 'Sales Representative'
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30' : 'text-slate-300 hover:bg-white/8 hover:text-white'
  ].join(' ')

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = navByRole[user?.role ?? 'SALES_REP'] ?? navByRole.SALES_REP

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur xl:flex">
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 p-5 text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-900/70">LeadFlow CRM</p>
            <h1 className="mt-3 text-2xl font-black">LeadFlow CRM</h1>
            <p className="mt-2 text-sm text-slate-900/75">Manage your leads, pipeline, and team.</p>
          </div>

          <nav className="space-y-2">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Your account</p>
            <p className="mt-2 font-semibold text-white">{user?.fullName}</p>
            <p>{user?.email}</p>
            <p className="mt-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200">{roleDisplayName[user?.role ?? ''] ?? user?.role}</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-950/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">{roleDisplayName[user?.role ?? ''] ?? user?.role}</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Welcome back, {user?.fullName?.split(' ')[0]}</h2>
              <p className="mt-1 text-sm text-slate-300">Track your leads, update your pipeline, and stay on top of your sales activity.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </header>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            {children}
          </div>

          <footer className="mt-8 text-center text-xs text-slate-500 pb-2">
            Built for{' '}
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition hover:underline"
            >
              Digital Heroes
            </a>
          </footer>
        </div>
      </div>
    </div>
  )
}
