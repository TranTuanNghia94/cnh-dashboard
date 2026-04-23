import { purchaseOrderLineExtendedAmount } from '@/lib/other'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaymentPaperUploadSection, type PaymentPaperSource } from '@/components/payment/payment-paper-upload-section'
import { IPaymentFileObject, IPaymentRequestFeeRequest } from '@/types/payment'
import { IPurchaseOrderLineResponse } from '@/types/purchase'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

type PaymentLineItem = {
  _id: string
  requestedAmount: number
  _line: IPurchaseOrderLineResponse
}

type FeeOption = {
  value: string
  label: string
}

type Props = {
  items: PaymentLineItem[]
  filteredItems: PaymentLineItem[]
  papers: IPaymentFileObject[]
  fees: IPaymentRequestFeeRequest[]
  hasLoadedLines: boolean
  filteredQuantity: number
  filteredRequestedAmountRaw: number
  filteredRequestedAmount: number
  effectivePercentage: number
  paymentMode: 'FULL' | 'PARTIAL'
  currency: string
  feeTypeOptions: FeeOption[]
  onUploadPapers: (files: FileList | null) => void
  onRemovePaper: (index: number) => void
  onAddFee: () => void
  onRemoveFee: (index: number) => void
  onUpdateFee: (index: number, field: keyof IPaymentRequestFeeRequest, value: string | number) => void
  numberWithCommas: (value: number) => string
}

