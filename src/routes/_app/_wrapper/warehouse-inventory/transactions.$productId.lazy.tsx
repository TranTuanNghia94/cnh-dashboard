import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetWarehouseInventoryBalance,
  useListWarehouseStockTransactions,
} from '@/hooks/use-warehouse-inventory';
import { DIRECTION_LABELS } from '@/lib/constants';
import type { IWarehouseInventoryBalanceInfo, IWarehouseStockTransactionInfo } from '@/types/warehouse-inventory';
import { createLazyFileRoute, Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';



export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inventory/transactions/$productId')({
  component: WarehouseInventoryTransactionsPage,
});

function WarehouseInventoryTransactionsPage() {
  const { productId } = useParams({ strict: false });
  const { mutateAsync: getBalance, isPending: isBalancePending } = useGetWarehouseInventoryBalance();
  const { mutateAsync: listTx, isPending: isTxPending } = useListWarehouseStockTransactions();
  const [balance, setBalance] = useState<IWarehouseInventoryBalanceInfo | null>(null);
  const [transactions, setTransactions] = useState<IWarehouseStockTransactionInfo[]>([]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    void (async () => {
      try {
        const [b, t] = await Promise.all([getBalance(productId), listTx(productId)]);
        if (cancelled) return;
        setBalance(b?.data ?? null);
        setTransactions(Array.isArray(t?.data) ? t.data : []);
      } catch {
        if (!cancelled) {
          setBalance(null);
          setTransactions([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, getBalance, listTx]);

  const loading = isBalancePending || isTxPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/warehouse-inventory" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Danh sách tồn kho
          </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Giao dịch kho theo sản phẩm</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tồn hiện tại</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !balance ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải…
            </div>
          ) : balance ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <dt className="text-muted-foreground">Mã SP</dt>
                <dd className="font-mono font-medium">{balance.productCode}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Tên SP</dt>
                <dd className="font-medium">{balance.productName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">SL tồn</dt>
                <dd className="tabular-nums font-medium">{balance.quantityOnHand}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Đơn vị</dt>
                <dd className="tabular-nums font-medium">{balance.uom}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Nhóm hàng</dt>
                <dd className="tabular-nums font-medium">{balance.productCategory}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Không tải được thông tin tồn kho.</p>
          )}
        </CardContent>
      </Card>


          <CardTitle className="text-base">Lịch sử giao dịch</CardTitle>
        
          {loading && transactions.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải…
            </div>
          ) : (
            <div className="rounded-md border">
              <Table wrapperClassName="h-auto max-h-[320px] min-h-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Chiều</TableHead>
                    <TableHead className="text-xs">Số lượng</TableHead>
                    <TableHead className="text-xs">Người tạo phiếu</TableHead>
                    <TableHead className="text-xs">Người duyệt</TableHead>
                    <TableHead className="text-xs">Mã tham chiếu</TableHead>
                    <TableHead className="text-xs">Ghi chú</TableHead>
                    <TableHead className="text-xs">Thời điểm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-16 text-center text-sm text-muted-foreground">
                        Chưa có giao dịch.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs">{DIRECTION_LABELS[row.direction] ?? row.direction}</TableCell>
                        <TableCell className="text-xs tabular-nums">{row.quantity}</TableCell>
                        <TableCell className="text-xs">{row.ownerBy || '—'}</TableCell>
                        <TableCell className="text-xs">{row.createdBy || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{row.referenceId || '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {row.note || '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

    </div>
  );
}
