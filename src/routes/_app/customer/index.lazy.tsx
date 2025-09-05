import { CustomerColumns } from '@/components/table/customer/columns'
import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { useGetCustomers } from '@/hooks/use-customer'
import { IPaginationAndSearch } from '@/types/api'
import { ICustomerWhere } from '@/types/customer'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/customer/')({
    component: CustomerPage,
})


function CustomerPage() {
    const { mutate, data } = useGetCustomers()
    const navigate = useNavigate()


    const queryAllCustomers = (req?: IPaginationAndSearch<ICustomerWhere>) => {
        mutate({ ...req, });
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
                fetchData={(req) => queryAllCustomers(req as IPaginationAndSearch<ICustomerWhere>)} 
                total={data?.metadata?.total} title='DANH SÁCH KHÁCH HÀNG' 
                data={data?.results?.map((item) => ({ ...item, refetch: queryAllCustomers })) || []} 
                columns={CustomerColumns} />
            <Outlet />
        </div>
    )
}