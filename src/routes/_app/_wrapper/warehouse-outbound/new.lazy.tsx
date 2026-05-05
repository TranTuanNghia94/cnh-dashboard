import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateWarehouseOutbound, useGetWarehouseOutboundOrderLines } from '@/hooks/use-warehouse-outbound';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type {
  IWarehouseOutboundCreateRequest,
  IWarehouseOutboundOrderInfo,
  IWarehouseOutboundOrderLineInfo,
  IWarehouseOutboundOrderLinesResponse,
} from '@/types/warehouse-outbound';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { FileDown, FileUp, Loader2, Search, Trash2 } from 'lucide-react';
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
    const payload = response?.data as IWarehouseOutboundOrderLineInfo[] | IWarehouseOutboundOrderLinesResponse | undefined;
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.lines)
        ? payload.lines
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
    const info = Array.isArray(payload) ? null : payload?.order ?? payload?.orderInfo ?? null;
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

  return (
    <div className="pb-24">
      <HeaderPageLayout
        title="Tạo phiếu xuất kho"
        buttonSubmit={
          <Button onClick={() => void onCreateDraft()} disabled={isCreating || isLoadingOrderLines}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Tạo DRAFT
          </Button>
        }
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
          <CardContent>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
                <p className="font-medium">{orderInfo.orderNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Khách hàng</p>
                <p className="font-medium">{orderInfo.customerName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mã khách hàng</p>
                <p className="font-medium">{orderInfo.customerCode || '—'}</p>
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
                <p className="text-xs text-muted-foreground">Trạng thái đơn</p>
                <p className="font-medium">{orderInfo.status || '—'}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-muted-foreground">Địa chỉ giao hàng</p>
                <p className="font-medium">{orderInfo.customerAddress || '—'}</p>
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
              {orderLines.map((line) => {
                const detail = detailsMap.get(line.orderLineId);
                const quantity = detail?.quantity ?? 0;
                const overAvailable = quantity > line.availableQuantity;
                const isZero = quantity <= 0;
                return (
                  <div
                    key={line.orderLineId}
                    className={cn(
                      'rounded-md border p-3 transition-colors',
                      overAvailable && 'border-destructive/70 bg-destructive/5',
                    )}
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium leading-none">
                        {line.productCode} - {line.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Đặt: {line.orderQuantity} | Khả dụng: {line.availableQuantity}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 items-end gap-2 md:grid-cols-[120px_1fr_1fr_1fr_auto]">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Số lượng xuất</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className={cn('w-full', overAvailable && 'border-destructive focus-visible:ring-destructive')}
                          value={quantity}
                          onChange={(e) => updateDetail(line.orderLineId, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Box</Label>
                        <Input
                          placeholder="Nhập box"
                          value={detail?.box ?? ''}
                          onChange={(e) => updateDetail(line.orderLineId, { box: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Reference code</Label>
                        <Input
                          placeholder="Nhập reference code"
                          value={detail?.referenceCode ?? ''}
                          onChange={(e) => updateDetail(line.orderLineId, { referenceCode: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Ghi chú dòng</Label>
                        <Input
                          placeholder="Nhập ghi chú"
                          value={detail?.note ?? ''}
                          onChange={(e) => updateDetail(line.orderLineId, { note: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end md:pb-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeLine(line.orderLineId)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Xoá dòng
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs">
                        {overAvailable ? (
                          <span className="text-destructive">Số lượng vượt tồn khả dụng.</span>
                        ) : isZero ? (
                          <span className="text-amber-600">Dòng này chưa được chọn để xuất (SL = 0).</span>
                        ) : (
                          <span className="text-emerald-600">Dòng hợp lệ để tạo phiếu xuất.</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
