import { useCallback, useEffect, useState } from 'react'
import {
  signUp as signUpService,
  signIn as signInService,
  signOut as signOutService,
  getCurrentUser as getCurrentUserService,
} from '../services/auth.service'

export function useSignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      return await signUpService(email, password)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { signUp, loading, error }
}

export function useSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      return await signInService(email, password)
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { signIn, loading, error }
}

export function useSignOut() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await signOutService()
    } catch (e) {
      setError((e as Error).message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { signOut, loading, error }
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const currentUser = await getCurrentUserService()
      setUser(currentUser)
      return currentUser
    } catch (e) {
      setError((e as Error).message)
      setUser(null)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchUser()
  }, [fetchUser])

  return { user, loading, error, refetch: fetchUser }
}

export function useAuth() {
  const signUpHook = useSignUp()
  const signInHook = useSignIn()
  const signOutHook = useSignOut()
  const currentUserHook = useCurrentUser()

  return {
    ...signUpHook,
    ...signInHook,
    ...signOutHook,
    ...currentUserHook,
  }
}
