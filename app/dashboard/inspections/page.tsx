import { Metadata } from 'next'
import { InspectionsDashboard } from '@/components/dashboard/inspections-dashboard'

export const metadata: Metadata = { title: 'My Inspections' }

export default function InspectionsPage() {
  return <InspectionsDashboard />
}
