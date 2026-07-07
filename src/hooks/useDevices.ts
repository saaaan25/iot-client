import { useCallback, useEffect, useState } from 'react'
import {
  getDevices as getDevicesService,
  getDeviceById as getDeviceByIdService,
  createDevice as createDeviceService,
  updateDevice as updateDeviceService,
  deleteDevice as deleteDeviceService,
} from '../services/devices.service'

export function useGetDevices() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDevicesService()
      setDevices(data as any[])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDevices()
  }, [fetchDevices])

  return { devices, loading, error, refetch: fetchDevices }
}

export function useGetDeviceById(id?: string) {
  const [device, setDevice] = useState<any>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  const fetchDeviceById = useCallback(async (deviceId = id) => {
    if (!deviceId) {
      setDevice(null)
      setLoading(false)
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getDeviceByIdService(deviceId)
      setDevice(data)
      return data
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchDeviceById()
  }, [fetchDeviceById])

  return { device, loading, error, refetch: fetchDeviceById }
}

export function useCreateDevice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createDevice = useCallback(async (device: {
    name: string
    address: string
    ubication: string
    status?: boolean
    user_id: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      return await createDeviceService(device)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { createDevice, loading, error }
}

export function useUpdateDevice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateDevice = useCallback(async (
    id: string,
    device: {
      name?: string
      address?: string
      ubication?: string
      status?: boolean
    }
  ) => {
    try {
      setLoading(true)
      setError(null)
      return await updateDeviceService(id, device)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateDevice, loading, error }
}

export function useDeleteDevice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteDevice = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteDeviceService(id)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteDevice, loading, error }
}

export function useDevices(id?: string) {
  return useGetDevices()
}
