export default function Loading() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Loading Cart...</h1>
      <div className="mt-4 flex gap-4">
        <div className="w-40 h-20 bg-gray-200 animate-pulse" />
        <div className="w-40 h-20 bg-gray-200 animate-pulse" />
      </div>
    </main>
  );
}
