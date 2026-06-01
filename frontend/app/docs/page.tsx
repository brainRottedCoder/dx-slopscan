import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacyDocsPage() {
  return <LegacyRedirect to={ROUTES.docQuality} />
}
