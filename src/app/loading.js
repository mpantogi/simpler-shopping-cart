export default function Loading() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Loading Products...</h1>
      <div className="flex gap-4">
        <div className="w-40 h-40 bg-gray-200 animate-pulse" />
        <div className="w-40 h-40 bg-gray-200 animate-pulse" />
        <div className="w-40 h-40 bg-gray-200 animate-pulse" />
      </div>
    </main>
  );
}
