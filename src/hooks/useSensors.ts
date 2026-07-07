import { useCallback, useEffect, useState } from 'react'
import {
  getSensors as getSensorsService,
  getSensorsByDevice as getSensorsByDeviceService,
  createSensor as createSensorService,
  updateSensor as updateSensorService,
  deleteSensor as deleteSensorService,
} from '../services/sensors.service'
import type { Sensor } from '../types'

export function useGetSensors() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSensorsService()
      setSensors(data as Sensor[])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSensors()
  }, [fetchSensors])

  return { sensors, loading, error, refetch: fetchSensors }
}

export function useGetSensorsByDevice() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSensorsByDevice = useCallback(async (deviceId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSensorsByDeviceService(deviceId)
      setSensors(data as Sensor[])
      return data as Sensor[]
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { sensors, loading, error, fetchSensorsByDevice }
}

export function useCreateSensor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSensor = useCallback(async (sensor: {
    type: string
    name: string
    pin: number
    status?: boolean
    device_id: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      return await createSensorService(sensor)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { createSensor, loading, error }
}

export function useUpdateSensor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSensor = useCallback(async (
    id: string,
    sensor: {
      type?: string
      name?: string
      status?: boolean
      pin?: number
      device_id?: string
    }
  ) => {
    try {
      setLoading(true)
      setError(null)
      return await updateSensorService(id, sensor)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateSensor, loading, error }
}

export function useDeleteSensor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteSensor = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteSensorService(id)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteSensor, loading, error }
}

export function useSensors(pollInterval = 8000) {
  const { sensors, loading, error, refetch } = useGetSensors()

  useEffect(() => {
    if (!pollInterval) return
    const id = window.setInterval(() => {
      void refetch()
    }, pollInterval)

    return () => window.clearInterval(id)
  }, [pollInterval, refetch])

  return { sensors, loading, error, refetch }
}
