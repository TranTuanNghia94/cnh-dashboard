import { DataTable } from '@/components/table/data-table'
import { FilterSelectField, FilterTextField } from '@/components/table/list-filter-fields'
import { ListFilterBar } from '@/components/table/list-filter-bar'
import { PaymentColumns } from '@/components/table/payment/columns'
import { Button } from '@/components/ui/button'
import { useGetPayments } from '@/hooks/use-payment'
import { PAYMENT_REQUEST_STATUS_STYLES } from '@/lib/constants'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/payment/')({
  component: PaymentPage,
})

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(PAYMENT_REQUEST_STATUS_STYLES).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
]

function PaymentPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetPayments()
  const [filters, setFilters] = useState({
    createdBy: '',
    paymentRequestNumber: '',
    vendorCode: '',
    numberOfPaper: '',
    status: '',
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

  const queryAllTypes = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(buildPayload(req))
  }, [buildPayload, mutateAsync])

  const applyFilters = useCallback(() => {
    void queryAllTypes({ page: 0, limit: 10 })
  }, [queryAllTypes])

  const resetFilters = useCallback(() => {
    const nextFilters = { createdBy: '', paymentRequestNumber: '', vendorCode: '', numberOfPaper: '', status: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    void queryAllTypes({ page: 0, limit: 10 })
  }, [queryAllTypes])

  const listTools = useMemo(() => {
    return (
      <ListFilterBar onApply={applyFilters} onReset={resetFilters} rightActions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: '/payment/new' })}
        >
          Tạo mới
        </Button>
      } activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}>
        <FilterTextField label="Người tạo" value={filters.createdBy} onChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))} placeholder="accountant1" />
        <FilterTextField label="Số đề nghị" value={filters.paymentRequestNumber} onChange={(value) => setFilters((prev) => ({ ...prev, paymentRequestNumber: value }))} placeholder="PR.8" />
        <FilterTextField label="Mã NCC" value={filters.vendorCode} onChange={(value) => setFilters((prev) => ({ ...prev, vendorCode: value }))} placeholder="VN01" />
        <FilterTextField label="Số chứng từ" value={filters.numberOfPaper} onChange={(value) => setFilters((prev) => ({ ...prev, numberOfPaper: value }))} placeholder="INV-2026-009" />
        <FilterSelectField
          label="Trạng thái"
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={PAYMENT_STATUS_OPTIONS}
        />
      </ListFilterBar>
    )
  }, [applyFilters, filters.createdBy, filters.numberOfPaper, filters.paymentRequestNumber, filters.status, filters.vendorCode, navigate, resetFilters])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) =>
          queryAllTypes(req as IRequestPaginationAndSearch)
        }
        total={data?.data?.pagination?.total}
        title="DANH SÁCH ĐỀ NGHỊ THANH TOÁN"
        data={data?.data?.data?.map((item) => ({
          ...item,
          refetch: () => queryAllTypes({ page: 0, limit: 10 }),
        })) || []}
        columns={PaymentColumns}
      />
      <Outlet />
    </div>
  )
}
