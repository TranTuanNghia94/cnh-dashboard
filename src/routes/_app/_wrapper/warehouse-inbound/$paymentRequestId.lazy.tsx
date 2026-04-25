import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  useSubmitWarehouseInboundReceipt,
} from '@/hooks/use-warehouse-inbound';
import { useUploadPaymentRequestFile } from '@/hooks/use-payment';
import { useToast } from '@/hooks/use-toast';
import {
  CURRENCY_OPTIONS,
  LIST_ROLES,
  PAYMENT_REQUEST_FILE_CATEGORY,
} from '@/lib/constants';
import { formatCurrencyVN, numberWithCommas } from '@/lib/other';
import { cn } from '@/lib/utils';
import { IPaymentRequestInfo, IPaymentRequestLineInfo } from '@/types/payment';
import type {
  IWarehouseInboundConfirmLineRequest,
  IWarehouseInboundFeeItem,
  IWarehouseInboundReceiptInfo,
} from '@/types/warehouse-inbound';
import { Link, createLazyFileRoute, useParams } from '@tanstack/react-router';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileDown,
  FileUp,
  Info,
  Loader2,
  Paperclip,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const APPROVAL_ROLE_OPTIONS = [
  LIST_ROLES.ACCOUNTANT,
  LIST_ROLES.ACCOUNTANT_MANAGER,
  LIST_ROLES.DIRECTOR,
] as const;

const WI_FEE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'OVERSEAS_SHIPPING', label: 'Phí vận chuyển quốc tế' },
  { value: 'LOCAL_HANDLING', label: 'Phí xử lý nội địa (10%)' },
  { value: 'CUSTOMS', label: 'Phí hải quan' },
  { value: 'INSURANCE', label: 'Phí bảo hiểm' },
  { value: 'FREIGHT', label: 'Cước vận chuyển nội địa' },
  { value: 'HANDLING', label: 'Bốc xếp' },
  { value: 'OTHER', label: 'Khác' },
];

function feeTypeLabel(value: string): string {
  return WI_FEE_TYPE_OPTIONS.find((t) => t.value === value)?.label ?? value;
}

function buildDefaultLines(items: IPaymentRequestLineInfo[] | undefined): IWarehouseInboundConfirmLineRequest[] {
  return (items ?? []).map((line) => {
    const po = line.purchaseOrderLine;
    return {
      paymentRequestPurchaseOrderLineId: line.id,
      quantityReceived: Number(po?.quantity ?? 0),
      taxPercent: Number(po?.tax ?? 0),
      isTaxIncluded: po?.isTaxIncluded ?? false,
      billOnPaper: '',
      lineNote: '',
    };
  });
}

function computeEffectiveUnitPrice(unitPrice: number, taxPercent: number, isTaxIncluded: boolean): number {
  if (taxPercent === 0) return unitPrice;
  if (isTaxIncluded) return unitPrice;
  return unitPrice * (1 + taxPercent / 100);
}

function computeBasePriceBeforeTax(unitPrice: number, taxPercent: number, isTaxIncluded: boolean): number {
  if (taxPercent === 0) return unitPrice;
  if (isTaxIncluded) return unitPrice / (1 + taxPercent / 100);
  return unitPrice;
}

function vendorLabel(pr: IPaymentRequestInfo | undefined): string {
  if (!pr) return '—';
  const fromLine = pr.items?.find((i) => i.purchaseOrderLine?.vendorName)?.purchaseOrderLine?.vendorName;
  if (fromLine) return fromLine;
  return pr.vendorId ?? '—';
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function FooterStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="whitespace-nowrap text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function DisplayField({
  label,
  value,
  hint,
  mono,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  mono?: boolean;
  className?: string;
}) {
  const isEmpty = value == null || value === '' || (typeof value === 'string' && !value.trim());
  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-sm leading-5',
          mono && 'font-mono text-xs',
          isEmpty ? 'italic text-muted-foreground' : 'font-medium text-foreground',
        )}
      >
        {isEmpty ? '—' : value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inbound/$paymentRequestId')({
  component: WarehouseInboundPaymentRequestPage,
});

