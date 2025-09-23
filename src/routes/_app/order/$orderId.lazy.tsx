import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_app/order/$orderId')({
  component: () => (<div>Hello /_app/order/new!</div>) 
})

