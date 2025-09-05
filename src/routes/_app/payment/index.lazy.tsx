import { DataTable } from '@/components/table/data-table'
import { PaymentColumns } from '@/components/table/payment/columns'
import { Button } from '@/components/ui/button'
import { useGetPayments } from '@/hooks/use-payment'
import { IPaginationAndSearch } from '@/types/api'
import { IPaymentResponse, IPaymentWhere } from '@/types/payment'
import { createLazyFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/payment/')({
  component: PaymentPage
})

function PaymentPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetPayments()


  const queryAllTypes = async (req?: IPaginationAndSearch<IPaymentWhere>) => {
    await mutateAsync({ ...req, });
  }

  const listTools = useMemo(() => {
    return (
      <div className='flex gap-2'>
        <Button size="sm" variant="outline" onClick={() => navigate({ to: "/payment/new" })}>Tạo mới</Button>
      </div>
    )
  }, [])

  return (
    <div>
      <DataTable listTools={listTools} fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<IPaymentWhere>)} total={data?.metadata?.total} title='DANH SÁCH ĐỀ NGHỊ THANH TOÁN' data={data?.results as IPaymentResponse[] || []} columns={PaymentColumns} />
      <Outlet />
    </div>
  )
}