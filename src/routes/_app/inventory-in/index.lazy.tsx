import { DataTable } from '@/components/table/data-table';
import { InventoryInColumns } from '@/components/table/inventory-in/columns';
import { useGetInventoryIn } from '@/hooks/use-inventory-in';
import { IPaginationAndSearch } from '@/types/api';
import { INhapKhoWhere } from '@/types/inventory-in';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/inventory-in/')({
  component: InventoryInPage
})


function InventoryInPage() {
  const { mutateAsync, data } = useGetInventoryIn()

  const queryAllTypes = async (req?: IPaginationAndSearch<INhapKhoWhere>) => {
    await mutateAsync({ ...req });
  }

  return (
    <div>
      <DataTable listTools={null}
        fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<INhapKhoWhere>)}
        total={data?.metadata?.total} title='DANH SÁCH NHẬP KHO'
        data={data?.results?.map((item) => ({ ...item, refetch: queryAllTypes })) || []}
        columns={InventoryInColumns} />
    </div>
  )
}
