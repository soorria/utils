import type { ReactNode } from 'react'
import type { SizeFormats, Sizes } from '~/lib/sizes.server'
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

const SizeAndSavings: React.FC<{ size: number; initial?: number }> = ({
  size,
  initial,
}) => {
  const savings = size >= 0 && initial ? 1 - size / initial : null

  return (
    <>
      {size >= 0 ? (
        `${humanFileSize(size)} / ${size} B`
      ) : (
        <span className="text-error">ERROR</span>
      )}
      {savings !== null && (
        <span
          className={cx(
            savings > 0
              ? 'text-success'
              : savings === 0
              ? 'text-warning'
              : 'text-error'
          )}
        >
          &nbsp;({(savings * 100).toFixed(2)}%
          <span className="sr-only sm:not-sr-only"> savings</span>)
        </span>
      )}
    </>
  )
}

const SizesResultTable: React.FC<{ title: ReactNode; sizes: Sizes }> = ({
  title,
  sizes,
}) => {
  return (
    <section>
      <h3 className="text-xl mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>format</th>
              <th>size</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sizes)
              .sort(([formatA], [formatB]) => getFormatOrder(formatA, formatB))
              .map(([format, size]) => (
                <tr key={format} className="hover">
                  <td>{capitalise(format)}</td>
                  <td>
                    <SizeAndSavings
                      size={size}
                      initial={format === 'initial' ? undefined : sizes.initial}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SizesResultTable
