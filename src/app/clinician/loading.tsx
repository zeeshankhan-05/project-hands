export default function ClinicianLoading() {
  return (
    <main className="page-wrap py-10" aria-label="Loading research progress">
      <div className="h-14 w-72 animate-pulse rounded-2xl bg-black/8" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="surface h-36 animate-pulse bg-white/60" />)}
      </div>
      <div className="surface mt-7 h-96 animate-pulse bg-white/60" />
    </main>
  );
}
