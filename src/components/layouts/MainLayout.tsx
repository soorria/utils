import { ComponentProps, ParentComponent, splitProps } from 'solid-js'
import { cx } from '~/lib/utils'

export const MainHeading: ParentComponent = props => {
  return <h1 class="text-5xl mt-8 scroll-mt-8">{props.children}</h1>
}

export type MainLayoutProps = ComponentProps<'main'>

const MainLayout: ParentComponent<MainLayoutProps> = props => {
  const [local, delegated] = splitProps(props, ['class'])

  return <main class={cx('space-y-8 flex-1', local.class)} {...delegated} />
}

export default MainLayout
