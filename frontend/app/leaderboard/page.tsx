import LegacyRedirect from '@/components/LegacyRedirect'
import { ROUTES } from '@/lib/routes'

export default function LegacyLeaderboardPage() {
  return <LegacyRedirect to={ROUTES.rankings} />
}
