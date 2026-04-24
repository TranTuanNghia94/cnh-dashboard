import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetWarehouseInboundReceiptById } from '@/hooks/use-warehouse-inbound';
import { formatCurrencyVN } from '@/lib/other';
import type { IWarehouseInboundReceiptInfo } from '@/types/warehouse-inbound';
import { Link, createLazyFileRoute, useParams } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inbound/receipt/$receiptId')({
  component: WarehouseInboundReceiptPage,
});

function WarehouseInboundReceiptPage() {
  const { receiptId } = useParams({ strict: false });
  const { mutateAsync: loadReceipt, isPending } = useGetWarehouseInboundReceiptById();
  const [receipt, setReceipt] = useState<IWarehouseInboundReceiptInfo>();

  const load = useCallback(async () => {
    if (!receiptId) return;
    const res = await loadReceipt(receiptId);
    setReceipt(res?.data as IWarehouseInboundReceiptInfo | undefined);
  }, [loadReceipt, receiptId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <HeaderPageLayout title="Biên nhận nhập kho" buttonSubmit={null} />

      {isPending && !receipt ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : receipt ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tổng quan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Mã biên nhận</span>
                <p className="font-mono text-xs font-medium">{receipt.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trạng thái</span>
                <p className="font-medium">{receipt.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tiền tệ</span>
                <p className="font-medium">{receipt.currency}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tỷ giá</span>
                <p className="font-medium">{receipt.exchangeRate}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phí</span>
                <p className="font-medium">{formatCurrencyVN(receipt.feeAmount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Số tiền thực tế</span>
                <p className="font-medium">{formatCurrencyVN(receipt.realBillAmount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trên chứng từ</span>
                <p className="font-medium">{formatCurrencyVN(receipt.billOnPaperAmount)}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Ghi chú</span>
                <p className="font-medium">{receipt.note || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ngày tạo</span>
                <p className="font-medium">{receipt.createdAt}</p>
              </div>
              {receipt.inventoryPostedAt && (
                <div>
                  <span className="text-muted-foreground">Ghi kho</span>
                  <p className="font-medium">{receipt.inventoryPostedAt}</p>
                </div>
              )}
              <div className="flex items-end">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to="/warehouse-inbound/$paymentRequestId"
                    params={{ paymentRequestId: receipt.paymentRequestId }}
                    className="gap-2"
                  >
                    Về DNTT <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dòng hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>SL dự kiến</TableHead>
                      <TableHead>SL nhận</TableHead>
                      <TableHead>Thuế %</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(receipt.lines ?? []).map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-xs">{line.productName}</TableCell>
                        <TableCell className="text-xs">{line.quantityExpected}</TableCell>
                        <TableCell className="text-xs">{line.quantityReceived}</TableCell>
                        <TableCell className="text-xs">{line.taxPercent}</TableCell>
                        <TableCell className="text-xs">{line.lineNote || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đính kèm</CardTitle>
            </CardHeader>
            <CardContent>
              {(receipt.attachments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có file.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {(receipt.attachments ?? []).map((f) => (
                    <li key={f.id}>
                      <a href={f.viewUrl || f.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                        {f.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              {(receipt.approvals ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có lịch sử duyệt.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {(receipt.approvals ?? []).map((a) => (
                    <li key={a.id} className="rounded-md border px-3 py-2">
                      <span className="font-medium">Cấp {a.level}</span> — {a.role}: {a.status}
                      {a.note ? <span className="text-muted-foreground"> — {a.note}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Không tải được biên nhận.</p>
      )}
    </div>
  );
}
