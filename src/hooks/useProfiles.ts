import { useCallback, useEffect, useState } from 'react'
import {
  getProfile as getProfileService,
  updateProfile as updateProfileService,
  deleteProfile as deleteProfileService,
} from '../services/profiles.service'

export function useGetProfile(id?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (profileId = id) => {
    if (!profileId) {
      setProfile(null)
      setLoading(false)
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getProfileService(profileId)
      setProfile(data)
      return data
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (
    id: string,
    profile: {
      name?: string
      last_name?: string
      phone?: string
    }
  ) => {
    try {
      setLoading(true)
      setError(null)
      return await updateProfileService(id, profile)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateProfile, loading, error }
}

export function useDeleteProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteProfile = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteProfileService(id)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteProfile, loading, error }
}

export function useProfiles(id?: string) {
  return useGetProfile(id)
}
