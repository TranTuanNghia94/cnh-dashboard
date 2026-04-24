import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useConfirmWarehouseInbound,
  useGetWarehouseInboundPaymentRequest,
  useGetWarehouseInboundReceipts,
} from '@/hooks/use-warehouse-inbound';
import { useToast } from '@/hooks/use-toast';
import { LIST_ROLES } from '@/lib/constants';
import { formatCurrencyVN } from '@/lib/other';
import { IPaymentRequestInfo, IPaymentRequestLineInfo } from '@/types/payment';
import type {
  IWarehouseInboundConfirmLineRequest,
  IWarehouseInboundReceiptInfo,
} from '@/types/warehouse-inbound';
import { Link, createLazyFileRoute, useParams } from '@tanstack/react-router';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const APPROVAL_ROLE_OPTIONS = [
  LIST_ROLES.ACCOUNTANT,
  LIST_ROLES.ACCOUNTANT_MANAGER,
  LIST_ROLES.DIRECTOR,
] as const;

function buildDefaultLines(items: IPaymentRequestLineInfo[] | undefined): IWarehouseInboundConfirmLineRequest[] {
  return (items ?? []).map((line) => {
    const po = line.purchaseOrderLine;
    return {
      paymentRequestPurchaseOrderLineId: line.id,
      quantityReceived: Number(po?.quantity ?? 0),
      taxPercent: Number(po?.tax ?? 0),
      lineNote: line.note ?? '',
    };
  });
}

function vendorLabel(pr: IPaymentRequestInfo | undefined): string {
  if (!pr) return '—';
  const fromLine = pr.items?.find((i) => i.purchaseOrderLine?.vendorName)?.purchaseOrderLine?.vendorName;
  if (fromLine) return fromLine;
  return pr.vendorId ?? '—';
}

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inbound/$paymentRequestId')({
  component: WarehouseInboundPaymentRequestPage,
});

