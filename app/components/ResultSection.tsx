import type { ReactNode } from 'react'
import type { SizeFormats, Sizes } from '~/lib/sizes.server'
import { capitalise } from '~/lib/utils'

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

const renderSize = (size: number): ReactNode =>
  size >= 0 ? size : <span className="text-error">ERROR</span>

const ResultSection: React.FC<{ title: ReactNode; sizes: Sizes }> = ({
  title,
  sizes,
}) => {
  return (
    <section>
      <h3 className="text-xl mb-4">{title}</h3>

      <table className="table w-full">
        <thead>
          <tr>
            <th>format</th>
            <th>size (bytes)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(sizes)
            .sort(([formatA], [formatB]) => getFormatOrder(formatA, formatB))
            .map(([format, size]) => (
              <tr key={format} className="hover">
                <td>{capitalise(format)}</td>
                <td>{renderSize(size)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  )
}

export default ResultSection
