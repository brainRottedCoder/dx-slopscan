import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacySpeciesPage() {
  return <LegacyRedirect to={ROUTES.taxonomy} />
}
