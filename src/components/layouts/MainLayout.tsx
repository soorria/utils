import { ComponentProps, ParentComponent, splitProps } from 'solid-js'
import { cx } from '~/lib/utils'

export const MainHeading: ParentComponent = props => {
  return <h1 class="text-5xl mt-8 scroll-mt-8">{props.children}</h1>
}

export type MainLayoutProps = ComponentProps<'main'>

const MainLayout: ParentComponent<MainLayoutProps> = _props => {
  const [local, props] = splitProps(_props, ['class'])

  return <main class={cx('space-y-8 flex-1', local.class)} {...props} />
}

export default MainLayout
