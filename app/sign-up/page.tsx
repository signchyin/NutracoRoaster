import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import Image from 'next/image'

export const metadata = {
  title: 'Create Account - Roastery',
  description: 'Sign up for a Roastery account',
}

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')
  
  return (
    <div className="min-h-svh bg-background flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-[linear-gradient(135deg,#70504a,#9c7259)] text-white flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center space-y-8">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-accent/20">
            <Image src="/mascot.png" alt="" width={56} height={56} className="h-14 w-14 object-contain" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Start Your Journey</h2>
            <p className="text-white/80 text-lg">
              Join hundreds of roasters using Roastery to streamline their operations and grow faster.
            </p>
          </div>
          <div className="pt-8 border-t border-white/20 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div className="text-left">
                <p className="font-semibold">Free to start</p>
                <p className="text-sm text-white/70">No credit card required</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div className="text-left">
                <p className="font-semibold">Quick setup</p>
                <p className="text-sm text-white/70">Get started in minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚀</div>
              <div className="text-left">
                <p className="font-semibold">Scale easily</p>
                <p className="text-sm text-white/70">Grow without limits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <AuthForm mode="sign-up" />
      </div>
    </div>
  )
}
