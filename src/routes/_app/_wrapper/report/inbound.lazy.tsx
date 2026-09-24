import { inboundSummaryColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_INBOUND } from '@/lib/url'
import { InboundSummaryReportRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/inbound')({
  component: InboundReportPage,
})

function InboundReportPage() {
  return (
    <OperationalReportScreen<InboundSummaryReportRow>
      title="BÁO CÁO NHẬP KHO"
      path={URL_REPORT_INBOUND}
      columns={inboundSummaryColumns}
    />
  )
}
