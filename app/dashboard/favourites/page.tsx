import { Metadata } from 'next'
import { FavouritesDashboard } from '@/components/dashboard/favourites-dashboard'

export const metadata: Metadata = { title: 'Saved Listings | {{BRAND_NAME}}' }

export default function FavouritesPage() {
  return <FavouritesDashboard />
}
