import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authRateLimiter } from '@/lib/rateLimit'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        const clientIP = '127.0.0.1'
        const rateLimit = authRateLimiter.check(`signin_${clientIP}`)
        if (!rateLimit.allowed) {
          console.log('Rate limit exceeded for sign-in attempts')
          return false
        }
        if (profile?.hd && process.env.ALLOWED_DOMAINS?.split(',').includes(profile.hd)) {
          return true
        }
        if (process.env.NODE_ENV === 'development') {
          return true
        }
        console.log('Rejected sign-in: Not a school Google account', profile?.hd)
        return false
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
