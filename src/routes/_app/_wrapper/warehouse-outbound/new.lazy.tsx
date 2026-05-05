import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useCreateWarehouseOutbound, useGetWarehouseOutboundOrderLines } from '@/hooks/use-warehouse-outbound';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type {
  IWarehouseOutboundCreateRequest,
  IWarehouseOutboundOrderInfo,
  IWarehouseOutboundOrderLineInfo,
  IWarehouseOutboundOrderLinesResponse,
  IWarehouseOutboundOrderSearchInfo,
} from '@/types/warehouse-outbound';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { FileDown, FileUp, Loader2, RefreshCcw, Save, Search, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

type TDetailForm = {
  orderLineId: string;
  quantity: number;
  box: string;
  referenceCode: string;
  note: string;
};

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-outbound/new')({
  component: NewWarehouseOutboundPage,
});

function NewWarehouseOutboundPage() {
  const { toast } = useToast();
  const { history } = useRouter();
  const { mutateAsync: loadOrderLines, isPending: isLoadingOrderLines } = useGetWarehouseOutboundOrderLines();
  const { mutateAsync: createOutbound, isPending: isCreating } = useCreateWarehouseOutbound();

  const [contractNumber, setContractNumber] = useState('');
  const [outboundReason, setOutboundReason] = useState('');
  const [note, setNote] = useState('');
  const [orderLines, setOrderLines] = useState<IWarehouseOutboundOrderLineInfo[]>([]);
  const [orderInfo, setOrderInfo] = useState<IWarehouseOutboundOrderInfo | null>(null);
  const [details, setDetails] = useState<TDetailForm[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);

  const detailsMap = useMemo(() => new Map(details.map((d) => [d.orderLineId, d])), [details]);

  const onSearchContract = async () => {
    if (!contractNumber.trim()) {
      toast({ variant: 'destructive', title: 'Thiếu hợp đồng', description: 'Vui lòng nhập số hợp đồng.' });
      return;
    }
    const response = await loadOrderLines(contractNumber.trim());
    const payload = response?.data as
      | IWarehouseOutboundOrderLineInfo[]
      | IWarehouseOutboundOrderLinesResponse
      | IWarehouseOutboundOrderSearchInfo
      | undefined;

    const isOrderSearchInfo = (value: unknown): value is IWarehouseOutboundOrderSearchInfo => {
      if (!value || Array.isArray(value)) return false;
      return Array.isArray((value as IWarehouseOutboundOrderSearchInfo).orderLines);
    };

    const list = Array.isArray(payload)
      ? payload
      : isOrderSearchInfo(payload)
        ? payload.orderLines
        : Array.isArray(payload?.lines)
          ? payload.lines
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

    const info: IWarehouseOutboundOrderInfo | null = Array.isArray(payload)
      ? null
      : isOrderSearchInfo(payload)
        ? {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            contractNumber: payload.contractNumber,
            orderStatus: payload.orderStatus,
            customerId: payload.customerId,
            customerCode: payload.customerCode,
            customerName: payload.customerName,
            customerPhone: payload.customerPhone,
            customerTaxCode: payload.customerTaxCode,
            customerAddressId: payload.customerAddressId,
            customerAddress: payload.customerAddress,
            customerContactPerson: payload.customerContactPerson,
            customerAddressPhone: payload.customerAddressPhone,
          }
        : payload?.order ?? payload?.orderInfo ?? null;
    setOrderInfo(info);
    setOrderLines(list);
    setDetails(
      list.map((line) => ({
        orderLineId: line.orderLineId,
        quantity: Math.max(0, Math.min(line.orderQuantity, line.availableQuantity)),
        box: '',
        referenceCode: '',
        note: '',
      })),
    );
  };

  const updateDetail = (orderLineId: string, patch: Partial<TDetailForm>) => {
    setDetails((prev) => prev.map((item) => (item.orderLineId === orderLineId ? { ...item, ...patch } : item)));
  };

  const removeLine = (orderLineId: string) => {
    setOrderLines((prev) => prev.filter((line) => line.orderLineId !== orderLineId));
    setDetails((prev) => prev.filter((line) => line.orderLineId !== orderLineId));
  };

  const exportLinesToExcel = () => {
    if (!orderLines.length) {
      toast({ variant: 'destructive', title: 'Không có dòng hàng để xuất' });
      return;
    }
    const headers = [
      'orderLineId',
      'productCode',
      'productName',
      'orderQuantity',
      'availableQuantity',
      'quantity',
      'box',
      'referenceCode',
      'note',
    ];
    const rows = orderLines.map((line) => {
      const detail = detailsMap.get(line.orderLineId);
      return [
        line.orderLineId,
        line.productCode,
        line.productName,
        line.orderQuantity,
        line.availableQuantity,
        detail?.quantity ?? 0,
        detail?.box ?? '',
        detail?.referenceCode ?? '',
        detail?.note ?? '',
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 30 },
      { wch: 16 },
      { wch: 30 },
      { wch: 12 },
      { wch: 14 },
      { wch: 10 },
      { wch: 12 },
      { wch: 18 },
      { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'warehouse-outbound-lines');
    XLSX.writeFile(wb, `warehouse-outbound-${contractNumber.trim() || 'lines'}.xlsx`);
  };

  const importLinesFromExcel = (files: FileList | null) => {
    if (!files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        if (!rows.length) {
          toast({ variant: 'destructive', title: 'File rỗng', description: 'Không có dữ liệu để cập nhật.' });
          return;
        }
        const byLineId = new Map<string, Record<string, unknown>>();
        rows.forEach((row) => {
          const id = String(row.orderLineId ?? '').trim();
          if (id) byLineId.set(id, row);
        });
        let updated = 0;
        setDetails((prev) =>
          prev.map((detail) => {
            const row = byLineId.get(detail.orderLineId);
            if (!row) return detail;
            const line = orderLines.find((x) => x.orderLineId === detail.orderLineId);
            const rawQty = Number(row.quantity ?? detail.quantity);
            const nextQty = Number.isFinite(rawQty)
              ? Math.max(0, Math.min(rawQty, line?.availableQuantity ?? rawQty))
              : detail.quantity;
            updated++;
            return {
              ...detail,
              quantity: nextQty,
              box: String(row.box ?? detail.box ?? ''),
              referenceCode: String(row.referenceCode ?? detail.referenceCode ?? ''),
              note: String(row.note ?? detail.note ?? ''),
            };
          }),
        );
        toast({ title: `Đã cập nhật ${updated} dòng từ Excel`, variant: 'success' });
      } catch {
        toast({ variant: 'destructive', title: 'Không đọc được file', description: 'Vui lòng dùng file xuất từ hệ thống.' });
      }
      if (importFileRef.current) importFileRef.current.value = '';
    };
    reader.readAsArrayBuffer(files[0]);
  };

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!contractNumber.trim()) errors.push('contractNumber là bắt buộc');
    if (!outboundReason.trim()) errors.push('outboundReason là bắt buộc');
    const used = details.filter((d) => d.quantity > 0);
    if (orderLines.length > 0 && used.length === 0) {
      errors.push('Cần nhập số lượng xuất cho ít nhất 1 dòng hàng');
    }
    for (const d of used) {
      const line = orderLines.find((x) => x.orderLineId === d.orderLineId);
      if (!d.orderLineId) errors.push('orderLineId là bắt buộc');
      if (d.quantity <= 0) errors.push('Số lượng phải lớn hơn 0');
      if (line && d.quantity > line.availableQuantity) {
        errors.push(`SL xuất vượt SL khả dụng cho ${line.productCode}`);
      }
    }
    return errors;
  }, [contractNumber, outboundReason, details, orderLines]);

  const selectedLinesCount = useMemo(() => details.filter((d) => d.quantity > 0).length, [details]);
  const totalOutboundQty = useMemo(
    () => details.reduce((sum, d) => sum + (Number.isFinite(d.quantity) ? Number(d.quantity) : 0), 0),
    [details],
  );
  const invalidLineCount = useMemo(
    () =>
      details.filter((d) => {
        const line = orderLines.find((x) => x.orderLineId === d.orderLineId);
        return !line || d.quantity < 0 || d.quantity > line.availableQuantity;
      }).length,
    [details, orderLines],
  );

  const calculatedTotals = useMemo(() => {
    const selected = orderLines
      .map((line) => {
        const detail = detailsMap.get(line.orderLineId);
        const quantity = Number(detail?.quantity ?? 0);
        if (quantity <= 0) return null;
        const sourceUnitPrice = Number(line.unitPrice ?? 0);
        const vatRate = Number(line.vat ?? 0) / 100;
        const isIncludedTax = Boolean(line.includedTax);
        const netUnitPrice = isIncludedTax && vatRate > 0 ? sourceUnitPrice / (1 + vatRate) : sourceUnitPrice;
        const grossUnitPrice = isIncludedTax || vatRate <= 0 ? sourceUnitPrice : sourceUnitPrice * (1 + vatRate);
        const amountRaw = quantity * netUnitPrice;
        const totalRaw = quantity * grossUnitPrice;
        const amount = Math.round(amountRaw);
        const total = Math.round(totalRaw);
        // Keep arithmetic consistent in VND: amount + tax = total
        const taxAmount = total - amount;
        return { quantity, amount, taxAmount, total };
      })
      .filter(Boolean) as Array<{ quantity: number; amount: number; taxAmount: number; total: number }>;

    return selected.reduce<{ lines: number; quantity: number; amount: number; taxAmount: number; total: number }>(
      (acc, cur) => ({
        lines: acc.lines + 1,
        quantity: acc.quantity + cur.quantity,
        amount: acc.amount + cur.amount,
        taxAmount: acc.taxAmount + cur.taxAmount,
        total: acc.total + cur.total,
      }),
      { lines: 0, quantity: 0, amount: 0, taxAmount: 0, total: 0 },
    );
  }, [detailsMap, orderLines]);

  const canSubmit = validationErrors.length === 0 && calculatedTotals.lines > 0 && !isCreating && !isLoadingOrderLines;

  const orderStatus = orderInfo?.orderStatus || orderInfo?.status || '';
  const statusBadgeVariant: 'default' | 'success' | 'destructive' | 'warning' = (() => {
    if (orderStatus === 'COMPLETED' || orderStatus === 'APPROVED') return 'success';
    if (orderStatus === 'CANCELLED' || orderStatus === 'REJECTED') return 'destructive';
    if (orderStatus === 'PENDING' || orderStatus === 'SUBMITTED') return 'warning';
    return 'default';
  })();

  const onCreateDraft = async () => {
    if (validationErrors.length) {
      toast({ variant: 'destructive', title: 'Dữ liệu chưa hợp lệ', description: validationErrors[0] });
      return;
    }
    const selectedDetails = details
      .filter((d) => d.quantity > 0)
      .map((d) => ({
        orderLineId: d.orderLineId,
        quantity: d.quantity,
        box: d.box || undefined,
        referenceCode: d.referenceCode || undefined,
        note: d.note || undefined,
      }));
    const payload: IWarehouseOutboundCreateRequest = {
      contractNumber: contractNumber.trim(),
      outboundReason: outboundReason.trim(),
      note: note.trim() || undefined,
      details: selectedDetails.length ? selectedDetails : undefined,
    };
    const res = await createOutbound(payload);
    const created = res?.data as { id?: string } | undefined;
    toast({ title: 'Tạo phiếu xuất thành công', variant: 'success' });
    if (created?.id) {
      history.push(`/warehouse-outbound/${created.id}`);
      return;
    }
    history.push('/warehouse-outbound');
  };

  const onResetForm = () => {
    setContractNumber('');
    setOutboundReason('');
    setNote('');
    setOrderInfo(null);
    setOrderLines([]);
    setDetails([]);
  };

  return (
    <div className="pb-32">
      <HeaderPageLayout
        title="Tạo phiếu xuất kho"
        buttonSubmit={<></>}
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm uppercase">Thông tin phiếu xuất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Số hợp đồng</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập contractNumber..."
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                />
                <Button variant="outline" onClick={() => void onSearchContract()} disabled={isLoadingOrderLines}>
                  {isLoadingOrderLines ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-1 h-4 w-4" />
                      Tìm
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Lý do xuất kho</Label>
              <Input
                placeholder="Nhập outboundReason..."
                value={outboundReason}
                onChange={(e) => setOutboundReason(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Textarea placeholder="Ghi chú..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {validationErrors.length ? (
            <p className="text-xs text-destructive">{validationErrors[0]}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Điền thông tin bắt buộc và kiểm tra số lượng xuất trước khi tạo DRAFT.
            </p>
          )}
        </CardContent>
      </Card>

      {orderInfo ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm uppercase">Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariant}>Trạng thái: {orderStatus || '—'}</Badge>
              <Badge variant="secondary">Tiền tệ: {orderInfo.currency || '—'}</Badge>
              <Badge variant="outline">Hợp đồng: {orderInfo.contractNumber || contractNumber || '—'}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Order Info</p>
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-medium">{orderInfo.orderNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mã đơn (ID)</p>
                    <p className="font-medium">{orderInfo.orderId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày đơn hàng</p>
                    <p className="font-medium">{orderInfo.orderDate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày giao dự kiến</p>
                    <p className="font-medium">{orderInfo.deliveryDate || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Liên hệ / ghi chú</p>
                    <p className="font-medium">{orderInfo.customerContactPerson || orderInfo.note || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Customer Info</p>
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{orderInfo.customerName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mã khách hàng</p>
                    <p className="font-medium">{orderInfo.customerCode || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mã KH nội bộ</p>
                    <p className="font-medium">{orderInfo.customerId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mã số thuế</p>
                    <p className="font-medium">{orderInfo.customerTaxCode || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{orderInfo.customerPhone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{orderInfo.customerEmail || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID địa chỉ KH</p>
                    <p className="font-medium">{orderInfo.customerAddressId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SĐT địa chỉ</p>
                    <p className="font-medium">{orderInfo.customerAddressPhone || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Địa chỉ giao hàng</p>
                    <p className="font-medium">{orderInfo.customerAddress || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-sm uppercase">
            <span>Chi tiết dòng hàng</span>
            <div className="flex items-center gap-2">
              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => importLinesFromExcel(e.target.files)}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => importFileRef.current?.click()}>
                <FileUp className="mr-1 h-4 w-4" />
                Upload Excel
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportLinesToExcel} disabled={!orderLines.length}>
                <FileDown className="mr-1 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-4">
            <div className="rounded-md border bg-muted/40 px-3 py-2">
              <p className="text-muted-foreground">Tổng dòng</p>
              <p className="font-semibold">{orderLines.length}</p>
            </div>
            <div className="rounded-md border bg-muted/40 px-3 py-2">
              <p className="text-muted-foreground">Dòng đã chọn</p>
              <p className="font-semibold">{selectedLinesCount}</p>
            </div>
            <div className="rounded-md border bg-muted/40 px-3 py-2">
              <p className="text-muted-foreground">Tổng SL xuất</p>
              <p className="font-semibold">{totalOutboundQty}</p>
            </div>
            <div className="rounded-md border bg-muted/40 px-3 py-2">
              <p className="text-muted-foreground">Dòng lỗi</p>
              <p className={cn('font-semibold', invalidLineCount > 0 && 'text-destructive')}>{invalidLineCount}</p>
            </div>
          </div>
          {orderLines.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">Nhập số hợp đồng và bấm Tìm để tải danh sách order lines.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-md border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Nhập <span className="font-semibold">Số lượng xuất</span> cho từng dòng. Hệ thống tự tính tiền/thuế theo số lượng xuất để bạn kiểm tra nhanh trước khi tạo phiếu.
              </div>
              <p className="text-[11px] text-muted-foreground">Trên màn hình nhỏ, vuốt ngang để xem đầy đủ các cột.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Bảng có thể cuộn ngang</Badge>
                <Badge variant="success">Hợp lệ</Badge>
                <Badge variant="warning">Chưa chọn</Badge>
                <Badge variant="destructive">Vượt tồn</Badge>
              </div>
              <div className="rounded-md border">
                <div className="max-h-[520px] overflow-auto">
                  <Table className="min-w-[1750px]">
                    <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur-sm">
                      <TableRow>
                        <TableHead className="w-[52px] text-center">#</TableHead>
                        <TableHead className="sticky left-0 z-20 min-w-[240px] bg-muted/80 backdrop-blur-sm">Sản phẩm</TableHead>
                        <TableHead className="text-right">Đặt</TableHead>
                        <TableHead className="text-right">Tồn</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                        <TableHead className="text-right">VAT</TableHead>
                        <TableHead className="text-right">Tiền VAT</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead className="min-w-[120px]">SL xuất</TableHead>
                        <TableHead className="min-w-[120px]">Box</TableHead>
                        <TableHead className="min-w-[160px]">Reference code</TableHead>
                        <TableHead className="min-w-[160px]">Ghi chú dòng</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="sticky right-0 z-20 text-right bg-muted/80 backdrop-blur-sm">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderLines.map((line, idx) => {
                        const detail = detailsMap.get(line.orderLineId);
                        const quantity = detail?.quantity ?? 0;
                        const overAvailable = quantity > line.availableQuantity;
                        const isZero = quantity <= 0;
                        const sourceUnitPrice = Number(line.unitPrice ?? 0);
                        const vatRate = Number(line.vat ?? 0) / 100;
                        const isIncludedTax = Boolean(line.includedTax);
                        const netUnitPrice =
                          isIncludedTax && vatRate > 0 ? sourceUnitPrice / (1 + vatRate) : sourceUnitPrice;
                        const grossUnitPrice =
                          isIncludedTax || vatRate <= 0 ? sourceUnitPrice : sourceUnitPrice * (1 + vatRate);
                        const lineAmountRaw = quantity * netUnitPrice;
                        const lineTotalRaw = quantity * grossUnitPrice;
                        const lineAmount = Math.round(lineAmountRaw);
                        const lineTotal = Math.round(lineTotalRaw);
                        const lineTax = lineTotal - lineAmount;
                        return (
                          <TableRow
                            key={line.orderLineId}
                            className={cn(
                              'odd:bg-muted/10 hover:bg-muted/40',
                              overAvailable && 'bg-destructive/5 hover:bg-destructive/10',
                            )}
                          >
                            <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="sticky left-0 z-10 bg-background">
                              <div className="space-y-1 pr-2">
                                <p className="text-xs font-medium">{line.productCode} - {line.productName}</p>
                                <p className="text-[11px] text-muted-foreground">{line.orderLineId}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{line.orderQuantity}</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{line.availableQuantity}</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">
                              <div className="space-y-0.5">
                                <p>{Math.round(netUnitPrice).toLocaleString('vi-VN')}</p>
                                {/* line break this */}
                                <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">
                                  {isIncludedTax
                                    ? `Có VAT: ${sourceUnitPrice.toLocaleString('vi-VN')}`
                                    : 'Không VAT'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{lineAmount.toLocaleString('vi-VN')}</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{Number(line.vat ?? 0)}%</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{lineTax.toLocaleString('vi-VN')}</TableCell>
                            <TableCell className="text-right text-xs font-semibold tabular-nums">{lineTotal.toLocaleString('vi-VN')}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                className={cn('h-8 w-[96px]', overAvailable && 'border-destructive focus-visible:ring-destructive')}
                                value={quantity}
                                onChange={(e) => updateDetail(line.orderLineId, { quantity: Number(e.target.value) })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                placeholder="Box"
                                value={detail?.box ?? ''}
                                onChange={(e) => updateDetail(line.orderLineId, { box: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                placeholder="Reference code"
                                value={detail?.referenceCode ?? ''}
                                onChange={(e) => updateDetail(line.orderLineId, { referenceCode: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                placeholder="Ghi chú"
                                value={detail?.note ?? ''}
                                onChange={(e) => updateDetail(line.orderLineId, { note: e.target.value })}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={overAvailable ? 'destructive' : isZero ? 'warning' : 'success'} />
                            </TableCell>
                            <TableCell className="sticky right-0 z-10 text-right bg-background">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeLine(line.orderLineId)}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Xoá
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Hợp đồng</span>
              <span className="font-medium text-foreground">{contractNumber || '—'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Dòng đã chọn</span>
              <span className="font-medium text-foreground">{calculatedTotals.lines}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tổng SL xuất</span>
              <span className="font-medium text-foreground tabular-nums">{calculatedTotals.quantity.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tiền hàng</span>
              <span className="font-medium text-foreground tabular-nums">{calculatedTotals.amount.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tiền thuế</span>
              <span className="font-medium text-foreground tabular-nums">{calculatedTotals.taxAmount.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tổng cộng</span>
              <span className="font-bold text-primary tabular-nums">{calculatedTotals.total.toLocaleString('vi-VN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onResetForm} disabled={isCreating}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button type="button" size="sm" disabled={!canSubmit} onClick={() => void onCreateDraft()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Tạo phiếu xuất
                </>
              )}
            </Button>
            {!canSubmit && !isCreating ? (
              <span className="text-[11px] text-muted-foreground">
                {validationErrors[0] ?? 'Vui lòng nhập dữ liệu để tạo phiếu'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
