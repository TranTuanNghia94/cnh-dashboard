import { DataTableModal } from '@/components/table/data-table-modal'
import { ModalFindVendorColumns } from '@/components/table/vendor/modal-find-vendor'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGetVendors } from '@/hooks/use-vendor'
import { IRequestPaginationAndSearch } from '@/types/api'
import { IVendorResponse } from '@/types/vendor'
import { useCallback, useRef, useState } from 'react'

type Props = {
  onSelect: (vendor: IVendorResponse) => void
  triggerLabel?: string
  disabled?: boolean
}

const FindVendor = ({ onSelect, triggerLabel = 'Chọn NCC', disabled }: Props) => {
  const { mutateAsync, data } = useGetVendors()
  const [selected, setSelected] = useState<IVendorResponse>()
  const [open, setOpen] = useState(false)
  const [filterVersion, setFilterVersion] = useState(0)
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
      Object.entries(filtersRef.current).filter(([, value]) => value.trim() !== ''),
    )

    return {
      page: req?.page ?? 0,
      limit: req?.limit ?? 10,
      ...activeFilters,
    } as IRequestPaginationAndSearch
  }, [])

  const queryVendors = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(buildPayload(req))
  }, [buildPayload, mutateAsync])

  const applyFilters = useCallback(() => {
    setSelected(undefined)
    setFilterVersion((value) => value + 1)
  }, [])

  const resetFilters = useCallback(() => {
    const nextFilters = { vendorCode: '', vendorName: '', misaCode: '', currency: '', nation: '' }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    setSelected(undefined)
    setFilterVersion((value) => value + 1)
  }, [])

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value)
    if (!value) {
      setSelected(undefined)
    }
  }, [])

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected)
      setOpen(false)
      setSelected(undefined)
    }
  }

  const handleDoubleClick = useCallback((v: IVendorResponse) => {
    onSelect(v)
    setOpen(false)
    setSelected(undefined)
  }, [onSelect])

  const activeFilterCount = Object.values(filters).filter((value) => value.trim() !== '').length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="xs" variant="outline" disabled={disabled}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle className="uppercase">Chọn nhà cung cấp</DialogTitle>
            <div className="flex gap-x-2">
              <Button size="sm" onClick={handleConfirm} disabled={!selected}>
                Xác nhận
              </Button>
              <DialogClose asChild>
                <Button size="sm" variant="outline" onClick={() => setSelected(undefined)}>
                  Đóng
                </Button>
              </DialogClose>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Nhấp đúp vào một dòng để chọn nhanh.</p>
        </DialogHeader>
        <form
          className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault()
            applyFilters()
          }}
        >
          <div>
            <Label className="mb-2 block text-xs">Mã NCC</Label>
            <Input
              className="h-9"
              placeholder="VN..."
              value={filters.vendorCode}
              onChange={(event) => setFilters((prev) => ({ ...prev, vendorCode: event.target.value }))}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs">Tên NCC</Label>
            <Input
              className="h-9"
              placeholder="Global..."
              value={filters.vendorName}
              onChange={(event) => setFilters((prev) => ({ ...prev, vendorName: event.target.value }))}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs">Mã MISA</Label>
            <Input
              className="h-9"
              placeholder="MS-02"
              value={filters.misaCode}
              onChange={(event) => setFilters((prev) => ({ ...prev, misaCode: event.target.value }))}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs">Tiền tệ</Label>
            <Input
              className="h-9"
              placeholder="USD"
              value={filters.currency}
              onChange={(event) => setFilters((prev) => ({ ...prev, currency: event.target.value }))}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs">Quốc gia</Label>
            <Input
              className="h-9"
              placeholder="Vietnam"
              value={filters.nation}
              onChange={(event) => setFilters((prev) => ({ ...prev, nation: event.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Áp dụng</Button>
            <Button type="button" size="sm" variant="outline" onClick={resetFilters} disabled={activeFilterCount === 0}>
              Xóa lọc
            </Button>
          </div>
        </form>
        <DataTableModal
          key={filterVersion}
          selectedFunct={setSelected}
          onDoubleClickConfirm={handleDoubleClick}
          fetchData={(req) => queryVendors(req as IRequestPaginationAndSearch)}
          total={data?.data?.pagination?.total}
          data={data?.data?.data ?? []}
          columns={ModalFindVendorColumns}
        />
      </DialogContent>
    </Dialog>
  )
}

export default FindVendor
