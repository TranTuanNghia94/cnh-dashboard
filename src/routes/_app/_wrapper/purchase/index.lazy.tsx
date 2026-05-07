import { DataTable } from '@/components/table/data-table'
import { FilterTextField } from '@/components/table/list-filter-fields'
import { ListFilterBar } from '@/components/table/list-filter-bar'
import { PurchaseOrderColumns } from '@/components/table/purchase/column'
import { Button } from '@/components/ui/button'
import { useGetPurchases } from '@/hooks/use-purchase'
import { IRequestPaginationAndSearch } from '@/types/api'
import { IPurchaseOrderResponse } from '@/types/purchase'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/purchase/')({
  component: PurchasePage,
})

function PurchasePage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetPurchases()
  const [filters, setFilters] = useState({
    purchaseOrderNumber: '',
    contractNumber: '',
    createdBy: '',
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

  const queryAllPurchases = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(buildPayload(req))
  }, [buildPayload, mutateAsync])

  const applyFilters = useCallback(() => {
    void queryAllPurchases({ page: 0, limit: 10 })
  }, [queryAllPurchases])

  const resetFilters = useCallback(() => {
    const nextFilters = { purchaseOrderNumber: '', contractNumber: '', createdBy: '', customerName: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    void queryAllPurchases({ page: 0, limit: 10 })
  }, [queryAllPurchases])

  const listTools = useMemo(() => {
    return (
      <ListFilterBar onApply={applyFilters} onReset={resetFilters} rightActions={
        <Button size="sm" variant="outline" onClick={() => navigate({ to: '/purchase/new' })}>Tạo mới</Button>
      } activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}>
        <FilterTextField label="Số đơn mua" value={filters.purchaseOrderNumber} onChange={(value) => setFilters((prev) => ({ ...prev, purchaseOrderNumber: value }))} placeholder="PO.5" />
        <FilterTextField label="Số hợp đồng" value={filters.contractNumber} onChange={(value) => setFilters((prev) => ({ ...prev, contractNumber: value }))} placeholder="HD-2026-01" />
        <FilterTextField label="Người tạo" value={filters.createdBy} onChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))} placeholder="buyer01" />
        <FilterTextField label="Khách hàng" value={filters.customerName} onChange={(value) => setFilters((prev) => ({ ...prev, customerName: value }))} placeholder="An Phát" />
      </ListFilterBar>
    )
  }, [applyFilters, filters.contractNumber, filters.createdBy, filters.customerName, filters.purchaseOrderNumber, navigate, resetFilters])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllPurchases(req as IRequestPaginationAndSearch)}
        total={data?.data?.pagination?.total}
        title="DANH SÁCH ĐƠN MUA HÀNG"
        data={data?.data?.data?.map((item: IPurchaseOrderResponse) => ({
          ...item,
          refetch: () => queryAllPurchases({ page: 0, limit: 10 }),
        })) || []}
        columns={PurchaseOrderColumns}
      />
    </div>
  )
}
