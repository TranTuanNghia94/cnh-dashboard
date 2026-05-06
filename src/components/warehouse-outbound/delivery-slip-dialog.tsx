import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetDeliverySlipByOutboundNumber, useGetDeliverySlipByWarehouseOutboundId } from '@/hooks/use-delivery-slip';
import type { IDeliverySlipInfo } from '@/types/delivery-slip';
import type { IWarehouseOutboundInfo } from '@/types/warehouse-outbound';
import html2pdf from 'html2pdf.js';
import { FileDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

type DeliverySlipDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outboundId?: string;
  outbound?: IWarehouseOutboundInfo;
};

export default function DeliverySlipDialog({ open, onOpenChange, outboundId, outbound }: DeliverySlipDialogProps) {
  const deliverySlipRef = useRef<HTMLDivElement | null>(null);
  const [showPrice, setShowPrice] = useState(true);
  const [deliverySlip, setDeliverySlip] = useState<IDeliverySlipInfo>();
  const { mutateAsync: getByOutboundId, isPending: isLoadingByOutboundId } = useGetDeliverySlipByWarehouseOutboundId();
  const { mutateAsync: getByOutboundNumber, isPending: isLoadingByOutboundNumber } = useGetDeliverySlipByOutboundNumber();

  useEffect(() => {
    const loadDeliverySlip = async () => {
      if (!open) return;
      try {
        if (outboundId) {
          const res = await getByOutboundId(outboundId);
          setDeliverySlip(res?.data as IDeliverySlipInfo | undefined);
          return;
        }
        if (outbound?.outboundNumber) {
          const res = await getByOutboundNumber(outbound.outboundNumber);
          setDeliverySlip(res?.data as IDeliverySlipInfo | undefined);
        }
      } catch {
        // errors already handled by hooks via toast
      }
    };
    void loadDeliverySlip();
  }, [open, outboundId, outbound?.outboundNumber, getByOutboundId, getByOutboundNumber]);

  const outboundData = deliverySlip;

  const totals = useMemo(() => {
    const details = outboundData?.lines ?? [];
    const lineCount = details.length;
    const totalAmount = Number(outboundData?.totalAmount ?? 0);
    const taxAmount = Number(outboundData?.taxAmount ?? 0);
    const amountExTax = Math.round(totalAmount - taxAmount);
    return { lineCount, totalAmount, taxAmount, amountExTax, details };
  }, [outboundData]);

  const displayCurrency = outboundData?.currency || outbound?.currency || 'VND';
  const isVnd = String(displayCurrency).toUpperCase() === 'VND';

  const formatAmount = (value: number) => {
    const normalized = isVnd ? Math.round(Number(value ?? 0)) : Number(value ?? 0);
    return normalized.toLocaleString('vi-VN');
  };

  const exportDeliverySlipExcel = () => {
    if (!outboundData) return;
    const headers = showPrice
      ? ['STT', 'Mã hàng', 'Tên hàng', 'Số lượng', 'Đơn giá', 'Thuế', 'Thành tiền', 'Ref', 'Box', 'Phòng', 'Giáo viên', 'Ghi chú']
      : ['STT', 'Mã hàng', 'Tên hàng', 'Số lượng', 'Ref', 'Box', 'Phòng', 'Giáo viên', 'Ghi chú'];
    const rows = totals.details.map((line, idx) =>
      showPrice
        ? [
          idx + 1,
          line.productCode ?? '',
          line.productName ?? '',
          Number(line.quantity ?? 0),
          isVnd ? Math.round(Number(line.unitPrice ?? 0)) : Number(line.unitPrice ?? 0),
          isVnd ? Math.round(Number(line.taxAmount ?? 0)) : Number(line.taxAmount ?? 0),
          isVnd ? Math.round(Number(line.totalAmount ?? 0)) : Number(line.totalAmount ?? 0),
          line.referenceCode ?? '',
          line.box ?? '',
          line.deliveryNote ?? '',
          line.receiverNote ?? '',
          line.note ?? '',
        ]
        : [
          idx + 1,
          line.productCode ?? '',
          line.productName ?? '',
          Number(line.quantity ?? 0),
          line.referenceCode ?? '',
          line.box ?? '',
          line.deliveryNote ?? '',
          line.receiverNote ?? '',
          line.note ?? '',
        ],
    );
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = showPrice
      ? [
        { wch: 6 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 24 },
      ]
      : [{ wch: 6 }, { wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'delivery-slip');
    XLSX.writeFile(wb, `delivery-slip-${outboundData.outboundNumber || outboundData.outboundId}.xlsx`);
  };

  const exportDeliverySlipPdf = async () => {
    if (!deliverySlipRef.current || !outboundData) return;
    await html2pdf()
      .from(deliverySlipRef.current)
      .set({
        margin: [8, 8, 8, 8],
        filename: `delivery-slip-${outboundData.outboundNumber || outboundData.outboundId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      })
      .save();
  };

  const isLoading = isLoadingByOutboundId || isLoadingByOutboundNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Phiếu giao hàng</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPrice((prev) => !prev)} disabled={!outboundData}>
            {showPrice ? 'Ẩn giá' : 'Hiện giá'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportDeliverySlipExcel} disabled={!outboundData}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button size="sm" onClick={() => void exportDeliverySlipPdf()} disabled={!outboundData}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <div ref={deliverySlipRef} className="mx-auto w-full max-w-[1120px] space-y-5 bg-white p-6 text-black">
          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-[1fr_auto] md:items-start">
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase leading-tight">International Educational Supply Corporation</p>
                <p>Địa chỉ: 2/18 Đường 79, Phường Tân Hưng, TP.HCM</p>
                <p>Điện thoại: (84-28) 37753501/02/03</p>
              </div>
              <div className="space-y-1 text-left md:min-w-[220px] md:text-right">
                <p>
                  <span className="uppercase text-neutral-500">Mẫu biểu:</span> <span className="font-semibold">Phiếu giao hàng</span>
                </p>
                <p>
                  <span className="uppercase text-neutral-500">Ngày in:</span>{' '}
                  <span className="font-semibold">{new Date().toLocaleDateString('vi-VN')}</span>
                </p>
              </div>
            </div>

            <div className="border-y py-3 text-center">
              <h3 className="text-2xl font-bold uppercase tracking-[0.12em]">Phiếu giao hàng</h3>
              <p className="mt-1 text-sm">
                Số phiếu: <span className="font-semibold">{outboundData?.outboundNumber || '—'}</span>
              </p>
              {isLoading ? <p className="mt-1 text-xs italic text-neutral-500">Đang tải dữ liệu phiếu giao hàng...</p> : null}
            </div>
          </div>

          <div className="space-y-3 pb-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Số đơn hàng</p>
                <p className="font-medium">{outboundData?.orderNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Số hợp đồng</p>
                <p className="font-medium">{outboundData?.contractNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Ngày xuất</p>
                <p className="font-medium">{outboundData?.outboundDate || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Lý do xuất</p>
                <p className="font-medium">{outboundData?.outboundReason || '—'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-b border-black pb-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Mã khách hàng</p>
                <p className="font-medium">{outboundData?.customerCode || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Tên khách hàng</p>
                <p className="font-medium">{outboundData?.customerName || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Số điện thoại</p>
                <p className="font-medium">{outboundData?.customerPhone || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-neutral-500">Người liên hệ</p>
                <p className="font-medium">{outboundData?.customerContactPerson || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase text-neutral-500">Địa chỉ giao hàng</p>
              <p className="font-medium">{outboundData?.customerAddress || '—'}</p>
            </div>
          </div>

          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-[11px]">#</TableHead>
                <TableHead className="text-[11px]">Mã hàng</TableHead>
                <TableHead className="text-[11px]">Tên hàng</TableHead>
                <TableHead className="text-right text-[11px]">SL</TableHead>
                {showPrice ? <TableHead className="text-right text-[11px]">Đơn giá</TableHead> : null}
                {showPrice ? <TableHead className="text-right text-[11px]">Thuế</TableHead> : null}
                {showPrice ? <TableHead className="text-right text-[11px]">Thành tiền</TableHead> : null}
                <TableHead className="text-[11px]">Ref</TableHead>
                <TableHead className="text-[11px]">Box</TableHead>
                <TableHead className="text-[11px]">Phòng</TableHead>
                <TableHead className="text-[11px]">Giáo viên</TableHead>
                <TableHead className="text-[11px]">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totals.details.map((line, idx) => (
                <TableRow key={line.outboundDetailId || line.orderLineId || String(idx)}>
                  <TableCell className="text-center text-xs">{idx + 1}</TableCell>
                  <TableCell>{line.productCode || '—'}</TableCell>
                  <TableCell>{line.productName || '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{Number(line.quantity ?? 0).toLocaleString('vi-VN')}</TableCell>
                  {showPrice ? <TableCell className="text-right tabular-nums">{formatAmount(Number(line.unitPrice ?? 0))}</TableCell> : null}
                  {showPrice ? <TableCell className="text-right tabular-nums">{formatAmount(Number(line.taxAmount ?? 0))}</TableCell> : null}
                  {showPrice ? <TableCell className="text-right tabular-nums">{formatAmount(Number(line.totalAmount ?? 0))}</TableCell> : null}
                  <TableCell>{line.referenceCode || '—'}</TableCell>
                  <TableCell>{line.box || '—'}</TableCell>
                  <TableCell>{line.deliveryNote || '—'}</TableCell>
                  <TableCell>{line.receiverNote || '—'}</TableCell>
                  <TableCell>{line.note || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid grid-cols-2 gap-3 border-t border-black pt-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Tổng dòng hàng</p>
              <p className="font-medium tabular-nums">{totals.lineCount.toLocaleString('vi-VN')}</p>
            </div>
            {showPrice ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Tiền hàng</p>
                  <p className="font-medium tabular-nums">{formatAmount(totals.amountExTax)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thuế</p>
                  <p className="font-medium tabular-nums">{formatAmount(totals.taxAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tổng cộng</p>
                  <p className="font-bold tabular-nums">
                    {formatAmount(totals.totalAmount)}
                    {outboundData?.currency ? ` ${outboundData.currency}` : ''}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          <table className="mt-8 w-full border border-black text-center text-sm">
            <tbody>
              <tr>
                <td className="w-1/3 border border-black p-2 font-semibold uppercase">Người giao hàng</td>
                <td className="w-1/3 border border-black p-2 font-semibold uppercase">Người nhận hàng</td>
                <td className="w-1/3 border border-black p-2 font-semibold uppercase">Người lập</td>
              </tr>
              <tr>
                <td className="h-28 border border-black align-bottom p-2 text-xs italic">(Ký, ghi rõ họ tên)</td>
                <td className="h-28 border border-black align-bottom p-2 text-xs italic">(Ký, ghi rõ họ tên)</td>
                <td className="h-28 border border-black align-bottom p-2">
                  <p className="text-xs font-medium not-italic">{outboundData?.createdBy || '—'}</p>
                  <p className="text-xs italic">(Ký, ghi rõ họ tên)</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

