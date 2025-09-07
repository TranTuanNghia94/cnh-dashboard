import { DataTable } from '@/components/table/data-table'
import { CategoryColumns } from '@/components/table/category/columns'
import { Button } from '@/components/ui/button'
import { useGetCategories } from '@/hooks/use-category'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/type/')({
    component: TypePage
})


function TypePage() {
    const navigate = useNavigate()
    const { mutateAsync, data } = useGetCategories()

    const fetchCategories = useCallback(() => mutateAsync(), [mutateAsync])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleCreate = useCallback(() => navigate({ to: "/type/new" }), [navigate])

    const listTools = useMemo(() => (
        <div className='flex gap-2'>
            <Button size="sm" variant="outline" onClick={handleCreate}>Tạo mới</Button>
        </div>
    ), [handleCreate])

    const rows = useMemo(() => (
        data?.data?.data?.map((item) => ({ ...item, refetch: fetchCategories })) || []
    ), [data, fetchCategories])

    return (
        <div>
            <DataTable listTools={listTools}
                fetchData={fetchCategories}
                total={data?.data?.pagination?.total}
                title='DANH SÁCH NHÓM HÀNG'
                data={rows}
                columns={CategoryColumns} />
            <Outlet />
        </div>
    )
}