export default function PaymentLinesSection({
  items,
  filteredItems,
  papers,
  fees,
  hasLoadedLines,
  filteredQuantity,
  filteredRequestedAmountRaw,
  filteredRequestedAmount,
  effectivePercentage,
  paymentMode,
  currency,
  feeTypeOptions,
  onUploadPapers,
  onRemovePaper,
  onAddFee,
  onRemoveFee,
  onUpdateFee,
  numberWithCommas,
}: Props) {
  const paperSources = useMemo<PaymentPaperSource[]>(
    () =>
      papers.map((p) => ({
        kind: 'meta',
        fileName: p.fileName,
        fileUrl: p.fileUrl,
        size: p.size,
        contentType: p.contentType,
      })),
    [papers],
  )

  const totalFeesAmount = useMemo(
    () => fees.reduce((acc, fee) => acc + Number(fee.amount ?? 0), 0),
    [fees],
  )
  const totalWithFees = filteredRequestedAmount + totalFeesAmount

  const tableSummaryLabel = useMemo(() => {
    if (paymentMode === 'FULL') return 'Thanh toán toàn bộ đơn hàng'
    return `Thanh toán ${effectivePercentage}% đơn hàng`
  }, [paymentMode, effectivePercentage])

  return (
    <div className={`grid grid-cols-1 gap-4 ${!hasLoadedLines ? 'opacity-60' : ''}`}>
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase">Dòng thanh toán</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Đi theo từng bước để tránh thiếu dữ liệu trước khi tạo đề nghị.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 text-[11px]">
              {filteredItems.length}/{items.length} dòng
            </Badge>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <PaymentPaperUploadSection
            disabled={!hasLoadedLines}
            onUploadPapers={onUploadPapers}
            onRemovePaper={onRemovePaper}
            paperSources={paperSources}
            showBankNoteUpload={false}
            onUploadBankNotes={() => {}}
            bankNoteExistingSources={[]}
            bankNotePendingSources={[]}
            onRemoveBankNotePending={() => {}}
            emptyBankNoteColumnHint="Bank note (sau khi đã thanh toán) — thêm khi cập nhật đề nghị."
          />

          <section className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px]">{tableSummaryLabel}</Badge>
              <Badge variant="outline" className="text-[11px]">
                Tổng tiền hàng: {numberWithCommas(filteredRequestedAmountRaw)} {currency}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                Tiền đề nghị: {numberWithCommas(filteredRequestedAmount)} {currency}
              </Badge>
              {totalFeesAmount !== 0 && (
                <>
                  <Badge variant="outline" className="text-[11px]">
                    Phí phát sinh: {numberWithCommas(totalFeesAmount)} {currency}
                  </Badge>
                  <Badge className="text-[11px]">
                    Tổng thanh toán: {numberWithCommas(totalWithFees)} {currency}
                  </Badge>
                </>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu dòng PO. Vui lòng tìm theo chứng từ ở panel bên trái.
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex h-20 items-center justify-center rounded-md border text-sm text-muted-foreground">
                Không tìm thấy dòng PO theo điều kiện chứng từ.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60">
                    <tr className="border-b">
                      <th className="w-10 px-2 py-2 text-center font-semibold">STT</th>
                      <th className="px-2 py-2 text-left font-semibold">VENDOR</th>
                      <th className="px-2 py-2 text-left font-semibold">MÃ HÀNG</th>
                      <th className="min-w-[180px] px-2 py-2 text-left font-semibold">TÊN HÀNG</th>
                      <th className="px-2 py-2 text-right font-semibold">ĐVT</th>
                      <th className="px-2 py-2 text-right font-semibold">SL</th>
                      <th className="px-2 py-2 text-right font-semibold">ĐƠN GIÁ</th>
                      <th className="px-2 py-2 text-right font-semibold">THÀNH TIỀN</th>
                      <th className="px-2 py-2 text-right font-semibold">TIỀN TỆ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => {
                      const line = item._line as unknown as Record<string, unknown>
                      const productCode = String(item._line.product?.code ?? line.productCode ?? '—')
                      const productName = String(item._line.productName || item._line.product?.name || line.name || '—')
                      const qty = Number(item._line.quantity ?? 0)
                      const unitPrice = Number(item._line.unitPrice ?? 0)
                      const lineTotal =
                        purchaseOrderLineExtendedAmount(item._line) || Number(item.requestedAmount ?? 0)
                      return (
                        <tr key={item._id} className="border-b transition-colors hover:bg-muted/30">
                          <td className="px-2 py-2 text-center text-muted-foreground">{idx + 1}</td>
                          <td className="px-2 py-2 font-medium">{item._line.vendorName}</td>
                          <td className="px-2 py-2">{productCode}</td>
                          <td className="px-2 py-2">{productName}</td>
                          <td className="px-2 py-2 text-right tabular-nums">{item._line.uom1 ?? '—'}</td>
                          <td className="px-2 py-2 text-right tabular-nums">{numberWithCommas(qty)}</td>
                          <td className="px-2 py-2 text-right tabular-nums">{numberWithCommas(unitPrice)}</td>
                          <td className="px-2 py-2 text-right font-medium tabular-nums">{numberWithCommas(lineTotal)}</td>
                          <td className="px-2 py-2 text-right font-medium tabular-nums">{item._line.currency ?? 'VND'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-muted/40">
                    <tr className="border-t">
                      <td colSpan={5} className="px-2 py-2 text-right text-xs font-medium">Tổng số lượng / Tổng tiền hàng</td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums">{numberWithCommas(filteredQuantity)}</td>
                      <td></td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums">{numberWithCommas(filteredRequestedAmountRaw)}</td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums">{currency}</td>
                    </tr>
                    {/* {paymentMode === 'PARTIAL' && (
                      <tr className="border-t">
                        <td colSpan={5} className="px-2 py-2 text-right text-xs font-medium">
                          Thanh toán {effectivePercentage}%
                        </td>
                        <td colSpan={2}/>
                        <td className="px-2 py-2 text-right font-semibold tabular-nums text-primary">
                          {numberWithCommas(filteredRequestedAmount)}
                        </td>
                        <td className="px-2 py-2 text-right font-medium tabular-nums">{currency}</td>
                      </tr>
                    )} */}
                    <tr className="border-t bg-primary/5">
                      <td colSpan={5} className="px-2 py-2 text-right text-xs font-semibold">
                        Số tiền đề nghị thanh toán ({effectivePercentage.toFixed(2)}%)
                      </td>
                      <td colSpan={2}/>
                      <td className="px-2 py-2 text-right font-bold tabular-nums text-primary">
                        {numberWithCommas(filteredRequestedAmount)}
                      </td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums">{currency}</td>
                    </tr>
                    {totalFeesAmount !== 0 && (
                      <>
                        {fees
                          .map((fee, index) => ({
                            name: fee.feeName.trim() || `Phí #${index + 1}`,
                            amount: Number(fee.amount ?? 0),
                            index,
                          }))
                          .filter((fee) => fee.amount !== 0)
                          .map((fee) => (
                            <tr key={`fee-row-${fee.index}`} className="border-t">
                              <td colSpan={5} className="px-2 py-2 text-right text-xs text-muted-foreground">
                                + {fee.name}
                              </td>
                              <td colSpan={2}/>
                              <td className="px-2 py-2 text-right text-xs font-medium tabular-nums">
                                {numberWithCommas(fee.amount)}
                              </td>
                              <td className="px-2 py-2 text-right font-medium tabular-nums">{currency}</td>
                            </tr>
                          ))}
                        <tr className="border-t">
                          <td colSpan={5} className="px-2 py-2 text-right text-xs font-medium">
                            Tổng phí phát sinh
                          </td>
                          <td colSpan={2}/>
                          <td className="px-2 py-2 text-right font-medium tabular-nums">
                            {numberWithCommas(totalFeesAmount)}
                          </td>
                          <td className="px-2 py-2 text-right font-medium tabular-nums">{currency}</td>
                        </tr>
                        <tr className="border-t bg-emerald-50">
                          <td colSpan={5} className="px-2 py-2 text-right text-xs font-semibold text-emerald-800">
                            Tổng đề nghị thanh toán (gồm phí)
                          </td>
                          <td colSpan={2}/>
                          <td className="px-2 py-2 text-right font-bold tabular-nums text-emerald-700">
                            {numberWithCommas(totalWithFees)}
                          </td>
                          <td className="px-2 py-2 text-right font-medium tabular-nums">{currency}</td>
                        </tr>
                      </>
                    )}
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-md border bg-muted/20 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase">Bước 3: Phí phát sinh</h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Thêm các khoản phí cần thanh toán kèm theo (nếu có)</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={onAddFee}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Thêm phí
              </Button>
            </div>

            {fees.length === 0 ? (
              <div className="flex h-16 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                Chưa có khoản phí nào
              </div>
            ) : (
              <div className="space-y-2">
                {fees.map((fee, index) => (
                  <div key={index} className="grid grid-cols-1 gap-2 rounded-md border bg-background p-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Tên phí</Label>
                      <Input
                        className="h-7 text-xs"
                        placeholder="Phí vận chuyển..."
                        value={fee.feeName}
                        onChange={(e) => onUpdateFee(index, 'feeName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Loại phí</Label>
                      <Select value={fee.feeType} onValueChange={(v) => onUpdateFee(index, 'feeType', v)}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Số tiền ({currency})</Label>
                      <Input
                        type="number"
                        className="h-7 text-xs tabular-nums"
                        value={fee.amount}
                        onChange={(e) => onUpdateFee(index, 'amount', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Ghi chú</Label>
                      <Input className="h-7 text-xs" value={fee.note} onChange={(e) => onUpdateFee(index, 'note', e.target.value)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-red-500 hover:text-red-700"
                      onClick={() => onRemoveFee(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
