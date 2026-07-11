/* ── Template config (replace per client) ─────────────────────────────────── */

/* TODO(client): set the agency's primary timezone (IANA name) */
export const SITE_TIMEZONE = 'Australia/Melbourne'

/* TODO(client): set the agency's display locale (BCP 47) */
export const SITE_LOCALE = 'en-AU'

/** @deprecated Prefer SITE_TIMEZONE — kept as a stable alias for existing call sites. */
export const MELBOURNE_TZ = SITE_TIMEZONE
/** @deprecated Prefer SITE_LOCALE — kept as a stable alias for existing call sites. */
export const AU_LOCALE = SITE_LOCALE

/* ── Helpers (generic; honour SITE_TIMEZONE / SITE_LOCALE) ─────────────────── */

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getSiteFormatter(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options)
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(SITE_LOCALE, { timeZone: SITE_TIMEZONE, ...options })
    formatterCache.set(key, formatter)
  }
  return formatter
}

export function melbourneParts(date: Date) {
  const parts = getSiteFormatter({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour') === '24' ? '0' : get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
  }
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** YYYY-MM-DD in SITE_TIMEZONE for a given instant. */
export function melbourneDateKey(date: Date | string = new Date()): string {
  const p = melbourneParts(typeof date === 'string' ? new Date(date) : date)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`
}

/** YYYY-MM-DD offset from today in SITE_TIMEZONE. */
export function melbourneDateOffset(daysFromToday: number): string {
  const p = melbourneParts(new Date())
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + daysFromToday))
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

/** Convert a SITE_TIMEZONE wall-clock datetime-local value to ISO UTC. */
export function datetimeLocalToIso(local: string): string {
  const [datePart, timePart = '00:00'] = local.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  let ms = Date.UTC(year, month - 1, day, hour, minute)
  for (let i = 0; i < 4; i++) {
    const p = melbourneParts(new Date(ms))
    const targetMinutes = hour * 60 + minute
    const actualMinutes = p.hour * 60 + p.minute
    const dayDiff = day - p.day
    const minuteDiff = targetMinutes - actualMinutes + dayDiff * 1440
    if (minuteDiff === 0 && p.year === year && p.month === month) break
    ms += minuteDiff * 60_000
  }
  return new Date(ms).toISOString()
}

/** Convert ISO UTC to a datetime-local string in SITE_TIMEZONE. */
export function isoToDatetimeLocal(iso: string): string {
  const p = melbourneParts(new Date(iso))
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`
}

/** Combine separate date + time inputs (SITE_TIMEZONE wall clock) into ISO UTC. */
export function dateAndTimeToIso(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? time : time.slice(0, 5)
  return datetimeLocalToIso(`${date}T${normalizedTime}`)
}

/** Start of a SITE_TIMEZONE calendar day as a UTC Date. */
export function startOfDayMelbourne(date: Date = new Date()): Date {
  const key = melbourneDateKey(date)
  return new Date(datetimeLocalToIso(`${key}T00:00`))
}

/** Start of the current calendar month in SITE_TIMEZONE as a UTC Date. */
export function startOfMonthMelbourne(date: Date = new Date()): Date {
  const p = melbourneParts(date)
  return new Date(datetimeLocalToIso(`${p.year}-${pad2(p.month)}-01T00:00`))
}

export function formatDateMelbourne(
  iso: string | Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter(options).format(date)
}

export function formatTimeMelbourne(
  iso: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter(options).format(date)
}

export function formatDateTimeMelbourne(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter({
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatMonthYearMelbourne(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter({ month: 'long', year: 'numeric' }).format(date)
}

export function formatShortDateMelbourne(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter({ day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function formatMonthShortMelbourne(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter({ month: 'short' }).format(date)
}

export function formatYearMelbourne(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return getSiteFormatter({ year: 'numeric' }).format(date)
}

export function formatDayOfMonthMelbourne(iso: string | Date): number {
  return melbourneParts(typeof iso === 'string' ? new Date(iso) : iso).day
}

export function formatMonthIndexMelbourne(iso: string | Date): number {
  return melbourneParts(typeof iso === 'string' ? new Date(iso) : iso).month - 1
}
