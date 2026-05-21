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
  DisplayField,
  FooterStat,
  PendingFilesList,
} from '@/components/warehouse-inbound/shared';
import {
  useConfirmWarehouseInbound,
  useGetWarehouseInboundPaymentRequest,
  useGetWarehouseInboundReceipts,
  useSubmitWarehouseInboundReceipt,
} from '@/hooks/use-warehouse-inbound';
import { useUploadPaymentRequestFile } from '@/hooks/use-payment';
import { useToast } from '@/hooks/use-toast';
import {
  LIST_ROLES,
  PAYMENT_REQUEST_FILE_CATEGORY,
} from '@/lib/constants';
import { formatCurrencyVN, numberWithCommas } from '@/lib/other';
import { hasPermission, PERMISSION_CODES } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IPaymentRequestInfo } from '@/types/payment';
import type {
  IWarehouseInboundConfirmLineRequest,
  IWarehouseInboundFeeRequest,
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
  ShoppingCart,
  Trash2,
  Warehouse,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const { mutateAsync: submitInboundReceipt, isPending: isSubmittingReceipt } = useSubmitWarehouseInboundReceipt();
  const { mutateAsync: uploadPaymentFile, isPending: isUploadingFile } = useUploadPaymentRequestFile();

  const [pr, setPr] = useState<IPaymentRequestInfo>();
  const [receipts, setReceipts] = useState<IWarehouseInboundReceiptInfo[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [fees, setFees] = useState<IWarehouseInboundFeeRequest[]>([]);
  const [realBillAmount, setRealBillAmount] = useState(0);
  const [billOnPaperAmount, setBillOnPaperAmount] = useState(0);
  const [note, setNote] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [approvalLevels, setApprovalLevels] = useState(2);
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
    setExchangeRate(Number(data.exchangeRate ?? 1));
    setFees([]);
    setRealBillAmount(0);
    setBillOnPaperAmount(0);
    setNote('');
    setReceivedDate(new Date().toISOString().slice(0, 10));
    setApprovalLevels(Number(data.approvalLevels ?? 2));
    const rolesFromPr = [...new Set((data.approvals ?? []).map((a) => a.role).filter(Boolean))] as string[];
    const defaultRoles = rolesFromPr.length
      ? rolesFromPr.filter((r) => APPROVAL_ROLE_OPTIONS.some((o) => o.code === r))
      : [LIST_ROLES.ACCOUNTANT.code, LIST_ROLES.ACCOUNTANT_MANAGER.code];
    setApprovalRoles(defaultRoles.length ? defaultRoles : [LIST_ROLES.ACCOUNTANT.code]);
    const autoLines: IWarehouseInboundConfirmLineRequest[] = (data.items ?? []).map((item) => ({
      paymentRequestPurchaseOrderLineId: item.id,
      quantityReceived: item.purchaseOrderLine?.quantity ?? 0,
      taxPercent: item.purchaseOrderLine?.tax,
      taxIncluded: false,
      billOnPaper: undefined,
      lineNote: '',
    }));
    setLines(autoLines);
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

  const poLineOptions = useMemo(() => {
    const prItems = pr?.items ?? [];
    return prItems.map((item) => ({
      id: item.id,
      productCode: item.purchaseOrderLine?.product?.code ?? '—',
      productName: item.purchaseOrderLine?.productName ?? item.purchaseOrderLine?.product?.name ?? '—',
      vendorName: item.purchaseOrderLine?.vendorName ?? '—',
      quantity: item.purchaseOrderLine?.quantity ?? 0,
      uom: item.purchaseOrderLine?.uom1 ?? '—',
      unitPrice: item.purchaseOrderLine?.unitPrice ?? 0,
      tax: item.purchaseOrderLine?.tax ?? 0,
      isTaxIncluded: item.purchaseOrderLine?.isTaxIncluded ?? false,
    }));
  }, [pr?.items]);

  const toggleFile = (id: string) => {
    setAttachedFileIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateLine = (idx: number, patch: Partial<IWarehouseInboundConfirmLineRequest>) => {
    setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const addFee = () => {
    setFees((prev) => [...prev, { feeName: '', feeType: 'OTHER', amount: 0, note: '' }]);
  };

  const updateFee = (idx: number, patch: Partial<IWarehouseInboundFeeRequest>) => {
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

  const importFileRef = useRef<HTMLInputElement>(null);

  const exportLinesToExcel = useCallback(() => {
    const headers = ['STT', 'Mã SP', 'Tên sản phẩm', 'Số lượng', 'SL thực', 'ĐVT', 'Thuế %', 'Bao gồm thuế', 'Đơn giá', 'Đơn giá + thuế', 'Bill sổ sách', 'Ghi chú'];
    const rows = lines.map((line, idx) => {
      const po = poLineOptions.find((o) => o.id === line.paymentRequestPurchaseOrderLineId);
      const unitPrice = po?.unitPrice ?? 0;
      const taxPct = line.taxPercent ?? 0;
      const isTaxIncluded = line.taxIncluded ?? false;
      const priceWithTax = isTaxIncluded ? unitPrice : unitPrice * (1 + taxPct / 100);
      const computedBillAmount = (line.quantityReceived ?? 0) * priceWithTax;
      const billOnBookAmount = line.billOnPaper?.trim() ? line.billOnPaper : computedBillAmount;
      return [
        idx + 1,
        po?.productCode ?? '',
        po?.productName ?? '',
        po?.quantity ?? 0,
        line.quantityReceived,
        po?.uom ?? '',
        line.taxPercent ?? '',
        isTaxIncluded ? 'Có' : 'Không',
        unitPrice,
        priceWithTax,
        billOnBookAmount,
        line.lineNote ?? '',
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [{ wch: 5 }, { wch: 14 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dòng hàng');
    XLSX.writeFile(wb, `nk-${pr?.requestNumber ?? 'lines'}.xlsx`);
  }, [lines, poLineOptions, pr?.requestNumber]);

  const importLinesFromExcel = useCallback(
    (files: FileList | null) => {
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
          let updatedCount = 0;
          setLines((prev) => {
            const updated = [...prev];
            for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
              const arr = rows[rowIdx] as unknown[];
              const lineIdx = rowIdx - 1;
              if (lineIdx >= updated.length) break;
              const qtyReceived = arr[4] != null && arr[4] !== '' ? Number(arr[4]) : updated[lineIdx].quantityReceived;
              const taxPct = arr[6] != null && arr[6] !== '' ? Number(arr[6]) : updated[lineIdx].taxPercent;
              const taxIncludedRaw = String(arr[7] ?? '').trim().toLowerCase();
              const isTaxIncluded = taxIncludedRaw === 'có' || taxIncludedRaw === 'co' || taxIncludedRaw === 'true' || taxIncludedRaw === '1';
              const billOnBook = arr[10] != null && arr[10] !== '' ? String(arr[10]) : undefined;
              const note = arr[11] != null && String(arr[11]).trim() ? String(arr[11]) : updated[lineIdx].lineNote;
              updated[lineIdx] = {
                ...updated[lineIdx],
                quantityReceived: qtyReceived,
                taxPercent: taxPct,
                taxIncluded: isTaxIncluded,
                billOnPaper: billOnBook,
                lineNote: note ?? '',
              };
              updatedCount++;
            }
            return updated;
          });
          toast({ title: `Đã cập nhật ${updatedCount} dòng từ Excel`, variant: 'success' });
        } catch {
          toast({ variant: 'destructive', title: 'Không đọc được file', description: 'Vui lòng dùng file xuất từ hệ thống.' });
        }
        if (importFileRef.current) importFileRef.current.value = '';
      };
      reader.readAsArrayBuffer(files[0]);
    },
    [toast],
  );

  const missingRequirements = useMemo(() => {
    const issues: string[] = [];
    if (!lines.length) issues.push('Cần có ít nhất 1 dòng');
    if (!lines.some((l) => l.quantityReceived > 0)) issues.push('Ít nhất 1 dòng phải có SL thực > 0');
    return issues;
  }, [lines]);

  const canCreateInbound = hasPermission(PERMISSION_CODES.WAREHOUSE_INBOUND_CREATE);
  const canUpdateInbound = hasPermission(PERMISSION_CODES.WAREHOUSE_INBOUND_UPDATE);
  const canCreateDraft = canCreateInbound && !!paymentRequestId && !!pr && missingRequirements.length === 0;

  const currency = pr?.currency || 'VND';
  const exchangeRatePreview =
    currency !== 'VND' && exchangeRate > 0 ? `1 ${currency} ≈ ${numberWithCommas(exchangeRate)} VND` : '';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRequestId || !pr) return;
    if (!lines.length) {
      toast({ variant: 'destructive', title: 'Không có dòng', description: 'Cần ít nhất 1 dòng để tạo DRAFT.' });
      return;
    }
    try {
      let newFileIds: string[] = [];
      if (pendingFiles.length > 0) {
        const prevPaperIds = new Set((pr.papers ?? []).map((p) => p.id));
        for (const file of pendingFiles) {
          await uploadPaymentFile({
            file,
            paymentRequestId,
            category: PAYMENT_REQUEST_FILE_CATEGORY.PAPERS,
            attachmentType: "PAPER",
          });
        }
        const prRes = await loadPr(paymentRequestId);
        const updatedPr = prRes?.data as IPaymentRequestInfo | undefined;
        if (updatedPr) {
          newFileIds = (updatedPr.papers ?? []).filter((p) => !prevPaperIds.has(p.id)).map((p) => p.id);
        }
      }

      const allFileIds = [...attachedFileIds, ...newFileIds];
      await confirmInbound({
        paymentRequestId,
        exchangeRate,
        feeAmount: totalFeeAmount || undefined,
        fees: fees.length ? fees : undefined,
        realBillAmount: realBillAmount || undefined,
        billOnPaperAmount: billOnPaperAmount || undefined,
        note: note || undefined,
        receivedDate,
        approvalLevels,
        approvalRoles,
        lines,
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

  if (isLoading && !pr) {
    return (
      <div className="pb-28">
        <HeaderPageLayout title="Nhập kho theo ĐNTT" buttonSubmit={null} />
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
        <HeaderPageLayout title="Nhập kho theo ĐNTT" buttonSubmit={null} />
        <p className="mt-6 text-sm text-muted-foreground">Không tải được đề nghị thanh toán.</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <HeaderPageLayout
        title={pr.requestNumber ? `Nhập kho — ${pr.requestNumber}` : 'Nhập kho theo ĐNTT'}
        buttonSubmit={
          <Button type="submit" form="wi-confirm-form" size="sm" disabled={!canCreateDraft || isConfirming || isUploadingFile || isLoading}>
            {isConfirming || isUploadingFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Xác nhận nhập kho
          </Button>
        }
      />

      {/* Overview strip */}
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
              <span className="font-medium tabular-nums">{pr?.items?.length ?? 0}</span>
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

      {/* Main 3-col grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Col 1 — PR info (read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase">
              <Info className="h-4 w-4" />
              Thông tin đề nghị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DisplayField label="Mã ĐNTT" value={pr.requestNumber} mono />
              <DisplayField label="Trạng thái" value={pr.status} />
              <DisplayField label="Nhà cung cấp" value={vendorLabel(pr)} className="col-span-2" />
              <DisplayField label="Tiền tệ" value={pr.currency} />
              <DisplayField label="Tỷ giá PR" value={pr.exchangeRate ? numberWithCommas(Number(pr.exchangeRate)) : '—'} />
              <DisplayField label="Tổng đề nghị" value={formatCurrencyVN(Number(pr.totalAmount * (pr.exchangeRate ?? 1)))} className="col-span-2" />
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" asChild>
              <Link to="/payment/$paymentId" params={{ paymentId: pr.id }}>
                <ExternalLink className="h-3.5 w-3.5" />
                Mở trang ĐNTT
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Col 2 — Confirm form */}
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
                  {exchangeRatePreview && <p className="text-[10px] text-muted-foreground">{exchangeRatePreview}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ngày nhận hàng</Label>
                  <Input type="date" className="h-8 text-xs" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
                </div>
              </div>

              {/* <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Số tiền thực tế</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-8 text-xs tabular-nums"
                    value={realBillAmount}
                    onChange={(e) => setRealBillAmount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trên chứng từ</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-8 text-xs tabular-nums"
                    value={billOnPaperAmount}
                    onChange={(e) => setBillOnPaperAmount(Number(e.target.value))}
                  />
                </div>
              </div> */}

              <div className="space-y-1">
                <Label className="text-xs">Số cấp duyệt</Label>
                <Select value={String(approvalLevels)} onValueChange={(v) => setApprovalLevels(Number(v))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 3 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-xs">
                        {n} cấp
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-1">
                <Label className="text-xs">Ghi chú biên nhận</Label>
                <Input className="h-8 text-xs" placeholder="Ghi chú..." value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Col 3 — Existing receipts */}
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
                  <li key={r.id} className="space-y-2 rounded-md border px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium">{r.receiptNumber || r.id}</p>
                        <p className="text-[10px] text-muted-foreground">{r.status} — {r.receivedDate || r.createdAt}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => void loadAll()} disabled={isLoading || isSubmittingReceipt}>
                          <RefreshCcw className="h-3 w-3" />
                        </Button>
                        <Button variant="secondary" size="sm" className="h-7 text-xs" asChild>
                          <Link to="/warehouse-inbound/receipt/$receiptId" params={{ receiptId: r.id }}>Xem</Link>
                        </Button>
                        {r.status === 'DRAFT' && (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="h-7 min-w-[72px] gap-1 text-xs"
                            disabled={(isSubmittingReceipt && submittingReceiptId === r.id) || !hasActiveLine(r) || !canUpdateInbound}
                            onClick={() => void onSubmitDraftReceipt(r.id)}
                            title={!hasActiveLine(r) ? 'Cần ít nhất 1 dòng active' : undefined}
                          >
                            {isSubmittingReceipt && submittingReceiptId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                            Submit
                          </Button>
                        )}
                      </div>
                      {r.status === 'DRAFT' && !hasActiveLine(r) && (
                        <p className="w-full text-[10px] text-amber-600">Cần ít nhất 1 dòng quantityReceived &gt; 0</p>
                      )}
                    </div>
                    {(r.orders?.length ?? 0) > 0 && (
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          <ShoppingCart className="h-3 w-3" />
                          Đơn bán hàng liên quan
                        </p>
                        {r.orders.map((o) => (
                          <div key={o.orderId} className="rounded-md border bg-muted/30 px-2.5 py-1.5">
                            <p className="text-xs font-medium">{o.orderNumber}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {o.contractNumber ? `HĐ: ${o.contractNumber}` : ''}
                              {o.contractNumber && o.customerName ? ' — ' : ''}
                              {o.customerName ? `KH: ${o.customerName}` : ''}
                              {(o.contractNumber || o.customerName) && o.status ? ' — ' : ''}
                              {o.status ?? ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <Separator className="my-3" />


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

              <PendingFilesList files={pendingFiles} onRemove={removePendingFile} />

              {papers.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">File đã có trên ĐNTT — tích để đính kèm</p>
                  {papers.map((f) => (
                    <label key={f.id} className="flex cursor-pointer items-center gap-2 text-xs">
                      <Checkbox checked={attachedFileIds.includes(f.id)} onCheckedChange={() => toggleFile(f.id)} />
                      <span className="min-w-0 truncate">{f.fileName}</span>
                    </label>
                  ))}
                </div>
              ) : pendingFiles.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">Chưa có file. Nhấn "Chọn file" để thêm.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees section */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm uppercase">
              <span>Phí nhập kho</span>
              {fees.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">{fees.length}</span>
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
              <p className="mt-0.5 text-[10px] text-muted-foreground">Nhấn "Thêm phí" để khai báo phí vận chuyển, hải quan, bảo hiểm...</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_44px_160px_120px_32px] items-center gap-2 px-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tên phí</span>
                <span />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Loại phí</span>
                <span className="text-right text-[10px] uppercase tracking-wide text-muted-foreground">Số tiền ({currency})</span>
                <span />
              </div>
              {fees.map((fee, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_44px_160px_120px_32px] items-center gap-2">
                  <Input className="h-7 text-xs" placeholder="VD: Overseas shipping..." value={fee.feeName} onChange={(e) => updateFee(idx, { feeName: e.target.value })} />
                  <span className="text-center text-[10px] text-muted-foreground">—</span>
                  <Select value={fee.feeType} onValueChange={(v) => updateFee(idx, { feeType: v, feeName: fee.feeName || feeTypeLabel(v) })}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WI_FEE_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input className="h-7 text-right text-xs tabular-nums" type="number" step="any" min={0} value={fee.amount} onChange={(e) => updateFee(idx, { amount: Number(e.target.value) })} />
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeFee(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 border-t pt-2 text-xs">
                <span className="text-muted-foreground">Tổng phí:</span>
                <span className="w-28 text-right font-semibold tabular-nums">{numberWithCommas(totalFeeAmount)}</span>
                <span className="w-10 text-muted-foreground">{currency}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lines section */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm uppercase">
              <Warehouse className="h-4 w-4" />
              Dòng xác nhận nhập kho
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">{lines.length} dòng</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input ref={importFileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => importLinesFromExcel(e.target.files)} />
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => importFileRef.current?.click()}>
                <FileUp className="h-3.5 w-3.5" />
                Tải lên Excel
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={exportLinesToExcel} disabled={lines.length === 0}>
                <FileDown className="h-3.5 w-3.5" />
                Xuất Excel
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-6 text-center">
              <Warehouse className="mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs font-medium text-muted-foreground">Chưa có dòng PO nào</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Hệ thống tự nạp từ ĐNTT. Kiểm tra lại dữ liệu ĐNTT nếu không có dòng.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center text-[11px]">STT</TableHead>
                    <TableHead className="w-28 text-[11px]">Mã SP</TableHead>
                    <TableHead className="min-w-[160px] text-[11px]">Tên sản phẩm</TableHead>
                    <TableHead className="w-20 text-right text-[11px]">Số lượng</TableHead>
                    <TableHead className="w-28 text-[11px]">SL thực</TableHead>
                    <TableHead className="w-20 text-[11px]">ĐVT</TableHead>
                    <TableHead className="w-24 text-[11px]">Thuế %</TableHead>
                    <TableHead className="w-24 text-center text-[11px]">Bao gồm thuế</TableHead>
                    <TableHead className="w-28 text-right text-[11px]">Đơn giá</TableHead>
                    <TableHead className="w-32 text-right text-[11px]">Đơn giá + thuế</TableHead>
                    <TableHead className="w-32 text-right text-[11px]">Bill sổ sách</TableHead>
                    <TableHead className="min-w-[140px] text-[11px]">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, idx) => {
                    const po = poLineOptions.find((o) => o.id === line.paymentRequestPurchaseOrderLineId);
                    const unitPrice = po?.unitPrice ?? 0;
                    const taxPct = line.taxPercent ?? 0;
                    const isTaxIncluded = line.taxIncluded ?? false;
                    const priceWithTax = isTaxIncluded ? unitPrice : unitPrice * (1 + taxPct / 100);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="text-center text-xs tabular-nums">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{po?.productCode ?? '—'}</TableCell>
                        <TableCell className="text-xs">{po?.productName ?? '—'}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{numberWithCommas(po?.quantity ?? 0)}</TableCell>
                        <TableCell>
                          <Input
                            className="h-7 w-full text-xs tabular-nums"
                            type="number"
                            step="any"
                            min={0}
                            value={line.quantityReceived}
                            onChange={(e) => updateLine(idx, { quantityReceived: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell className="text-xs">{po?.uom ?? '—'}</TableCell>
                        <TableCell>
                          <Input
                            className="h-7 w-full text-xs tabular-nums"
                            type="number"
                            step="any"
                            min={0}
                            value={line.taxPercent ?? ''}
                            onChange={(e) => updateLine(idx, { taxPercent: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="—"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex h-7 items-center justify-center">
                            <Checkbox
                              checked={isTaxIncluded}
                              onCheckedChange={(checked) => updateLine(idx, { taxIncluded: checked === true })}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{numberWithCommas(unitPrice)}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{numberWithCommas(priceWithTax)}</TableCell>
                        <TableCell>
                          <Input
                            className="h-7 w-full text-right text-xs font-medium tabular-nums"
                            type="text"
                            value={line.billOnPaper ?? ''}
                            onChange={(e) =>
                              updateLine(idx, { billOnPaper: e.target.value.trim() ? e.target.value : undefined })
                            }
                            placeholder="—"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-7 w-full text-xs"
                            placeholder="Ghi chú..."
                            value={line.lineNote ?? ''}
                            onChange={(e) => updateLine(idx, { lineNote: e.target.value })}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {lines.length > 0 && (() => {
            const totals = lines.reduce(
              (acc, line) => {
                const po = poLineOptions.find((o) => o.id === line.paymentRequestPurchaseOrderLineId);
                const unitPrice = po?.unitPrice ?? 0;
                const qty = po?.quantity ?? 0;
                const qtyReceived = line.quantityReceived ?? 0;
                const taxPct = line.taxPercent ?? 0;
                const lineTotal = qtyReceived * unitPrice;
                const lineTax = lineTotal * (taxPct / 100);
                acc.totalQty += qty;
                acc.totalQtyReceived += qtyReceived;
                acc.totalAmount += lineTotal;
                acc.totalTax += lineTax;
                return acc;
              },
              { totalQty: 0, totalQtyReceived: 0, totalAmount: 0, totalTax: 0 },
            );
            const paidPct = pr?.paidPercentage ?? 100;
            const requestedAmount = totals.totalAmount * (paidPct / 100);

            return (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                <div className="flex items-center justify-end gap-4 text-xs">
                  <span className="text-muted-foreground">Tổng số lượng / Tổng tiền hàng</span>
                  <span className="w-16 text-right font-medium tabular-nums">{numberWithCommas(totals.totalQtyReceived)}</span>
                  <span className="w-28 text-right font-semibold tabular-nums">{numberWithCommas(Math.round(totals.totalAmount))}</span>
                  <span className="w-12 text-muted-foreground">{currency}</span>
                </div>
                {paidPct < 100 && (
                  <div className="flex items-center justify-end gap-4 text-xs">
                    <span className="text-muted-foreground">Số tiền đề nghị thanh toán ({paidPct.toFixed(2)}%)</span>
                    <span className="w-16" />
                    <span className="w-28 text-right font-semibold tabular-nums text-primary">{numberWithCommas(Math.round(requestedAmount))}</span>
                    <span className="w-12 text-muted-foreground">{currency}</span>
                  </div>
                )}
                {totals.totalTax > 0 && (
                  <div className="flex items-center justify-end gap-4 text-xs">
                    <span className="text-muted-foreground">+ VAT</span>
                    <span className="w-16" />
                    <span className="w-28 text-right tabular-nums">{numberWithCommas(Math.round(totals.totalTax * 10) / 10)}</span>
                    <span className="w-12 text-muted-foreground">{currency}</span>
                  </div>
                )}
                {totalFeeAmount > 0 && (
                  <div className="flex items-center justify-end gap-4 text-xs">
                    <span className="text-muted-foreground">Tổng phí phát sinh</span>
                    <span className="w-16" />
                    <span className="w-28 text-right tabular-nums">{numberWithCommas(totalFeeAmount)}</span>
                    <span className="w-12 text-muted-foreground">{currency}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-end gap-4 text-xs">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">Tổng đề nghị thanh toán (gồm phí)</span>
                  <span className="w-16" />
                  <span className="w-28 text-right text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {numberWithCommas(Math.round(((paidPct < 100 ? requestedAmount : totals.totalAmount) + totals.totalTax + totalFeeAmount) * 10) / 10)}
                  </span>
                  <span className="w-12 font-medium text-muted-foreground">{currency}</span>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Summary strip */}
      {(totalFeeAmount > 0 || realBillAmount > 0) && (
        <Card className="mt-4">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              {realBillAmount > 0 && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiền thực tế</span>
                  <span className="font-medium tabular-nums">{numberWithCommas(realBillAmount)} {currency}</span>
                </div>
              )}
              {billOnPaperAmount > 0 && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Trên chứng từ</span>
                  <span className="font-medium tabular-nums">{numberWithCommas(billOnPaperAmount)} {currency}</span>
                </div>
              )}
              {totalFeeAmount > 0 && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tổng phí</span>
                  <span className="font-medium tabular-nums">{numberWithCommas(totalFeeAmount)} {currency}</span>
                </div>
              )}
              {(realBillAmount > 0 || totalFeeAmount > 0) && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Tổng nhập kho</span>
                  <span className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {numberWithCommas(Math.round(realBillAmount + totalFeeAmount))} {currency}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed footer bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-x-5 gap-y-2 overflow-x-auto text-sm">
            <FooterStat label="Số dòng">
              <span className="font-medium text-foreground tabular-nums">{lines.length}</span>
            </FooterStat>
            <FooterStat label="Tỷ giá">
              <span className="font-medium text-foreground tabular-nums">{numberWithCommas(exchangeRate)}</span>
            </FooterStat>
            <FooterStat label="Ngày nhận">
              <span className="font-medium text-foreground">{receivedDate}</span>
            </FooterStat>
            {totalFeeAmount > 0 && (
              <FooterStat label="Tổng phí">
                <span className="font-medium text-foreground tabular-nums">{numberWithCommas(totalFeeAmount)} {currency}</span>
              </FooterStat>
            )}
            <FooterStat label="File đính kèm">
              <span className="font-medium text-foreground tabular-nums">
                {attachedFileIds.length + pendingFiles.length} file
                {pendingFiles.length > 0 && <span className="ml-1 text-amber-600">({pendingFiles.length} chờ upload)</span>}
              </span>
            </FooterStat>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => void loadAll()} disabled={isLoading || isConfirming}>
              <RefreshCcw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              Làm mới
            </Button>
            <Button type="submit" form="wi-confirm-form" size="sm" disabled={!canCreateDraft || isConfirming || isUploadingFile || isLoading}>
              {isUploadingFile ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang upload file...</>
              ) : isConfirming ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo draft...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Xác nhận nhập kho</>
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
