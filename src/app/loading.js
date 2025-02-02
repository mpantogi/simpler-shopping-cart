export default function Loading() {
  return (
    <main className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      <h1 className="text-2xl font-semibold">Loading...</h1>
    </main>
  );
}
