import { DataTable } from '@/components/table/data-table'
import { InventoryOutColumns } from '@/components/table/inventory-out/columns'
import { useGetInventoryOut } from '@/hooks/use-inventory-out'
import { IPaginationAndSearch } from '@/types/api'
import { IXuatKhoWhere } from '@/types/inventory-out'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/inventory-out/')({
  component: InventoryOutPage
})

function InventoryOutPage() {
  const { mutateAsync, data } = useGetInventoryOut()

  const queryAllTypes = async (req?: IPaginationAndSearch<IXuatKhoWhere>) => {
    await mutateAsync({ ...req });
  }

  return (
    <div>
      <DataTable listTools={null}
        fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<IXuatKhoWhere>)}
        total={data?.metadata?.total} title='DANH SÁCH XUẤT KHO'
        data={data?.results?.map((item) => ({ ...item, refetch: queryAllTypes })) || []}
        columns={InventoryOutColumns} />
    </div>
  )
}
