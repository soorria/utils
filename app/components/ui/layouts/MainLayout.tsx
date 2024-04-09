import type { HTMLAttributes } from 'react'
import { cx } from '~/lib/utils'

export type MainLayoutProps = HTMLAttributes<HTMLDivElement>

const MainLayout = ({ className, ...props }: MainLayoutProps) => {
  return <main className={cx('space-y-8 flex-1', className)} {...props} />
}

export default MainLayout
