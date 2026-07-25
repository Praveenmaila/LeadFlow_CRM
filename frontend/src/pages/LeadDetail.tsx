import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import api from '../services/api'
import { AppShell } from '../components/AppShell'
import type { Lead, Note } from '../types'

dayjs.extend(relativeTime)

const statusColor: Record<string, string> = {
  OPEN: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  QUALIFIED: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  WON: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  LOST: 'border-rose-400/20 bg-rose-400/10 text-rose-200'
}

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [noteError, setNoteError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadLead = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<Lead>(`/leads/${id}`)
        if (!ignore) {
          setLead(response.data)
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err.response?.status === 404
            ? 'Lead not found or you do not have access.'
            : 'Unable to load lead details.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadLead()

    return () => {
      ignore = true
    }
  }, [id])

  const loadNotes = useCallback(async () => {
    if (!id) return
    setNotesLoading(true)
    try {
      const response = await api.get<Note[]>(`/leads/${id}/notes`)
      setNotes(response.data)
    } catch {
      // Silently handle — notes section will just show empty
    } finally {
      setNotesLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim() || !id) return

    setNoteSubmitting(true)
    setNoteError('')

    try {
      await api.post(`/leads/${id}/notes`, { content: noteContent.trim() })
      setNoteContent('')
      await loadNotes()
    } catch (err: any) {
      setNoteError(err.response?.data?.message ?? 'Failed to add note.')
    } finally {
      setNoteSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 text-slate-100">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-slate-400">
            Loading lead details...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-6 py-12 text-center text-sm text-rose-100">
            {error}
          </div>
        ) : lead ? (
          <>
            {/* Lead header card */}
            <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Lead details</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{lead.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{lead.email}</p>
                </div>
                <span className={`self-start rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ${statusColor[lead.status] ?? 'border-white/10 bg-white/5 text-slate-300'}`}>
                  {lead.status}
                </span>
              </div>
            </section>

            {/* Detail grid */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <DetailCard label="Company" value={lead.company} />
              <DetailCard label="Owner" value={lead.ownerName} />
              <DetailCard label="Source" value={lead.source} />
              <DetailCard label="Deal value" value={`$${lead.amount.toLocaleString()}`} />
              <DetailCard label="Created" value={dayjs(lead.createdAt).format('MMM D, YYYY')} />
              <DetailCard label="Lead ID" value={lead.id} mono />
            </section>

            {/* Notes section */}
            <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Notes</p>

              {/* Add note form */}
              <form onSubmit={handleAddNote} className="mt-4 space-y-3">
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Add a note about this lead..."
                  maxLength={1000}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{noteContent.length}/1000</p>
                  <button
                    type="submit"
                    disabled={!noteContent.trim() || noteSubmitting}
                    className="rounded-2xl bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {noteSubmitting ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
                {noteError && (
                  <p className="text-sm text-rose-300">{noteError}</p>
                )}
              </form>

              {/* Notes list */}
              <div className="mt-6 space-y-3">
                {notesLoading ? (
                  <p className="text-sm text-slate-500">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-slate-500">No notes yet. Be the first to add one.</p>
                ) : (
                  notes.map(note => (
                    <article key={note.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-sm text-white whitespace-pre-wrap">{note.content}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-cyan-300/80">{note.authorName}</span>
                        <span>·</span>
                        <span title={dayjs(note.createdAt).format('MMM D, YYYY h:mm A')}>
                          {dayjs(note.createdAt).fromNow()}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}

const DetailCard = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
    <p className={`mt-2 text-lg font-semibold text-white ${mono ? 'font-mono text-sm break-all' : ''}`}>{value}</p>
  </article>
)

export default LeadDetailPage

