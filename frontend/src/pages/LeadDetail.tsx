import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import api from '../services/api'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/AuthProvider'
import type { Lead, Note, Activity, User } from '../types'

dayjs.extend(relativeTime)

const statusColor: Record<string, string> = {
  NEW: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
  OPEN: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  CONTACTED: 'border-purple-400/20 bg-purple-400/10 text-purple-200',
  QUALIFIED: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  WON: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  LOST: 'border-rose-400/20 bg-rose-400/10 text-rose-200'
}

const statusOptions = ['NEW', 'OPEN', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST']

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    NEW: 'New',
    OPEN: 'Open',
    CONTACTED: 'Contacted',
    QUALIFIED: 'Qualified',
    WON: 'Won',
    LOST: 'Lost'
  }
  return labels[status?.toUpperCase()] || status
}

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [noteError, setNoteError] = useState('')

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)

  // Status update state
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState('')

  // User assignment state
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  // Delete lead state
  const [deleting, setDeleting] = useState(false)

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
      // Silently handle
    } finally {
      setNotesLoading(false)
    }
  }, [id])

  const loadActivities = useCallback(async () => {
    if (!id) return
    setActivitiesLoading(true)
    try {
      const response = await api.get<Activity[]>(`/leads/${id}/activities`)
      setActivities(response.data)
    } catch {
      // Silently handle
    } finally {
      setActivitiesLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadNotes()
    void loadActivities()
  }, [loadNotes, loadActivities])

  // Fetch team members list for dropdown
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      const fetchTeam = async () => {
        try {
          const response = await api.get<User[]>('/users')
          setTeamMembers(response.data)
        } catch {
          // ignore
        }
      }
      void fetchTeam()
    }
  }, [user])

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

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !lead) return
    setStatusUpdating(true)
    setStatusError('')

    try {
      const response = await api.put<Lead>(`/leads/${id}/status`, { status: newStatus })
      setLead(response.data)
      await loadActivities()
    } catch (err: any) {
      setStatusError(err.response?.data?.message ?? 'Failed to update status.')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleAssignOwner = async (ownerEmail: string) => {
    if (!id || !lead) return
    setAssigning(true)
    setAssignError('')

    try {
      const response = await api.put<Lead>(`/leads/${id}/assign`, { ownerEmail })
      setLead(response.data)
      await loadActivities()
    } catch (err: any) {
      setAssignError(err.response?.data?.message ?? 'Failed to assign owner.')
    } finally {
      setAssigning(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!id) return
    if (!window.confirm('Are you sure you want to delete this lead? This action is permanent.')) return

    setDeleting(true)
    try {
      await api.delete(`/leads/${id}`)
      navigate('/dashboard')
    } catch {
      alert('Failed to delete lead. Only Administrators have permission.')
      setDeleting(false)
    }
  }

  // Permission check: Admin/Manager can edit any status, Sales Rep can only edit if lead is assigned to them and not closed
  const isClosedOrQualified = lead && ['QUALIFIED', 'WON', 'LOST'].includes(lead.status.toUpperCase())
  
  const canEditStatus = Boolean(
    user && (
      user.role === 'ADMIN' || 
      user.role === 'MANAGER' || 
      (lead && lead.ownerEmail?.toLowerCase() === user.email.toLowerCase() && !isClosedOrQualified)
    )
  )

  const getAllowedStatusOptions = () => {
    if (!lead || !user) return []
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      return statusOptions
    }
    // Sales Rep transition rules
    const current = lead.status.toUpperCase()
    if (current === 'NEW' || current === 'OPEN') {
      return ['OPEN', 'CONTACTED']
    }
    if (current === 'CONTACTED') {
      return ['CONTACTED', 'QUALIFIED']
    }
    return [current]
  }

  const activeAllowedOptions = getAllowedStatusOptions()

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
          <div className="space-y-6">
            {/* Header card with status update */}
            <section className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Lead Details</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{lead.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">{lead.company}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">Status</span>
                    {canEditStatus ? (
                      <select
                        disabled={statusUpdating}
                        value={lead.status}
                        onChange={e => handleStatusChange(e.target.value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold uppercase tracking-wider outline-none bg-slate-950 focus:border-cyan-400/60 ${statusColor[lead.status.toUpperCase()] ?? 'border-white/10 text-slate-300'}`}
                      >
                        {activeAllowedOptions.map(opt => (
                          <option key={opt} value={opt} className="bg-slate-950 text-white">
                            {getStatusLabel(opt)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${statusColor[lead.status.toUpperCase()] ?? 'border-white/10 bg-white/5 text-slate-300'}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {statusError && (
                <p className="mt-2 text-xs text-rose-400">{statusError}</p>
              )}
            </section>

            {/* Layout grid */}
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              {/* Left Column: Notes & Activity Timeline */}
              <div className="space-y-6">
                {/* Notes Section */}
                <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold">Notes</p>

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

                  <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto pr-2">
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

                {/* Activity Timeline Section */}
                <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold">Activity Timeline</p>

                  <div className="mt-6 flow-root">
                    <ul className="-mb-8">
                      {activitiesLoading ? (
                        <p className="text-sm text-slate-500">Loading activity timeline...</p>
                      ) : activities.length === 0 ? (
                        <p className="text-sm text-slate-500">No activity recorded yet.</p>
                      ) : (
                        activities.map((activity, actIdx) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {actIdx !== activities.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-white/10" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30">
                                    <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-slate-200">
                                      {activity.content}{' '}
                                      <span className="font-semibold text-cyan-200">({activity.creatorName})</span>
                                    </p>
                                  </div>
                                  <div className="whitespace-nowrap text-right text-xs text-slate-400">
                                    <time title={dayjs(activity.createdAt).format('MMM D, YYYY h:mm A')}>
                                      {dayjs(activity.createdAt).fromNow()}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </section>
              </div>

              {/* Right Column: Contact Details, Owner & Context */}
              <div className="space-y-6">
                <section className="rounded-[24px] border border-white/10 bg-white/5 p-6 space-y-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold mb-3">Contact Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-sm font-semibold text-white">{lead.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email Address</p>
                        <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition block">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  <div>
                    <h3 className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold mb-3">Owner Details</h3>
                    <div className="space-y-3">
                      {user && (user.role === 'ADMIN' || user.role === 'MANAGER') ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Assign Lead To</p>
                          <select
                            disabled={assigning}
                            value={lead.ownerEmail || ''}
                            onChange={e => handleAssignOwner(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map(member => (
                              <option key={member.email} value={member.email}>
                                {member.fullName} ({member.role})
                              </option>
                            ))}
                          </select>
                          {assignError && <p className="text-xs text-rose-400 mt-1">{assignError}</p>}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-500">Assigned To</p>
                          <p className="text-sm font-semibold text-white">{lead.ownerName || 'Unassigned'}</p>
                        </div>
                      )}
                      
                      {lead.ownerEmail && (
                        <div>
                          <p className="text-xs text-slate-500">Owner Email</p>
                          <p className="text-sm font-semibold text-slate-300">{lead.ownerEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  <div>
                    <h3 className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold mb-3">Sales Metadata</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Source</p>
                        <p className="text-sm font-semibold text-white">{lead.source}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Deal Value</p>
                        <p className="text-sm font-semibold text-emerald-300">${lead.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Created At</p>
                        <p className="text-sm font-semibold text-white">{dayjs(lead.createdAt).format('MMM D, YYYY')}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  <div>
                    <h3 className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold mb-3">System Context</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Lead ID</p>
                        <p className="text-xs font-mono text-slate-400 break-all select-all">{lead.id}</p>
                      </div>
                      
                      {/* Delete Lead button for Admin only */}
                      {user && user.role === 'ADMIN' && (
                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDeleteLead}
                            className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-40"
                          >
                            {deleting ? 'Deleting Lead...' : 'Delete Lead'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}

export default LeadDetailPage
