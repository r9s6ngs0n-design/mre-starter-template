export interface LeadEmailData {
  full_name: string
  email: string
  mobile?: string | null
  category: string
  enquiry_type: string
  preferred_location?: string | null
  budget_range?: string | null
  requirements?: string | null
}

export function adminLeadNotificationHtml(lead: LeadEmailData): string {
  return `
    <h2>New enquiry — {{BRAND_NAME}}</h2>
    <p><strong>${lead.full_name}</strong> submitted a ${lead.enquiry_type} enquiry (${lead.category}).</p>
    <ul>
      <li>Email: ${lead.email}</li>
      ${lead.mobile ? `<li>Mobile: ${lead.mobile}</li>` : ''}
      ${lead.preferred_location ? `<li>Location: ${lead.preferred_location}</li>` : ''}
      ${lead.budget_range ? `<li>Budget: ${lead.budget_range}</li>` : ''}
    </ul>
    ${lead.requirements ? `<p><strong>Requirements:</strong><br>${lead.requirements}</p>` : ''}
    <p>Log in to the admin CRM to follow up.</p>
  `
}

export function leadConfirmationHtml(name: string): string {
  return `
    <h2>Thank you, ${name}</h2>
    <p>We've received your enquiry and a member of the {{BRAND_NAME}} team will be in touch shortly.</p>
    <p>{{BRAND_NAME}}</p>
  `
}
