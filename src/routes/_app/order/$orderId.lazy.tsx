import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_app/order/$orderId')({
  component: OrderIdPage,
})


function OrderIdPage() {
    return <div>Hello /_app/order/$orderId!</div>
}