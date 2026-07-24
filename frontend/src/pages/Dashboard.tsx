import React, { useDeferredValue, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../services/api'
import { AppShell } from '../components/AppShell'
import type { LeadPageResponse } from '../types'

const statusOptions = ['', 'OPEN', 'QUALIFIED', 'WON', 'LOST']

const DashboardPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [owner, setOwner] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [data, setData] = useState<LeadPageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()

    const loadLeads = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<LeadPageResponse>('/leads', {
          signal: controller.signal,
          params: {
            search: deferredSearch || undefined,
            status: status || undefined,
            owner: owner || undefined,
            page,
            size: pageSize
          }
        })

        if (!ignore) {
          setData(response.data)
        }
      } catch (requestError: any) {
        if (!ignore && requestError.name !== 'CanceledError' && requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message ?? 'Unable to load leads right now.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadLeads()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [deferredSearch, owner, page, pageSize, status])

  const roleSummary = useMemo(() => {
    if (!data) {
      return []
    }

    return [
      { label: 'Open', value: data.totals.open },
      { label: 'Qualified', value: data.totals.qualified },
      { label: 'Won', value: data.totals.won },
      { label: 'Lost', value: data.totals.lost }
    ]
  }, [data])

  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setOwner('')
    setPage(0)
  }

  return (
    <AppShell>
      <div className="space-y-6 text-slate-100">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Matching leads</p>
            <p className="mt-3 text-3xl font-black text-white">{data?.page.totalItems ?? 0}</p>
          </article>
          {roleSummary.map(item => (
            <article key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-2 lg:col-span-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Search</span>
              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value)
                  setPage(0)
                }}
                placeholder="Search by lead, company, email, or source"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</span>
              <select
                value={status}
                onChange={event => {
                  setStatus(event.target.value)
                  setPage(0)
                }}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
              >
                <option value="">All statuses</option>
                {statusOptions.filter(Boolean).map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Owner</span>
              <input
                value={owner}
                onChange={event => {
                  setOwner(event.target.value)
                  setPage(0)
                }}
                placeholder="Owner email or name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Reset filters
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              Page size
              <select
                value={pageSize}
                onChange={event => {
                  setPageSize(Number(event.target.value))
                  setPage(0)
                }}
                className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none"
              >
                {[5, 10, 20].map(sizeOption => (
                  <option key={sizeOption} value={sizeOption}>
                    {sizeOption}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/80">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Lead pipeline</h3>
              <p className="text-sm text-slate-400">Results come from the Spring Boot backend.</p>
            </div>
            <p className="text-sm text-slate-400">
              Page {data?.page.page ? data.page.page + 1 : 1} of {data?.page.totalPages || 1}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td className="px-5 py-10 text-slate-300" colSpan={7}>
                      Loading leads from the backend...
                    </td>
                  </tr>
                ) : data?.items.length ? (
                  data.items.map(lead => (
                    <tr key={lead.id} className="hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-slate-400">{lead.email}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-200">{lead.company}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-200">{lead.ownerName}</td>
                      <td className="px-5 py-4 text-slate-200">{lead.source}</td>
                      <td className="px-5 py-4 text-slate-200">${lead.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-200">{dayjs(lead.createdAt).format('MMM D, YYYY')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-10 text-slate-300" colSpan={7}>
                      No leads matched the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
            <p className="text-sm text-slate-400">
              Showing {data?.items.length ?? 0} of {data?.page.totalItems ?? 0} results
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 0 || loading}
                onClick={() => setPage(current => Math.max(current - 1, 0))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={loading || (data ? page + 1 >= data.page.totalPages : false)}
                onClick={() => setPage(current => current + 1)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default DashboardPage
