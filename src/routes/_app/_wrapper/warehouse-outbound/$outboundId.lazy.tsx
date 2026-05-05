import HeaderPageLayout from '@/components/layout/HeaderPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useApproveWarehouseOutbound,
  useCancelWarehouseOutbound,
  useGetWarehouseOutboundActions,
  useGetWarehouseOutboundById,
  useListWarehouseOutboundFiles,
  useRejectWarehouseOutbound,
  useResubmitWarehouseOutbound,
  useSubmitWarehouseOutbound,
  useUploadWarehouseOutboundFile,
} from '@/hooks/use-warehouse-outbound';
import { useToast } from '@/hooks/use-toast';
import { WAREHOUSE_OUTBOUND_STATUS_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type {
  IWarehouseOutboundActionsInfo,
  IWarehouseOutboundFileListResponse,
  IWarehouseOutboundInfo,
} from '@/types/warehouse-outbound';
import { createLazyFileRoute, useParams } from '@tanstack/react-router';
import { Loader2, RefreshCcw } from 'lucide-react';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

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
  const { mutateAsync: uploadFile, isPending: isUploadingFile } = useUploadWarehouseOutboundFile();
  const { mutateAsync: listFiles } = useListWarehouseOutboundFiles();

  const [outbound, setOutbound] = useState<IWarehouseOutboundInfo>();
  const [actions, setActions] = useState<IWarehouseOutboundActionsInfo>();
  const [files, setFiles] = useState<Array<{ fileName?: string; fileUrl?: string }>>([]);
  const [actionNote, setActionNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLevel, setActionLevel] = useState<string>('');

  const loadAll = useCallback(async () => {
    if (!outboundId) return;
    const [detailRes, actionRes, filesRes] = await Promise.all([
      getDetail(outboundId),
      getActions(outboundId),
      listFiles(outboundId),
    ]);
    setOutbound(detailRes?.data as IWarehouseOutboundInfo | undefined);
    setActions(actionRes?.data as IWarehouseOutboundActionsInfo | undefined);
    const f = (filesRes?.data as IWarehouseOutboundFileListResponse | undefined)?.data;
    setFiles(Array.isArray(f) ? f : []);
  }, [outboundId, getDetail, getActions, listFiles]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const busy = isSubmitting || isApproving || isRejecting || isCancelling || isResubmitting || isUploadingFile;
  const parsedActionLevel = actionLevel.trim() ? Number(actionLevel) : undefined;

  const onUploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !outboundId) return;
    await uploadFile({ outboundId, file });
    toast({ title: 'Upload file thành công', variant: 'success' });
    await loadAll();
    e.target.value = '';
  };

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

  return (
    <div className="pb-24">
      <HeaderPageLayout
        title={outbound?.outboundNumber ? `Phiếu xuất - ${outbound.outboundNumber}` : 'Chi tiết phiếu xuất'}
        buttonSubmit={
          <Button variant="outline" onClick={() => void loadAll()} disabled={isLoadingDetail || busy}>
            <RefreshCcw className={cn('mr-2 h-4 w-4', isLoadingDetail && 'animate-spin')} />
            Làm mới
          </Button>
        }
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm uppercase">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
          <div className="md:col-span-3">
            <p className="text-xs text-muted-foreground">Lý do</p>
            <p className="text-sm">{outbound?.outboundReason || '—'}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs text-muted-foreground">Ghi chú</p>
            <p className="text-sm">{outbound?.note || '—'}</p>
          </div>
          <div className="md:col-span-3">
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
                    {idx < OUTBOUND_FLOW_STEPS.length - 1 ? <span className="text-xs text-muted-foreground">→</span> : null}
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
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm uppercase">Chi tiết dòng hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(outbound?.details ?? []).map((line) => (
              <div key={line.id} className="rounded-md border p-3">
                <div className="text-sm font-medium">
                  {line.productCode} - {line.productName}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-6">
                  <span>SL: {line.quantity}</span>
                  <span>Đơn giá: {Number(line.unitPrice ?? 0).toLocaleString('vi-VN')}</span>
                  <span>VAT: {line.vat}%</span>
                  <span>Thành tiền: {Number(line.totalAmount ?? 0).toLocaleString('vi-VN')}</span>
                  <span>Thuế: {Number(line.taxAmount ?? 0).toLocaleString('vi-VN')}</span>
                  <span>Box: {line.box || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm uppercase">Tiến trình duyệt</CardTitle>
        </CardHeader>
        <CardContent>
          {(outbound?.approvals ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lịch sử duyệt.</p>
          ) : (
            <div className="space-y-2">
              {(outbound?.approvals ?? []).map((approval) => (
                <div key={approval.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      Level {approval.level} - {approval.role}
                    </p>
                    <span className="text-xs text-muted-foreground">{approval.status || '—'}</span>
                  </div>
                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    <p>Approver: {approval.approverId || '—'}</p>
                    <p>Updated by: {approval.updatedBy || '—'}</p>
                    <p>Approved at: {approval.approvedAt || '—'}</p>
                    <p>Reason: {approval.rejectionReason || '—'}</p>
                    <p>Note: {approval.note || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm uppercase">Files & hành động</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input type="file" onChange={(e) => void onUploadFile(e)} disabled={busy} />
          </div>
          {files.length > 0 ? (
            <div className="space-y-1">
              {files.map((f, idx) => (
                <a key={idx} href={f.fileUrl} className="block text-sm text-primary underline" target="_blank" rel="noreferrer">
                  {f.fileName || `File ${idx + 1}`}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có file.</p>
          )}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Ghi chú hành động</Label>
              <Textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Lý do từ chối</Label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Cấp duyệt (tuỳ chọn)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Để trống để backend tự chọn level kế tiếp"
                value={actionLevel}
                onChange={(e) => setActionLevel(e.target.value)}
                disabled={!canApproveOrReject}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {actions?.canSubmit ? (
              <Button
                variant="default"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await submitOutbound(outboundId);
                  toast({ title: 'Đã submit phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit
              </Button>
            ) : null}
            {actions?.canApprove ? (
              <Button
                variant="default"
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
                Approve
              </Button>
            ) : null}
            {actions?.canReject ? (
              <Button
                variant="destructive"
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
                Reject
              </Button>
            ) : null}
            {actions?.canCancel ? (
              <Button
                variant="outline"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await cancelOutbound(outboundId);
                  toast({ title: 'Đã huỷ phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cancel
              </Button>
            ) : null}
            {actions?.canResubmit ? (
              <Button
                variant="secondary"
                disabled={busy || !outboundId}
                onClick={async () => {
                  if (!outboundId) return;
                  await resubmitOutbound(outboundId);
                  toast({ title: 'Đã gửi lại phiếu xuất', variant: 'success' });
                  await loadAll();
                }}
              >
                {isResubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resubmit
              </Button>
            ) : null}
            {!actions?.canSubmit &&
            !actions?.canApprove &&
            !actions?.canReject &&
            !actions?.canCancel &&
            !actions?.canResubmit ? (
              <p className="text-sm text-muted-foreground">Không có hành động khả dụng ở trạng thái hiện tại.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
