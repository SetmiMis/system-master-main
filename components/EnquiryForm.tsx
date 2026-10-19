"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { site } from "@/content/site";

interface Props { options: { slug: string; title: string }[] }

export function EnquiryForm({ options }: Props) {
  const params = useSearchParams();
  // URL params seed the form; the visitor's own choice wins once made.
  const [pickedCategory, setCategory] = useState<string | null>(null);
  const [pickedKind, setKind] = useState<"enquiry" | "quote" | null>(null);
  const category = pickedCategory ?? params.get("category") ?? "";
  const kind = pickedKind ?? (params.get("kind") === "quote" ? "quote" : "enquiry");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const title = options.find((o) => o.slug === category)?.title ?? "";
  const wa = `https://api.whatsapp.com/send?phone=${site.whatsapp}&text=${encodeURIComponent(`Hello SETMI INDIA, I am interested in ${title || "your products"}.`)}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, category: title || "General", name: f.get("name"), contact: f.get("contact"), message: f.get("message"), website: f.get("website") }),
    }).catch(() => null);
    if (res?.ok) return setState("done");
    const body = await res?.json().catch(() => null);
    const fields = body?.fields ? Object.values(body.fields).flat().join(" ") : "";
    setError(fields || body?.error || "Network error. Please try WhatsApp, phone or email.");
    setState("error");
  }

  const input = "w-full border border-panel-line bg-transparent px-4 py-3 text-ink placeholder:text-ink-dim/70 focus:border-accent";

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h3 className="font-display text-3xl">Prefer to talk?</h3>
        <ul className="mt-6 space-y-4">
          <li><a className="btn w-full justify-start" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden /> WhatsApp +91 85868 78111</a></li>
          {site.phones.map((p) => (
            <li key={p}><a className="btn w-full justify-start" href={`tel:${p.replace(/\s/g, "")}`}><Phone size={16} aria-hidden /> {p}</a></li>
          ))}
          <li><a className="btn w-full justify-start" href={`mailto:${site.email}`}><Mail size={16} aria-hidden /> {site.email}</a></li>
        </ul>
        <p className="mt-6 text-sm text-ink-dim">{site.address}</p>
      </div>

      {state === "done" ? (
        <div role="status" className="border border-accent p-8">
          <p className="font-display text-3xl">Thank you.</p>
          <p className="mt-3 text-ink-dim">We received your message and will get back to you. For anything urgent, use WhatsApp or phone.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5" aria-describedby={error ? "form-error" : undefined}>
          <fieldset className="flex gap-2">
            <legend className="eyebrow mb-2">I would like to</legend>
            {(["enquiry", "quote"] as const).map((k) => (
              <label key={k} className={`btn cursor-pointer ${kind === k ? "border-accent text-accent" : ""}`}>
                <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                {k === "enquiry" ? "Make an enquiry" : "Request a quotation"}
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor="cat" className="eyebrow">Product area</label>
            <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)} className={`${input} mt-2`}>
              <option value="">Other / not sure</option>
              {options.map((o) => <option key={o.slug} value={o.slug}>{o.title}</option>)}
            </select>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div><label htmlFor="name" className="eyebrow">Name</label><input id="name" name="name" autoComplete="name" required className={`${input} mt-2`} /></div>
            <div><label htmlFor="contact" className="eyebrow">Phone or email</label><input id="contact" name="contact" autoComplete="email" required className={`${input} mt-2`} /></div>
          </div>
          <div>
            <label htmlFor="message" className="eyebrow">Your requirement</label>
            <textarea id="message" name="message" rows={5} required placeholder="Product, quantity, where it will be used" className={`${input} mt-2`} />
          </div>
          <div className="hidden" aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <p id="form-error" role="alert" className="text-sm text-critical">{error}</p>}
          <button className="btn btn-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send"}</button>
          <p className="text-xs text-ink-dim">We use your details only to reply to this enquiry.</p>
        </form>
      )}
    </div>
  );
}
