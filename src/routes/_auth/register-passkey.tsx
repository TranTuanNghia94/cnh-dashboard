import { PasskeyRegistrationContent } from '@/components/auth/passkey-registration-content'
import { isAuthenticated } from '@/lib/auth-guard'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

type RegisterPasskeySearch = {
  required?: string
}

export const Route = createFileRoute('/_auth/register-passkey')({
  validateSearch: (search: Record<string, unknown>): RegisterPasskeySearch => ({
    required: typeof search.required === 'string' ? search.required : undefined,
  }),
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login', replace: true })
    }
  },
  component: RegisterPasskeyPage,
})

function RegisterPasskeyPage() {
  const navigate = useNavigate()
  const { required } = Route.useSearch()
  const isRequired = required === '1'

  const goHome = () => {
    navigate({ to: '/home', replace: true })
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-lg">
        <PasskeyRegistrationContent
          required={isRequired}
          onCompleted={goHome}
          onSkip={isRequired ? undefined : goHome}
        />
      </div>
    </div>
  )
}
