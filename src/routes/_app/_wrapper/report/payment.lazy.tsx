import { paymentColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_PAYMENT } from '@/lib/url'
import { PaymentLedgerRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/payment')({
  component: PaymentReportPage,
})

function PaymentReportPage() {
  return (
    <OperationalReportScreen<PaymentLedgerRow>
      title="BÁO CÁO THANH TOÁN"
      path={URL_REPORT_PAYMENT}
      columns={paymentColumns}
    />
  )
}
