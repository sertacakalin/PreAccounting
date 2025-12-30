export function Placeholder({ title }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <p className="text-muted-foreground">
        This page is under construction. Use React Query + React Hook Form to build the full features.
      </p>
    </div>
  )
}
