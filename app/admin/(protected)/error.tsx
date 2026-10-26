"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="admin-panel admin-error-panel" role="alert">
      <p className="admin-kicker">Admin / Error</p>
      <h1>Something went wrong.</h1>
      <p>
        The admin screen could not finish loading. Check the Supabase
        configuration and try again.
      </p>
      <button className="admin-button" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
