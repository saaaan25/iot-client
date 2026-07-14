import { useCallback, useEffect, useState } from 'react'
import {
  getEvents as getEventsService,
  getEventsBySensor as getEventsBySensorService,
  createEvent as createEventService,
  deleteEvent as deleteEventService,
} from '../services/events.service'
import type { SecurityEvent, EventType, EventSeverity } from '../types'

export function useGetEvents(limit = 50) {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapRowToEvent = useCallback((row: any): SecurityEvent => {
    const dt = row.event_date ?? row.created_at ?? row.timestamp ?? row.date ?? null
    const dateObj = dt ? new Date(dt) : null
    const date = dateObj ? dateObj.toISOString().split('T')[0] : ''
    const time = dateObj ? dateObj.toTimeString().split(' ')[0].slice(0,5) : ''

    const sensorId = row.sensors?.name ?? row.sensor?.name ?? row.sensor_name ?? row.sensor_id ?? row.sensorId ?? ''
    const type = (row.type ?? row.event_type ?? 'alert') as EventType
    const label = row.label ?? row.description ?? `${type} event`
    const severity = (row.severity ?? row.level ?? 'ok') as EventSeverity
    const imageUrl = row.image_url ?? row.imageUrl ?? null

    return {
      id: String(row.id ?? ''),
      date,
      time,
      sensorId,
      type,
      label,
      severity,
      imageUrl,
    }
  }, [])

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getEventsService()
      const rows = Array.isArray(data) ? data : []
      const mapped = rows.map(mapRowToEvent).slice(0, limit)
      setEvents(mapped)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [limit, mapRowToEvent])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export function useGetEventsBySensor() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapRowToEvent = useCallback((row: any): SecurityEvent => {
    const dt = row.event_date ?? row.created_at ?? row.timestamp ?? row.date ?? null
    const dateObj = dt ? new Date(dt) : null
    const date = dateObj ? dateObj.toISOString().split('T')[0] : ''
    const time = dateObj ? dateObj.toTimeString().split(' ')[0].slice(0,5) : ''

    const sensorId = row.sensors?.name ?? row.sensor?.name ?? row.sensor_name ?? row.sensor_id ?? row.sensorId ?? ''
    const type = (row.type ?? row.event_type ?? 'alert') as EventType
    const label = row.label ?? row.description ?? `${type} event`
    const severity = (row.severity ?? row.level ?? 'ok') as EventSeverity
    const imageUrl = row.image_url ?? row.imageUrl ?? null

    return {
      id: String(row.id ?? ''),
      date,
      time,
      sensorId,
      type,
      label,
      severity,
      imageUrl,
    }
  }, [])

  const fetchEventsBySensor = useCallback(async (sensorId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEventsBySensorService(sensorId)
      const rows = Array.isArray(data) ? data : []
      const mapped = rows.map(mapRowToEvent)
      setEvents(mapped)
      return mapped
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [mapRowToEvent])

  return { events, loading, error, fetchEventsBySensor }
}

export function useCreateEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEvent = useCallback(async (event: { sensor_id: string; type: string; value: string }) => {
    try {
      setLoading(true)
      setError(null)
      return await createEventService(event)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { createEvent, loading, error }
}

export function useDeleteEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteEvent = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteEventService(id)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteEvent, loading, error }
}

export function useEvents(limit = 50) {
  return useGetEvents(limit)
}
