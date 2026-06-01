import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacyIntegrationsPage() {
  return <LegacyRedirect to={ROUTES.setup} />
}
