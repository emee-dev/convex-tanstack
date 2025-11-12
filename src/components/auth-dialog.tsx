import { GithubIcon } from '@/assets/svg/github'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

type AuthData = { name: string; email: string; password: string }

export function AuthDialog() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async ({ name, email, password }: AuthData) => {
    await authClient.signUp.email(
      {
        name,
        email,
        password,
        callbackURL: '/',
        image: `https://robohash.org/${name.split(' ').join('+')}`,
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => setLoading(false),
        onError: (ctx) => {
          setLoading(false)
          console.error('SignUp auth error:', ctx.error)
          toast('Oops!!', {
            description: `SignUp auth error: ${ctx.error.message}`,
          })
        },
      },
    )
  }

  const handleSignIn = async ({ email, password }: Omit<AuthData, 'name'>) => {
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: '/',
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => setLoading(false),
        onError: (ctx) => {
          setLoading(false)
          console.error('SignIn auth error:', ctx.error)
          toast('Oops!!', {
            description: `SignIn auth error: ${ctx.error.message}`,
          })
        },
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signIn') {
      await handleSignIn({ email, password })
    } else {
      await handleSignUp({ name: `${firstName} ${lastName}`, email, password })
    }
  }

  const handleGithub = async () => {
    setError('')

    await authClient.signIn.social(
      {
        provider: 'github',
        callbackURL: '/',
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => setLoading(false),
        onError: (ctx) => {
          setLoading(false)
          console.error('Github auth error:', ctx.error.message)
          toast('Oops!!', {
            description: `Github auth error: ${ctx.error.message}`,
          })
        },
      },
    )
  }

  const toggleMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn')
    setError('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          Sign In
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] p-0 border-0 shadow-2xl overflow-hidden font-sans">
        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-2.5">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-2xl font-bold text-white">
              {mode === 'signIn' ? 'Welcome Back' : 'Get Started'}
            </DialogTitle>
            <p className="text-sm text-slate-300 font-normal">
              {mode === 'signIn'
                ? 'Sign in to your account to continue'
                : 'Create an account to get started'}
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg animate-in">
                {error}
              </div>
            )}

            {mode === 'signUp' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="firstName"
                    className="text-xs font-semibold text-slate-700 uppercase tracking-wide"
                  >
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="lastName"
                    className="text-xs font-semibold text-slate-700 uppercase tracking-wide"
                  >
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                      className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wide"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 uppercase tracking-wide"
                >
                  Password
                </Label>
                {mode === 'signIn' && (
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 transition-all duration-200 mt-2"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signIn' ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGithub}
              disabled={loading}
              className="w-full border-slate-200 hover:bg-slate-50 font-semibold py-2.5 transition-all duration-200 bg-transparent"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GithubIcon className="mr-2 h-4 w-4" />
              )}
              Continue with GitHub
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              {mode === 'signIn'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <span className="font-semibold text-slate-900">
                {mode === 'signIn' ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
