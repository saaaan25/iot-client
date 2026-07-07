import { useCallback, useEffect, useState } from 'react'
import {
  getAlerts as getAlertsService,
  createAlert as createAlertService,
  updateAlert as updateAlertService,
  deleteAlert as deleteAlertService,
} from '../services/alerts.service'
import type { Alert, AlertLevel } from '../types'

type AlertStatus = 'pending' | 'acknowledged' | 'resolved' | string

type AlertRecord = {
  id: string
  event_id?: string | null
  message?: string
  status?: AlertStatus | null
  created_at?: string | null
  events?: unknown[]
  level?: AlertLevel | string
  sensorId?: string
  timestamp?: string
  acknowledged?: boolean
}

const normalizeAlert = (alert: AlertRecord): Alert => ({
  ...alert,
  id: alert.id,
  level: alert.level === 'critical' || alert.level === 'warning' ? alert.level : 'warning',
  message: alert.message ?? 'Sin mensaje',
  sensorId: alert.sensorId ?? alert.event_id ?? '',
  timestamp: alert.timestamp ?? alert.created_at ?? new Date().toISOString(),
  acknowledged: Boolean(
    alert.acknowledged || ['acknowledged', 'resolved'].includes(String(alert.status ?? '').toLowerCase())
  ),
})

export function useGetAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAlertsService()
      setAlerts((data as AlertRecord[]).map(normalizeAlert))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAlerts()
  }, [fetchAlerts])

  return { alerts, loading, error, refetch: fetchAlerts }
}

export function useCreateAlert() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAlert = useCallback(async (alert: { event_id: string; message: string; status: string }) => {
    try {
      setLoading(true)
      setError(null)
      return await createAlertService(alert)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { createAlert, loading, error }
}

export function useUpdateAlert() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateAlert = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true)
      setError(null)
      return await updateAlertService(id, status)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateAlert, loading, error }
}

export function useDeleteAlert() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAlert = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteAlertService(id)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteAlert, loading, error }
}

export function useAlerts() {
  const { alerts, loading, error, refetch } = useGetAlerts()
  const { updateAlert, loading: updating, error: updateError } = useUpdateAlert()

  const acknowledge = useCallback(async (id: string) => {
    const updated = await updateAlert(id, 'acknowledged')
    return updated
  }, [updateAlert])

  return {
    alerts,
    loading: loading || updating,
    error: error ?? updateError,
    refetch,
    acknowledge,
  }
}
