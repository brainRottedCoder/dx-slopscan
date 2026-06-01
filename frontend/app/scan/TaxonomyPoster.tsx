// Taxonomy poster component - imports from unified species source
import { SPECIES_DATA } from '@/lib/species'

export const SPECIES = SPECIES_DATA.map(s => ({
  glyph: s.lucideIcon,
  name: s.name,
  color: s.color,
  desc: s.desc,
  fix: s.fix,
  example: s.example,
}))

export default SPECIES
