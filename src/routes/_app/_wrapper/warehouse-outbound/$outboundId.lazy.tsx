import HeaderPageLayout from '@/components/layout/HeaderPage';
import PaymentApprovalHistorySection from '@/components/payment/payment-approval-history-section';
import DeliverySlipDialog from '@/components/warehouse-outbound/delivery-slip-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatNumberVN } from '@/lib/other';
import {
  useApproveWarehouseOutbound,
  useCancelWarehouseOutbound,
  useGetWarehouseOutboundActions,
  useGetWarehouseOutboundById,
  useRejectWarehouseOutbound,
  useResubmitWarehouseOutbound,
  useSubmitWarehouseOutbound,
} from '@/hooks/use-warehouse-outbound';
import { useToast } from '@/hooks/use-toast';
import { WAREHOUSE_OUTBOUND_STATUS_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type {
  IWarehouseOutboundActionsInfo,
  IWarehouseOutboundInfo,
} from '@/types/warehouse-outbound';
import { createLazyFileRoute, useParams } from '@tanstack/react-router';
import { FileText, Loader2, RefreshCcw, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const OUTBOUND_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã huỷ',
};

const OUTBOUND_FLOW_STEPS = ['DRAFT', 'SUBMITTED', 'APPROVED'] as const;

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-outbound/$outboundId')({
  component: WarehouseOutboundDetailPage,
});

