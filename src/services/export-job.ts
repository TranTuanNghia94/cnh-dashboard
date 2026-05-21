import { fetcherWithAuth, METHODS } from '@/lib/api'
import { URL_EXPORT_JOB_BY_ID, URL_EXPORT_JOBS } from '@/lib/url'
import type { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from '@/types/api'
import type { ICreateExportJobRequest, IExportJobResponse } from '@/types/export-job'

export const createExportJob = async (body: ICreateExportJobRequest) => {
  return fetcherWithAuth<string>(URL_EXPORT_JOBS, {
    method: METHODS.POST,
    data: body,
  })
}

export const getExportJobs = async (params?: Pick<IRequestPaginationAndSearch, 'page' | 'limit'>) => {
  return fetcherWithAuth<IResponsePaginationAndSearch<IExportJobResponse>>(URL_EXPORT_JOBS, {
    method: METHODS.GET,
    params: {
      page: params?.page ?? 0,
      limit: params?.limit ?? 20,
    },
  })
}

export const getExportJobById = async (jobId: string) => {
  return fetcherWithAuth<IExportJobResponse>(URL_EXPORT_JOB_BY_ID.replace('{jobId}', jobId), {
    method: METHODS.GET,
  })
}
