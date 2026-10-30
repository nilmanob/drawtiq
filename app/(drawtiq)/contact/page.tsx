import Link from "next/link";
import { getContactFormFields, getContactSettings, type ContactFormField } from "@/lib/content/cms";
import { CONTACT_FIELD_FALLBACKS } from "@/lib/content/contact-fallbacks";
import { getPageSeo, pageContent } from "@/lib/content/page-content";
import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, { data: cms }] = await Promise.all([getPageSeo("contact"), getContactSettings()]);
  return pageSeo({
    title: seo.title || "Contact",
    description:
      seo.description ||
      cms?.hero_lead ||
      "Start a conversation with Drawtiq about UI/UX design, branding, or graphic design.",
    alternates: { canonical: "/contact" },
  });
}

export default async function ContactPage() {
  const [{ data: cms }, { data: configuredFields }, nextSteps] = await Promise.all([
    getContactSettings(),
    getContactFormFields(),
    pageContent("contact", "next-steps", {
      label: "WHAT HAPPENS NEXT",
      steps: [
        "We read your note properly.",
        "You get a reply within two working days.",
        "If it fits, we set up a short call.",
      ],
    }),
  ]);
  const fields = configuredFields.length ? configuredFields : CONTACT_FIELD_FALLBACKS;
  const content = {
    heroEyebrow: cms?.hero_eyebrow || "06 / Start a conversation",
    heroHeading: cms?.hero_heading || "Have a good idea?<br /><em>Let’s make it work.</em>",
    heroLead: cms?.hero_lead || "Tell us what you’re working on. We’ll reply within two business days with a few honest questions and a clear next step.",
    copyEyebrow: cms?.copy_eyebrow || "Your turn",
    copyHeading: cms?.copy_heading || "Good things start with <em>a note.</em>",
    copyParagraph: cms?.copy_paragraph || "You don’t need a perfect brief. A little context about the idea, the challenge, and what success could look like is a great place to start.",
    emailLabel: cms?.email_label || "EMAIL US",
    email: cms?.email_address || "contact@drawtiq.com",
    formHeading: cms?.form_heading || "PROJECT INQUIRY / 001",
    formSubheading: cms?.form_subheading || "Share as much or as little as you know. A sentence is enough.",
    submitLabel: cms?.submit_label || "Send inquiry",
    hint: cms?.hint_text || "We use these details only to reply to your inquiry. Files are not uploaded; we’ll request a brief by email if needed.",
  };
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {content.heroEyebrow}
        </p>
         <h1 dangerouslySetInnerHTML={{ __html: content.heroHeading }} />
        <p className="lead">
          {content.heroLead}
        </p>
      </section>

      <section className="section-wrap contact-page-grid">
        <div className="contact-page-copy">
           <p className="eyebrow">{content.copyEyebrow}</p>
           <h2 dangerouslySetInnerHTML={{ __html: content.copyHeading }} />
           <p>{content.copyParagraph}</p>
          <div className="contact-detail">
             <span className="mono">{content.emailLabel}</span>
             <a href={`mailto:${content.email}`}>{content.email} ↗</a>
          </div>
          <div className="contact-detail">
            <span className="mono">{nextSteps.label}</span>
            <ol className="contact-steps">
              {(nextSteps.steps as string[]).map((step) => (
                <li key={step}><span>{step}</span></li>
              ))}
            </ol>
          </div>
        </div>

        <form className="contact-form-page" id="project-form" method="post" action="/api/inquiries">
          <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <div className="form-heading">
             <span className="mono">{content.formHeading}</span>
             <span>{content.formSubheading}</span>
          </div>

          <div className="form-two">
            {fields.filter((field) => field.field_type === "text" || field.field_type === "email").map((field) => <ContactField key={field.id} field={field} />)}
          </div>
          <div className="form-two">
            {fields.filter((field) => field.field_type === "select").map((field) => <ContactField key={field.id} field={field} />)}
          </div>
          {fields.filter((field) => !["text", "email", "select"].includes(field.field_type)).map((field) => <ContactField key={field.id} field={field} />)}

          <button className="button button-accent form-submit" type="submit">
             {content.submitLabel} <span>↗</span>
          </button>
          <p className="form-hint" id="form-hint" role="status" aria-live="polite">
             {content.hint}
          </p>
        </form>
      </section>
    </main>
  );
}

function ContactField({ field }: { field: ContactFormField }) {
  const options = field.options.filter((option): option is string => typeof option === "string");
  const required = field.is_required;
  return <label>{field.field_label}
    {field.field_type === "textarea" ? <textarea name={field.field_name} rows={4} placeholder={field.placeholder || undefined} required={required} /> :
      field.field_type === "select" ? <select name={field.field_name} required={required} defaultValue=""><option value="" disabled={required}>{field.placeholder || "Select an option"}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> :
      <input name={field.field_name} type={field.field_type} placeholder={field.placeholder || undefined} required={required} accept={field.field_type === "file" ? ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" : undefined} />}
  </label>;
}
