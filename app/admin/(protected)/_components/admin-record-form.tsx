"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminActionResult } from "@/lib/admin/action-result";
import type { AdminFormField } from "@/lib/admin/form-types";

type AdminRecordFormProps = {
  action: (formData: FormData) => Promise<AdminActionResult>;
  deleteAction?: (id: string) => Promise<AdminActionResult>;
  fields: AdminFormField[];
  mode: "create" | "edit";
  recordId?: string;
  itemLabel: string;
  listHref: string;
  editHrefTemplate: string;
  saved?: boolean;
  hiddenFields?: Record<string, string>;
};

function fieldError(
  errors: Record<string, string[]>,
  name: string
): string | undefined {
  return errors[name]?.[0];
}

export function AdminRecordForm({
  action,
  deleteAction,
  fields,
  mode,
  recordId,
  itemLabel,
  listHref,
  editHrefTemplate,
  saved = false,
  hiddenFields,
}: AdminRecordFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [savedState, setSavedState] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSavedState(false);
    setError(null);
    setFieldErrors({});

    try {
      const result = await action(new FormData(event.currentTarget));

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (mode === "create") {
        const editHref = editHrefTemplate.replace("[id]", result.id);
        router.replace(`${editHref}${editHref.includes("?") ? "&" : "?"}saved=1`);
        router.refresh();
        return;
      }

      setSavedState(true);
      router.refresh();
    } catch {
      setError("The request failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!deleteAction || !recordId) {
      return;
    }

    if (!window.confirm(`Delete this ${itemLabel}? This cannot be undone.`)) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const result = await deleteAction(recordId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.replace(listHref);
      router.refresh();
    } catch {
      setError("The delete request failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-record-form" onSubmit={handleSubmit}>
      {recordId ? <input type="hidden" name="id" value={recordId} /> : null}
      {hiddenFields ? Object.entries(hiddenFields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />) : null}

      {savedState ? (
        <div className="admin-alert admin-alert-success" role="status">
          {itemLabel} saved.
        </div>
      ) : null}

      {error ? (
        <div className="admin-alert admin-alert-error" role="alert">
          <strong>Could not complete the request.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="admin-form-grid">
        {fields.map((field) => {
          const errorMessage = fieldError(fieldErrors, field.name);

          if (field.type === "checkbox") {
            return (
              <div
                className={`admin-form-field${field.fullWidth ? " is-full" : ""}`}
                key={field.name}
              >
                <label className="admin-check">
                  <input
                    type="checkbox"
                    name={field.name}
                    defaultChecked={Boolean(field.defaultValue)}
                  />
                  <span>{field.label}</span>
                </label>
                {field.hint ? (
                  <p className="admin-field-hint">{field.hint}</p>
                ) : null}
                {errorMessage ? (
                  <p className="admin-field-error">{errorMessage}</p>
                ) : null}
              </div>
            );
          }

          const inputClass = `admin-input${field.mono ? " admin-mono-input" : ""}${
            field.type === "json" ? " admin-json-input" : ""
          }`;

          return (
            <div
              className={`admin-form-field${field.fullWidth ? " is-full" : ""}`}
              key={field.name}
            >
              <label htmlFor={`field-${field.name}`}>
                {field.label}
                {field.required ? <span aria-hidden="true"> *</span> : null}
              </label>

              {field.type === "textarea" || field.type === "json" ? (
                <textarea
                  id={`field-${field.name}`}
                  className={inputClass}
                  name={field.name}
                  rows={field.rows ?? (field.type === "json" ? 10 : 4)}
                  required={field.required}
                  placeholder={field.placeholder}
                  defaultValue={String(field.defaultValue ?? "")}
                  spellCheck={field.type !== "json"}
                />
              ) : field.type === "select" ? (
                <select
                  id={`field-${field.name}`}
                  className={inputClass}
                  name={field.name}
                  required={field.required}
                  defaultValue={String(field.defaultValue ?? "")}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`field-${field.name}`}
                  className={inputClass}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  defaultValue={String(field.defaultValue ?? "")}
                  min={field.type === "number" ? 0 : undefined}
                />
              )}

              {field.hint ? (
                <p className="admin-field-hint">{field.hint}</p>
              ) : null}
              {errorMessage ? (
                <p className="admin-field-error">{errorMessage}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="admin-form-actions">
        <button className="admin-button" type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? `Create ${itemLabel}` : "Save changes"}
        </button>
        <Link className="admin-button admin-button-secondary" href={listHref}>
          Cancel
        </Link>
        {deleteAction && recordId ? (
          <button
            className="admin-button admin-button-danger"
            type="button"
            onClick={handleDelete}
            disabled={pending}
          >
            Delete {itemLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
}
