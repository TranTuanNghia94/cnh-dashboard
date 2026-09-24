import { createAPIClient, fetcherWithAuth, METHODS, BASE_URL } from '@/lib/api'
import { getCookie, REFRESH_TOKEN, TOKEN } from '@/lib/cookie'
import { IGenericResponse } from '@/types/other'
import { OperationalReportPage, OperationalReportQuery } from '@/types/operational-report'

export const fetchOperationalReport = async <T>(path: string, query: OperationalReportQuery) => {
  return fetcherWithAuth<OperationalReportPage<T>>(path, {
    method: METHODS.POST,
    data: query,
  })
}

export const downloadOperationalReport = async (
  path: string,
  query: OperationalReportQuery,
  fileName: string,
) => {
  const client = createAPIClient(BASE_URL, getCookie(TOKEN), getCookie(REFRESH_TOKEN))
  const response = await client.post(`${path}/export`, query, { responseType: 'blob' })
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export type OperationalReportResponse<T> = IGenericResponse<OperationalReportPage<T>>
