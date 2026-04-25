"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h2 className="text-2xl font-semibold">Application error</h2>
          <p className="text-sm text-slate-300">
            {error.message || "An unexpected error occurred while loading the app."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
