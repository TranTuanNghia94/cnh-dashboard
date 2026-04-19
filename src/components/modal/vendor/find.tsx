import { DataTableModal } from '@/components/table/data-table-modal'
import { ModalFindVendorColumns } from '@/components/table/vendor/modal-find-vendor'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGetVendors } from '@/hooks/use-vendor'
import { IRequestPaginationAndSearch } from '@/types/api'
import { IVendorResponse } from '@/types/vendor'
import { useCallback, useEffect, useState } from 'react'

type Props = {
  onSelect: (vendor: IVendorResponse) => void
  triggerLabel?: string
  disabled?: boolean
}

const FindVendor = ({ onSelect, triggerLabel = 'Chọn NCC', disabled }: Props) => {
  const { mutateAsync, data } = useGetVendors()
  const [selected, setSelected] = useState<IVendorResponse>()
  const [open, setOpen] = useState(false)

  const queryVendors = useCallback(async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(req)
  }, [mutateAsync])

  useEffect(() => {
    if (open) {
      void queryVendors({ limit: 10, page: 0 })
    }
  }, [open, queryVendors])

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <DataTableModal
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
