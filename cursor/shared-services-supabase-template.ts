import { H3Error, H3Event, createError } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import { loggerError } from '~/shared/utils/logger'
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/shared/types/database.types'
import type {
  Lead,
  LeadInsert,
  LeadUpdate,
  LeadWithCompanies,
  LeadScore,
  LeadScoreCategory,
  PaginatedResponse,
  Company,
  Interaction,
  LeadCustomField
} from '~/shared/types'
import { TABLES, FIELD_NAMES } from '~/shared/types'

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
}
const LEAD_SCORE = {
  COLD_MAX: 30,
  WARM_MAX: 70,
  MAX_SCORE: 100
}
const SCORE_WEIGHTS = {
  DEMOGRAPHIC: 0.3,
  ENGAGEMENT: 0.3,
  INTEREST: 0.2,
  AUTHORITY: 0.2
}
const COMPANY_SIZE_SCORES = {
  '1-10': 5,
  '11-50': 10,
  '51-200': 15,
  '201-500': 20,
  '501-1000': 25,
  '1001-5000': 30,
  '5000+': 35
}
const REVENUE_RANGE_SCORES = {
  'less_than_1m': 5,
  '1m_to_10m': 10,
  '10m_to_50m': 15,
  '50m_to_100m': 20,
  '100m_to_500m': 25,
  '500m_to_1b': 30,
  'over_1b': 35
}
const INTERACTION_SCORES = {
  BASE_PER_INTERACTION: 5,
  MAX_INTERACTIONS_SCORE: 30,
  RECENT_INTERACTION_BONUS: 10,
  MEETING_VALUE: 3,
  CALL_VALUE: 2,
  EMAIL_VALUE: 1
}
const SOURCE_SCORES = {
  WEBSITE_CONTACT_FORM: 15,
  REFERRAL: 20,
  DIRECT: 10
}
const AUTHORITY_SCORES = {
  C_LEVEL: 30,
  VP_LEVEL: 25,
  DIRECTOR_LEVEL: 20,
  MANAGER_LEVEL: 15,
  OTHER_LEVEL: 5
}
const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'First name, last name and email are required',
  DUPLICATE_EMAIL: 'A lead with this email already exists',
  ANOTHER_LEAD_EMAIL: 'Another lead with this email already exists',
  LEAD_NOT_FOUND: 'Lead not found',
  CREATE_FAILED: 'Failed to create lead',
  UPDATE_FAILED: 'Failed to update lead',
  GENERIC_FETCH: 'Error fetching leads',
  GENERIC_LEAD_FETCH: 'Error fetching lead',
  GENERIC_CREATE: 'Error creating lead',
  GENERIC_UPDATE: 'Error updating lead',
  GENERIC_DELETE: 'Error deleting lead',
  GENERIC_SCORE: 'Error calculating lead score',
  GENERIC_COMPANY_ASSOC: 'Error associating lead with company',
  GENERIC_COMPANY_REMOVE: 'Error removing company association',
  GENERIC_CUSTOM_FIELD: 'Error managing custom field',
  GENERIC_INACTIVE: 'Error finding inactive leads'
}
const RELATIONSHIP_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  FORMER: 'former'
} as const
const STATUS_VALUES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
}
const LEAD_SOURCE = {
  WEBSITE_CONTACT_FORM: 'website_contact_form',
  REFERRAL: 'referral',
  DIRECT: 'direct'
}

export interface LeadFilterOptions {
  search?: string
  status?: string
  priority?: string
  leadScore?: number
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}
type InteractionWithType = Interaction & { interaction_type: string }
interface CompanyWithRelationship extends Company {
  relationship_type: string
}
interface CompanyLeadJoin {
  company_id: string;
  relationship_type: string;
  companies: Company;
}

export class LeadsService {
  private client: SupabaseClient<Database>
  constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  private handleError(error?: any, defaultMessage?: string, statusCode = HTTP_STATUS.SERVER_ERROR): H3Error {
    loggerError('[LeadsService]', error || error.message || 'Unknown error')
    return createError({
      statusCode: error?.statusCode || statusCode,
      message: error?.message || defaultMessage
    })
  }

