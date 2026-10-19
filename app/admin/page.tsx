import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase-server";
import { deleteFaq, deleteSystem, saveCategory, saveFaq, saveScene, saveSystem, signOut } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const field = "mt-1 w-full border border-panel-line bg-transparent px-3 py-2 text-sm";
const Status = ({ v }: { v: string }) => (
  <select name="status" defaultValue={v} className={field} aria-label="Status"><option value="draft">draft (hidden)</option><option value="published">published</option></select>
);

export default async function Admin({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const db = await requireAdmin();
  const { m } = await searchParams;
  const [cats, faqs, scene, enq, systems] = await Promise.all([
    db.from("categories").select("*").order("sort"),
    db.from("faqs").select("*").order("sort"),
    db.from("scenes").select("*").eq("slug", "intro").maybeSingle(),
    db.from("enquiries").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("systems").select("*").order("sort"),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-16 px-5 py-12">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Content admin</h1>
        <form action={signOut}><button className="btn">Sign out</button></form>
      </header>
      {m && <p role="status" className="border border-accent p-3">{m}</p>}

      <section aria-labelledby="a-scene">
        <h2 id="a-scene" className="font-display text-3xl">Opening scene: video and captions</h2>
        {scene.data && (
          <form action={saveScene} className="mt-4 space-y-3">
            <input type="hidden" name="slug" value="intro" />
            <label className="eyebrow block">Video URL (https, MP4/WebM)<input name="video_url" defaultValue={scene.data.video_url ?? ""} className={field} /></label>
            <label className="eyebrow block">Poster image URL<input name="poster_url" defaultValue={scene.data.poster_url ?? ""} className={field} /></label>
            <label className="eyebrow block">Captions (WebVTT, whole-film timeline; leave empty to use the built-in captions)<textarea name="vtt" rows={10} defaultValue={scene.data.vtt ?? ""} className={`${field} font-mono`} /></label>
            <Status v={scene.data.status} />
            <button className="btn btn-primary">Save scene</button>
          </form>
        )}
      </section>

      <section aria-labelledby="a-sys">
        <h2 id="a-sys" className="text-2xl font-extrabold">Systems (shown on /systems and in the film)</h2>
        <div className="mt-4 space-y-4">
          {[...(systems.data ?? []), { id: "", name: "", description: "", url: "https://", grp: "", icon: "records", sort: systems.data?.length ?? 0, status: "draft" }].map((s) => (
            <div key={s.id || "new"} className="rounded-2xl border border-panel-line p-5">
              <form action={saveSystem} className="space-y-3">
                <input type="hidden" name="id" value={s.id} />
                <p className="eyebrow">{s.id ? s.name : "Add a new system"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="eyebrow block">Name<input name="name" required defaultValue={s.name} className={field} /></label>
                  <label className="eyebrow block">Link (https)<input name="url" type="url" required defaultValue={s.url} className={field} /></label>
                </div>
                <label className="eyebrow block">Short description<input name="description" required defaultValue={s.description} className={field} /></label>
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="eyebrow block">Group<input name="grp" required defaultValue={s.grp} placeholder="Sales & Orders" className={field} /></label>
                  <label className="eyebrow block">Icon<select name="icon" defaultValue={s.icon} className={field}>{["records", "truck", "success", "quality", "support", "shield", "handshake"].map((i) => <option key={i}>{i}</option>)}</select></label>
                  <label className="eyebrow block">Order<input name="sort" type="number" defaultValue={s.sort} className={field} /></label>
                  <Status v={s.status} />
                </div>
                <button className="btn btn-primary">{s.id ? "Save" : "Add system"}</button>
              </form>
              {s.id && <form action={deleteSystem} className="mt-3"><input type="hidden" name="id" value={s.id} /><button className="btn !border-critical text-critical">Delete</button></form>}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="a-cats">
        <h2 id="a-cats" className="font-display text-3xl">Product categories</h2>
        <div className="mt-4 space-y-6">
          {cats.data?.map((c) => (
            <form key={c.slug} action={saveCategory} className="space-y-3 border border-panel-line p-5">
              <input type="hidden" name="slug" value={c.slug} />
              <p className="eyebrow">{c.slug}</p>
              <label className="eyebrow block">Title<input name="title" defaultValue={c.title} className={field} /></label>
              <label className="eyebrow block">Summary<textarea name="summary" rows={2} defaultValue={c.summary} className={field} /></label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="eyebrow block">Range (one per line)<textarea name="family" rows={5} defaultValue={c.family.join("\n")} className={field} /></label>
                <label className="eyebrow block">Used for<textarea name="used_for" rows={5} defaultValue={c.used_for.join("\n")} className={field} /></label>
                <label className="eyebrow block">Examples<textarea name="examples" rows={5} defaultValue={c.examples.join("\n")} className={field} /></label>
              </div>
              <label className="eyebrow block">Image path or URL<input name="image_url" defaultValue={c.image_url ?? ""} className={field} /></label>
              <div className="grid grid-cols-2 gap-3"><label className="eyebrow block">Order<input name="sort" type="number" defaultValue={c.sort} className={field} /></label><Status v={c.status} /></div>
              <button className="btn">Save {c.title}</button>
            </form>
          ))}
        </div>
      </section>

      <section aria-labelledby="a-faq">
        <h2 id="a-faq" className="font-display text-3xl">FAQs</h2>
        <div className="mt-4 space-y-4">
          {[...(faqs.data ?? []), { id: "", question: "", answer: "", sort: (faqs.data?.length ?? 0), status: "draft" }].map((q) => (
            <div key={q.id || "new"} className="border border-panel-line p-5">
              <form action={saveFaq} className="space-y-3">
                <input type="hidden" name="id" value={q.id} />
                <p className="eyebrow">{q.id ? "Edit" : "Add new"}</p>
                <label className="eyebrow block">Question<input name="question" defaultValue={q.question} className={field} /></label>
                <label className="eyebrow block">Answer<textarea name="answer" rows={3} defaultValue={q.answer} className={field} /></label>
                <div className="grid grid-cols-2 gap-3"><label className="eyebrow block">Order<input name="sort" type="number" defaultValue={q.sort} className={field} /></label><Status v={q.status} /></div>
                <button className="btn">{q.id ? "Save" : "Add FAQ"}</button>
              </form>
              {q.id && <form action={deleteFaq} className="mt-3"><input type="hidden" name="id" value={q.id} /><button className="btn !border-critical text-critical">Delete</button></form>}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="a-enq">
        <h2 id="a-enq" className="font-display text-3xl">Latest enquiries</h2>
        <p className="mt-2 text-sm text-ink-dim">Retention: delete rows older than 12 months (see docs/MAINTENANCE.md).</p>
        <ul className="mt-4 divide-y divide-line border-y border-panel-line">
          {enq.data?.length ? enq.data.map((e) => (
            <li key={e.id} className="py-4 text-sm">
              <p><b>{e.name}</b> · {e.contact} · <span className="eyebrow">{e.kind} · {e.category} · {new Date(e.created_at).toLocaleString("en-IN")}</span></p>
              <p className="mt-1 whitespace-pre-wrap text-ink-dim">{e.message}</p>
            </li>
          )) : <li className="py-4 text-ink-dim">No enquiries yet.</li>}
        </ul>
      </section>
    </main>
  );
}
