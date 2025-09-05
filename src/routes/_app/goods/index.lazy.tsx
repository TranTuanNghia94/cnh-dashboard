import { DataTable } from '@/components/table/data-table'
import { GoodsColumns } from '@/components/table/goods/columns'
import { Button } from '@/components/ui/button'
import { useGetGoods } from '@/hooks/use-goods'
import { IPaginationAndSearch } from '@/types/api'
import { IGoodsWhere } from '@/types/goods'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/goods/')({
  component: GoodsPage
})


function GoodsPage() {
    const navigate = useNavigate()
    const { mutateAsync, data } = useGetGoods()

    const queryAllTypes = async (req?: IPaginationAndSearch<IGoodsWhere>) => {
        await mutateAsync({ ...req, });
    }

    const listTools = useMemo(() => {
        return (
            <div className='flex gap-2'>
                <Button size="sm" variant="outline" onClick={() => navigate({to: "/goods/new"})}>Tạo mới</Button>
            </div>
        )
    }, [])

    return (
        <div>
            <DataTable listTools={listTools} 
                fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<IGoodsWhere>)} 
                total={data?.metadata?.total} title='DANH SÁCH HÀNG HOÁ' 
                data={data?.results?.map((item) => ({ ...item, refetch: queryAllTypes })) || []} 
                columns={GoodsColumns} />
            <Outlet />
        </div>
    )
}