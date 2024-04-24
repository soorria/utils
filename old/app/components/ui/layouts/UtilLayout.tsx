import type { Util } from '~/lib/all-utils.server'
import MainHeading from '../MainHeading'
import MainLayout, { MainLayoutProps } from './MainLayout'
import UtilDescription from '../UtilDescription'

export interface UtilLayoutProps extends MainLayoutProps {
  util: Util
}

const UtilLayout = ({ util, children, ...props }: UtilLayoutProps) => {
  return (
    <MainLayout {...props}>
      <MainHeading>{util.title}</MainHeading>
      <UtilDescription>{util.description}</UtilDescription>

      <noscript>
        <div className="h-48 text-xl font-bold grid place-items-center">
          <p>{util.title} requires javascript to be enabled.</p>
        </div>
      </noscript>

      {children}
    </MainLayout>
  )
}

export default UtilLayout