function WarehouseInboundPaymentRequestPage() {
  const { paymentRequestId } = useParams({ strict: false });
  const { toast } = useToast();
  const { mutateAsync: loadPr, isPending: isLoadingPr } = useGetWarehouseInboundPaymentRequest();
  const { mutateAsync: loadReceipts, isPending: isLoadingReceipts } = useGetWarehouseInboundReceipts();
  const { mutateAsync: confirmInbound, isPending: isConfirming } = useConfirmWarehouseInbound();

  const [pr, setPr] = useState<IPaymentRequestInfo>();
  const [receipts, setReceipts] = useState<IWarehouseInboundReceiptInfo[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [feeAmount, setFeeAmount] = useState(0);
  const [realBillAmount, setRealBillAmount] = useState(0);
  const [billOnPaperAmount, setBillOnPaperAmount] = useState(0);
  const [note, setNote] = useState('');
  const [approvalLevels, setApprovalLevels] = useState(1);
  const [approvalRoles, setApprovalRoles] = useState<string[]>([]);
  const [lines, setLines] = useState<IWarehouseInboundConfirmLineRequest[]>([]);
  const [attachedFileIds, setAttachedFileIds] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    if (!paymentRequestId) return;
    const prRes = await loadPr(paymentRequestId);
    const data = prRes?.data as IPaymentRequestInfo | undefined;
    if (!data) return;
    setPr(data);
    setExchangeRate(Number(data.exchangeRate ?? 1));
    setFeeAmount(Number(data.feeAmount ?? 0));
    const base = Number(data.totalAmount ?? data.requestedAmount ?? 0);
    setRealBillAmount(base);
    setBillOnPaperAmount(base);
    setNote('');
    setApprovalLevels(Number(data.approvalLevels ?? 1));
    const rolesFromPr = [...new Set((data.approvals ?? []).map((a) => a.role).filter(Boolean))] as string[];
    const defaultRoles = rolesFromPr.length
      ? rolesFromPr.filter((r) => APPROVAL_ROLE_OPTIONS.some((o) => o.code === r))
      : [LIST_ROLES.ACCOUNTANT.code, LIST_ROLES.ACCOUNTANT_MANAGER.code];
    setApprovalRoles(defaultRoles.length ? defaultRoles : [LIST_ROLES.ACCOUNTANT.code]);
    setLines(buildDefaultLines(data.items));
    setAttachedFileIds([]);

    let list: IWarehouseInboundReceiptInfo[] = [];
    try {
      const rcRes = await loadReceipts(paymentRequestId);
      const raw = rcRes?.data as unknown;
      list = Array.isArray(raw) ? raw : (raw as { receipts?: IWarehouseInboundReceiptInfo[] })?.receipts ?? [];
    } catch {
      list = [];
    }
    setReceipts(list);
  }, [loadPr, loadReceipts, paymentRequestId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const papers = pr?.papers ?? [];

  const toggleRole = (code: string) => {
    setApprovalRoles((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const toggleFile = (id: string) => {
    setAttachedFileIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateLine = (idx: number, patch: Partial<IWarehouseInboundConfirmLineRequest>) => {
    setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const lineMeta = useMemo(() => {
    return (pr?.items ?? []).map((item) => ({
      id: item.id,
      productName: item.purchaseOrderLine?.productName ?? item.purchaseOrderLine?.product?.name ?? '—',
      qtyExpected: Number(item.purchaseOrderLine?.quantity ?? 0),
    }));
  }, [pr?.items]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRequestId || !pr) return;
    if (!lines.length) {
      toast({ variant: 'destructive', title: 'Không có dòng hàng', description: 'Đề nghị thanh toán không có dòng PO.' });
      return;
    }
    if (!approvalRoles.length) {
      toast({ variant: 'destructive', title: 'Thiếu vai trò duyệt', description: 'Chọn ít nhất một vai trò.' });
      return;
    }
    try {
      await confirmInbound({
        paymentRequestId,
        exchangeRate,
        feeAmount,
        realBillAmount,
        billOnPaperAmount,
        note,
        approvalLevels,
        approvalRoles,
        lines,
        attachedFileIds,
      });
      toast({ title: 'Đã xác nhận nhập kho' });
      await loadAll();
    } catch {
      /* toast from hook */
    }
  };

  const isLoading = isLoadingPr || isLoadingReceipts;

  return (
    <div className="space-y-6">
      <HeaderPageLayout
        title="Nhập kho theo DNTT"
        buttonSubmit={
          <Button type="submit" form="wi-confirm-form" size="sm" disabled={isConfirming || isLoading}>
            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Xác nhận nhập kho
          </Button>
        }
      />

      {isLoading && !pr ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : pr ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin đề nghị</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Mã DNTT</span>
                <p className="font-mono font-medium">{pr.requestNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trạng thái</span>
                <p className="font-medium">{pr.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nhà cung cấp</span>
                <p className="font-medium">{vendorLabel(pr)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tiền tệ</span>
                <p className="font-medium">{pr.currency}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Tổng đề nghị</span>
                <p className="font-medium">{formatCurrencyVN(Number(pr.totalAmount ?? 0))}</p>
              </div>
              <div className="sm:col-span-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/payment/$paymentId" params={{ paymentId: pr.id }} className="gap-2">
                    Mở trang DNTT <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biên nhận nhập kho đã lập</CardTitle>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có biên nhận.</p>
              ) : (
                <ul className="space-y-2">
                  {receipts.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                      <span className="font-mono text-xs">{r.id}</span>
                      <span>{r.status}</span>
                      <Button variant="secondary" size="sm" asChild>
                        <Link to="/warehouse-inbound/receipt/$receiptId" params={{ receiptId: r.id }}>
                          Xem
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <form id="wi-confirm-form" onSubmit={(e) => void onSubmit(e)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Xác nhận nhập kho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="wi-er">Tỷ giá</Label>
                    <Input
                      id="wi-er"
                      type="number"
                      step="any"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wi-fee">Phí</Label>
                    <Input
                      id="wi-fee"
                      type="number"
                      step="any"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wi-levels">Số cấp duyệt</Label>
                    <Input
                      id="wi-levels"
                      type="number"
                      min={1}
                      value={approvalLevels}
                      onChange={(e) => setApprovalLevels(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wi-real">Số tiền thực tế (hoá đơn)</Label>
                    <Input
                      id="wi-real"
                      type="number"
                      step="any"
                      value={realBillAmount}
                      onChange={(e) => setRealBillAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wi-paper">Số tiền trên chứng từ</Label>
                    <Input
                      id="wi-paper"
                      type="number"
                      step="any"
                      value={billOnPaperAmount}
                      onChange={(e) => setBillOnPaperAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="wi-note">Ghi chú biên nhận</Label>
                    <Input id="wi-note" value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vai trò duyệt</Label>
                  <div className="flex flex-wrap gap-4">
                    {APPROVAL_ROLE_OPTIONS.map((role) => (
                      <label key={role.code} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={approvalRoles.includes(role.code)}
                          onCheckedChange={() => toggleRole(role.code)}
                        />
                        {role.name} ({role.code})
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Chứng từ đính kèm (đã upload trên DNTT)</Label>
                  {papers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có file.</p>
                  ) : (
                    <ul className="space-y-2">
                      {papers.map((f) => (
                        <li key={f.id} className="flex items-center gap-2 text-sm">
                          <Checkbox checked={attachedFileIds.includes(f.id)} onCheckedChange={() => toggleFile(f.id)} />
                          <span className="min-w-0 truncate">{f.fileName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dòng hàng — số lượng nhận & thuế</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="w-24">SL đặt</TableHead>
                        <TableHead className="w-28">SL nhận</TableHead>
                        <TableHead className="w-24">Thuế %</TableHead>
                        <TableHead>Ghi chú dòng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, idx) => (
                        <TableRow key={line.paymentRequestPurchaseOrderLineId}>
                          <TableCell className="text-xs">{lineMeta[idx]?.productName ?? '—'}</TableCell>
                          <TableCell className="text-xs">{lineMeta[idx]?.qtyExpected ?? '—'}</TableCell>
                          <TableCell>
                            <Input
                              className="h-8"
                              type="number"
                              step="any"
                              min={0}
                              value={line.quantityReceived}
                              onChange={(e) => updateLine(idx, { quantityReceived: Number(e.target.value) })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-8"
                              type="number"
                              step="any"
                              min={0}
                              value={line.taxPercent}
                              onChange={(e) => updateLine(idx, { taxPercent: Number(e.target.value) })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-8"
                              value={line.lineNote}
                              onChange={(e) => updateLine(idx, { lineNote: e.target.value })}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </form>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Không tải được đề nghị thanh toán.</p>
      )}
    </div>
  );
}
