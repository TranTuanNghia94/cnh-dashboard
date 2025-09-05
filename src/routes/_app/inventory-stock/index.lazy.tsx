import { DataTable } from '@/components/table/data-table'
import { InventoryStockColumns } from '@/components/table/inventory-stock/columns'
import { useGetInventoryStock } from '@/hooks/use-inventory-stock'
import { IPaginationAndSearch } from '@/types/api'
import { IInventoryStockWhere } from '@/types/inventory-stock'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/inventory-stock/')({
  component: InventoryStockPage
})

function InventoryStockPage() {
  const { mutateAsync, data } = useGetInventoryStock()

  const queryAllTypes = async (req?: IPaginationAndSearch<IInventoryStockWhere>) => {
    await mutateAsync({ ...req });
  }

  return <div>
    <DataTable listTools={null}
      fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<IInventoryStockWhere>)}
      total={data?.metadata?.total} title='DANH SÁCH TỒN KHO'
      data={data?.results?.map((item) => ({ ...item, refetch: queryAllTypes })) || []}
      columns={InventoryStockColumns} />
  </div>
}