  private async checkLeadExists(id: string): Promise<void> {
    const { data: existingLead } = await this.client
      .from(TABLES.LEADS)
      .select(FIELD_NAMES.ID)
      .eq(FIELD_NAMES.ID, id)
      .maybeSingle()
    if (!existingLead) {
      throw this.handleError(
        new Error(ERROR_MESSAGES.LEAD_NOT_FOUND),
        ERROR_MESSAGES.LEAD_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      )
    }
  }

  private async checkDuplicateEmail(email: string, excludeId?: string): Promise<void> {
    let query = this.client
      .from(TABLES.LEADS)
      .select(FIELD_NAMES.ID)
      .eq(FIELD_NAMES.EMAIL, email)
    if (excludeId) {
      query = query.neq(FIELD_NAMES.ID, excludeId)
    }
    const { data: existingLead } = await query.maybeSingle()
    if (existingLead) {
      throw this.handleError(
        new Error(excludeId ? ERROR_MESSAGES.ANOTHER_LEAD_EMAIL : ERROR_MESSAGES.DUPLICATE_EMAIL),
        excludeId ? ERROR_MESSAGES.ANOTHER_LEAD_EMAIL : ERROR_MESSAGES.DUPLICATE_EMAIL,
        HTTP_STATUS.CONFLICT
      )
    }
  }

