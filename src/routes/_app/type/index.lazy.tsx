import { DataTable } from '@/components/table/data-table'
import { CategoryColumns } from '@/components/table/category/columns'
import { Button } from '@/components/ui/button'
import { useGetCategories } from '@/hooks/use-category'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/type/')({
    component: TypePage
})


function TypePage() {
    const navigate = useNavigate()
    const { mutateAsync, data } = useGetCategories()

    useEffect(() => {
        mutateAsync()
    }, [])

    const listTools = useMemo(() => {
        return (
            <div className='flex gap-2'>
                <Button size="sm" variant="outline" onClick={() => navigate({to: "/type/new"})}>Tạo mới</Button>
            </div>
        )
    }, [])

    return (
        <div>
            <DataTable listTools={listTools} 
                fetchData={() => mutateAsync()} 
                total={data?.data?.pagination?.total} title='DANH SÁCH NHÓM HÀNG' 
                data={data?.data?.data?.map((item) => ({ ...item, refetch: mutateAsync })) || []} 
                columns={CategoryColumns} />
            <Outlet />
        </div>
    )
}