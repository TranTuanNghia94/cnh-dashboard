import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_app/order/$orderId')({
  component: UpdateOrderPage,
})


function UpdateOrderPage() {
    return <div>Hello /_app/order/$orderId!</div>
}