import { useCallback, useEffect, useState } from 'react'
import { loadAllEnvironmentalData } from '../services/dataService'

const initialState = {
  loading: true,
  boundaries: null,
  models: { modelA: null, modelB: null },
  errors: {},
}

export default function useEnvironmentalData() {
  const [state, setState] = useState(initialState)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true
    setState((current) => ({ ...current, loading: true }))
    loadAllEnvironmentalData().then((result) => {
      if (active) setState({ loading: false, ...result })
    })
    return () => {
      active = false
    }
  }, [reloadToken])

  const reload = useCallback(() => setReloadToken((value) => value + 1), [])
  return { ...state, reload }
}
