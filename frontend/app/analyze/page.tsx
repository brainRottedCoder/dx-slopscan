import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacyAnalyzePage() {
  return <LegacyRedirect to={ROUTES.scan} />
}
