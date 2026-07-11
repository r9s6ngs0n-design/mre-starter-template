import { createClient } from '@/lib/supabase/client'
import type { LeadCategory, TablesInsert } from '@/lib/database.types'

export type EnquiryPreset =
  | 'general'
  | 'appraisal'
  | 'inspection'
  | 'register_interest'
  | 'investment'
  | 'property_management'

export interface LeadFormPayload {
  fullName: string
  email: string
  mobile?: string
  preferredLocation?: string
  budgetRange?: string
  requirements?: string
  formType?: 'buying' | 'selling' | 'management' | 'renting'
  subtype?: string
  presetEnquiryType?: EnquiryPreset
  listingId?: string
  source?: string
}

const DEFAULT_STATUS: Record<LeadCategory, string> = {
  buyer: 'new',
  vendor: 'appraisal_request',
  landlord: 'management_enquiry',
  tenant: 'new',
}

function mapFormToLead(payload: LeadFormPayload): TablesInsert<'leads'> {
  const preset = payload.presetEnquiryType

  if (preset === 'appraisal') {
    return {
      full_name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile ?? null,
      preferred_location: payload.preferredLocation ?? null,
      budget_range: payload.budgetRange ?? null,
      requirements: payload.requirements ?? null,
      category: 'vendor',
      subtype: 'sales_appraisal',
      enquiry_type: 'appraisal',
      status: DEFAULT_STATUS.vendor,
      source: payload.source ?? 'direct',
      listing_id: payload.listingId ?? null,
    }
  }

  if (preset === 'inspection') {
    return {
      full_name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile ?? null,
      requirements: payload.requirements ?? null,
      category: 'buyer',
      enquiry_type: 'inspection',
      status: DEFAULT_STATUS.buyer,
      source: payload.source ?? 'direct',
      listing_id: payload.listingId ?? null,
    }
  }

  if (preset === 'register_interest') {
    return {
      full_name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile ?? null,
      budget_range: payload.budgetRange ?? null,
      requirements: payload.requirements ?? null,
      category: 'buyer',
      enquiry_type: 'register_interest',
      status: DEFAULT_STATUS.buyer,
      source: payload.source ?? 'direct',
      listing_id: payload.listingId ?? null,
    }
  }

  if (preset === 'investment') {
    return {
      full_name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile ?? null,
      budget_range: payload.budgetRange ?? null,
      requirements: payload.requirements ?? null,
      category: 'buyer',
      subtype: 'investor',
      enquiry_type: 'investment',
      status: DEFAULT_STATUS.buyer,
      source: payload.source ?? 'direct',
    }
  }

  if (preset === 'property_management') {
    return {
      full_name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile ?? null,
      requirements: payload.requirements ?? null,
      category: 'landlord',
      subtype: 'property_management',
      enquiry_type: 'property_management',
      status: DEFAULT_STATUS.landlord,
      source: payload.source ?? 'direct',
    }
  }

  const formType = payload.formType ?? 'buying'
  const mapping: Record<
    string,
    { category: LeadCategory; enquiry_type: string; subtype?: string }
  > = {
    buying: { category: 'buyer', enquiry_type: 'general', subtype: payload.subtype },
    selling: { category: 'vendor', enquiry_type: 'appraisal', subtype: 'sales_appraisal' },
    management: {
      category: 'landlord',
      enquiry_type: 'property_management',
      subtype: 'property_management',
    },
    renting: { category: 'tenant', enquiry_type: 'general', subtype: 'rental' },
  }

  const m = mapping[formType] ?? mapping.buying

  return {
    full_name: payload.fullName,
    email: payload.email,
    mobile: payload.mobile ?? null,
    preferred_location: payload.preferredLocation ?? null,
    budget_range: payload.budgetRange ?? null,
    requirements: payload.requirements ?? null,
    category: m.category,
    subtype: m.subtype ?? null,
    enquiry_type: m.enquiry_type,
    status: DEFAULT_STATUS[m.category],
    source: payload.source ?? 'direct',
    listing_id: payload.listingId ?? null,
  }
}

export async function submitLead(payload: LeadFormPayload): Promise<{ error: string | null }> {
  const supabase = createClient()
  const row = mapFormToLead(payload)
  const { error } = await supabase.from('leads').insert(row)
  return { error: error?.message ?? null }
}

export async function subscribeNewsletter(payload: {
  email: string
  interest: string
  source?: string
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('newsletter_subscribers').insert({
    email: payload.email,
    interest: payload.interest,
    source: payload.source ?? 'website',
  })
  return { error: error?.message ?? null }
}
