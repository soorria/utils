import { JSXElement, Show, VoidComponent, For, mergeProps } from 'solid-js'
import { cx } from '~/lib/utils'
import BaseSection from '../ui/sections/BaseSection'
import type { ApiRefSchema, ContentType } from './types'
import {
  contentTypeToDisplay,
  httpMethodToColorClasses,
  paramSourceToDisplayText,
} from './utils'

interface ApiRefProps {
  id?: string
  schema: ApiRefSchema
}

export const ApiRef: VoidComponent<ApiRefProps> = _props => {
  const props = mergeProps({ id: 'api' }, _props)
  return (
    <BaseSection
      title={
        <>
          {props.schema.title || 'Api Reference'}
          <a
            href={`#${props.id}`}
            class="heading-anchor"
            aria-hidden="true"
            tabIndex={-1}
          />
        </>
      }
      variant="MINIMAL"
      id={props.id}
    >
      <For each={props.schema.endpoints}>
        {endpoint => (
          <div class="space-y-6">
            <h3 class="space-x-4 text-xl relative flex items-center">
              <span
                class={cx(
                  'uppercase py-1 px-2 rounded text-base',
                  httpMethodToColorClasses(endpoint.method)
                )}
              >
                {endpoint.method}
              </span>
              <span class="font-mono">{endpoint.path}</span>
            </h3>

            <div class="space-y-4">
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
                body={
                  <For each={endpoint.request.params}>
                    {param => (
                      <tr>
                        <td>{param.name}</td>
                        <td>{paramSourceToDisplayText(param.source)}</td>
                        <td>{param.description}</td>
                      </tr>
                    )}
                  </For>
                }
              />
              <Show when={endpoint.request.note} keyed>
                {note => (
                  <div class="p-4 bg-base-300 space-y-2 rounded-box">
                    <div class="font-display font-bold">
                      {note.title || 'Note'}
                    </div>
                    <div>{note.body}</div>
                  </div>
                )}
              </Show>
            </div>

            <div class="space-y-4">
              <RequestResponseHeader
                title="Response"
                contentType={endpoint.response.contentType}
              />
              <Table
                head={
                  <tr>
                    <th>Status Code</th>
                    <th>Description</th>
                  </tr>
                }
                body={
                  <For each={endpoint.response.statuses}>
                    {status => (
                      <tr>
                        <td>{status.code}</td>
                        <td>
                          <div class="space-y-6">
                            <Show when={status.description}>
                              <p>{status.description}</p>
                            </Show>
                            <Show when={status.example}>
                              <div class="space-y-4">
                                <p class="font-bold">Example:</p>
                                <pre class="p-4 overflow-x-auto bg-base-300 rounded-box max-w-full">
                                  {status.example}
                                  {/* <code>{wrapExample(status.example)}</code> */}
                                </pre>
                              </div>
                            </Show>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                }
              />
            </div>
          </div>
        )}
      </For>
    </BaseSection>
  )
}

const wrapExample = (ex: JSXElement) => {
  if (ex instanceof HTMLElement) return ex
  if (typeof ex === 'string') return <code>{ex}</code>
  return null
}

const RequestResponseHeader: VoidComponent<{
  title: string
  contentType?: ContentType
}> = props => (
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end">
    <h4 class="text-lg">{props.title}</h4>
    <Show when={props.contentType} keyed>
      {contentType => (
        <div class="font-mono">
          Content-Type: {contentTypeToDisplay(contentType)}
        </div>
      )}
    </Show>
  </div>
)

const Table: VoidComponent<{ head: JSXElement; body: JSXElement }> = props => (
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>{props.head}</thead>
      <tbody>{props.body}</tbody>
    </table>
  </div>
)
