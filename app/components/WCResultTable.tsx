import type { ReactNode } from 'react'
import { capitalise, cx, PartiallyOptional } from '~/lib/utils'
import type { DoWCResult, WC } from '~/lib/wc'

const formatOrder: Array<keyof WC> = [
  'bytes',
  'chars',
  'words',
  'lines',
  'readingTime',
]

const formattedNames: Partial<Record<keyof WC, string>> = {
  readingTime: 'Reading Time',
}
const getFormattedName = (name: keyof WC) => {
  return formattedNames[name] ?? capitalise(name)
}

const WCResultTable: React.FC<DoWCResult> = ({ files, total, text }) => {
  return (
    <section>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>input</th>
              {formatOrder.map(name => (
                <th key={name} className="text-right">
                  {getFormattedName(name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {text ? (
              <tr>
                <td>text input</td>
                {formatOrder.map(name => (
                  <td key={name}>{text[name]}</td>
                ))}
              </tr>
            ) : null}

            {files.map(({ name, wc }) => (
              <tr key={name}>
                <td>
                  file <code>{name}</code>
                </td>
                {formatOrder.map(name => (
                  <td key={name} className="text-right">
                    {wc[name]}
                  </td>
                ))}
              </tr>
            ))}

            <tr className="font-bold">
              <td>total</td>
              {formatOrder.map(name => (
                <td key={name}>{name !== 'readingTime' ? total[name] : ''}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default WCResultTable
