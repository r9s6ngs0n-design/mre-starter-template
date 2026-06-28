import { Metadata } from 'next'
import { BookingsDashboard } from '@/components/dashboard/bookings-dashboard'

export const metadata: Metadata = { title: 'My Bookings | {{BRAND_NAME}}' }

export default function BookingsPage() {
  return <BookingsDashboard />
}
