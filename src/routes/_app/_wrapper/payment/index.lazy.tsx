import { DataTable } from '@/components/table/data-table'
import { PaymentColumns } from '@/components/table/payment/columns'
import { Button } from '@/components/ui/button'
import { useGetPayments } from '@/hooks/use-payment'
import { IPaginationAndSearch } from '@/types/api'
import { IPaymentRequestInfo } from '@/types/payment'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/payment/')({
  component: PaymentPage,
})

function PaymentPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetPayments()

  const queryAllTypes = async (req?: IPaginationAndSearch<IPaymentRequestInfo>) => {
    await mutateAsync({ ...req })
  }

  const listTools = useMemo(() => {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: '/payment/new' })}
        >
          Tạo mới
        </Button>
      </div>
    )
  }, [])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) =>
          queryAllTypes(req as IPaginationAndSearch<IPaymentRequestInfo>)
        }
        total={data?.data?.pagination?.total}
        title="DANH SÁCH ĐỀ NGHỊ THANH TOÁN"
        data={data?.data?.data?.map((item) => ({
          ...item,
          refetch: () => queryAllTypes({ take: 10, skip: 0 }),
        })) || []}
        columns={PaymentColumns}
      />
      <Outlet />
    </div>
  )
}
