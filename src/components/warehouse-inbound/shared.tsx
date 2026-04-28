import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { numberWithCommas } from '@/lib/other';
import { cn } from '@/lib/utils';
import type { IWarehouseInboundReceiptLineInfo } from '@/types/warehouse-inbound';
import type { IPaymentFileObject } from '@/types/payment';
import { FileText, Paperclip, Upload, X } from 'lucide-react';
import { type ReactNode, useMemo, useRef } from 'react';

// ---------------------------------------------------------------------------
// FooterStat — label+value column in sticky footer
// ---------------------------------------------------------------------------
export function FooterStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="whitespace-nowrap text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DisplayField — read-only label + value pair
// ---------------------------------------------------------------------------
export function DisplayField({
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

// ---------------------------------------------------------------------------
// ConfirmAction — wraps a trigger button with an AlertDialog
// ---------------------------------------------------------------------------
export function ConfirmAction({
  title,
  description,
  actionLabel,
  variant,
  onConfirm,
  disabled,
  body,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  variant?: 'destructive';
  onConfirm: () => void;
  disabled?: boolean;
  body?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {body && <div className="py-2">{body}</div>}
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            onClick={onConfirm}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// SummaryRow — a single right-aligned summary row
// ---------------------------------------------------------------------------
export function SummaryRow({
  label,
  qty,
  amount,
  currency,
}: {
  label: string;
  qty?: string;
  amount: string;
  currency: string;
}) {
  return (
    <div className="flex items-center justify-end gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="w-24 text-right font-medium tabular-nums">{qty ?? ''}</span>
      <span className="w-28 text-right font-semibold tabular-nums">{amount}</span>
      <span className="w-12 text-muted-foreground">{currency}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LinesSummary — totals block below a receipt lines table
// ---------------------------------------------------------------------------
export function LinesSummary({
  lines,
  feeAmount,
  currency,
}: {
  lines: IWarehouseInboundReceiptLineInfo[];
  feeAmount: number;
  currency: string;
}) {
  const totals = useMemo(() => {
    let totalQtyExpected = 0;
    let totalQtyReceived = 0;
    let totalAmount = 0;
    let totalTax = 0;
    for (const line of lines) {
      const qty = Number(line.quantityExpected ?? 0);
      const qtyR = Number(line.quantityReceived ?? 0);
      const price = Number(line.unitPrice ?? 0);
      const tax = Number(line.taxPercent ?? 0);
      const lineAmount = qtyR * price;
      totalQtyExpected += qty;
      totalQtyReceived += qtyR;
      totalAmount += lineAmount;
      totalTax += lineAmount * (tax / 100);
    }
    return { totalQtyExpected, totalQtyReceived, totalAmount, totalTax };
  }, [lines]);

  const fee = Number(feeAmount ?? 0);
  const grandTotal = totals.totalAmount + totals.totalTax + fee;

  return (
    <div className="mt-3 space-y-1.5 border-t pt-3">
      <SummaryRow
        label="Tổng SL dự kiến / SL nhận"
        qty={`${numberWithCommas(totals.totalQtyExpected)} / ${numberWithCommas(totals.totalQtyReceived)}`}
        amount={numberWithCommas(Math.round(totals.totalAmount))}
        currency={currency}
      />
      {totals.totalTax > 0 && (
        <SummaryRow label="+ VAT" amount={numberWithCommas(Math.round(totals.totalTax * 10) / 10)} currency={currency} />
      )}
      {fee > 0 && (
        <SummaryRow label="Tổng phí nhập kho" amount={numberWithCommas(fee)} currency={currency} />
      )}
      <Separator />
      <div className="flex items-center justify-end gap-4 text-xs">
        <span className="font-medium text-emerald-700 dark:text-emerald-400">Tổng cộng</span>
        <span className="w-24" />
        <span className="w-28 text-right text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
          {numberWithCommas(Math.round(grandTotal * 10) / 10)}
        </span>
        <span className="w-12 font-medium text-muted-foreground">{currency}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PendingFilesList — shows queued (unsaved) files with remove buttons
// ---------------------------------------------------------------------------
export function PendingFilesList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (idx: number) => void;
}) {
  if (files.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-amber-600">Chờ lưu ({files.length} file)</p>
      {files.map((f, i) => (
        <div
          key={`pending-${i}`}
          className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs dark:border-amber-800 dark:bg-amber-950/30"
        >
          <FileText className="h-3 w-3 shrink-0 text-amber-600" />
          <span className="min-w-0 flex-1 truncate">{f.name}</span>
          <span className="shrink-0 text-[9px] text-muted-foreground">{Math.round(f.size / 1024)}KB</span>
          <button
            type="button"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(i)}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileAttachmentSection — combined upload button, pending files, and saved files
// ---------------------------------------------------------------------------
export function FileAttachmentSection({
  savedFiles,
  pendingFiles,
  canUpload,
  disabled,
  onSelectFiles,
  onRemovePendingFile,
}: {
  savedFiles: IPaymentFileObject[];
  pendingFiles: File[];
  canUpload: boolean;
  disabled: boolean;
  onSelectFiles: (files: FileList | null) => void;
  onRemovePendingFile: (idx: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalCount = savedFiles.length + pendingFiles.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <FileText className="h-3 w-3" />
          File đính kèm
          {totalCount > 0 && (
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums">
              {savedFiles.length}
              {pendingFiles.length > 0 && <span className="text-amber-600">+{pendingFiles.length}</span>}
            </span>
          )}
        </p>
        {canUpload && (
          <label className={cn('cursor-pointer', disabled && 'pointer-events-none opacity-50')}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                onSelectFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={disabled}
            />
            <span className="inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[10px] hover:bg-muted">
              <Upload className="h-3 w-3" />
              Chọn file
            </span>
          </label>
        )}
      </div>

      <PendingFilesList files={pendingFiles} onRemove={onRemovePendingFile} />

      {savedFiles.length === 0 && pendingFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-4 text-center">
          <Paperclip className="mb-1 h-4 w-4 text-muted-foreground/60" />
          <p className="text-[11px] text-muted-foreground">Chưa có file. Nhấn Chọn file để thêm.</p>
        </div>
      ) : savedFiles.length > 0 ? (
        <div className="space-y-1">
          {savedFiles.map((f) => (
            <a
              key={f.id}
              href={f.viewUrl || f.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs text-primary hover:underline"
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{f.fileName}</span>
              <span className="shrink-0 text-[9px] text-muted-foreground">
                {f.size ? `${Math.round(f.size / 1024)}KB` : ''}
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReceiptLinesTable — lines table with optional editable fields + delete
// ---------------------------------------------------------------------------
export type LineEditState = {
  quantityReceived: number;
  taxPercent: number;
  taxIncluded: boolean;
  billOnPaper: string;
  lineNote: string;
};

function EditableLineRow({
  idx,
  line,
  canEdit,
  disabled,
  editState,
  onLineChange,
  onDelete,
}: {
  idx: number;
  line: IWarehouseInboundReceiptLineInfo;
  canEdit: boolean;
  disabled: boolean;
  editState?: LineEditState;
  onLineChange: (lineId: string, patch: Partial<LineEditState>) => void;
  onDelete: (lineId: string) => Promise<void>;
}) {
  const quantityReceived = editState?.quantityReceived ?? Number(line.quantityReceived ?? 0);
  const taxPercent = editState?.taxPercent ?? Number(line.taxPercent ?? 0);
  const taxIncluded = editState?.taxIncluded ?? Boolean(line.taxIncluded ?? false);
  const billOnPaper = editState?.billOnPaper ?? (line.billOnPaper ?? '');
  const lineNote = editState?.lineNote ?? (line.lineNote ?? '');

  const unitPrice = Number(line.unitPrice ?? 0);
  const priceWithTax = taxIncluded ? unitPrice : unitPrice * (1 + taxPercent / 100);

  return (
    <TableRow>
      <TableCell className="text-center text-xs tabular-nums">{idx + 1}</TableCell>
      <TableCell className="text-xs">{line.productName || '—'}</TableCell>
      <TableCell className="text-xs">{line.vendorName || '—'}</TableCell>
      <TableCell className="text-right text-xs tabular-nums">{unitPrice ? numberWithCommas(unitPrice) : '—'}</TableCell>
      <TableCell className="text-right text-xs tabular-nums">{line.quantityExpected}</TableCell>
      <TableCell className="text-right text-xs">
        {canEdit ? (
          <Input
            className="h-7 w-full text-right text-xs tabular-nums"
            type="number"
            min={0}
            step="any"
            value={quantityReceived}
            onChange={(e) => onLineChange(line.id, { quantityReceived: Number(e.target.value) })}
            disabled={disabled}
          />
        ) : (
          <span className="tabular-nums">{line.quantityReceived}</span>
        )}
      </TableCell>
      <TableCell className="text-right text-xs">
        {canEdit ? (
          <Input
            className="h-7 w-full text-right text-xs tabular-nums"
            type="number"
            min={0}
            step="any"
            value={taxPercent}
            onChange={(e) => onLineChange(line.id, { taxPercent: Number(e.target.value) })}
            disabled={disabled}
          />
        ) : (
          <span className="tabular-nums">{line.taxPercent}</span>
        )}
      </TableCell>
      <TableCell className="text-center text-xs">
        {canEdit ? (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={taxIncluded}
              onCheckedChange={(checked) => onLineChange(line.id, { taxIncluded: checked === true })}
              disabled={disabled}
            />
          </div>
        ) : (
          <span>{taxIncluded ? 'Có' : 'Không'}</span>
        )}
      </TableCell>
      <TableCell className="text-right text-xs font-medium tabular-nums">{numberWithCommas(priceWithTax)}</TableCell>
      <TableCell className="text-right text-xs font-medium tabular-nums">
        {canEdit ? (
          <Input
            className="h-7 w-full text-right text-xs font-medium tabular-nums"
            type="text"
            value={billOnPaper}
            onChange={(e) => onLineChange(line.id, { billOnPaper: e.target.value })}
            disabled={disabled}
            placeholder="—"
          />
        ) : (
          <span className="text-muted-foreground">{billOnPaper || '—'}</span>
        )}
      </TableCell>
      <TableCell className="text-xs">
        {canEdit ? (
          <Input
            className="h-7 w-full text-xs"
            value={lineNote}
            onChange={(e) => onLineChange(line.id, { lineNote: e.target.value })}
            disabled={disabled}
            placeholder="Ghi chú..."
          />
        ) : (
          <span className="text-muted-foreground">{lineNote || '—'}</span>
        )}
      </TableCell>
      {canEdit && (
        <TableCell>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            disabled={disabled}
            onClick={() => void onDelete(line.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

export function ReceiptLinesTable({
  lines,
  canEdit,
  disabled,
  lineEdits,
  onLineChange,
  onDelete,
  emptyMessage,
  emptyHint,
  EmptyIcon,
}: {
  lines: IWarehouseInboundReceiptLineInfo[];
  canEdit: boolean;
  disabled: boolean;
  lineEdits: Map<string, LineEditState>;
  onLineChange: (lineId: string, patch: Partial<LineEditState>) => void;
  onDelete: (lineId: string) => Promise<void>;
  emptyMessage?: string;
  emptyHint?: string;
  EmptyIcon?: React.ComponentType<{ className?: string }>;
}) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-6 text-center">
        {EmptyIcon && <EmptyIcon className="mb-2 h-6 w-6 text-muted-foreground/60" />}
        <p className="text-xs font-medium text-muted-foreground">{emptyMessage ?? 'Chưa có dòng hàng'}</p>
        {emptyHint && <p className="mt-0.5 text-[10px] text-muted-foreground">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center text-[11px]">STT</TableHead>
            <TableHead className="min-w-[140px] text-[11px]">Sản phẩm</TableHead>
            <TableHead className="text-[11px]">NCC</TableHead>
            <TableHead className="w-28 text-right text-[11px]">Đơn giá</TableHead>
            <TableHead className="w-20 text-right text-[11px]">SL dự kiến</TableHead>
            <TableHead className="w-28 text-right text-[11px]">SL nhận</TableHead>
            <TableHead className="w-20 text-right text-[11px]">Thuế %</TableHead>
            <TableHead className="w-24 text-center text-[11px]">Bao gồm thuế</TableHead>
            <TableHead className="w-32 text-right text-[11px]">Đơn giá + thuế</TableHead>
            <TableHead className="w-32 text-right text-[11px]">Bill sổ sách</TableHead>
            <TableHead className="min-w-[120px] text-[11px]">Ghi chú</TableHead>
            {canEdit && <TableHead className="w-[50px] text-[11px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, idx) => (
            <EditableLineRow
              key={line.id}
              idx={idx}
              line={line}
              canEdit={canEdit}
              disabled={disabled}
              editState={lineEdits.get(line.id)}
              onLineChange={onLineChange}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
