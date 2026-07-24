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
  company: string
  status: string
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
