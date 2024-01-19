'use client'

import * as React from 'react'
import { auth, useAuth, useUser } from "@clerk/nextjs"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SyncUser() {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const updateParams = {
    firstName: user?.firstName,
    lastName: user?.lastName
  }

  const syncToBackend = async () => {
    try {

      // this endpoint will update the user user in the DN
      // it MUST also update the user's publicMtadata
      // clerkClient.users.updateUserMetadata(userId, { publicMetadata: { "synced": true}})
      await fetch('http://localhost:8080', {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${await getToken()}`
        },
        body: JSON.stringify(updateParams)
      })

      // Reload the user's sessions so metadata changes are reflect in token
      user?.reload()

      // fetch should have worked
      router.push(`${pathname}${searchParams.get('redirect_url')}`)

    } catch (err) {
      console.error('Error Updating:', err)
    }
  }

  React.useEffect(() => {
    if (isLoaded && user?.id) {
      syncToBackend()
    }

  }, [isLoaded, user])




  return (
    <div className="w-screen h-screen border-5 border-red-500 flex items-center justify-center text-2xl animate-spin">
      Loading...
    </div>
  )
}
