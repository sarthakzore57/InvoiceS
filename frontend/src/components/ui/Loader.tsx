export default function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 dark:bg-slate-950">
      <div className="rounded-lg bg-white/80 p-6 text-center shadow-soft backdrop-blur dark:bg-slate-900">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
      </div>
    </div>
  );
}
