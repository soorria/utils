import type { ReactNode } from 'react'
import { cx } from '~/lib/utils'
import MinimalSection from '../ui/sections/MinimalSection'
import type { ApiRefSchema, ContentType } from './types'
import { contentTypeToDisplay, httpMethodToColorClasses, paramSourceToDisplayText } from './utils'

interface ApiRefProps {
  id?: string
  schema: ApiRefSchema
}

export const ApiRef: React.FC<ApiRefProps> = ({ id = 'api', schema }) => {
  return (
    <MinimalSection
      title={
        <>
          {schema.title || 'Api Reference'}
          <a href={`#${id}`} className="heading-anchor" aria-hidden="true" tabIndex={-1} />
        </>
      }
      id={id}
    >
      {schema.endpoints.map(endpoint => (
        <div className="space-y-6" key={endpoint.method + endpoint.path}>
          <h3 className="space-x-4 text-xl relative flex items-center">
            <span
              className={cx(
                'uppercase py-1 px-2 rounded text-base',
                httpMethodToColorClasses(endpoint.method)
              )}
            >
              {endpoint.method}
            </span>
            <span className="font-mono">{endpoint.path}</span>
          </h3>

          <RequestResponseHeader
            title="Request Parameters"
            contentType={endpoint.request.contentType}
          />
          <Table
            head={
              <tr>
                <th>Parameter</th>
                <th>Source</th>
                <th>Description</th>
              </tr>
            }
            body={endpoint.request.params.map(param => (
              <tr key={param.name}>
                <td>{param.name}</td>
                <td>{paramSourceToDisplayText(param.source)}</td>
                <td>{param.description}</td>
              </tr>
            ))}
          />

          <RequestResponseHeader title="Response" contentType={endpoint.response.contentType} />
          <Table
            head={
              <tr>
                <th>Status Code</th>
                <th>Description</th>
              </tr>
            }
            body={endpoint.response.statuses.map(status => (
              <tr key={status.code}>
                <td>{status.code}</td>
                <td>{status.description}</td>
              </tr>
            ))}
          />
        </div>
      ))}
    </MinimalSection>
  )
}

const RequestResponseHeader: React.FC<{ title: string; contentType?: ContentType }> = ({
  title,
  contentType,
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
    <h4 className="text-lg">{title}</h4>
    {typeof contentType !== 'undefined' && (
      <div className="font-mono">Content-Type: {contentTypeToDisplay(contentType)}</div>
    )}
  </div>
)

const Table: React.FC<{ head: ReactNode; body: ReactNode }> = ({ head, body }) => (
  <div className="overflow-x-auto">
    <table className="table w-full">
      <thead>{head}</thead>
      <tbody>{body}</tbody>
    </table>
  </div>
)
