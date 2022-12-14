import { ParentComponent, Show } from 'solid-js'

const Line = () => (
  <div role="presentation" class="flex items-center">
    <div class="h-px bg-base-content/25 flex-1" />
  </div>
)

const Divider: ParentComponent = props => {
  return (
    <Show when={props.children} fallback={<Line />}>
      <div
        class="grid gap-4 px-4"
        style={{ 'grid-template-columns': '1fr auto 1fr' }}
      >
        <Line />
        <div class="italic text-sm">{props.children}</div>
        <Line />
      </div>
    </Show>
  )
}

export default Divider
