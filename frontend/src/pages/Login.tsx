import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthProvider'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

type LoginFormValues = {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit } = useForm<LoginFormValues>()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setError('')
  }, [])

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200 shadow-2xl shadow-cyan-950/30">
          Restoring your session...
        </div>
      </div>
    )
  }

  if (auth.isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | undefined)?.from ?? '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true)
    setError('')
    try {
      await auth.login(data.email, data.password)
      const redirectTo = (location.state as { from?: string } | undefined)?.from ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (loginError: any) {
      setError(loginError.response?.data?.message ?? 'Login failed. Check your credentials and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center justify-center w-full my-auto">
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] py-4">
            <section className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">LeadFlow CRM</p>
                <h1 className="mt-4 max-w-lg text-4xl font-black leading-tight text-white sm:text-5xl">
                  A modern CRM workspace for growing sales teams.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  LeadFlow CRM helps teams capture leads, manage pipeline activity, and keep sales work visible from first contact to close.
                </p>
              </div>

              <div className="mt-10 space-y-4 rounded-[28px] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">What it does</p>
                  <p className="text-base font-semibold text-white">Everything a small sales team needs in one place.</p>
                </div>
                <ul className="space-y-3 leading-6">
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                    Capture and qualify inbound leads without losing context.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                    Track pipeline progress, ownership, and next steps at a glance.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                    Keep team activity, notes, and customer updates organized.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                    Give every role a focused workspace with the right level of access.
                  </li>
                </ul>
              </div>
            </section>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Access your workspace with your assigned account.</p>

              {error ? (
                <div className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <label className="mt-6 block space-y-2">
                <span className="text-sm text-slate-300">Email</span>
                <input {...register('email', { required: true })} required type="email" autoComplete="email" autoCapitalize="none" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60" />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-sm text-slate-300">Password</span>
                <input {...register('password', { required: true })} required type="password" autoComplete="current-password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60" />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                Demo credentials are available in the README.
              </p>
            </form>
          </div>
        </div>
        <footer className="w-full text-center text-xs text-slate-500 relative z-10 py-4">
          Built for{' '}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition hover:underline"
          >
            Digital Heroes Training Task
          </a>
        </footer>
      </div>
    </div>
  )
}

export default LoginPage
