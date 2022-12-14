import { Component, For, JSXElement, Show } from 'solid-js'
import type { SizeFormats, SizesResult } from '~/lib/sizes.server'
import { capitalise, cx, humanFileSize } from '~/lib/utils'

const formatOrder: Record<SizeFormats, number> = {
  initial: 1,
  deflate: 2,
  gzip: 3,
  brotli: 4,
}

const getFormatOrder = (a: string, b: string): number => {
  const aOrder = a in formatOrder ? formatOrder[a as SizeFormats] : 999
  const bOrder = b in formatOrder ? formatOrder[b as SizeFormats] : 999

  if (aOrder > bOrder) return 1
  if (aOrder < bOrder) return -1

  if (a > b) return 1
  if (a < b) return -1
  return 0
}

const SizeAndSavings: Component<{ size: number; initial?: number }> = props => {
  const savings = () =>
    props.size >= 0 && props.initial ? 1 - props.size / props.initial : null

  return (
    <>
      {props.size >= 0 ? (
        `${humanFileSize(props.size)} / ${props.size} B`
      ) : (
        <span class="text-error">ERROR</span>
      )}
      <Show when={savings()} keyed>
        {savings => (
          <span
            class={cx(
              savings > 0
                ? 'text-success'
                : savings === 0
                ? 'text-warning'
                : 'text-error'
            )}
          >
            &nbsp;({(savings * 100).toFixed(2)}%
            <span class="sr-only sm:not-sr-only"> savings</span>)
          </span>
        )}
      </Show>
    </>
  )
}

const SizesResultTable: Component<{
  title: JSXElement
  sizes: SizesResult
}> = props => {
  return (
    <section>
      <h3 class="text-xl mb-4">{props.title}</h3>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>format</th>
              <th>size</th>
            </tr>
          </thead>
          <tbody>
            <For
              each={Object.entries(props.sizes).sort(([formatA], [formatB]) =>
                getFormatOrder(formatA, formatB)
              )}
            >
              {([format, size]) => (
                <tr class="hover">
                  <td>{capitalise(format)}</td>
                  <td>
                    <SizeAndSavings
                      size={size}
                      initial={
                        format === 'initial' ? undefined : props.sizes.initial
                      }
                    />
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SizesResultTable
