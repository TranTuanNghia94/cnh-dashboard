import { outboundSummaryColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_OUTBOUND } from '@/lib/url'
import { OutboundSummaryReportRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/outbound')({
  component: OutboundReportPage,
})

function OutboundReportPage() {
  return (
    <OperationalReportScreen<OutboundSummaryReportRow>
      title="BÁO CÁO XUẤT KHO"
      path={URL_REPORT_OUTBOUND}
      columns={outboundSummaryColumns}
    />
  )
}