function WarehouseOutboundDetailPage() {
  const { outboundId } = useParams({ strict: false });
  const { toast } = useToast();
  const { mutateAsync: getDetail, isPending: isLoadingDetail } = useGetWarehouseOutboundById();
  const { mutateAsync: getActions } = useGetWarehouseOutboundActions();
  const { mutateAsync: submitOutbound, isPending: isSubmitting } = useSubmitWarehouseOutbound();
  const { mutateAsync: approveOutbound, isPending: isApproving } = useApproveWarehouseOutbound();
  const { mutateAsync: rejectOutbound, isPending: isRejecting } = useRejectWarehouseOutbound();
  const { mutateAsync: cancelOutbound, isPending: isCancelling } = useCancelWarehouseOutbound();
  const { mutateAsync: resubmitOutbound, isPending: isResubmitting } = useResubmitWarehouseOutbound();

  const [outbound, setOutbound] = useState<IWarehouseOutboundInfo>();
  const [actions, setActions] = useState<IWarehouseOutboundActionsInfo>();
  const [actionNote, setActionNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLevel, setActionLevel] = useState<string>('');
  const [openDeliverySlip, setOpenDeliverySlip] = useState(false);

  const loadAll = useCallback(async () => {
    if (!outboundId) return;
    const [detailRes, actionRes] = await Promise.all([getDetail(outboundId), getActions(outboundId)]);
    setOutbound(detailRes?.data as IWarehouseOutboundInfo | undefined);
    setActions(actionRes?.data as IWarehouseOutboundActionsInfo | undefined);
  }, [outboundId, getDetail, getActions]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const busy = isSubmitting || isApproving || isRejecting || isCancelling || isResubmitting;
  const parsedActionLevel = actionLevel.trim() ? Number(actionLevel) : undefined;

  const statusView = useMemo(() => {
    const status = outbound?.status;
    if (!status) return null;
    const st = WAREHOUSE_OUTBOUND_STATUS_STYLES[status];
    return st ? <span className={cn(st.style, 'text-xs')}>{st.label}</span> : <span>{status}</span>;
  }, [outbound?.status]);

  const canApproveOrReject = Boolean(actions?.canApprove || actions?.canReject);
  const currentStatus = outbound?.status ?? '';
  const currentFlowIndex = OUTBOUND_FLOW_STEPS.indexOf(currentStatus as (typeof OUTBOUND_FLOW_STEPS)[number]);
  const isRejected = currentStatus === 'REJECTED';
  const isCancelled = currentStatus === 'CANCELLED';

  const lineCount = outbound?.details?.length ?? 0;
  const amountExTax = useMemo(() => {
    if (!outbound) return 0;
    const t = Number(outbound.totalAmount ?? 0);
    const tax = Number(outbound.taxAmount ?? 0);
    return Math.round(t - tax);
  }, [outbound]);

  const hasAnyAction = Boolean(
    actions?.canSubmit ||
      actions?.canApprove ||
      actions?.canReject ||
      actions?.canCancel ||
      actions?.canResubmit,
  );

  return (
    <div className="pb-36">
      <HeaderPageLayout
        title={outbound?.outboundNumber ? `Phiếu xuất - ${outbound.outboundNumber}` : 'Chi tiết phiếu xuất'}
        buttonSubmit={<></>}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Số phiếu xuất</p>
              <p className="text-sm font-medium">{outbound?.outboundNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Số hợp đồng</p>
              <p className="text-sm font-medium">{outbound?.contractNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trạng thái</p>
              <div className="mt-1">{statusView}</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ngày xuất</p>
              <p className="text-sm font-medium">{outbound?.outboundDate || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đơn hàng</p>
              <p className="text-sm font-medium">{outbound?.orderNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duyệt</p>
              <p className="text-sm font-medium">
                {outbound ? `${outbound.currentApprovalLevel} / ${outbound.approvalLevels}` : '—'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Lý do xuất</p>
              <p className="text-sm">{outbound?.outboundReason || '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Ghi chú</p>
              <p className="text-sm">{outbound?.note || '—'}</p>
            </div>
            {/* <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-muted-foreground">Tiến trình trạng thái</p>
              <div className="flex flex-wrap items-center gap-2">
                {OUTBOUND_FLOW_STEPS.map((step, idx) => {
                  const active = currentFlowIndex >= 0 && idx <= currentFlowIndex;
                  const current = currentStatus === step;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-1 text-xs',
                          active ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground',
                          current && 'font-semibold',
                        )}
                      >
                        {OUTBOUND_STATUS_LABELS[step]}
                      </span>
                      {idx < OUTBOUND_FLOW_STEPS.length - 1 ? (
                        <span className="text-xs text-muted-foreground">→</span>
                      ) : null}
                    </div>
                  );
                })}
                {isRejected ? (
                  <span className="rounded-full border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                    {OUTBOUND_STATUS_LABELS.REJECTED}
                  </span>
                ) : null}
                {isCancelled ? (
                  <span className="rounded-full border border-orange-300 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                    {OUTBOUND_STATUS_LABELS.CANCELLED}
                  </span>
                ) : null}
              </div>
            </div> */}
          </CardContent>
        </Card>

        <PaymentApprovalHistorySection
          className="h-full"
          approvals={outbound?.approvals}
          approvalLevels={outbound?.approvalLevels}
        />
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase">Chi tiết dòng hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {(outbound?.details ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dòng hàng.</p>
          ) : (
            <Table wrapperClassName="h-auto max-h-[min(520px,60vh)] min-h-0">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-10 px-2 text-center text-xs">STT</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Mã hàng</TableHead>
                  <TableHead className="h-8 min-w-[160px] px-2 text-xs">Tên hàng</TableHead>
                  <TableHead className="h-8 px-2 text-right text-xs">SL</TableHead>
                  <TableHead className="h-8 px-2 text-right text-xs">Đơn giá</TableHead>
                  <TableHead className="h-8 px-2 text-center text-xs">VAT %</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Tiền tệ</TableHead>
                  <TableHead className="h-8 px-2 text-right text-xs">Chưa thuế</TableHead>
                  <TableHead className="h-8 px-2 text-right text-xs">Thuế</TableHead>
                  <TableHead className="h-8 px-2 text-right text-xs">Thành tiền</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Box</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Mã TC</TableHead>
                  <TableHead className="h-8 min-w-[120px] px-2 text-xs">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(outbound?.details ?? []).map((line, index) => (
                  <TableRow key={line.id}>
                    <TableCell className="px-2 py-2 text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-xs font-medium">{line.productCode || '—'}</TableCell>
                    <TableCell className="max-w-[220px] px-2 py-2 text-xs">
                      <span className="line-clamp-2" title={line.productName}>
                        {line.productName || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-xs tabular-nums">
                      {formatNumberVN(line.quantity)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-xs tabular-nums">
                      {formatNumberVN(line.unitPrice)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-center text-xs tabular-nums">{line.vat ?? 0}%</TableCell>
                    <TableCell className="px-2 py-2 text-xs">{line.currency || outbound?.currency || '—'}</TableCell>
                    <TableCell className="px-2 py-2 text-right text-xs tabular-nums">
                      {formatNumberVN(line.priceWithoutTax)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-xs tabular-nums">
                      {formatNumberVN(line.taxAmount)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-xs font-medium tabular-nums">
                      {formatNumberVN(line.totalAmount)}
                    </TableCell>
                    <TableCell className="px-2 py-2 text-xs">{line.box || '—'}</TableCell>
                    <TableCell className="px-2 py-2 text-xs">{line.referenceCode || '—'}</TableCell>
                    <TableCell className="max-w-[140px] px-2 py-2 text-xs text-muted-foreground">
                      {line.note || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {canApproveOrReject ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm uppercase">Ghi chú hành động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Ghi chú hành động</Label>
                <Textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Lý do từ chối</Label>
                <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Cấp duyệt (tuỳ chọn)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Để trống để backend tự chọn level kế tiếp"
                  value={actionLevel}
                  onChange={(e) => setActionLevel(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Số phiếu</span>
              <span className="truncate font-medium">{outbound?.outboundNumber || '—'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Hợp đồng</span>
              <span className="truncate font-medium">{outbound?.contractNumber || '—'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Trạng thái</span>
              <span className="font-medium">{statusView}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Dòng hàng</span>
              <span className="font-medium tabular-nums">{lineCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Duyệt</span>
              <span className="font-medium tabular-nums">
                {outbound ? `${outbound.currentApprovalLevel} / ${outbound.approvalLevels}` : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tiền hàng</span>
              <span className="font-medium tabular-nums">
                {outbound ? amountExTax.toLocaleString('vi-VN') : '—'} {outbound?.currency ? ` ${outbound.currency}` : ''}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Thuế</span>
              <span className="font-medium tabular-nums">
                {outbound ? Number(outbound.taxAmount ?? 0).toLocaleString('vi-VN') : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tổng cộng</span>
              <span className="font-bold text-primary tabular-nums">
                {outbound ? Number(outbound.totalAmount ?? 0).toLocaleString('vi-VN') : '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenDeliverySlip(true)} disabled={!outbound}>
              <FileText className="mr-2 h-4 w-4" />
              Phiếu giao hàng
            </Button>
            <Button variant="outline" size="sm" onClick={() => void loadAll()} disabled={isLoadingDetail || busy}>
              <RefreshCcw className={cn('mr-2 h-4 w-4', isLoadingDetail && 'animate-spin')} />
              Làm mới
            </Button>
            {actions?.canSubmit ? (
              <Button
                variant="default"
                size="sm"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await submitOutbound(outboundId);
                  toast({ title: 'Đã submit phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Gửi duyệt
              </Button>
            ) : null}
            {actions?.canApprove ? (
              <Button
                variant="default"
                size="sm"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await approveOutbound({
                    outboundId,
                    body: { level: Number.isFinite(parsedActionLevel) ? parsedActionLevel : undefined, note: actionNote || undefined },
                  });
                  toast({ title: 'Đã duyệt phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Duyệt
              </Button>
            ) : null}
            {actions?.canReject ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await rejectOutbound({
                    outboundId,
                    body: {
                      level: Number.isFinite(parsedActionLevel) ? parsedActionLevel : undefined,
                      reason: rejectReason || 'Không đạt điều kiện duyệt',
                      note: actionNote || undefined,
                    },
                  });
                  toast({ title: 'Đã từ chối phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Từ chối
              </Button>
            ) : null}
            {actions?.canCancel ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await cancelOutbound(outboundId);
                  toast({ title: 'Đã huỷ phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Huỷ phiếu
              </Button>
            ) : null}
            {actions?.canResubmit ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await resubmitOutbound(outboundId);
                  toast({ title: 'Đã gửi lại phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isResubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Gửi lại
              </Button>
            ) : null}
            {!hasAnyAction ? (
              <span className="text-[11px] text-muted-foreground">Không có hành động khả dụng.</span>
            ) : null}
          </div>
        </div>
      </div>

      <DeliverySlipDialog open={openDeliverySlip} onOpenChange={setOpenDeliverySlip} outboundId={outboundId} outbound={outbound} />
    </div>
  );
}
