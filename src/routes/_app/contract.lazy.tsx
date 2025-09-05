import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/contract')({
  component: () => <div>Hello /_app/contract!</div>,
})
