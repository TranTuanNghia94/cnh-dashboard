import ProductTaxHistoryContent from '@/components/product/product-tax-history-content'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatProductTaxPercent } from '@/lib/product-tax-history'
import type { IProductResponse } from '@/types/product'
import { History, X } from 'lucide-react'
import { useState } from 'react'

type ProductTaxHistoryModalProps = {
  product: IProductResponse
}

export default function ProductTaxHistoryModal({ product }: ProductTaxHistoryModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
          <History className="mr-2 h-4 w-4" />
          Lịch sử thuế
        </div>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-[min(96vw,1100px)] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="relative shrink-0 space-y-1 border-b px-6 py-4 pr-12 text-left">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-8 w-8"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-base">Lịch sử thuế</DialogTitle>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-medium text-foreground">{product.code}</span>
            {' — '}
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Thuế hiện tại:{' '}
            <span className="font-medium text-foreground">{formatProductTaxPercent(product.tax)}</span>
          </p>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto px-2 pb-4 pt-2">
          <ProductTaxHistoryContent productId={product.id} enabled={open} />
        </div>
        <DialogFooter className="shrink-0 border-t px-6 py-3 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
