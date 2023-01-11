import env from '@beam-australia/react-env'
import {
  ClientCreateBody,
  DataFormats,
  DatasetInfoResponse,
  UpdateSubjectPermissionsBody,
  UpdateSubjectPermissionsResponse,
  UserCreateBody
} from './types'
import { api } from '@/lib/data-utils'

const API_URL = env('API_URL')

export const getPermissionsListUi = async (): Promise<{
  [key: string]: { [key: string]: string }[]
}> => {
  const res = await api(`${API_URL}/permissions_ui`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

export const getSubjectsListUi = async (): Promise<
  Array<Record<string, string | undefined>>
> => {
  const res = await api(`${API_URL}/subjects`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

export const getDatasetsUi = async (): Promise<{
  [key: string]: { dataset: string; version: string }[]
}> => {
  const res = await api(`${API_URL}/datasets_ui`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

export const getSubjectPermissions = async ({ queryKey }): Promise<string[]> => {
  const [_, subjectId] = queryKey
  const res = await api(`${API_URL}/permissions/${subjectId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

export const createClient = async ({
  path,
  data
}: {
  path: string
  data: ClientCreateBody | UserCreateBody
}) => {
  const res = await api(`${API_URL}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export const updateSubjectPermissions = async (
  data: UpdateSubjectPermissionsBody
): Promise<UpdateSubjectPermissionsResponse> => {
  const res = await api(`${API_URL}/subjects/permissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export const uploadDataset = async ({ path, data }: { path: string; data: FormData }) => {
  const res = await api(`${API_URL}/datasets/${path}`, {
    method: 'POST',
    body: data
  })
  return res.json()
}

export const getDatasetInfo = async ({ queryKey }): Promise<DatasetInfoResponse> => {
  const [_, domain, dataset, version] = queryKey
  const res = await api(
    `${API_URL}/datasets/${domain}/${dataset}/info?version=${version}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  )
  return res.json()
}

export const queryDataset = async ({
  path,
  dataFormat,
  data
}: {
  path: string
  dataFormat: DataFormats
  data: unknown
}) => {
  const acceptHeader = dataFormat === 'json' ? 'application/json' : 'text/csv'
  const res = await api(`${API_URL}/datasets/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: acceptHeader
    },
    body: JSON.stringify(data)
  })
  return res
}
