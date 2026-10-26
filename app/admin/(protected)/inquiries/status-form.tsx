"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

export function InquiryStatusForm({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    setError(null);

    try {
      const result = await updateInquiryStatus(new FormData(event.currentTarget));

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("The status update failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-status-form" onSubmit={handleSubmit}>
      <input name="id" type="hidden" value={id} />
      <label className="admin-status-label" htmlFor="inquiry-status">
        Status
      </label>
      <div className="admin-status-row">
        <select
          className="admin-input"
          defaultValue={status}
          id="inquiry-status"
          name="status"
          required
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="admin-button" disabled={pending} type="submit">
          {pending ? "Updating…" : "Update status"}
        </button>
      </div>
      {saved ? (
        <p className="admin-inline-success" role="status">
          Status updated.
        </p>
      ) : null}
      {error ? (
        <p className="admin-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
