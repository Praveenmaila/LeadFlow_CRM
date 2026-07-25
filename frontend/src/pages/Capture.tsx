import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const sourceOptions = ['Website', 'Referral', 'Social Media', 'Event', 'Advertisement', 'Other']

const CapturePage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    notes: ''
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await api.post('/capture', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        source: form.source || undefined,
        notes: form.notes.trim() || undefined
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_28%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-8 text-center">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Thank you!</h2>
            <p className="mt-3 text-slate-300">Our sales team will contact you shortly.</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left info panel */}
          <section className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">LeadFlow CRM</p>
              <h1 className="mt-4 max-w-lg text-4xl font-black leading-tight text-white sm:text-5xl">
                Get in touch with our sales team.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Tell us about your business and we'll reach out to discuss how LeadFlow CRM can help your team close more deals.
              </p>
            </div>

            <div className="mt-10 space-y-4 rounded-[28px] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">What happens next</p>
                <p className="text-base font-semibold text-white">We'll follow up within 24 hours.</p>
              </div>
              <ul className="space-y-3 leading-6">
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                  A member of our team will review your request.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                  We'll schedule a quick call to understand your needs.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                  You'll get a personalized walkthrough of LeadFlow CRM.
                </li>
              </ul>
            </div>
          </section>

          {/* Right form panel */}
          <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <h2 className="text-2xl font-bold text-white">Contact us</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Fill out the form below and we'll be in touch.</p>

            {error && (
              <div className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <label className="mt-6 block space-y-2">
              <span className="text-sm text-slate-300">Name <span className="text-rose-400">*</span></span>
              <input
                required
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm text-slate-300">Email <span className="text-rose-400">*</span></span>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm text-slate-300">Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm text-slate-300">Company</span>
              <input
                value={form.company}
                onChange={e => updateField('company', e.target.value)}
                placeholder="Your company name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm text-slate-300">How did you hear about us?</span>
              <select
                value={form.source}
                onChange={e => updateField('source', e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
              >
                <option value="">Select a source</option>
                {sourceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm text-slate-300">Notes</span>
              <textarea
                value={form.notes}
                onChange={e => updateField('notes', e.target.value)}
                placeholder="Tell us about your needs..."
                rows={3}
                maxLength={1000}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CapturePage
