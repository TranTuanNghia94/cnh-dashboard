import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SlidersHorizontal } from 'lucide-react'

interface ListFilterBarProps {
  children: ReactNode
  onApply: () => void
  onReset: () => void
  rightActions?: ReactNode
  activeFilterCount?: number
}

export function ListFilterBar({
  children,
  onApply,
  onReset,
  rightActions,
  activeFilterCount = 0,
}: ListFilterBarProps) {
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    onApply()
    setOpen(false)
  }

  const handleReset = () => {
    onReset()
    setOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {activeFilterCount > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl rounded-2xl border-border/60 p-0">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleApply()
            }}
          >
            <DialogHeader className="border-b border-border/60 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-base">Tùy chọn lọc dữ liệu</DialogTitle>
                  <DialogDescription className="mt-1">
                Nhập điều kiện cần tìm rồi nhấn áp dụng để tải lại danh sách.
                  </DialogDescription>
                </div>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {activeFilterCount} bộ lọc đang bật
                  </span>
                ) : null}
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
              {children}
            </div>

            <DialogFooter className="border-t border-border/60 px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleReset}>
                Xóa lọc
              </Button>
              <Button type="submit" className="min-w-24">Áp dụng</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="ghost" onClick={onReset} className="rounded-xl">
        Xóa lọc
      </Button>
      {rightActions}
    </div>
  )
}
