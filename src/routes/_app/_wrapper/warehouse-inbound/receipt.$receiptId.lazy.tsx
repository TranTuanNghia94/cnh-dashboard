import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ConfirmAction,
  DisplayField,
  FileAttachmentSection,
  FooterStat,
  type LineEditState,
  LinesSummary,
  ReceiptLinesTable,
} from '@/components/warehouse-inbound/shared';
import {
  useAddWarehouseInboundReceiptLine,
  useApproveWarehouseInboundReceipt,
  useCancelWarehouseInboundReceipt,
  useDeleteWarehouseInboundReceiptLine,
  useGetWarehouseInboundReceiptById,
  useListWarehouseInboundReceiptFiles,
  usePatchWarehouseInboundReceiptLine,
  useRejectWarehouseInboundReceipt,
  useSubmitWarehouseInboundReceipt,
  useUploadWarehouseInboundReceiptFile,
} from '@/hooks/use-warehouse-inbound';
import { useToast } from '@/hooks/use-toast';
import { WAREHOUSE_INBOUND_STATUS_STYLES } from '@/lib/constants';
import { getCookie, getRolesFromCookie, SUB } from '@/lib/cookie';
import { numberWithCommas } from '@/lib/other';
import { cn } from '@/lib/utils';
import type { IWarehouseInboundReceiptInfo } from '@/types/warehouse-inbound';
import type { IPaymentFileObject } from '@/types/payment';
import { Link, createLazyFileRoute, useParams } from '@tanstack/react-router';
import {
  Ban,
  Check,
  ClipboardList,
  ExternalLink,
  Info,
  Loader2,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Send,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const APPROVER_ROLES = ['ACCOUNTANT', 'ACCOUNTANT_MANAGER', 'ADMIN'];

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
  const { mutateAsync: cancelReceipt, isPending: isCancelling } = useCancelWarehouseInboundReceipt();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadWarehouseInboundReceiptFile();
  const { mutateAsync: listFiles } = useListWarehouseInboundReceiptFiles();

  const [receipt, setReceipt] = useState<IWarehouseInboundReceiptInfo>();
  const [uploadedFiles, setUploadedFiles] = useState<IPaymentFileObject[]>([]);
  const [lineEdits, setLineEdits] = useState<Map<string, LineEditState>>(new Map());
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [newPoLineId, setNewPoLineId] = useState('');
  const [newQtyReceived, setNewQtyReceived] = useState(0);
  const [newTaxPercent, setNewTaxPercent] = useState(0);
  const [newLineNote, setNewLineNote] = useState('');
  const [usePoDirectMode, setUsePoDirectMode] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!receiptId) return;
    try {
      const res = await listFiles(receiptId);
      const files = (res?.data ?? []) as IPaymentFileObject[];
      setUploadedFiles(Array.isArray(files) ? files : []);
    } catch {
      setUploadedFiles([]);
    }
  }, [listFiles, receiptId]);

  const load = useCallback(async () => {
    if (!receiptId) return;
    const res = await loadReceipt(receiptId);
    const data = res?.data as IWarehouseInboundReceiptInfo | undefined;
    setReceipt(data);
    if (data) {
      setUsePoDirectMode(!data.paymentRequestId);
    }
    setLineEdits(new Map());
    setPendingFiles([]);
    await loadFiles();
  }, [loadReceipt, loadFiles, receiptId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isDraft = receipt?.status === 'DRAFT';
  const isSubmitted = receipt?.status === 'SUBMITTED';
  const isBusy = isAddingLine || isPatchingLine || isDeletingLine || isSubmitting || isApproving || isRejecting || isCancelling || isUploading || isSaving;
  const statusUi = useMemo(
    () => (receipt?.status ? WAREHOUSE_INBOUND_STATUS_STYLES[receipt.status] : undefined),
    [receipt?.status],
  );

  const canApprove = useMemo(() => {
    const userRoles = getRolesFromCookie();
    const hasRole = userRoles.some((r) => APPROVER_ROLES.includes(r));
    if (!hasRole) return false;
    const currentUserId = getCookie(SUB);
    if (currentUserId && receipt?.createdBy && currentUserId === receipt.createdBy) return false;
    return true;
  }, [receipt?.createdBy]);

  const handleAddLine = async () => {
    if (!receiptId) return;
    if (!newPoLineId.trim()) {
      toast({ variant: 'destructive', title: 'Thiếu mã dòng PO', description: usePoDirectMode ? 'Vui lòng nhập purchaseOrderLineId.' : 'Vui lòng nhập paymentRequestPurchaseOrderLineId.' });
      return;
    }
    const body = usePoDirectMode
      ? {
          purchaseOrderLineId: newPoLineId.trim(),
          quantityReceived: Number(newQtyReceived || 0),
          taxPercent: Number(newTaxPercent || 0) || undefined,
          taxIncluded: false,
          lineNote: newLineNote || undefined,
        }
      : {
          paymentRequestPurchaseOrderLineId: newPoLineId.trim(),
          quantityReceived: Number(newQtyReceived || 0),
          taxPercent: Number(newTaxPercent || 0) || undefined,
          taxIncluded: false,
          lineNote: newLineNote || undefined,
        };
    await addLine({ receiptId, body });
    setNewPoLineId('');
    setNewQtyReceived(0);
    setNewTaxPercent(0);
    setNewLineNote('');
    await load();
  };

  const handleSubmit = async () => {
    if (!receiptId) return;
    await submitReceipt(receiptId);
    toast({ title: 'Đã gửi duyệt', variant: 'success' });
    await load();
  };

  const handleApprove = async () => {
    if (!receiptId) return;
    await approveReceipt({ receiptId, body: { note: approvalNote || undefined } });
    setApprovalNote('');
    toast({ title: 'Đã duyệt', variant: 'success' });
    await load();
  };

  const handleReject = async () => {
    if (!receiptId) return;
    if (!rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Thiếu lý do từ chối', description: 'Nhập reason trước khi reject.' });
      return;
    }
    await rejectReceipt({ receiptId, body: { reason: rejectReason.trim(), note: approvalNote || undefined } });
    setRejectReason('');
    setApprovalNote('');
    await load();
  };

  const handleCancel = async () => {
    if (!receiptId) return;
    await cancelReceipt(receiptId);
    toast({ title: 'Đã huỷ biên nhận', variant: 'success' });
    await load();
  };

  const addPendingFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setPendingFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLineEdit = (lineId: string, patch: Partial<LineEditState>) => {
    setLineEdits((prev) => {
      const next = new Map(prev);
      const existing = next.get(lineId);
      const line = (receipt?.lines ?? []).find((l) => l.id === lineId);
      const base = existing ?? {
        quantityReceived: Number(line?.quantityReceived ?? 0),
        taxPercent: Number(line?.taxPercent ?? 0),
        taxIncluded: Boolean(line?.taxIncluded ?? false),
        billOnPaper: line?.billOnPaper ?? '',
        lineNote: line?.lineNote ?? '',
      };
      next.set(lineId, { ...base, ...patch });
      return next;
    });
  };

  const hasUnsavedChanges = lineEdits.size > 0 || pendingFiles.length > 0;

  const handleSaveDraft = async () => {
    if (!receiptId) return;
    setIsSaving(true);
    try {
      let patchedCount = 0;
      for (const [lineId, edit] of lineEdits) {
        try {
          await patchLine({
            receiptId,
            lineId,
            body: {
              quantityReceived: edit.quantityReceived,
              taxPercent: edit.taxPercent,
              taxIncluded: edit.taxIncluded,
              billOnPaper: edit.billOnPaper.trim() || undefined,
              lineNote: edit.lineNote || undefined,
            },
          });
          patchedCount++;
        } catch { /* toast from hook */ }
      }

      let uploadedCount = 0;
      for (const file of pendingFiles) {
        try {
          await uploadFile({ receiptId, file });
          uploadedCount++;
        } catch { /* toast from hook */ }
      }

      const parts: string[] = [];
      if (patchedCount > 0) parts.push(`${patchedCount} dòng`);
      if (uploadedCount > 0) parts.push(`${uploadedCount} file`);
      if (parts.length > 0) toast({ title: `Đã cập nhật ${parts.join(' và ')}`, variant: 'success' });

      await load();
    } finally {
      setIsSaving(false);
    }
  };

  const allFiles = useMemo(() => {
    const fromReceipt = receipt?.attachments ?? [];
    const fromApi = uploadedFiles;
    const seen = new Set(fromReceipt.map((f) => f.id));
    return [...fromReceipt, ...fromApi.filter((f) => !seen.has(f.id))];
  }, [receipt?.attachments, uploadedFiles]);

  const linesCount = (receipt?.lines ?? []).length;
  const lineTotals = useMemo(() => {
    const ls = receipt?.lines ?? [];
    let amount = 0;
    for (const l of ls) amount += Number(l.quantityReceived ?? 0) * Number(l.unitPrice ?? 0);
    return amount;
  }, [receipt?.lines]);

  if (isPending && !receipt) {
    return (
      <div className="pb-28">
        <HeaderPageLayout title="Biên nhận nhập kho" buttonSubmit={null} />
        <div className="mt-4 space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="pb-28">
        <HeaderPageLayout title="Biên nhận nhập kho" buttonSubmit={null} />
        <p className="mt-6 text-sm text-muted-foreground">Không tải được biên nhận.</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <HeaderPageLayout
        title={receipt.receiptNumber ? `Biên nhận — ${receipt.receiptNumber}` : 'Biên nhận nhập kho'}
        buttonSubmit={null}
      />

      {/* Overview strip */}
      {/* <Card className="mt-4 border-border/60">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {statusUi ? (
              <span className={statusUi.style}>{statusUi.label}</span>
            ) : (
              <span className="rounded-md bg-muted px-3 py-1 text-xs font-bold shadow-sm">{receipt.status}</span>
            )}
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs text-foreground">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiền tệ</span>
              <span className="truncate font-medium">{receipt.currency}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tỷ giá</span>
              <span className="font-medium tabular-nums">{numberWithCommas(receipt.exchangeRate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Dòng hàng</span>
              <span className="font-medium tabular-nums">{linesCount}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tổng tiền hàng</span>
              <span className="text-base font-bold text-primary tabular-nums">
                {numberWithCommas(Math.round(lineTotals))} {receipt.currency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* 3-col grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Col 1 — Receipt info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <Info className="h-4 w-4" />
              Thông tin biên nhận
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DisplayField label="Mã biên nhận" value={receipt.receiptNumber} mono />
              <DisplayField label="Trạng thái" value={statusUi ? <span className={cn(statusUi.style, 'text-xs')}>{statusUi.label}</span> : <span className="text-xs">{receipt.status}</span>} />
              <DisplayField label="Ngày nhận hàng" value={receipt.receivedDate} />
              <DisplayField label="Ngày tạo" value={receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString('vi-VN') : undefined} />
              <DisplayField label="Tỷ giá" value={numberWithCommas(receipt.exchangeRate)} />
              <DisplayField label="Tiền tệ" value={receipt.currency} />
              <DisplayField label="Số tiền thực tế" value={receipt.realBillAmount ? numberWithCommas(receipt.realBillAmount) : undefined} />
              <DisplayField label="Trên chứng từ" value={receipt.billOnPaperAmount ? numberWithCommas(receipt.billOnPaperAmount) : undefined} />
              <DisplayField label="Phí nhập kho" value={receipt.feeAmount ? numberWithCommas(receipt.feeAmount) + ' ' + receipt.currency : undefined} />
              {receipt.inventoryPostedAt && (
                <DisplayField label="Inventory posted" value={new Date(receipt.inventoryPostedAt).toLocaleString('vi-VN')} />
              )}
              <DisplayField label="Ghi chú" value={receipt.note} className="col-span-2" />
            </div>
            {receipt.paymentRequestId && (
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" asChild>
                <Link to="/warehouse-inbound/$paymentRequestId" params={{ paymentRequestId: receipt.paymentRequestId }}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Mở trang ĐNTT
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Col 2 — PO & Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <Truck className="h-4 w-4" />
              Đơn hàng liên quan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(receipt.purchaseOrders ?? []).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Đơn mua hàng (PO)</p>
                {(receipt.purchaseOrders ?? []).map((po) => (
                  <div key={po.purchaseOrderId} className="rounded-md border bg-muted/30 px-2.5 py-1.5">
                    <p className="font-mono text-xs font-medium">{po.purchaseOrderNumber}</p>
                    <p className="text-[10px] text-muted-foreground">
                      NCC: {po.vendorName}
                      {po.orderNumber ? ` — ĐH: ${po.orderNumber}` : ''}
                      {po.orderContractNumber ? ` — HĐ: ${po.orderContractNumber}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {(receipt.orders ?? []).length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <ShoppingCart className="h-3 w-3" />
                  Đơn bán hàng
                </p>
                {(receipt.orders ?? []).map((order) => (
                  <div key={order.orderId} className="rounded-md border bg-muted/30 px-2.5 py-1.5">
                    <p className="font-mono text-xs font-medium">{order.orderNumber}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.contractNumber ? `HĐ: ${order.contractNumber}` : ''}
                      {order.contractNumber && order.customerName ? ' — ' : ''}
                      {order.customerName ? `KH: ${order.customerName}` : ''}
                      {(order.contractNumber || order.customerName) && order.status ? ' — ' : ''}
                      {order.status ?? ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {(receipt.purchaseOrders ?? []).length === 0 && (receipt.orders ?? []).length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-6 text-center">
                <Truck className="mb-2 h-6 w-6 text-muted-foreground/60" />
                <p className="text-xs font-medium text-muted-foreground">Chưa có đơn hàng liên quan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Col 3 — Attachments & Approval history */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <ClipboardList className="h-4 w-4" />
              Đính kèm & Duyệt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileAttachmentSection
              savedFiles={allFiles}
              pendingFiles={pendingFiles}
              canUpload={isDraft}
              disabled={isBusy}
              onSelectFiles={addPendingFiles}
              onRemovePendingFile={removePendingFile}
            />

            <Separator />

            {/* Approval history */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Lịch sử duyệt</p>
              {(receipt.approvals ?? []).length === 0 ? (
                <p className="text-[11px] text-muted-foreground">Chưa có lịch sử duyệt.</p>
              ) : (
                <div className="space-y-1">
                  {(receipt.approvals ?? []).map((a) => (
                    <div key={a.id} className="rounded-md border px-2.5 py-1.5 text-xs">
                      <span className="font-medium">Cấp {a.level}</span>
                      <span className="text-muted-foreground"> — {a.role}: </span>
                      <span className={cn('font-medium', a.status === 'APPROVED' && 'text-emerald-700 dark:text-emerald-400', a.status === 'REJECTED' && 'text-red-600')}>{a.status}</span>
                      {a.rejectionReason && <p className="mt-0.5 text-[10px] text-red-600">Lý do: {a.rejectionReason}</p>}
                      {a.note && <p className="mt-0.5 text-[10px] text-muted-foreground">{a.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Fees section */}
      {(receipt.fees ?? []).length > 0 && (
        <Card className="mt-3">
          <CardHeader className="space-y-0 px-4 py-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase leading-none mt-3">
              Phí nhập kho
              <span className="rounded-full bg-muted px-1.5 py-px text-[9px] font-medium tabular-nums text-muted-foreground">
                {(receipt.fees ?? []).length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 mt-3">
            <div className="rounded-md border">
              {/* Table wraps ScrollArea with a fixed viewport height — override so this small list is not stretched */}
              <Table wrapperClassName="h-auto max-h-none min-h-0">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-7 w-8 px-2 py-0 text-center font-medium text-xs leading-none">STT</TableHead>
                    <TableHead className="h-7 px-2 py-0 font-medium text-xs leading-none">Tên phí</TableHead>
                    <TableHead className="h-7 px-2 py-0 font-medium text-xs leading-none">Loại</TableHead>
                    <TableHead className="h-7 px-2 py-0 text-right font-medium text-xs leading-none">Số tiền</TableHead>
                    <TableHead className="h-7 px-2 py-0 font-medium text-xs leading-none">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(receipt.fees ?? []).map((fee, idx) => (
                    <TableRow key={fee.id} className="hover:bg-muted/40">
                      <TableCell className="px-2 py-1 text-center text-xs tabular-nums leading-tight">{idx + 1}</TableCell>
                      <TableCell className="px-2 py-1 text-xs leading-tight">{fee.feeName}</TableCell>
                      <TableCell className="px-2 py-1 text-xs leading-tight text-muted-foreground">{fee.feeType}</TableCell>
                      <TableCell className="px-2 py-1 text-right text-xs font-medium tabular-nums leading-tight">
                        {numberWithCommas(fee.amount)}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate px-2 py-1 text-xs leading-tight text-muted-foreground">
                        {fee.note || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add line (DRAFT only) */}
      {isDraft && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm uppercase">
                <Plus className="h-4 w-4" />
                Thêm dòng nhận
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-normal">
                <input type="checkbox" className="rounded" checked={usePoDirectMode} onChange={(e) => setUsePoDirectMode(e.target.checked)} />
                PO trực tiếp
              </label>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1 lg:col-span-2">
                <Label className="text-xs">{usePoDirectMode ? 'PO Line ID' : 'PR PO Line ID'}</Label>
                <Input className="h-8 text-xs font-mono" value={newPoLineId} onChange={(e) => setNewPoLineId(e.target.value)} placeholder={usePoDirectMode ? 'purchaseOrderLineId' : 'paymentRequestPurchaseOrderLineId'} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SL nhận</Label>
                <Input className="h-8 text-xs tabular-nums" type="number" min={0} step="any" value={newQtyReceived} onChange={(e) => setNewQtyReceived(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Thuế %</Label>
                <Input className="h-8 text-xs tabular-nums" type="number" min={0} step="any" value={newTaxPercent} onChange={(e) => setNewTaxPercent(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ghi chú</Label>
                <Input className="h-8 text-xs" value={newLineNote} onChange={(e) => setNewLineNote(e.target.value)} placeholder="Ghi chú..." />
              </div>
            </div>
            <Button type="button" size="sm" className="mt-3 gap-1.5 text-xs" onClick={() => void handleAddLine()} disabled={isBusy}>
              {isAddingLine ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Thêm dòng
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lines table */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm uppercase">
              <Package className="h-4 w-4" />
              Dòng hàng
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">{linesCount} dòng</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptLinesTable
            lines={receipt.lines ?? []}
            canEdit={isDraft}
            disabled={isBusy}
            lineEdits={lineEdits}
            onLineChange={updateLineEdit}
            onDelete={async (lineId) => {
              if (!receiptId) return;
              await removeLine({ receiptId, lineId });
              await load();
            }}
            emptyMessage="Chưa có dòng hàng"
            emptyHint={isDraft ? 'Sử dụng form bên trên để thêm dòng.' : undefined}
            EmptyIcon={Package}
          />

          {linesCount > 0 && <LinesSummary lines={receipt.lines ?? []} feeAmount={receipt.feeAmount} currency={receipt.currency} />}
        </CardContent>
      </Card>

      {/* Fixed footer bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-x-5 gap-y-2 overflow-x-auto text-sm">
            <FooterStat label="Số dòng">
              <span className="font-medium text-foreground tabular-nums">{linesCount}</span>
            </FooterStat>
            <FooterStat label="Tỷ giá">
              <span className="font-medium text-foreground tabular-nums">{numberWithCommas(receipt.exchangeRate)}</span>
            </FooterStat>
            <FooterStat label="Ngày nhận">
              <span className="font-medium text-foreground">{receipt.receivedDate || '—'}</span>
            </FooterStat>
            <FooterStat label="Tổng tiền hàng">
              <span className="font-medium text-foreground tabular-nums">{numberWithCommas(Math.round(lineTotals))} {receipt.currency}</span>
            </FooterStat>
            {receipt.feeAmount > 0 && (
              <FooterStat label="Tổng phí">
                <span className="font-medium text-foreground tabular-nums">{numberWithCommas(receipt.feeAmount)} {receipt.currency}</span>
              </FooterStat>
            )}
            <FooterStat label="File đính kèm">
              <span className="font-medium text-foreground tabular-nums">
                {allFiles.length} file
                {pendingFiles.length > 0 && <span className="ml-1 text-amber-600">(+{pendingFiles.length})</span>}
              </span>
            </FooterStat>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => void load()} disabled={isPending || isBusy}>
              <RefreshCcw className={cn('mr-2 h-4 w-4', isPending && 'animate-spin')} />
              Làm mới
            </Button>

            {isDraft && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                  disabled={isBusy || !hasUnsavedChanges}
                  onClick={() => void handleSaveDraft()}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Cập nhật
                  {hasUnsavedChanges && (
                    <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-medium leading-none text-white">
                      {lineEdits.size + pendingFiles.length}
                    </span>
                  )}
                </Button>
                <ConfirmAction
                  title="Gửi duyệt biên nhận?"
                  description={`Biên nhận ${receipt.receiptNumber || ''} sẽ được gửi duyệt. Sau khi gửi, bạn không thể chỉnh sửa dòng hàng.`}
                  actionLabel="Gửi duyệt"
                  onConfirm={() => void handleSubmit()}
                  disabled={isBusy}
                >
                  <Button type="button" size="sm" className="gap-1.5" disabled={isBusy}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Gửi duyệt
                  </Button>
                </ConfirmAction>
                <ConfirmAction
                  title="Huỷ biên nhận?"
                  description={`Biên nhận ${receipt.receiptNumber || ''} sẽ bị huỷ vĩnh viễn. Hành động này không thể hoàn tác.`}
                  actionLabel="Huỷ biên nhận"
                  variant="destructive"
                  onConfirm={() => void handleCancel()}
                  disabled={isBusy}
                >
                  <Button type="button" variant="destructive" size="sm" className="gap-1.5" disabled={isBusy}>
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                    Huỷ biên nhận
                  </Button>
                </ConfirmAction>
              </>
            )}

            {isSubmitted && canApprove && (
              <>
                <ConfirmAction
                  title="Duyệt biên nhận?"
                  description={`Biên nhận ${receipt.receiptNumber || ''} sẽ được duyệt.`}
                  actionLabel="Duyệt"
                  onConfirm={() => void handleApprove()}
                  disabled={isBusy}
                  body={
                    <div className="space-y-1">
                      <Label htmlFor="wi-approval-note" className="text-xs">Ghi chú duyệt</Label>
                      <Input id="wi-approval-note" className="h-8 text-xs" value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)..." />
                    </div>
                  }
                >
                  <Button type="button" size="sm" className="gap-1.5" disabled={isBusy}>
                    {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Duyệt
                  </Button>
                </ConfirmAction>
                <ConfirmAction
                  title="Từ chối biên nhận?"
                  description={`Biên nhận ${receipt.receiptNumber || ''} sẽ bị từ chối.`}
                  actionLabel="Từ chối"
                  variant="destructive"
                  onConfirm={() => void handleReject()}
                  disabled={isBusy}
                  body={
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="wi-reject-reason" className="text-xs">Lý do từ chối <span className="text-destructive">*</span></Label>
                        <Input id="wi-reject-reason" className="h-8 text-xs" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Nhập lý do từ chối..." />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="wi-reject-note" className="text-xs">Ghi chú</Label>
                        <Input id="wi-reject-note" className="h-8 text-xs" value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)..." />
                      </div>
                    </div>
                  }
                >
                  <Button type="button" variant="destructive" size="sm" className="gap-1.5" disabled={isBusy}>
                    {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Từ chối
                  </Button>
                </ConfirmAction>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

