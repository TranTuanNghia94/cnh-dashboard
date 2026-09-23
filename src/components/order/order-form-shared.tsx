/**
 * Shared form components used by both the create-order and edit-order pages.
 *
 * Components:
 *   OrderInfoForm     – the "General info" + "Shipping" cards wrapped in a <form>
 *   OrderLinesSection – the order-lines card with optional search filters & reset
 *   OrderFooterBar    – sticky bottom CTA bar
 */

import FindAddress from '@/components/modal/address/find'
import FindCustomer from '@/components/modal/customer/find'
import OrderLineExcelUploadModal from '@/components/order/order-line-excel-upload-modal'
import OrderLineCreate from '@/components/modal/order/order-line-create'
import { FilterBadge, SectionStatusBadge } from '@/components/order/order-ui'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { TableCell, TableRow } from '@/components/ui/table'
import { OrderLineColumns } from '@/components/table/order/columns-order-line'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CalendarPicker from '@/components/ui/calendar-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { IAddressResponse } from '@/types/address'
import { ICustomerResponse } from '@/types/customer'
import { IOrderLineCreateRequest } from '@/types/order'
import { cn } from '@/lib/utils'
import { downloadOrderLinesExcelTemplate } from '@/lib/order-lines-excel'
import { formatCurrencyVN, formatNumberVN } from '@/lib/other'
import { ChevronLeft, ChevronRight, FileDown, FileUp, RefreshCcw, Save, XIcon } from 'lucide-react'
import { ChangeEvent, FormEvent, memo, ReactNode, RefObject } from 'react'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type SectionStatus = { ready: boolean; label: string; helper: string }

export type LineFilters = { code: string; name: string; vendor: string }

export type FilterKey = keyof LineFilters

export type ActiveFilterBadge = { key: FilterKey; label: string; value: string }

export type LineFiltersState = {
  values: LineFilters
  activeFilterBadges: ReadonlyArray<ActiveFilterBadge>
  hasFilters: boolean
  onChange: (field: FilterKey) => (e: ChangeEvent<HTMLInputElement>) => void
  onRemove: (field: FilterKey) => () => void
  onClear: () => void
}

export type OrderLineRow = IOrderLineCreateRequest & {
  deleteRow: () => void
  updateRow: (val: IOrderLineCreateRequest) => void
}

// ---------------------------------------------------------------------------
// OrderInfoForm
// ---------------------------------------------------------------------------

export type OrderInfoSection = 'general' | 'shipping'

export type OrderInfoFormProps = {
  formId: string
  formRef: RefObject<HTMLFormElement>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  // general card
  defaultContractNumber?: string
  contractNumber?: string
  onContractNumberChange?: (value: string) => void
  date: Date | undefined
  setDate: (d: Date | undefined) => void
  dateDelivery: Date | undefined
  setDateDelivery: (d: Date | undefined) => void
  customerData: ICustomerResponse | undefined
  onSelectCustomer: (data: ICustomerResponse) => void
  // shipping card
  addressData: IAddressResponse | undefined
  onSelectAddress: (data: IAddressResponse) => void
  defaultNotes?: string
  // which cards to show (both stay mounted; hidden ones keep form field values)
  visibleSections?: ReadonlyArray<OrderInfoSection>
  // edit-mode extras (omit for create)
  isLoading?: boolean
  generalStatus?: SectionStatus
  shippingStatus?: SectionStatus
  className?: string
}

