import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useGetWarehouseInventoryBalance,
  useListWarehouseStockTransactions,
} from '@/hooks/use-warehouse-inventory'
import { DIRECTION_LABELS } from '@/lib/constants'
import type { StockLedgerRow } from '@/types/operational-report'
import type { IWarehouseInventoryBalanceInfo, IWarehouseStockTransactionInfo } from '@/types/warehouse-inventory'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type StockDetailDialogProps = {
  product: StockLedgerRow | null
  onClose: () => void
}

export function StockDetailDialog({ product, onClose }: StockDetailDialogProps) {
  const { mutateAsync: getBalance, isPending: loadingBalance } = useGetWarehouseInventoryBalance()
  const { mutateAsync: listTx, isPending: loadingTx } = useListWarehouseStockTransactions()
  const [balance, setBalance] = useState<IWarehouseInventoryBalanceInfo | null>(null)
  const [transactions, setTransactions] = useState<IWarehouseStockTransactionInfo[]>([])

  useEffect(() => {
    if (!product?.productId) return
    let cancelled = false
    void (async () => {
      try {
        const [balanceResponse, transactionResponse] = await Promise.all([
          getBalance(product.productId),
          listTx(product.productId),
        ])
        if (cancelled) return
        setBalance(balanceResponse?.data ?? null)
        setTransactions(Array.isArray(transactionResponse?.data) ? transactionResponse.data : [])
      } catch {
        if (!cancelled) {
          setBalance(null)
          setTransactions([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [product?.productId, getBalance, listTx])

  const loading = loadingBalance || loadingTx

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[85vh] max-w-[90vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Chi tiết tồn kho</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {product?.productCode} · {product?.productName}
          </p>
        </DialogHeader>
        {loading && !balance ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải giao dịch
          </div>
        ) : (
          <dl className="grid gap-3 rounded-xl border bg-muted/30 p-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Mã hàng</dt>
              <dd className="font-medium">{balance?.productCode || product?.productCode}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Tên hàng</dt>
              <dd className="font-medium">{balance?.productName || product?.productName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tồn hiện tại</dt>
              <dd className="font-medium tabular-nums">{balance?.quantityOnHand ?? '—'}</dd>
            </div>
          </dl>
        )}
        <Table wrapperClassName="h-auto max-h-[360px] min-h-0">
          <TableHeader>
            <TableRow>
              <TableHead>Chiều</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Người duyệt</TableHead>
              <TableHead>Mã tham chiếu</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thời điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-16 text-center text-sm text-muted-foreground">
                  Đang tải giao dịch
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-16 text-center text-sm text-muted-foreground">
                  Chưa có giao dịch
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{DIRECTION_LABELS[row.direction] ?? row.direction}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                  <TableCell>{row.ownerBy || '—'}</TableCell>
                  <TableCell>{row.createdBy || '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{row.referenceId || '—'}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{row.note || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
