import { CalendarRange } from 'lucide-react'
import FutureFeaturePage from '../components/layout/FutureFeaturePage'

export default function SeasonalAnalysis() {
  return (
    <FutureFeaturePage
      eyebrow="Phase 2 feature"
      title="Seasonal analysis"
      description="Temporal and seasonal clustering will be added when the validated Model B dataset and time-series processing workflow are available."
      icon={CalendarRange}
      items={['Season-aware Model B results', 'NDVI, NDWI, and MNDWI trend charts', 'Season and date-range comparison controls', 'Validated temporal summaries by DS Division']}
    />
  )
}
