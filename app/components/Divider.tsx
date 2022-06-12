const Divider: React.FC = ({ children }) => {
  const line = (
    <div role="presentation" className="flex items-center">
      <div className="h-px bg-base-content/25 flex-1" />
    </div>
  )

  if (!children) return line

  return (
    <div className="grid gap-4 px-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      {line}
      <div className="italic text-sm">{children}</div>
      {line}
    </div>
  )
}

export default Divider
