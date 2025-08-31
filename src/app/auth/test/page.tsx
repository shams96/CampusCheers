'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'

export default function AuthTestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Authentication Test</h1>

        {session ? (
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">✅ Authenticated</h2>

              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
              )}

              <div className="text-left space-y-2">
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                primary
                size="large"
                label="Go to Dashboard"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              />

              <Button
                size="medium"
                label="Sign Out"
                onClick={() => signOut()}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-400">❌ Not Authenticated</h2>
              <p className="text-neutral-400">
                Click the button below to test Google authentication
              </p>
            </div>

            <div className="space-y-3">
              <Button
                primary
                size="large"
                label="Sign in with Google"
                onClick={() => signIn('google')}
                className="w-full"
              />

              <Button
                size="medium"
                label="Go to Main Sign-in"
                onClick={() => router.push('/auth/signin')}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-neutral-500">
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>NextAuth URL:</strong> {process.env.NEXTAUTH_URL}</p>
          <p><strong>Google Client ID:</strong> {process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</p>
        </div>
      </div>
    </main>
  )
}