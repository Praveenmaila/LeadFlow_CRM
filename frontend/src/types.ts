export type User = {
  uuid: string
  email: string
  fullName: string
  role: string
}

export type AuthSession = {
  accessToken: string
  user: User
}

export type PageInfo = {
  page: number
  size: number
  totalItems: number
  totalPages: number
}

export type LeadTotals = {
  open: number
  won: number
  lost: number
  qualified: number
}

export type Lead = {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  status: string
  ownerEmail: string
  ownerName: string
  source: string
  amount: number
  createdAt: string
}

export type LeadPageResponse = {
  items: Lead[]
  page: PageInfo
  totals: LeadTotals
}

export type Note = {
  id: string
  authorName: string
  content: string
  createdAt: string
}

export type Activity = {
  id: string
  content: string
  creatorName: string
  createdAt: string
}
