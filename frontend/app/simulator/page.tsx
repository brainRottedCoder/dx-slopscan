import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacySimulatorPage() {
  return <LegacyRedirect to={ROUTES.signals} />
}
