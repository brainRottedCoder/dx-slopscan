import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacyBenchmarkPage() {
  return <LegacyRedirect to={ROUTES.evaluation} />
}