export const OrderInfoForm = memo(function OrderInfoForm({
  formId, formRef, onSubmit,
  defaultContractNumber, contractNumber, onContractNumberChange,
  date, setDate, dateDelivery, setDateDelivery,
  customerData, onSelectCustomer, addressData, onSelectAddress, defaultNotes,
  visibleSections = ['general', 'shipping'],
  isLoading, generalStatus, shippingStatus, className,
}: OrderInfoFormProps) {
  const hasCustomer = Boolean(customerData?.id)
  const showGeneral = visibleSections.includes('general')
  const showShipping = visibleSections.includes('shipping')
  const showBoth = showGeneral && showShipping

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={onSubmit}
      className={cn(
        'grid grid-cols-1 gap-4',
        showBoth && 'lg:grid-cols-2 lg:gap-x-4',
        className,
      )}
    >
      {/* General info — keep mounted so uncontrolled fields survive step changes */}
      <div
        aria-hidden={!showGeneral}
        className={cn(
          !showGeneral && 'hidden',
          generalStatus && !generalStatus.ready && 'border-dashed border-destructive/60 bg-destructive/5',
        )}
      >
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="uppercase">Thông tin chung</CardTitle>
            {generalStatus && <CardDescription>{generalStatus.helper}</CardDescription>}
          </div>
          {generalStatus && <SectionStatusBadge ready={generalStatus.ready} label={generalStatus.label} />}
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48 w-full" /> : (
            <div className="grid grid-cols-5 gap-x-6">
              <div className="col-span-3">
                <Label className="text-xs">Số hợp đồng<span className="text-red-600">*</span></Label>
                <Input
                  name="contractNumber"
                  required
                  placeholder="Nhập số hợp đồng"
                  {...(onContractNumberChange
                    ? { value: contractNumber ?? '', onChange: (e: ChangeEvent<HTMLInputElement>) => onContractNumberChange(e.target.value) }
                    : { defaultValue: defaultContractNumber ?? '' })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Ngày lập hợp đồng<span className="text-red-600">*</span></Label>
                <CalendarPicker date={date} setDate={setDate} placeholder="Chọn ngày lập hợp đồng" />
              </div>
              <div className="col-span-3 mt-2">
                <Label className="text-xs">Khách hàng<span className="text-red-600">*</span></Label>
                <div className="flex flex-col gap-y-2">
                  <div className="flex gap-x-4">
                    <Input disabled value={customerData?.name ?? ''} placeholder="Chưa chọn khách hàng" />
                    <FindCustomer handleSelect={onSelectCustomer} />
                  </div>
                  {!hasCustomer && (
                    <p className="text-xs text-muted-foreground">Chọn khách hàng để mở danh sách địa chỉ.</p>
                  )}
                </div>
              </div>
              <div className="col-span-2 mt-2">
                <Label className="text-xs">Ngày giao dự kiến<span className="text-red-600">*</span></Label>
                <CalendarPicker date={dateDelivery} setDate={setDateDelivery} placeholder="Chọn ngày giao hàng" />
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Shipping */}
      <div
        aria-hidden={!showShipping}
        className={cn(
          !showShipping && 'hidden',
          shippingStatus && !shippingStatus.ready && 'border-dashed border-destructive/60 bg-destructive/5',
        )}
      >
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="uppercase">Thông tin giao hàng</CardTitle>
            {shippingStatus
              ? <CardDescription>{shippingStatus.helper}</CardDescription>
              : <CardDescription>Tùy chọn — có thể bỏ qua</CardDescription>}
          </div>
          {shippingStatus && <SectionStatusBadge ready={shippingStatus.ready} label={shippingStatus.label} />}
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48 w-full" /> : (
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <Label className="text-xs">Người nhận</Label>
                <div className="flex flex-col gap-y-2">
                  <div className="flex gap-x-4">
                    <Input disabled value={addressData?.contactPerson ?? ''} placeholder="Chưa có thông tin" />
                    <FindAddress
                      disabled={!hasCustomer}
                      setAddressData={onSelectAddress}
                      customerId={(customerData?.id as string) || null}
                    />
                  </div>
                  {!hasCustomer && (
                    <p className="text-xs text-muted-foreground">Vui lòng chọn khách hàng trước.</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs">SĐT</Label>
                <Input disabled type="tel" value={addressData?.phone ?? ''} placeholder="—" />
              </div>
              <div className="col-span-2 mt-2">
                <Label className="text-xs">Địa chỉ giao hàng</Label>
                <Input disabled value={addressData?.address ?? ''} placeholder="—" />
              </div>
              <div className="col-span-2 mt-2">
                <Label className="text-xs">Ghi chú</Label>
                <Input name="notes" defaultValue={defaultNotes ?? ''} placeholder="Ghi chú bổ sung" />
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </form>
  )
})

// ---------------------------------------------------------------------------
// OrderLinesSection
// ---------------------------------------------------------------------------

export type OrderLinesSectionProps = {
  listLines: IOrderLineCreateRequest[]
  tableData: OrderLineRow[]
  formattedTotal: string
  linesSectionHelper: string
  onAddLine: (val: IOrderLineCreateRequest) => void
  disableAddLine: boolean
  noDataText?: string
  // edit-mode: line search filters
  filters?: LineFiltersState
  // create-mode: reset form button
  onReset?: () => void
  isSaving?: boolean
  onDownloadTemplate?: () => void
  onUploadExcel?: () => void
  isUploadingExcel?: boolean
  uploadButtonLabel?: string
  uploadExcelAction?: ReactNode
}

export const OrderLinesSection = memo(function OrderLinesSection({
  listLines, tableData, formattedTotal, linesSectionHelper,
  onAddLine, disableAddLine, noDataText,
  filters, onReset, isSaving,
  onDownloadTemplate, onUploadExcel, isUploadingExcel, uploadButtonLabel, uploadExcelAction,
}: OrderLinesSectionProps) {
  const lineTotals = tableData.reduce(
    (acc, line) => {
      const quantity = Number(line.quantity ?? 0) || 0
      const amount = Number(line.totalAmount ?? 0) || quantity * (Number(line.unitPrice ?? 0) || 0)
      return { quantity: acc.quantity + quantity, amount: acc.amount + amount }
    },
    { quantity: 0, amount: 0 },
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="uppercase">Chi tiết đơn hàng</CardTitle>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
              {listLines.length} dòng
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tổng tiền: <span className="font-semibold text-foreground">{formattedTotal}</span>
          </p>
          <p className="text-xs text-muted-foreground">{linesSectionHelper}</p>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" disabled={isSaving}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận làm mới</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tất cả thông tin đã nhập sẽ bị xóa. Bạn có chắc muốn tiếp tục?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset}>Làm mới</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => (onDownloadTemplate ? onDownloadTemplate() : downloadOrderLinesExcelTemplate())}
            title="Bắt buộc: Mã hàng, Mã NCC, Số lượng, Đơn giá, ĐVT. Gồm thuế: 1 = đã gồm thuế, 0 = chưa. Tên hàng, Giáo viên, Phòng, Tham chiếu, Ghi chú — tùy chọn."
          >
            <FileDown className="mr-2 h-4 w-4" />
            Tải mẫu Excel
          </Button>
          {uploadExcelAction ?? (onUploadExcel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUploadExcel}
              disabled={Boolean(isUploadingExcel) || disableAddLine}
            >
              <FileUp className={cn('mr-2 h-4 w-4', isUploadingExcel && 'animate-pulse')} />
              {isUploadingExcel ? 'Đang tải lên...' : (uploadButtonLabel ?? 'Tải lên Excel')}
            </Button>
          ) : (
            <OrderLineExcelUploadModal
              disabled={disableAddLine || Boolean(isSaving)}
              onImported={(lines) => lines.forEach(onAddLine)}
            />
          ))}
          <OrderLineCreate saveDetail={onAddLine} disabled={disableAddLine} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {filters && (
          <>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="grid flex-1 gap-3 md:grid-cols-3">
                <Input placeholder="Mã hàng" value={filters.values.code} onChange={filters.onChange('code')} />
                <Input placeholder="Tên hàng" value={filters.values.name} onChange={filters.onChange('name')} />
                <Input placeholder="Nhà cung cấp" value={filters.values.vendor} onChange={filters.onChange('vendor')} />
              </div>
              {filters.hasFilters && (
                <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={filters.onClear}>
                  <XIcon className="h-3.5 w-3.5" />
                  Xóa lọc
                </Button>
              )}
            </div>
            {filters.hasFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{filters.activeFilterBadges.length} bộ lọc đang áp dụng:</span>
                {filters.activeFilterBadges.map(f => (
                  <FilterBadge key={f.key} label={f.label} value={f.value} onClear={filters.onRemove(f.key)} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Hiển thị {tableData.length} / {listLines.length} dòng</span>
          {disableAddLine && (
            <span>Chọn khách hàng để bật nút &quot;Thêm mới&quot;.</span>
          )}
        </div>

        <DataTableDetail
          data={tableData}
          wrapperClassName="h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]"
          columns={OrderLineColumns}
          noDataText={noDataText ?? 'Chưa có chi tiết nào.'}
          tableFooter={tableData.length > 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="text-xs font-semibold">Tổng</TableCell>
              <TableCell className="text-xs font-semibold tabular-nums">{formatNumberVN(lineTotals.quantity)}</TableCell>
              <TableCell />
              <TableCell />
              <TableCell className="text-xs font-semibold tabular-nums">{formatNumberVN(lineTotals.amount)}</TableCell>
              <TableCell />
            </TableRow>
          ) : null}
        />
      </CardContent>
    </Card>
  )
})

// ---------------------------------------------------------------------------
// OrderFooterBar
// ---------------------------------------------------------------------------

export type OrderFooterBarProps = {
  customerName?: string
  customerCode?: string
  addressText?: string
  listLines: IOrderLineCreateRequest[]
  hasPendingChanges?: boolean
  isSaving: boolean
  canSave: boolean
  onSave: () => void
  saveLabel?: string
  /** Wizard navigation (create flow). When omitted, footer behaves as save-only. */
  showBack?: boolean
  showNext?: boolean
  showSkip?: boolean
  showSave?: boolean
  canNext?: boolean
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  nextLabel?: string
  backLabel?: string
  skipLabel?: string
}

export const OrderFooterBar = memo(function OrderFooterBar({
  customerName, customerCode, addressText, listLines,
  hasPendingChanges, isSaving, canSave, onSave, saveLabel = 'Lưu đơn hàng',
  showBack = false,
  showNext = false,
  showSkip = false,
  showSave = true,
  canNext = false,
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Tiếp tục',
  backLabel = 'Quay lại',
  skipLabel = 'Bỏ qua',
}: OrderFooterBarProps) {
  const formattedTotal = formatCurrencyVN(
    listLines.reduce((acc, l) => acc + (Number(l.totalAmount ?? 0) || l.quantity * l.unitPrice), 0),
  )

  const sections = [
    { label: 'Khách hàng', value: customerName || '—', sub: customerCode },
    { label: 'Địa chỉ giao', value: addressText || '—' },
    { label: 'Tổng tiền', value: formattedTotal, sub: listLines.length ? `${listLines.length} dòng` : undefined },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {sections.map(s => (
            <div key={s.label} className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">{s.label}</span>
              <span className="font-medium text-foreground">{s.value}</span>
              {s.sub && <span className="text-[10px] text-muted-foreground">{s.sub}</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {hasPendingChanges && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Chưa lưu
            </span>
          )}
          {showBack && (
            <Button type="button" variant="outline" size="sm" onClick={onBack} disabled={isSaving}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {backLabel}
            </Button>
          )}
          {showSkip && (
            <Button type="button" variant="ghost" size="sm" onClick={onSkip} disabled={isSaving}>
              {skipLabel}
            </Button>
          )}
          {showNext && (
            <Button type="button" size="sm" onClick={onNext} disabled={!canNext || isSaving}>
              {nextLabel}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {showSave && (
            <Button type="button" size="sm" disabled={!canSave || isSaving} onClick={onSave}>
              {isSaving
                ? <><RefreshCcw className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                : <><Save className="mr-2 h-4 w-4" />{saveLabel}</>
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})
