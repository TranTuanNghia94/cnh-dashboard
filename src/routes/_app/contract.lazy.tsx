import { createLazyFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/contract')({
  component: () => <Navigate to="/home" replace />,
})
