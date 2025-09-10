import { CustomerColumns } from '@/components/table/customer/columns'
import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { useGetCustomers } from '@/hooks/use-customer'
import { IRequestPaginationAndSearch } from '@/types/api'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/customer/')({
    component: CustomerPage,
})


function CustomerPage() {
    const { mutate, data } = useGetCustomers()
    const navigate = useNavigate()


    const queryAllCustomers = (req?: IRequestPaginationAndSearch) => {
        mutate(req);
    }

    const listTools = useMemo(() => {
        return (
            <div className='flex gap-2'>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/customer/new" })}>Tạo mới</Button>
                <Button size="sm" variant="outline">Xuất file</Button>
                <Button size="sm" variant="outline">Cập nhật file</Button>
            </div>
        )
    }, [])

    return (
        <div>
            <DataTable listTools={listTools}
                fetchData={(req) => queryAllCustomers(req as IRequestPaginationAndSearch)} 
                total={data?.data?.pagination?.total} title='DANH SÁCH KHÁCH HÀNG' 
                data={data?.data?.data?.map((item) => ({ ...item, refetch: queryAllCustomers })) || []} 
                columns={CustomerColumns} />
            <Outlet />
        </div>
    )
}