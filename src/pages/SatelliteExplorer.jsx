import { Satellite } from 'lucide-react'
import FutureFeaturePage from '../components/layout/FutureFeaturePage'

export default function SatelliteExplorer() {
  return (
    <FutureFeaturePage
      eyebrow="Future integration"
      title="Satellite explorer"
      description="A Google Earth Engine layer service can be connected here in a later phase without changing the Phase 1 map and data-normalization architecture."
      icon={Satellite}
      items={['Google Earth Engine map tiles', 'Dataset and acquisition-date selection', 'Cloud and quality masks', 'Satellite layer opacity and comparison tools']}
    />
  )
}
