import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useAddWarehouseInboundReceiptLine,
  useApproveWarehouseInboundReceipt,
  useDeleteWarehouseInboundReceiptLine,
  useGetWarehouseInboundReceiptById,
  usePatchWarehouseInboundReceiptLine,
  useRejectWarehouseInboundReceipt,
  useSubmitWarehouseInboundReceipt,
} from '@/hooks/use-warehouse-inbound';
import { useToast } from '@/hooks/use-toast';
import { WAREHOUSE_INBOUND_STATUS_STYLES } from '@/lib/constants';
import { formatCurrencyVN } from '@/lib/other';
import type { IWarehouseInboundReceiptInfo } from '@/types/warehouse-inbound';
import { Link, createLazyFileRoute, useParams } from '@tanstack/react-router';
import { Check, ExternalLink, Loader2, RefreshCcw, Send, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inbound/receipt/$receiptId')({
  component: WarehouseInboundReceiptPage,
});

function WarehouseInboundReceiptPage() {
  const { receiptId } = useParams({ strict: false });
  const { toast } = useToast();
  const { mutateAsync: loadReceipt, isPending } = useGetWarehouseInboundReceiptById();
  const { mutateAsync: addLine, isPending: isAddingLine } = useAddWarehouseInboundReceiptLine();
  const { mutateAsync: patchLine, isPending: isPatchingLine } = usePatchWarehouseInboundReceiptLine();
  const { mutateAsync: removeLine, isPending: isDeletingLine } = useDeleteWarehouseInboundReceiptLine();
  const { mutateAsync: submitReceipt, isPending: isSubmitting } = useSubmitWarehouseInboundReceipt();
  const { mutateAsync: approveReceipt, isPending: isApproving } = useApproveWarehouseInboundReceipt();
  const { mutateAsync: rejectReceipt, isPending: isRejecting } = useRejectWarehouseInboundReceipt();

  const [receipt, setReceipt] = useState<IWarehouseInboundReceiptInfo>();
  const [newPoLineId, setNewPoLineId] = useState('');
  const [newQtyReceived, setNewQtyReceived] = useState(0);
  const [newTaxPercent, setNewTaxPercent] = useState(0);
  const [newLineNote, setNewLineNote] = useState('');
  const [approvalLevel, setApprovalLevel] = useState(1);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    if (!receiptId) return;
    const res = await loadReceipt(receiptId);
    const data = res?.data as IWarehouseInboundReceiptInfo | undefined;
    setReceipt(data);
    if (data?.currentApprovalLevel) {
      setApprovalLevel(data.currentApprovalLevel);
    }
  }, [loadReceipt, receiptId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isDraft = receipt?.status === 'DRAFT';
  const isSubmitted = receipt?.status === 'SUBMITTED';
  const isBusy = isAddingLine || isPatchingLine || isDeletingLine || isSubmitting || isApproving || isRejecting;
  const statusUi = useMemo(
    () => (receipt?.status ? WAREHOUSE_INBOUND_STATUS_STYLES[receipt.status] : undefined),
    [receipt?.status],
  );

  const handleAddLine = async () => {
    if (!receiptId) return;
    if (!newPoLineId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Thiếu mã dòng PO',
        description: 'Vui lòng nhập paymentRequestPurchaseOrderLineId.',
      });
      return;
    }
    await addLine({
      receiptId,
      body: {
        paymentRequestPurchaseOrderLineId: newPoLineId.trim(),
        quantityReceived: Number(newQtyReceived || 0),
        taxPercent: Number(newTaxPercent || 0),
        lineNote: newLineNote || undefined,
      },
    });
    setNewPoLineId('');
    setNewQtyReceived(0);
    setNewTaxPercent(0);
    setNewLineNote('');
    await load();
  };

  const handleSubmit = async () => {
    if (!receiptId) return;
    await submitReceipt(receiptId);
    await load();
  };

  const handleApprove = async () => {
    if (!receiptId) return;
    await approveReceipt({
      receiptId,
      body: {
        level: Number(approvalLevel || 1),
        note: approvalNote || undefined,
      },
    });
    setApprovalNote('');
    await load();
  };

  const handleReject = async () => {
    if (!receiptId) return;
    if (!rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Thiếu lý do từ chối',
        description: 'Nhập reason trước khi reject.',
      });
      return;
    }
    await rejectReceipt({
      receiptId,
      body: {
        level: Number(approvalLevel || 1),
        reason: rejectReason.trim(),
        note: approvalNote || undefined,
      },
    });
    setRejectReason('');
    setApprovalNote('');
    await load();
  };

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
                <p className={statusUi?.style ?? 'font-medium'}>{statusUi?.label ?? receipt.status}</p>
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
              {receipt.inventoryPostedAt ? (
                <div>
                  <span className="text-muted-foreground">Inventory posted at</span>
                  <p className="font-medium">{receipt.inventoryPostedAt}</p>
                </div>
              ) : null}
              <div className="flex items-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/warehouse-inbound/$paymentRequestId" params={{ paymentRequestId: receipt.paymentRequestId }} className="gap-2">
                    Về DNTT <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {isDraft ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thêm dòng nhận (DRAFT)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="wi-po-line-id">PO Line ID</Label>
                  <Input id="wi-po-line-id" value={newPoLineId} onChange={(e) => setNewPoLineId(e.target.value)} placeholder="paymentRequestPurchaseOrderLineId" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wi-qty-received">SL nhận</Label>
                  <Input id="wi-qty-received" type="number" min={0} step="any" value={newQtyReceived} onChange={(e) => setNewQtyReceived(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wi-tax-percent">Thuế %</Label>
                  <Input id="wi-tax-percent" type="number" min={0} step="any" value={newTaxPercent} onChange={(e) => setNewTaxPercent(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wi-line-note">Ghi chú dòng</Label>
                  <Input id="wi-line-note" value={newLineNote} onChange={(e) => setNewLineNote(e.target.value)} />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <Button type="button" onClick={() => void handleAddLine()} disabled={isBusy}>
                    Thêm dòng
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

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
                      {isDraft ? <TableHead></TableHead> : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(receipt.lines ?? []).map((line) => (
                      <DraftEditableLineRow
                        key={line.id}
                        line={line}
                        canEdit={isDraft}
                        disabled={isBusy}
                        onSave={async (lineId, quantityReceived, taxPercent, lineNote) => {
                          if (!receiptId) return;
                          await patchLine({
                            receiptId,
                            lineId,
                            body: {
                              quantityReceived,
                              taxPercent,
                              lineNote: lineNote || undefined,
                            },
                          });
                          await load();
                        }}
                        onDelete={async (lineId) => {
                          if (!receiptId) return;
                          await removeLine({ receiptId, lineId });
                          await load();
                        }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thao tác theo trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isDraft ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    DRAFT: có thể thêm/sửa/xoá dòng. Khi đã đủ dữ liệu thì gửi duyệt.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-muted-foreground"
                      onClick={() => void load()}
                      disabled={isBusy}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Làm mới
                    </Button>
                    <Button type="button" size="sm" className="h-8 min-w-[148px] gap-1.5 rounded-md" onClick={() => void handleSubmit()} disabled={isBusy}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Submit for approval
                    </Button>
                  </div>
                </>
              ) : null}

              {isSubmitted ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wi-approval-level">Level</Label>
                    <Input id="wi-approval-level" type="number" min={1} value={approvalLevel} onChange={(e) => setApprovalLevel(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wi-approval-note">Note</Label>
                    <Input id="wi-approval-note" value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="wi-reject-reason">Reason (for reject)</Label>
                    <Input id="wi-reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-muted-foreground"
                      onClick={() => void load()}
                      disabled={isBusy}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Làm mới
                    </Button>
                    <Button type="button" size="sm" className="h-8 min-w-[104px] gap-1.5 rounded-md" onClick={() => void handleApprove()} disabled={isBusy}>
                      {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Approve
                    </Button>
                    <Button type="button" size="sm" variant="destructive" className="h-8 min-w-[104px] gap-1.5 rounded-md" onClick={() => void handleReject()} disabled={isBusy}>
                      {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      Reject
                    </Button>
                  </div>
                </div>
              ) : null}

              {receipt.status === 'REJECTED' ? (
                <p className="text-sm text-muted-foreground">
                  REJECTED: xem lý do trong lịch sử duyệt, rồi tạo biên nhận mới hoặc chạy rework flow.
                </p>
              ) : null}
              {receipt.status === 'APPROVED' ? (
                <p className="text-sm text-muted-foreground">
                  APPROVED: đã khóa chỉnh sửa. {receipt.inventoryPostedAt ? `Inventory posted at ${receipt.inventoryPostedAt}` : ''}
                </p>
              ) : null}
              {receipt.status === 'CANCELLED' ? (
                <p className="text-sm text-muted-foreground">CANCELLED: biên nhận đã đóng.</p>
              ) : null}
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
                      {a.rejectionReason ? <span className="text-red-600"> — Lý do: {a.rejectionReason}</span> : null}
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

type DraftEditableLineRowProps = {
  line: IWarehouseInboundReceiptInfo['lines'][number];
  canEdit: boolean;
  disabled: boolean;
  onSave: (lineId: string, quantityReceived: number, taxPercent: number, lineNote: string) => Promise<void>;
  onDelete: (lineId: string) => Promise<void>;
};

function DraftEditableLineRow({ line, canEdit, disabled, onSave, onDelete }: DraftEditableLineRowProps) {
  const [quantityReceived, setQuantityReceived] = useState(Number(line.quantityReceived ?? 0));
  const [taxPercent, setTaxPercent] = useState(Number(line.taxPercent ?? 0));
  const [lineNote, setLineNote] = useState(line.lineNote ?? '');

  useEffect(() => {
    setQuantityReceived(Number(line.quantityReceived ?? 0));
    setTaxPercent(Number(line.taxPercent ?? 0));
    setLineNote(line.lineNote ?? '');
  }, [line.id, line.quantityReceived, line.taxPercent, line.lineNote]);

  return (
    <TableRow>
      <TableCell className="text-xs">{line.productName}</TableCell>
      <TableCell className="text-xs">{line.quantityExpected}</TableCell>
      <TableCell className="text-xs">
        {canEdit ? (
          <Input
            className="h-8"
            type="number"
            min={0}
            step="any"
            value={quantityReceived}
            onChange={(e) => setQuantityReceived(Number(e.target.value))}
            disabled={disabled}
          />
        ) : (
          line.quantityReceived
        )}
      </TableCell>
      <TableCell className="text-xs">
        {canEdit ? (
          <Input
            className="h-8"
            type="number"
            min={0}
            step="any"
            value={taxPercent}
            onChange={(e) => setTaxPercent(Number(e.target.value))}
            disabled={disabled}
          />
        ) : (
          line.taxPercent
        )}
      </TableCell>
      <TableCell className="text-xs">
        {canEdit ? (
          <Input className="h-8" value={lineNote} onChange={(e) => setLineNote(e.target.value)} disabled={disabled} />
        ) : (
          line.lineNote || '—'
        )}
      </TableCell>
      {canEdit ? (
        <TableCell className="w-[170px]">
          <div className="flex items-center gap-1.5">
            <Button type="button" size="sm" variant="secondary" className="h-8 gap-1.5" disabled={disabled} onClick={() => void onSave(line.id, Number(quantityReceived || 0), Number(taxPercent || 0), lineNote)}>
              <Check className="h-3.5 w-3.5" />
              Lưu
            </Button>
            <Button type="button" size="sm" variant="destructive" className="h-8 gap-1.5" disabled={disabled} onClick={() => void onDelete(line.id)}>
              <X className="h-3.5 w-3.5" />
              Xoá
            </Button>
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
