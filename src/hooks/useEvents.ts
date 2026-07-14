import { useCallback, useEffect, useState } from 'react'
import {
  getEvents as getEventsService,
  getEventsBySensor as getEventsBySensorService,
  createEvent as createEventService,
  deleteEvent as deleteEventService,
} from '../services/events.service'
import type { SecurityEvent } from '../types'

export function useGetEvents(limit = 50) {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getEventsService()
      setEvents((data as SecurityEvent[]).slice(0, limit))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export function useGetEventsBySensor() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEventsBySensor = useCallback(async (sensorId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEventsBySensorService(sensorId)
      setEvents(data as SecurityEvent[])
      return data as SecurityEvent[]
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

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
