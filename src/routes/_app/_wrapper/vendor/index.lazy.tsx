import { DataTable } from '@/components/table/data-table'
import { FilterTextField } from '@/components/table/list-filter-fields'
import { ListFilterBar } from '@/components/table/list-filter-bar'
import { VendorColumns } from '@/components/table/vendor/columns'
import { Button } from '@/components/ui/button'
import { ExportJobButton } from '@/components/export/export-job-button'
import { useGetVendors } from '@/hooks/use-vendor'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { UploadVendorModal } from '@/components/modal/vendor/upload'

export const Route = createLazyFileRoute('/_app/_wrapper/vendor/')({
  component: VendorPage,
})

function VendorPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetVendors()
  const [filters, setFilters] = useState({
    vendorCode: '',
    vendorName: '',
    misaCode: '',
    currency: '',
    nation: '',
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

  const queryAllVendors = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(buildPayload(req))
  }, [buildPayload, mutateAsync])

  const applyFilters = useCallback(() => {
    void queryAllVendors({ page: 0, limit: 10 })
  }, [queryAllVendors])

  const resetFilters = useCallback(() => {
    const nextFilters = { vendorCode: '', vendorName: '', misaCode: '', currency: '', nation: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    void queryAllVendors({ page: 0, limit: 10 })
  }, [queryAllVendors])

  const listTools = useMemo(() => {
    return (
      <ListFilterBar onApply={applyFilters} onReset={resetFilters} rightActions={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/vendor/new' })}
          >
            Tạo mới
          </Button>
          <ExportJobButton type="VENDORS" />
          <UploadVendorModal onUploadSuccess={() => queryAllVendors({ page: 0, limit: 10 })} />
        </>
      } activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}>
        <FilterTextField label="Mã NCC" value={filters.vendorCode} onChange={(value) => setFilters((prev) => ({ ...prev, vendorCode: value }))} placeholder="VN..." />
        <FilterTextField label="Tên NCC" value={filters.vendorName} onChange={(value) => setFilters((prev) => ({ ...prev, vendorName: value }))} placeholder="Global..." />
        <FilterTextField label="Mã MISA" value={filters.misaCode} onChange={(value) => setFilters((prev) => ({ ...prev, misaCode: value }))} placeholder="MS-02" />
        <FilterTextField label="Tiền tệ" value={filters.currency} onChange={(value) => setFilters((prev) => ({ ...prev, currency: value }))} placeholder="USD" />
        <FilterTextField label="Quốc gia" value={filters.nation} onChange={(value) => setFilters((prev) => ({ ...prev, nation: value }))} placeholder="Vietnam" />
      </ListFilterBar>
    )
  }, [applyFilters, filters, navigate, queryAllVendors, resetFilters])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllVendors(req as IRequestPaginationAndSearch)}
        total={data?.data.pagination?.total}
        title="DANH SÁCH NHÀ CUNG CẤP"
        data={
          data?.data.data?.map((item) => ({
            ...item,
            refetch: () => queryAllVendors({ page: 0, limit: 10 }),
          })) || []
        }
        columns={VendorColumns}
      />
      <Outlet />
    </div>
  )
}
