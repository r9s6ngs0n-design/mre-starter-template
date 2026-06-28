import { Metadata } from 'next'
import { SettingsDashboard } from '@/components/dashboard/settings-dashboard'

export const metadata: Metadata = { title: 'Account Settings | {{BRAND_NAME}}' }

export default function SettingsPage() {
  return <SettingsDashboard />
}
