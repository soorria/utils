import type { Util } from '~/lib/all-utils.server'
import MainHeading from '../MainHeading'
import MainLayout from '../MainLayout'
import UtilDescription from '../UtilDescription'

interface UtilLayoutProps {
  util: Util
}

const UtilLayout: React.FC<UtilLayoutProps> = ({ util, children }) => {
  return (
    <MainLayout>
      <MainHeading>{util.title}</MainHeading>
      <UtilDescription>{util.description}</UtilDescription>
      {children}
    </MainLayout>
  )
}

export default UtilLayout
