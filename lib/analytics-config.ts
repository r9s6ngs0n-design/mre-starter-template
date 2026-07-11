/**
 * Route path prefixes that count as "property interest" in the analytics funnel.
 * Template-configurable — adjust if category or detail routes differ.
 */
export const FUNNEL_PROPERTY_INTEREST_PREFIXES = [
  '/property/',
  '/buy',
  '/rent',
  '/projects',
  '/commercial',
] as const