  async getLeads(options: LeadFilterOptions = {}): Promise<PaginatedResponse<Lead[]>> {
    try {
      const {
        search,
        status,
        priority,
        leadScore,
        assignedTo,
        dateFrom,
        dateTo,
        sortBy = FIELD_NAMES.CREATED_AT,
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = options
      const offset = (page - 1) * limit
      let query = this.client
        .from(TABLES.LEADS)
        .select('*', { count: 'exact' })
      if (search) {
        query = query.or(`${FIELD_NAMES.FIRST_NAME}.ilike.%${search}%,${FIELD_NAMES.LAST_NAME}.ilike.%${search}%,${FIELD_NAMES.EMAIL}.ilike.%${search}%`)
      }
      if (status) {
        query = query.eq(FIELD_NAMES.LEAD_STATUS, status)
      }
      if (priority) {
        query = query.eq(FIELD_NAMES.LEAD_PRIORITY, priority)
      }
      const hasLeadScore = leadScore !== undefined
      if (hasLeadScore) {
        query = query.gte(FIELD_NAMES.LEAD_SCORE, leadScore)
      }
      if (assignedTo) {
        query = query.eq(FIELD_NAMES.ASSIGNED_TO, assignedTo)
      }
      if (dateFrom) {
        query = query.gte(FIELD_NAMES.CREATED_AT, dateFrom)
      }
      if (dateTo) {
        query = query.lte(FIELD_NAMES.CREATED_AT, dateTo)
      }
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)
      const { data: leads, error, count } = await query
      if (error) {
        throw this.handleError(
          new Error(`Error fetching leads: ${error.message}`),
          `Error fetching leads: ${error.message}`,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      return {
        data: leads as Lead[],
        error: null,
        meta: {
          total: count || 0,
          page,
          limit
        }
      }
    } catch (error: any) {
      throw this.handleError(error, ERROR_MESSAGES.GENERIC_FETCH)
    }
  }

  async getLeadById(id: string): Promise<LeadWithCompanies> {
    try {

      const { data: lead, error } = await this.client
        .from(TABLES.LEADS)
        .select('*')
        .eq(FIELD_NAMES.ID, id)
        .single()
      if (error) {
        throw this.handleError(
          error,
          error.message,
          error.code === 'PGRST116' ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.SERVER_ERROR
        )
      }
      if (!lead) {
        throw this.handleError(
          new Error(ERROR_MESSAGES.LEAD_NOT_FOUND),
          ERROR_MESSAGES.LEAD_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        )
      }

      const typedLead = lead as Lead;

      const [companyLeadsResult, customFieldsResult, interactionsResult] = await Promise.all([
        this.client
          .from(TABLES.COMPANIES_LEADS)
          .select(`${FIELD_NAMES.COMPANY_ID}, ${FIELD_NAMES.RELATIONSHIP_TYPE}, ${TABLES.COMPANIES}(*)`)
          .eq(FIELD_NAMES.LEAD_ID, id),
        this.client
          .from(TABLES.LEAD_CUSTOM_FIELDS)
          .select('*')
          .eq(FIELD_NAMES.LEAD_ID, id),
        this.client
          .from(TABLES.INTERACTIONS)
          .select('*')
          .eq(FIELD_NAMES.LEAD_ID, id)
          .order(FIELD_NAMES.DATE, { ascending: false })
      ]);

      if (companyLeadsResult.error) {
        throw this.handleError(
          companyLeadsResult.error,
          `Error fetching lead companies: ${companyLeadsResult.error.message}`,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      if (customFieldsResult.error) {
        throw this.handleError(
          customFieldsResult.error,
          `Error fetching lead custom fields: ${customFieldsResult.error.message}`,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      if (interactionsResult.error) {
        throw this.handleError(
          interactionsResult.error,
          `Error fetching lead interactions: ${interactionsResult.error.message}`,
          HTTP_STATUS.SERVER_ERROR
        )
      }

      let companies: CompanyWithRelationship[] = [];
      if (companyLeadsResult.data) {
        companies = ((companyLeadsResult.data as unknown) as CompanyLeadJoin[]).map(companyLead => {
          const company = companyLead.companies ? 
            companyLead.companies : 
            {} as Company;
          
          const relationshipType = companyLead.relationship_type ? 
            String(companyLead.relationship_type) : 
            RELATIONSHIP_TYPES.SECONDARY;
            
          return {
            ...company,
            relationship_type: relationshipType
          } as CompanyWithRelationship;
        });
      }

      const leadWithRelatedData = {
        ...typedLead,
        companies,
        customFields: customFieldsResult.data as LeadCustomField[] || [],
        interactions: interactionsResult.data as Interaction[] || []
      } as LeadWithCompanies;

      return leadWithRelatedData
    } catch (error: any) {
      throw this.handleError(error, ERROR_MESSAGES.GENERIC_LEAD_FETCH)
    }
  }

  async createLead(leadData: LeadInsert): Promise<Lead> {
    try {
      const { first_name, last_name, email } = leadData
      const hasRequiredFields = first_name && last_name && email
      if (!hasRequiredFields) {
        throw this.handleError(
          new Error(ERROR_MESSAGES.REQUIRED_FIELDS),
          ERROR_MESSAGES.REQUIRED_FIELDS,
          HTTP_STATUS.BAD_REQUEST
        )
      }

      await this.checkDuplicateEmail(leadData.email)

      const { data: newLead, error } = await this.client
        .from(TABLES.LEADS)
        .insert(leadData)
        .select()
        .single()
      if (error) {
        throw this.handleError(
          error,
          `Error creating lead: ${error.message}`,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      if (!newLead) {
        throw this.handleError(
          new Error(ERROR_MESSAGES.CREATE_FAILED),
          ERROR_MESSAGES.CREATE_FAILED,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      return newLead as Lead
    } catch (error: any) {
      throw this.handleError(error, ERROR_MESSAGES.GENERIC_CREATE)
    }
  }

  async updateLead(id: string, leadData: LeadUpdate): Promise<Lead> {
    try {

      await this.checkLeadExists(id)

      if (leadData.email) {
        await this.checkDuplicateEmail(leadData.email, id)
      }

      const { data: updatedLead, error } = await this.client
        .from(TABLES.LEADS)
        .update(leadData)
        .eq(FIELD_NAMES.ID, id)
        .select()
        .single()
      if (error) {
        throw this.handleError(
          error,
          `Error updating lead: ${error.message}`,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      if (!updatedLead) {
        throw this.handleError(
          new Error(ERROR_MESSAGES.UPDATE_FAILED),
          ERROR_MESSAGES.UPDATE_FAILED,
          HTTP_STATUS.SERVER_ERROR
        )
      }
      return updatedLead as Lead
    } catch (error: any) {
      throw this.handleError(error, ERROR_MESSAGES.GENERIC_UPDATE)
    }
  }

  async calculateLeadScore(id: string): Promise<LeadScore> {
    try {

      const lead = await this.getLeadById(id)

      let demographicScore = 0
      let engagementScore = 0
      let interestScore = 0
      let authorityScore = 0

      this.calculateDemographicScore(lead.companies as CompanyWithRelationship[] || [], demographicScore)

      this.calculateEngagementScore(lead.interactions as Interaction[] || [], engagementScore)

      this.calculateInterestScore(lead.lead_source, interestScore)

      this.calculateAuthorityScore(lead.job_title, authorityScore)

      const totalScore = (
        (demographicScore * SCORE_WEIGHTS.DEMOGRAPHIC) +
        (engagementScore * SCORE_WEIGHTS.ENGAGEMENT) +
        (interestScore * SCORE_WEIGHTS.INTEREST) +
        (authorityScore * SCORE_WEIGHTS.AUTHORITY)
      )

      const finalScore = Math.min(Math.round(totalScore), LEAD_SCORE.MAX_SCORE)

      const category = this.determineCategoryFromScore(finalScore)

      await this.client
        .from(TABLES.LEADS)
        .update({ [FIELD_NAMES.LEAD_SCORE]: finalScore })
        .eq(FIELD_NAMES.ID, id)

      return {
        score: finalScore,
        category,
        factors: {
          demographicScore,
          engagementScore,
          interestScore,
          authorityScore
        }
      }
    } catch (error: any) {
      throw this.handleError(error, ERROR_MESSAGES.GENERIC_SCORE)
    }
  }


  private calculateInterestScore(leadSource: string | null | undefined, scoreRef: number): void {
    if (!leadSource) return
    if (leadSource === LEAD_SOURCE.WEBSITE_CONTACT_FORM) {
      scoreRef += SOURCE_SCORES.WEBSITE_CONTACT_FORM
    } else if (leadSource === LEAD_SOURCE.REFERRAL) {
      scoreRef += SOURCE_SCORES.REFERRAL
    } else if (leadSource === LEAD_SOURCE.DIRECT) {
      scoreRef += SOURCE_SCORES.DIRECT
    }
  }

  async associateWithCompany(
    leadId: string,
    companyId: string,
    relationshipType: 'primary' | 'secondary' | 'former' = RELATIONSHIP_TYPES.SECONDARY
  ): Promise<void> {
    try {

      const { data: existingAssociation } = await this.client
        .from(TABLES.COMPANIES_LEADS)
        .select(FIELD_NAMES.ID)
        .eq(FIELD_NAMES.LEAD_ID, leadId)
        .eq(FIELD_NAMES.COMPANY_ID, companyId)
        .maybeSingle()
      if (existingAssociation) {

        const { error } = await this.client
          .from(TABLES.COMPANIES_LEADS)
          .update({ [FIELD_NAMES.RELATIONSHIP_TYPE]: relationshipType })
          .eq(FIELD_NAMES.LEAD_ID, leadId)
          .eq(FIELD_NAMES.COMPANY_ID, companyId)
        if (error) {
          throw createError({
            statusCode: HTTP_STATUS.SERVER_ERROR,
            message: `Error updating company association: ${error.message}`
          })
        }
      } else {

        const { error } = await this.client
          .from(TABLES.COMPANIES_LEADS)
          .insert({
            [FIELD_NAMES.LEAD_ID]: leadId,
            [FIELD_NAMES.COMPANY_ID]: companyId,
            [FIELD_NAMES.RELATIONSHIP_TYPE]: relationshipType
          })
        if (error) {
          throw createError({
            statusCode: HTTP_STATUS.SERVER_ERROR,
            message: `Error creating company association: ${error.message}`
          })
        }
      }

      if (relationshipType === RELATIONSHIP_TYPES.PRIMARY) {
        const { error } = await this.client
          .from(TABLES.COMPANIES_LEADS)
          .update({ [FIELD_NAMES.RELATIONSHIP_TYPE]: RELATIONSHIP_TYPES.SECONDARY })
          .eq(FIELD_NAMES.LEAD_ID, leadId)
          .neq(FIELD_NAMES.COMPANY_ID, companyId)
          .eq(FIELD_NAMES.RELATIONSHIP_TYPE, RELATIONSHIP_TYPES.PRIMARY)
        if (error) {
          throw createError({
            statusCode: HTTP_STATUS.SERVER_ERROR,
            message: `Error updating other company associations: ${error.message}`
          })
        }
      }
    } catch (error: any) {
      throw this.handleError(error, ERROR_MESSAGES.GENERIC_COMPANY_ASSOC)
    }
  }
}

export const getLeadsService = async (event: H3Event): Promise<LeadsService> => {
  const client = await serverSupabaseServiceRole<Database>(event)
  return new LeadsService(client)
} 