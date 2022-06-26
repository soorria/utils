import type { ReactNode } from 'react'

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export enum ContentType {
  APPLICATION_JSON = 'application/json',
  MULTIPART_FORMDATA = 'multipart/form-data',
}

export enum ParamSource {
  PATH = 'path',
  QUERY = 'query',
  FORMDATA = 'formdata',
  JSON = 'json',
}

export type ApiRefSchema = {
  title?: ReactNode
  endpoints: ApiRefEndpoint[]
}

export type ApiRefEndpoint = {
  path: string
  method: HttpMethod
  request: {
    contentType: ContentType
    params: {
      name: string
      source: ParamSource
      description: ReactNode
    }[]
    note?: {
      title?: ReactNode
      body: ReactNode
    }
  }
  response: {
    contentType: ContentType
    statuses: {
      code: number
      description?: ReactNode

      example?: ReactNode
    }[]
  }
}
