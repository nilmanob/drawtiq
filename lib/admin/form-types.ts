export type AdminFormFieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "json";

export type AdminFormField = {
  name: string;
  label: string;
  type: AdminFormFieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  fullWidth?: boolean;
  mono?: boolean;
};
