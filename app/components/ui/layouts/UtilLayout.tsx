import type { Util } from '~/lib/all-utils.server'
import MainHeading from '../MainHeading'
import MainLayout, { MainLayoutProps } from './MainLayout'
import UtilDescription from '../UtilDescription'

export interface UtilLayoutProps extends MainLayoutProps {
  util: Util
}

const UtilLayout: React.FC<UtilLayoutProps> = ({ util, children, ...props }) => {
  return (
    <MainLayout {...props}>
      <MainHeading>{util.title}</MainHeading>
      <UtilDescription>{util.description}</UtilDescription>
      {children}
    </MainLayout>
  )
}

export default UtilLayout
