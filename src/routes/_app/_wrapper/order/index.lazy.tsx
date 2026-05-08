import OrderBatchUploadModal from '@/components/order/order-batch-upload-modal'
import { DataTable } from '@/components/table/data-table'
import { FilterSelectField, FilterTextField } from '@/components/table/list-filter-fields'
import { ListFilterBar } from '@/components/table/list-filter-bar'
import { OrdersColumns } from '@/components/table/order/columns'
import { Button } from '@/components/ui/button'
import { useGetOrders } from '@/hooks/use-order'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/order/')({
  component: OrderPage,
})

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

function OrderPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetOrders()
  const [filters, setFilters] = useState({
    createdBy: '',
    contractNumber: '',
    orderNumber: '',
    status: '',
    customerName: '',
  })
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const buildPayload = useCallback((req?: IRequestPaginationAndSearch) => {
    const activeFilters = Object.fromEntries(
      Object.entries(filtersRef.current).filter(([, value]) => String(value).trim() !== '')
    )
    return {
      page: req?.page ?? 0,
      limit: req?.limit ?? 10,
      ...activeFilters,
    } as IRequestPaginationAndSearch
  }, [])

  const queryAllOrders = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(buildPayload(req))
  }, [buildPayload, mutateAsync])

  const applyFilters = useCallback(() => {
    void queryAllOrders({ page: 0, limit: 10 })
  }, [queryAllOrders])

  const resetFilters = useCallback(() => {
    const nextFilters = { createdBy: '', contractNumber: '', orderNumber: '', status: '', customerName: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    void queryAllOrders({ page: 0, limit: 10 })
  }, [queryAllOrders])

  const listTools = useMemo(() => {
    return (
      <ListFilterBar onApply={applyFilters} onReset={resetFilters} rightActions={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/order/new' })}
          >
            Tạo mới
          </Button>
          <OrderBatchUploadModal triggerLabel="Upload file" onUploaded={() => queryAllOrders({ page: 0, limit: 10 })} />
        </>
      } activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}>
        <FilterTextField label="Người tạo" value={filters.createdBy} onChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))} placeholder="admin" />
        <FilterTextField label="Số hợp đồng" value={filters.contractNumber} onChange={(value) => setFilters((prev) => ({ ...prev, contractNumber: value }))} placeholder="HD-2026-01" />
        <FilterTextField label="Số đơn hàng" value={filters.orderNumber} onChange={(value) => setFilters((prev) => ({ ...prev, orderNumber: value }))} placeholder="SO.12" />
        <FilterSelectField
          label="Trạng thái"
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={ORDER_STATUS_OPTIONS}
        />
        <FilterTextField label="Khách hàng" value={filters.customerName} onChange={(value) => setFilters((prev) => ({ ...prev, customerName: value }))} placeholder="Nam Viet" />
      </ListFilterBar>
    )
  }, [applyFilters, filters, navigate, queryAllOrders, resetFilters])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllOrders(req as IRequestPaginationAndSearch)}
        total={data?.data?.pagination?.total}
        title="DANH SÁCH ĐƠN HÀNG"
        data={
          data?.data?.data?.map((item) => ({
            ...item,
            refetch: () => queryAllOrders({ page: 0, limit: 10 }),
          })) || []
        }
        columns={OrdersColumns}
      />
      <Outlet />
    </div>
  )
}
