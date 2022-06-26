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

          <div className="space-y-4">
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
            {endpoint.request.note ? (
              <div className="p-4 bg-base-300 space-y-2 rounded-box">
                <div className="font-display font-bold">
                  {endpoint.request.note.title || 'Note'}
                </div>
                <div>{endpoint.request.note.body}</div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
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
                  <td>
                    <div className="space-y-6">
                      {status.description ? <p>{status.description}</p> : null}
                      {status.example ? (
                        <div className="space-y-4">
                          <p className="font-bold">Example:</p>
                          <pre className="p-4 overflow-x-auto bg-base-300 rounded-box max-w-full">
                            <code>{wrapExample(status.example)}</code>
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            />
          </div>
        </div>
      ))}
    </MinimalSection>
  )
}

const wrapExample = (ex: ReactNode) => {
  if (React.isValidElement(ex)) return ex
  if (typeof ex === 'string') return <code>{ex}</code>
  return null
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
