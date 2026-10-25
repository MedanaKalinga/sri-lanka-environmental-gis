import { Navigate, Route, Routes } from 'react-router-dom'
import NavigationBar from './components/layout/NavigationBar'
import About from './pages/About'
import ClusteringAnalysis from './pages/ClusteringAnalysis'
import Dashboard from './pages/Dashboard'
import SatelliteExplorer from './pages/SatelliteExplorer'
import SeasonalAnalysis from './pages/SeasonalAnalysis'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <NavigationBar />
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clustering" element={<ClusteringAnalysis />} />
          <Route path="/seasonal" element={<SeasonalAnalysis />} />
          <Route path="/satellite" element={<SatelliteExplorer />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
