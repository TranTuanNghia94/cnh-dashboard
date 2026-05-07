import { DataTable } from '@/components/table/data-table'
import { FilterTextField } from '@/components/table/list-filter-fields'
import { ListFilterBar } from '@/components/table/list-filter-bar'
import { ProductColumns } from '@/components/table/product/columns'
import { Button } from '@/components/ui/button'
import { UploadProductModal } from '@/components/modal/product/upload'
import { useGetProducts } from '@/hooks/use-product'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/goods/')({
  component: ProductPage,
})

function ProductPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetProducts()
  const [filters, setFilters] = useState({
    productCode: '',
    productName: '',
    productCategory: '',
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

  const queryAllProducts = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(buildPayload(req))
  }, [buildPayload, mutateAsync])

  const applyFilters = useCallback(() => {
    void queryAllProducts({ page: 0, limit: 10 })
  }, [queryAllProducts])

  const resetFilters = useCallback(() => {
    const nextFilters = { productCode: '', productName: '', productCategory: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    void queryAllProducts({ page: 0, limit: 10 })
  }, [queryAllProducts])

  const listTools = useMemo(() => {
    return (
      <ListFilterBar onApply={applyFilters} onReset={resetFilters} rightActions={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/goods/new' })}
          >
            Tạo mới
          </Button>

          <UploadProductModal 
            onUploadSuccess={() => {}}
          />
        </>
      } activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}>
        <FilterTextField label="Mã hàng" value={filters.productCode} onChange={(value) => setFilters((prev) => ({ ...prev, productCode: value }))} placeholder="SP..." />
        <FilterTextField label="Tên hàng" value={filters.productName} onChange={(value) => setFilters((prev) => ({ ...prev, productName: value }))} placeholder="Bolt..." />
        <FilterTextField label="Loại hàng" value={filters.productCategory} onChange={(value) => setFilters((prev) => ({ ...prev, productCategory: value }))} placeholder="Fastener" />
      </ListFilterBar>
    )
  }, [applyFilters, filters.productCategory, filters.productCode, filters.productName, navigate, resetFilters])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) =>
          queryAllProducts(req as IRequestPaginationAndSearch)
        }
        total={data?.data?.pagination?.total}
        title="DANH SÁCH HÀNG HOÁ"
        data={
          data?.data?.data?.map((item) => ({
            ...item,
            refetch: () => queryAllProducts({ page: 0, limit: 10 }),
          })) || []
        }
        columns={ProductColumns}
      />
      <Outlet />
    </div>
  )
}
