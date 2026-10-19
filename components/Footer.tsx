import Image from "next/image";
import Link from "next/link";
import { site, mainSite } from "@/content/site";

export function Footer() {
  return (
    <footer className="theme-dark px-6 py-12">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-4">
        <div>
          <Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={180} height={60} className="h-11 w-auto" />
          <p className="mt-3 text-sm text-ink-dim">{site.tagline}</p>
        </div>
        <address className="text-sm not-italic text-ink-dim md:col-span-2">
          <p className="eyebrow mb-3">Visit or call</p>
          <p>{site.address}</p>
          <p className="mt-2">{site.phones.join(" · ")}</p>
          <p><a className="hover:text-ink" href={`mailto:${site.email}`}>{site.email}</a></p>
        </address>
        <div className="text-sm">
          <p className="eyebrow mb-3">More</p>
          <ul className="space-y-2 text-ink-dim">
            <li><Link className="hover:text-ink" href="/faq">Questions & answers</Link></li>
            {site.social.map((s) => <li key={s.url}><a className="hover:text-ink" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
            <li><a className="hover:text-ink" href={mainSite} target="_blank" rel="noopener noreferrer">setmiindia.com</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
