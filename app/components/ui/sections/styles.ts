import { cx } from '~/lib/utils'

const rootMinimal = 'flex flex-col space-y-8'
export const classes = {
  rootMinimal,
  root: cx('p-4 md:p-8 border-2 rounded-btn', rootMinimal),
  title: 'text-3xl',
  childrenWrapper: 'space-y-6 flex-1',
  footer: 'text-center text-sm',
}
