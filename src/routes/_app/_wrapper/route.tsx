import { useLogoutMutation } from '@/hooks/use-auth'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

export const Route = createFileRoute('/_app/_wrapper')({
    component: RouteComponent,
})


function RouteComponent() {
    const { mutate } = useLogoutMutation()

    return (
        <LayoutWrapper onLogout={() => mutate()}>
            <Outlet />
        </LayoutWrapper>
    )
}