function WarehouseInboundPaymentRequestPage() {
  const { paymentRequestId } = useParams({ strict: false });
  const { toast } = useToast();
  const { mutateAsync: loadPr, isPending: isLoadingPr } = useGetWarehouseInboundPaymentRequest();
  const { mutateAsync: loadReceipts, isPending: isLoadingReceipts } = useGetWarehouseInboundReceipts();
  const { mutateAsync: confirmInbound, isPending: isConfirming } = useConfirmWarehouseInbound();
  const { mutateAsync: submitInboundReceipt, isPending: isSubmittingReceipt } = useSubmitWarehouseInboundReceipt();
  const { mutateAsync: uploadPaymentFile, isPending: isUploadingFile } = useUploadPaymentRequestFile();

  const [pr, setPr] = useState<IPaymentRequestInfo>();
  const [receipts, setReceipts] = useState<IWarehouseInboundReceiptInfo[]>([]);
  const [currency, setCurrency] = useState('VND');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [fees, setFees] = useState<IWarehouseInboundFeeItem[]>([]);
  const [note, setNote] = useState('');
  const [approvalLevels, setApprovalLevels] = useState(1);
  const [approvalRoles, setApprovalRoles] = useState<string[]>([]);
  const [lines, setLines] = useState<IWarehouseInboundConfirmLineRequest[]>([]);
  const [attachedFileIds, setAttachedFileIds] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [submittingReceiptId, setSubmittingReceiptId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!paymentRequestId) return;
    const prRes = await loadPr(paymentRequestId);
    const data = prRes?.data as IPaymentRequestInfo | undefined;
    if (!data) return;
    setPr(data);
    setCurrency(data.currency || 'VND');
    setExchangeRate(Number(data.exchangeRate ?? 1));
    setFees([]);
    setNote('');
    setApprovalLevels(Number(data.approvalLevels ?? 1));
    const rolesFromPr = [...new Set((data.approvals ?? []).map((a) => a.role).filter(Boolean))] as string[];
    const defaultRoles = rolesFromPr.length
      ? rolesFromPr.filter((r) => APPROVAL_ROLE_OPTIONS.some((o) => o.code === r))
      : [LIST_ROLES.ACCOUNTANT.code, LIST_ROLES.ACCOUNTANT_MANAGER.code];
    setApprovalRoles(defaultRoles.length ? defaultRoles : [LIST_ROLES.ACCOUNTANT.code]);
    setLines(buildDefaultLines(data.items));
    setAttachedFileIds([]);
    setPendingFiles([]);

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

  const toggleFile = (id: string) => {
    setAttachedFileIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateLine = (idx: number, patch: Partial<IWarehouseInboundConfirmLineRequest>) => {
    setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const addFee = () => {
    setFees((prev) => [...prev, { feeName: '', feeType: 'OTHER', amount: 0, note: '' }]);
  };

  const updateFee = (idx: number, patch: Partial<IWarehouseInboundFeeItem>) => {
    setFees((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeFee = (idx: number) => {
    setFees((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalFeeAmount = useMemo(() => fees.reduce((sum, f) => sum + Number(f.amount ?? 0), 0), [fees]);

  const addPendingFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setPendingFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmitDraftReceipt = async (receiptId: string) => {
    try {
      setSubmittingReceiptId(receiptId);
      await submitInboundReceipt(receiptId);
      toast({ title: 'Đã gửi duyệt biên nhận' });
      await loadAll();
    } catch {
      /* toast from hook */
    } finally {
      setSubmittingReceiptId(null);
    }
  };

  const hasActiveLine = (receipt: IWarehouseInboundReceiptInfo): boolean =>
    (receipt.lines ?? []).some((line) => Number(line.quantityReceived ?? 0) > 0);

  const lineMeta = useMemo(() => {
    return (pr?.items ?? []).map((item) => ({
      id: item.id,
      productCode: item.purchaseOrderLine?.product?.code ?? '—',
      productName: item.purchaseOrderLine?.productName ?? item.purchaseOrderLine?.product?.name ?? '—',
      qtyExpected: Number(item.purchaseOrderLine?.quantity ?? 0),
      unitPrice: Number(item.purchaseOrderLine?.unitPrice ?? 0),
      lineCurrency: item.purchaseOrderLine?.currency ?? '',
    }));
  }, [pr?.items]);

  const receivedLineCount = useMemo(
    () => lines.filter((line) => Number(line.quantityReceived ?? 0) > 0).length,
    [lines],
  );

  const lineStats = useMemo(() => {
    const totalQtyOrdered = lineMeta.reduce((s, m) => s + m.qtyExpected, 0);
    const totalQtyReceived = lines.reduce((s, l) => s + Number(l.quantityReceived ?? 0), 0);
    const totalAmount = lines.reduce((s, line, idx) => {
      const meta = lineMeta[idx];
      if (!meta || !meta.unitPrice) return s;
      const ep = computeEffectiveUnitPrice(meta.unitPrice, Number(line.taxPercent ?? 0), line.isTaxIncluded ?? false);
      return s + ep * Number(line.quantityReceived ?? 0);
    }, 0);
    const fillPct = totalQtyOrdered > 0 ? (totalQtyReceived / totalQtyOrdered) * 100 : 0;
    return { totalQtyOrdered, totalQtyReceived, totalAmount, fillPct };
  }, [lines, lineMeta]);

  const importFileRef = useRef<HTMLInputElement>(null);

  const exportLinesToExcel = useCallback(() => {
    const headers = [
      'STT', 'ID dòng (không đổi)', 'Mã sản phẩm', 'Sản phẩm', 'SL đặt',
      'SL nhận', 'Thuế %', 'Bao gồm thuế (0/1)', 'Đơn giá gốc', 'Đơn giá sau thuế',
      'Bill sổ sách', 'Ghi chú dòng',
    ];
    const rows = lines.map((line, idx) => {
      const meta = lineMeta[idx];
      const unitPrice = meta?.unitPrice ?? 0;
      const taxPct = Number(line.taxPercent ?? 0);
      const isTaxIncluded = line.isTaxIncluded ?? false;
      const effectivePrice = computeEffectiveUnitPrice(unitPrice, taxPct, isTaxIncluded);
      return [
        idx + 1,
        line.paymentRequestPurchaseOrderLineId,
        meta?.productCode ?? '',
        meta?.productName ?? '',
        meta?.qtyExpected ?? 0,
        line.quantityReceived,
        taxPct,
        isTaxIncluded ? 1 : 0,
        unitPrice,
        Math.round(effectivePrice * 100) / 100,
        line.billOnPaper ?? '',
        line.lineNote ?? '',
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 5 }, { wch: 38 }, { wch: 16 }, { wch: 32 }, { wch: 10 },
      { wch: 10 }, { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dòng hàng');
    XLSX.writeFile(wb, `nk-${pr?.requestNumber ?? 'lines'}.xlsx`);
  }, [lines, lineMeta, pr?.requestNumber]);

  const importLinesFromExcel = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as unknown[][];
        if (rows.length < 2) {
          toast({ variant: 'destructive', title: 'File không hợp lệ', description: 'File cần có ít nhất 1 dòng dữ liệu.' });
          return;
        }
        const updates: Record<string, Partial<IWarehouseInboundConfirmLineRequest>> = {};
        for (const row of rows.slice(1)) {
          const arr = row as unknown[];
          const id = String(arr[1] ?? '').trim();
          if (!id) continue;
          updates[id] = {
            quantityReceived: Number(arr[5] ?? 0),
            taxPercent: Number(arr[6] ?? 0),
            isTaxIncluded: Number(arr[7] ?? 0) === 1,
            billOnPaper: String(arr[10] ?? ''),
            lineNote: String(arr[11] ?? ''),
          };
        }
        const updatedCount = Object.keys(updates).length;
        if (updatedCount === 0) {
          toast({ variant: 'destructive', title: 'Không tìm thấy dữ liệu hợp lệ', description: 'Kiểm tra lại cột "ID dòng".' });
          return;
        }
        setLines((prev) =>
          prev.map((line) => {
            const u = updates[line.paymentRequestPurchaseOrderLineId];
            return u ? { ...line, ...u } : line;
          }),
        );
        toast({ title: `Đã cập nhật ${updatedCount} dòng từ Excel` });
      } catch {
        toast({ variant: 'destructive', title: 'Không đọc được file', description: 'Vui lòng dùng file xuất từ hệ thống.' });
      }
      if (importFileRef.current) importFileRef.current.value = '';
    };
    reader.readAsArrayBuffer(files[0]);
  }, [toast]);

  const missingRequirements = useMemo(() => {
    const issues: string[] = [];
    if (!lines.length) issues.push('Cần có dòng PO');
    if (receivedLineCount === 0) issues.push('Cần ít nhất 1 dòng nhận có SL > 0');
    return issues;
  }, [lines.length, receivedLineCount]);

  const canCreateDraft = !!paymentRequestId && !!pr && missingRequirements.length === 0;

  const exchangeRatePreview =
    currency !== 'VND' && exchangeRate > 0 ? `1 ${currency} ≈ ${numberWithCommas(exchangeRate)} VND` : '';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRequestId || !pr) return;
    if (!lines.length) {
      toast({ variant: 'destructive', title: 'Không có dòng hàng', description: 'Đề nghị thanh toán không có dòng PO.' });
      return;
    }
    const receivedLines = lines.filter((line) => Number(line.quantityReceived) > 0);
    if (!receivedLines.length) {
      toast({
        variant: 'destructive',
        title: 'Thiếu dòng nhận',
        description: 'Cần ít nhất 1 dòng có số lượng nhận > 0 để tạo DRAFT.',
      });
      return;
    }
    try {
      // Step 1 — upload staged files and collect their IDs
      let newFileIds: string[] = [];
      if (pendingFiles.length > 0) {
        const prevPaperIds = new Set((pr.papers ?? []).map((p) => p.id));
        for (const file of pendingFiles) {
          await uploadPaymentFile({
            file,
            paymentRequestId,
            category: PAYMENT_REQUEST_FILE_CATEGORY.PAPERS,
            attachmentType: PAYMENT_REQUEST_FILE_CATEGORY.PAPERS,
          });
        }
        // Refetch to discover the newly created file IDs
        const prRes = await loadPr(paymentRequestId);
        const updatedPr = prRes?.data as IPaymentRequestInfo | undefined;
        if (updatedPr) {
          newFileIds = (updatedPr.papers ?? [])
            .filter((p) => !prevPaperIds.has(p.id))
            .map((p) => p.id);
        }
      }

      // Step 2 — confirm inbound with all file IDs
      const allFileIds = [...attachedFileIds, ...newFileIds];
      await confirmInbound({
        paymentRequestId,
        currency,
        exchangeRate,
        feeAmount: totalFeeAmount,
        fees: fees.length ? fees : undefined,
        note,
        approvalLevels,
        approvalRoles,
        lines: receivedLines,
        attachedFileIds: allFileIds.length ? allFileIds : undefined,
      });
      setPendingFiles([]);
      toast({ title: 'Đã xác nhận nhập kho', variant: 'success' });
      await loadAll();
    } catch {
      /* toast from hook */
    }
  };

  const isLoading = isLoadingPr || isLoadingReceipts;

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading && !pr) {
    return (
      <div className="pb-28">
        <HeaderPageLayout title="Nhập kho theo DNTT" buttonSubmit={null} />
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

  if (!pr) {
    return (
      <div className="pb-28">
        <HeaderPageLayout title="Nhập kho theo DNTT" buttonSubmit={null} />
        <p className="mt-6 text-sm text-muted-foreground">Không tải được đề nghị thanh toán.</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <HeaderPageLayout
        title={pr.requestNumber ? `Nhập kho — ${pr.requestNumber}` : 'Nhập kho theo DNTT'}
        buttonSubmit={
          <Button type="submit" form="wi-confirm-form" size="sm" disabled={!canCreateDraft || isConfirming || isUploadingFile || isLoading}>
            {isConfirming || isUploadingFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Xác nhận nhập kho
          </Button>
        }
      />

      {/* ── Overview strip ── */}
      <Card className="mt-4 border-border/60">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="rounded-md bg-muted px-3 py-1 text-xs font-bold shadow-sm">{pr.status}</span>
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs text-foreground">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">NCC</span>
              <span className="truncate font-medium">{vendorLabel(pr)}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiền tệ</span>
              <span className="font-medium">{pr.currency || '—'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Dòng PO</span>
              <span className="font-medium tabular-nums">{pr.items?.length ?? 0}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tổng đề nghị</span>
              <span className="text-base font-bold text-primary tabular-nums">
                {formatCurrencyVN(Number(pr.totalAmount ?? 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Main 3-col grid ── */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Col 1 — Thông tin DNTT (read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <Info className="h-4 w-4" />
              Thông tin đề nghị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DisplayField label="Mã DNTT" value={pr.requestNumber} mono />
              <DisplayField label="Trạng thái" value={pr.status} />
              <DisplayField label="Nhà cung cấp" value={vendorLabel(pr)} className="col-span-2" />
              <DisplayField label="Tiền tệ" value={pr.currency} />
              <DisplayField label="Tỷ giá PR" value={pr.exchangeRate ? numberWithCommas(Number(pr.exchangeRate)) : '—'} />
              <DisplayField
                label="Tổng đề nghị"
                value={formatCurrencyVN(Number(pr.totalAmount ?? 0))}
                className="col-span-2"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" asChild>
              <Link to="/payment/$paymentId" params={{ paymentId: pr.id }}>
                <ExternalLink className="h-3.5 w-3.5" />
                Mở trang DNTT
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Col 2 — Xác nhận nhập kho (editable form) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <Warehouse className="h-4 w-4" />
              Xác nhận nhập kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id="wi-confirm-form" onSubmit={(e) => void onSubmit(e)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tiền tệ</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tỷ giá</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className="h-8 text-xs tabular-nums"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    disabled={currency === 'VND'}
                  />
                  {exchangeRatePreview && (
                    <p className="text-[10px] text-muted-foreground">{exchangeRatePreview}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Số cấp duyệt</Label>
                <Select value={String(approvalLevels)} onValueChange={(v) => setApprovalLevels(Number(v))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-xs">
                        {n} cấp
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ghi chú biên nhận</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Ghi chú..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Chứng từ đính kèm</Label>
                  <label className={cn('cursor-pointer', (isConfirming || isUploadingFile) && 'pointer-events-none opacity-50')}>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => { addPendingFiles(e.target.files); e.target.value = ''; }}
                      disabled={isConfirming || isUploadingFile || isLoading}
                    />
                    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs hover:bg-muted">
                      <Paperclip className="h-3 w-3" />
                      Chọn file
                    </span>
                  </label>
                </div>

                {/* Pending files — staged, not yet uploaded */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50/60 p-2 dark:border-amber-800 dark:bg-amber-950/20">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                      Chờ upload khi xác nhận ({pendingFiles.length})
                    </p>
                    {pendingFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <Paperclip className="h-3 w-3 shrink-0 text-amber-500" />
                        <span className="min-w-0 flex-1 truncate text-amber-800 dark:text-amber-300">{f.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-amber-600 hover:text-destructive"
                          onClick={() => removePendingFile(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing PR papers — select to attach */}
                {papers.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      File đã có trên DNTT — tích để đính kèm
                    </p>
                    {papers.map((f) => (
                      <label key={f.id} className="flex cursor-pointer items-center gap-2 text-xs">
                        <Checkbox
                          checked={attachedFileIds.includes(f.id)}
                          onCheckedChange={() => toggleFile(f.id)}
                        />
                        <span className="min-w-0 truncate">{f.fileName}</span>
                      </label>
                    ))}
                  </div>
                ) : pendingFiles.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">Chưa có file. Nhấn "Chọn file" để thêm.</p>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Col 3 — Biên nhận đã lập */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <ClipboardList className="h-4 w-4" />
              Biên nhận đã lập
              {receipts.length > 0 && (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {receipts.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-6 text-center">
                <ClipboardList className="mb-2 h-6 w-6 text-muted-foreground/60" />
                <p className="text-xs font-medium text-muted-foreground">Chưa có biên nhận</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Xác nhận nhập kho để tạo biên nhận DRAFT.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {receipts.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] text-muted-foreground">{r.id}</p>
                      <p className="text-xs font-medium">{r.status}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground"
                        onClick={() => void loadAll()}
                        disabled={isLoading || isSubmittingReceipt}
                      >
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                      <Button variant="secondary" size="sm" className="h-7 text-xs" asChild>
                        <Link to="/warehouse-inbound/receipt/$receiptId" params={{ receiptId: r.id }}>
                          Xem
                        </Link>
                      </Button>
                      {r.status === 'DRAFT' ? (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="h-7 min-w-[72px] gap-1 text-xs"
                          disabled={(isSubmittingReceipt && submittingReceiptId === r.id) || !hasActiveLine(r)}
                          onClick={() => void onSubmitDraftReceipt(r.id)}
                          title={!hasActiveLine(r) ? 'Cần ít nhất 1 dòng active' : undefined}
                        >
                          {isSubmittingReceipt && submittingReceiptId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          Submit
                        </Button>
                      ) : null}
                    </div>
                    {r.status === 'DRAFT' && !hasActiveLine(r) ? (
                      <p className="w-full text-[10px] text-amber-600">Cần ít nhất 1 dòng quantityReceived &gt; 0</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Phí nhập kho ── */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm uppercase">
              <span>Phí nhập kho</span>
              {fees.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {fees.length}
                </span>
              )}
            </span>
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={addFee}>
              <Plus className="h-3.5 w-3.5" />
              Thêm phí
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-4 text-center">
              <p className="text-xs font-medium text-muted-foreground">Chưa có phí</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Nhấn "Thêm phí" để khai báo phí vận chuyển, hải quan, bảo hiểm...
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* column labels */}
              <div className="grid grid-cols-[1fr_44px_160px_120px_32px] items-center gap-2 px-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tên phí</span>
                <span />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Loại phí</span>
                <span className="text-right text-[10px] uppercase tracking-wide text-muted-foreground">Số tiền ({currency})</span>
                <span />
              </div>
              {fees.map((fee, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_44px_160px_120px_32px] items-center gap-2">
                  <Input
                    className="h-7 text-xs"
                    placeholder="VD: Overseas shipping..."
                    value={fee.feeName}
                    onChange={(e) => updateFee(idx, { feeName: e.target.value })}
                  />
                  <span className="text-center text-[10px] text-muted-foreground">—</span>
                  <Select
                    value={fee.feeType}
                    onValueChange={(v) => updateFee(idx, { feeType: v, feeName: fee.feeName || feeTypeLabel(v) })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WI_FEE_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-7 text-right text-xs tabular-nums"
                    type="number"
                    step="any"
                    min={0}
                    value={fee.amount}
                    onChange={(e) => updateFee(idx, { amount: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeFee(idx)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 border-t pt-2 text-xs">
                <span className="text-muted-foreground">Tổng phí:</span>
                <span className="w-28 text-right font-semibold tabular-nums">
                  {numberWithCommas(totalFeeAmount)}
                </span>
                <span className="w-10 text-muted-foreground">{currency}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dòng hàng ── */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm uppercase">
              <Warehouse className="h-4 w-4" />
              Dòng hàng — số lượng nhận &amp; thuế
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {lines.length} dòng
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => importLinesFromExcel(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => importFileRef.current?.click()}
              >
                <FileUp className="h-3.5 w-3.5" />
                Tải lên Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={exportLinesToExcel}
                disabled={lines.length === 0}
              >
                <FileDown className="h-3.5 w-3.5" />
                Xuất Excel
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Partial-receipt warning banner */}
          {receivedLineCount > 0 && lineStats.fillPct < 100 && (
            <div className="mb-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Nhận chưa đủ — {lineStats.fillPct.toFixed(1)}% ({numberWithCommas(lineStats.totalQtyReceived)}/{numberWithCommas(lineStats.totalQtyOrdered)})
                </p>
                <ul className="mt-1 space-y-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                  {lines.map((line, idx) => {
                    const meta = lineMeta[idx];
                    const qty = Number(line.quantityReceived ?? 0);
                    const exp = meta?.qtyExpected ?? 0;
                    if (exp === 0 || qty >= exp) return null;
                    return (
                      <li key={line.paymentRequestPurchaseOrderLineId} className="flex items-center gap-1.5">
                        <span className={cn('inline-block h-1.5 w-1.5 rounded-full', qty === 0 ? 'bg-red-500' : 'bg-amber-500')} />
                        <span className="font-medium">{meta?.productName ?? '—'}</span>
                        <span className="text-amber-600">
                          {qty === 0 ? 'chưa nhận' : `nhận ${numberWithCommas(qty)}/${numberWithCommas(exp)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">STT</TableHead>
                  <TableHead className="text-[11px]">Mã Sản phẩm</TableHead>
                  <TableHead className="text-[11px]">Sản phẩm</TableHead>
                  <TableHead className="w-20 text-[11px]">SL đặt</TableHead>
                  <TableHead className="w-24 text-[11px]">SL nhận</TableHead>
                  <TableHead className="w-20 text-[11px]">Thuế %</TableHead>
                  <TableHead className="w-32 text-[11px]">Đơn giá gốc</TableHead>
                  <TableHead className="w-36 text-[11px]">Bao gồm thuế</TableHead>
                  <TableHead className="w-40 text-[11px]">Đơn giá sau thuế</TableHead>
                  <TableHead className="w-32 text-[11px]">Bill sổ sách</TableHead>
                  <TableHead className="text-[11px]">Ghi chú dòng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, idx) => {
                  const meta = lineMeta[idx];
                  const unitPrice = meta?.unitPrice ?? 0;
                  const taxPct = Number(line.taxPercent ?? 0);
                  const isTaxIncluded = line.isTaxIncluded ?? false;
                  const hasTax = taxPct > 0;
                  const lineCur = meta?.lineCurrency || currency;
                  const effectivePrice = computeEffectiveUnitPrice(unitPrice, taxPct, isTaxIncluded);
                  const basePrice = computeBasePriceBeforeTax(unitPrice, taxPct, isTaxIncluded);
                  const qtyReceived = Number(line.quantityReceived ?? 0);
                  const qtyExpected = meta?.qtyExpected ?? 0;
                  const isPartial = qtyExpected > 0 && qtyReceived < qtyExpected;
                  const isZero = qtyReceived === 0;
                  return (
                    <TableRow
                      key={line.paymentRequestPurchaseOrderLineId}
                      className={cn(isZero && 'bg-red-50/40 dark:bg-red-950/10', isPartial && !isZero && 'bg-amber-50/40 dark:bg-amber-950/10')}
                    >
                      <TableCell className="text-xs">{idx + 1}</TableCell>
                      <TableCell className="text-xs">{meta?.productCode}</TableCell>
                      <TableCell className="text-xs">{meta?.productName ?? '—'}</TableCell>
                      <TableCell className="text-xs tabular-nums">{meta?.qtyExpected ?? '—'}</TableCell>
                      <TableCell>
                        <Input
                          className={cn('h-8 text-xs tabular-nums', isZero && 'border-red-300 focus-visible:ring-red-300', isPartial && !isZero && 'border-amber-300 focus-visible:ring-amber-300')}
                          type="number"
                          step="any"
                          min={0}
                          value={line.quantityReceived}
                          onChange={(e) => updateLine(idx, { quantityReceived: Number(e.target.value) })}
                        />
                        {isZero && <p className="mt-0.5 text-[10px] font-medium text-red-500">Chưa nhận</p>}
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 text-xs tabular-nums"
                          type="number"
                          step="any"
                          min={0}
                          value={line.taxPercent}
                          onChange={(e) => updateLine(idx, { taxPercent: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {unitPrice > 0 ? `${numberWithCommas(unitPrice)} ${lineCur}` : '—'}
                      </TableCell>
                      <TableCell>
                        {hasTax ? (
                          <label className="flex cursor-pointer items-center gap-2 text-xs">
                            <Checkbox
                              checked={isTaxIncluded}
                              onCheckedChange={(v) => updateLine(idx, { isTaxIncluded: !!v })}
                            />
                            Giá đã có thuế
                          </label>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasTax ? (
                          <div className="space-y-0.5 text-xs">
                            <p className="font-medium tabular-nums text-foreground">
                              {numberWithCommas(Math.round(effectivePrice * 100) / 100)} {lineCur}
                            </p>
                            {!isTaxIncluded ? (
                              <p className="text-[10px] text-muted-foreground">
                                {numberWithCommas(unitPrice)} + {taxPct}% thuế
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground">
                                Trước thuế: {numberWithCommas(Math.round(basePrice * 100) / 100)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 text-xs"
                          type="text"
                          placeholder="Mã / số bill..."
                          value={line.billOnPaper ?? ''}
                          onChange={(e) => updateLine(idx, { billOnPaper: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 text-xs"
                          placeholder="Ghi chú..."
                          value={line.lineNote}
                          onChange={(e) => updateLine(idx, { lineNote: e.target.value })}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* ── Totals summary ── */}
          {lines.length > 0 && (
            <div className="mt-0 overflow-hidden rounded-b-md border-x border-b text-sm">
              {/* Row 1 — Tổng đặt hàng */}
              <div className="flex items-center border-b bg-muted/20 px-4 py-2">
                <span className="flex-1 text-xs text-muted-foreground">Tổng số lượng / Tổng tiền hàng</span>
                <span className="w-20 text-right tabular-nums text-xs">{numberWithCommas(lineStats.totalQtyOrdered)}</span>
                <span className="w-28 text-right font-medium tabular-nums text-xs">{numberWithCommas(Math.round(lineStats.totalAmount))}</span>
                <span className="w-12 text-right text-[11px] text-muted-foreground">{currency}</span>
              </div>

              {/* Row 2 — SL nhận (highlighted) */}
              <div className="flex items-center border-b bg-primary/5 px-4 py-2">
                <span className="flex-1 text-xs font-medium">
                  Số lượng nhận ({lineStats.fillPct.toFixed(1)}%)
                </span>
                <span className={cn('w-20 text-right font-semibold tabular-nums text-xs', lineStats.fillPct >= 100 ? 'text-emerald-600' : 'text-primary')}>
                  {numberWithCommas(lineStats.totalQtyReceived)}
                </span>
                <span className="w-28 text-right font-semibold tabular-nums text-xs text-primary">
                  {numberWithCommas(Math.round(lineStats.totalAmount))}
                </span>
                <span className="w-12 text-right text-[11px] text-muted-foreground">{currency}</span>
              </div>

              {/* Fee lines */}
              {fees.map((fee, idx) => (
                <div key={idx} className="flex items-center border-b px-4 py-1.5">
                  <span className="flex-1 pl-4 text-[11px] text-muted-foreground">
                    + {fee.feeName || feeTypeLabel(fee.feeType)}
                  </span>
                  <span className="w-20" />
                  <span className="w-28 text-right tabular-nums text-[11px]">{numberWithCommas(fee.amount)}</span>
                  <span className="w-12 text-right text-[11px] text-muted-foreground">{currency}</span>
                </div>
              ))}

              {/* Total fees */}
              {fees.length > 0 && (
                <div className="flex items-center border-b px-4 py-2">
                  <span className="flex-1 text-xs text-muted-foreground">Tổng phí phát sinh</span>
                  <span className="w-20" />
                  <span className="w-28 text-right font-medium tabular-nums text-xs">{numberWithCommas(totalFeeAmount)}</span>
                  <span className="w-12 text-right text-[11px] text-muted-foreground">{currency}</span>
                </div>
              )}

              {/* Grand total */}
              <div className="flex items-center bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/20">
                <span className="flex-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Tổng nhập kho (gồm phí)
                </span>
                <span className="w-20" />
                <span className="w-28 text-right font-bold tabular-nums text-sm text-emerald-700 dark:text-emerald-400">
                  {numberWithCommas(Math.round(lineStats.totalAmount + totalFeeAmount))}
                </span>
                <span className="w-12 text-right text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{currency}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Fixed footer bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-x-5 gap-y-2 overflow-x-auto text-sm">
            <FooterStat label="Dòng PO">
              <span className="font-medium text-foreground tabular-nums">{lines.length}</span>
            </FooterStat>
            <FooterStat label="Dòng nhận">
              <span className="font-medium text-foreground tabular-nums">{receivedLineCount} active</span>
            </FooterStat>
            <FooterStat label="Tiền tệ">
              <span className="font-medium text-foreground">{currency}</span>
            </FooterStat>
            <FooterStat label="Tỷ giá">
              <span className="font-medium text-foreground tabular-nums">{numberWithCommas(exchangeRate)}</span>
            </FooterStat>
            <FooterStat label="Tổng SL nhận">
              <span className="font-medium text-foreground tabular-nums">{numberWithCommas(lineStats.totalQtyReceived)}</span>
            </FooterStat>
            <FooterStat label="Tổng tiền">
              <span className="font-semibold text-primary tabular-nums">
                {numberWithCommas(Math.round(lineStats.totalAmount))} {currency}
              </span>
            </FooterStat>
            {totalFeeAmount > 0 && (
              <FooterStat label="Tổng phí">
                <span className="font-medium text-foreground tabular-nums">
                  {numberWithCommas(totalFeeAmount)} {currency}
                </span>
              </FooterStat>
            )}
            <FooterStat label="File đính kèm">
              <span className="font-medium text-foreground tabular-nums">
                {attachedFileIds.length + pendingFiles.length} file
                {pendingFiles.length > 0 && (
                  <span className="ml-1 text-amber-600">({pendingFiles.length} chờ upload)</span>
                )}
              </span>
            </FooterStat>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void loadAll()}
              disabled={isLoading || isConfirming}
            >
              <RefreshCcw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              Làm mới
            </Button>
            <Button
              type="submit"
              form="wi-confirm-form"
              size="sm"
              disabled={!canCreateDraft || isConfirming || isUploadingFile || isLoading}
            >
              {isUploadingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang upload file...
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo draft...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Xác nhận nhập kho
                </>
              )}
            </Button>
            {canCreateDraft ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đủ điều kiện tạo DRAFT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {missingRequirements[0] ?? 'Vui lòng kiểm tra dữ liệu'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
