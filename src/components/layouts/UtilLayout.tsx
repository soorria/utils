import type { Util } from '~/lib/all-utils.server'
import MainLayout, { MainLayoutProps, MainHeading } from './MainLayout'
import { ParentComponent, splitProps } from 'solid-js'

export const UtilDescription: ParentComponent = props => {
  return <p>{props.children}</p>
}

export interface UtilLayoutProps extends MainLayoutProps {
  util: Util
}

const UtilLayout: ParentComponent<UtilLayoutProps> = _props => {
  const [local, props] = splitProps(_props, ['util', 'children'])
  return (
    <MainLayout {...props}>
      <MainHeading>{local.util.title}</MainHeading>
      <UtilDescription>{local.util.description}</UtilDescription>

      <noscript>
        <div class="h-48 text-xl font-bold grid place-items-center">
          <p>{local.util.title} requires javascript to be enabled.</p>
        </div>
      </noscript>

      {local.children}
    </MainLayout>
  )
}

export default UtilLayout
