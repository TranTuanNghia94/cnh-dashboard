import { DataTable } from '@/components/table/data-table'
import { TypeColumns } from '@/components/table/type/columns'
import { Button } from '@/components/ui/button'
import { useGetTypes } from '@/hooks/use-type'
import { IPaginationAndSearch } from '@/types/api'
import { IGroupOfGoodsWhere } from '@/types/type'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/type/')({
    component: TypePage
})


function TypePage() {
    const navigate = useNavigate()
    const { mutateAsync, data } = useGetTypes()

    const queryAllTypes = async (req?: IPaginationAndSearch<IGroupOfGoodsWhere>) => {
        await mutateAsync({ ...req, });
    }

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
                fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<IGroupOfGoodsWhere>)} 
                total={data?.metadata?.total} title='DANH SÁCH NHÓM HÀNG' 
                data={data?.results?.map((item) => ({ ...item, refetch: queryAllTypes })) || []} 
                columns={TypeColumns} />
            <Outlet />
        </div>
    )
}