export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100" />
        <div className="h-4 w-32 bg-neutral-200 rounded" />
      </div>
    </div>
  )
}
