import { DataTable } from '@/components/table/data-table'
import { OrdersColumns } from '@/components/table/order/columns'
import { Button } from '@/components/ui/button'
import { useGetOrders } from '@/hooks/use-order'
import { IRequestPaginationAndSearch } from '@/types/api'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/order/')({
  component: OrderPage,
})



function OrderPage() {
    const navigate = useNavigate()
    const { mutateAsync, data } = useGetOrders()


    const queryAllOrders = async (req?: IRequestPaginationAndSearch) => {
        await mutateAsync({ ...req, });
    }


    const listTools = useMemo(() => {
        return (
            <div className='flex gap-2'>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/order/new" })}>Tạo mới</Button>
                <Button size="sm" variant="outline">Upload file</Button>
            </div>
        )
    }, [])

    return (
        <div>
            <DataTable listTools={listTools} 
                fetchData={(req) => queryAllOrders(req as IRequestPaginationAndSearch)} 
                total={data?.data?.pagination?.total} title='DANH SÁCH ĐƠN HÀNG' 
                data={data?.data?.data?.map((item) => ({ ...item, refetch: queryAllOrders })) || []} 
                columns={OrdersColumns} />
            <Outlet />
        </div>
    )
}