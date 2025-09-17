import { DataTable } from '@/components/table/data-table'
import { VendorColumns } from '@/components/table/vendor/columns'
import { Button } from '@/components/ui/button'
import { useGetVendors } from '@/hooks/use-vendor'
import { IRequestPaginationAndSearch } from '@/types/api'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/vendor/')({
    component: VendorPage
})


function VendorPage() {
    const navigate = useNavigate()
    const { mutateAsync, data: dataVendors } = useGetVendors()


    const queryAllVendors = async (req?: IRequestPaginationAndSearch) => {
        await mutateAsync({ ...req, });
    }

    const listTools = useMemo(() => {
        return (
            <div className='flex gap-2'>
                <Button size="sm" variant="outline" onClick={() => navigate({to: "/vendor/new"})}>Tạo mới</Button>
                <Button size="sm" variant="outline">Xuất file</Button>
                <Button size="sm" variant="outline">Cập nhật file</Button>
            </div>
        )
    }, [])

    return (
        <div>
            <DataTable listTools={listTools} 
                fetchData={(req) => queryAllVendors(req as IRequestPaginationAndSearch)} 
                total={dataVendors?.data?.pagination?.total} title='DANH SÁCH NHÀ CUNG CẤP' 
                data={dataVendors?.data?.data?.map((item) => ({ ...item, refetch: queryAllVendors })) || []} 
                columns={VendorColumns} />
            <Outlet />
        </div>
    )
}