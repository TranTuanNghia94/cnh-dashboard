import { UploadCustomerModal } from '@/components/modal/customer/upload'
import { FilterTextField } from '@/components/table/list-filter-fields'
import { ListFilterBar } from '@/components/table/list-filter-bar'
import { CustomerColumns } from '@/components/table/customer/columns'
import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { useGetCustomers } from '@/hooks/use-customer'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/customer/')({
  component: CustomerPage,
})

function CustomerPage() {
  const { mutate, data } = useGetCustomers()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    customerCode: '',
    misaCode: '',
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

  const queryAllCustomers = useCallback((req?: IRequestPaginationAndSearch) => {
    mutate(buildPayload(req))
  }, [buildPayload, mutate])

  const applyFilters = useCallback(() => {
    queryAllCustomers({ page: 0, limit: 10 })
  }, [queryAllCustomers])

  const resetFilters = useCallback(() => {
    const nextFilters = { customerCode: '', misaCode: '', customerName: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    queryAllCustomers({ page: 0, limit: 10 })
  }, [queryAllCustomers])

  const listTools = useMemo(() => {
    return (
      <ListFilterBar onApply={applyFilters} onReset={resetFilters} rightActions={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/customer/new' })}
          >
            Tạo mới
          </Button>
          <Button size="sm" variant="outline">
            Xuất file
          </Button>
          <UploadCustomerModal onUploadSuccess={() => queryAllCustomers({ page: 0, limit: 10 })} />
        </>
      } activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}>
        <FilterTextField label="Mã khách hàng" value={filters.customerCode} onChange={(value) => setFilters((prev) => ({ ...prev, customerCode: value }))} placeholder="CUS..." />
        <FilterTextField label="Mã MISA" value={filters.misaCode} onChange={(value) => setFilters((prev) => ({ ...prev, misaCode: value }))} placeholder="MISA-01" />
        <FilterTextField label="Tên khách hàng" value={filters.customerName} onChange={(value) => setFilters((prev) => ({ ...prev, customerName: value }))} placeholder="An Phát" />
      </ListFilterBar>
    )
  }, [applyFilters, filters, navigate, queryAllCustomers, resetFilters])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) =>
          queryAllCustomers(req as IRequestPaginationAndSearch)
        }
        total={data?.data?.pagination?.total}
        title="DANH SÁCH KHÁCH HÀNG"
        data={
          data?.data?.data?.map((item) => ({
            ...item,
            refetch: () => queryAllCustomers({ page: 0, limit: 10 }),
          })) || []
        }
        columns={CustomerColumns}
      />
      <Outlet />
    </div>
  )
}
