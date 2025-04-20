import type { Database } from './database.types'

export type Tables = Database['public']['Tables']

export type TableNames = keyof Tables

export type TableRow<T extends TableNames> = Tables[T]['Row']
export type TableInsert<T extends TableNames> = Tables[T]['Insert']
export type TableUpdate<T extends TableNames> = Tables[T]['Update']

export interface ApiResponse<T> {
  data: T
  error: string | null
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
  }
}

export interface DataTableProps<T> {
  data: T[]
  columns: {
    key: keyof T
    label: string
    sortable?: boolean
    format?: (value: any) => string
  }[]
  loading?: boolean
  error?: string | null
}

export type LeadWithCompanies = Lead & {
  companies?: Company[]
  customFields?: LeadCustomField[]
  interactions?: Interaction[]
}

export type CompanyWithLeads = Company & {
  leads?: Lead[]
  customFields?: CompanyCustomField[]
  interactions?: Interaction[]
}