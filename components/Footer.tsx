import Image from "next/image";
import { site, mainSite } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-14 md:px-10">
      <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-3">
        <div>
          <Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={180} height={60} className="h-12 w-auto" />
          <p className="mt-4 text-sm text-mute">{site.tagline}</p>
        </div>
        <address className="text-sm not-italic text-mute">
          <p className="label mb-3">Visit or call</p>
          <p>{site.address}</p>
          <p className="mt-2">{site.phones.join(" · ")}</p>
          <p><a className="hover:text-cyan" href={`mailto:${site.email}`}>{site.email}</a></p>
        </address>
        <div className="text-sm">
          <p className="label mb-3">Follow</p>
          <ul className="space-y-2">
            {site.social.map((s) => (
              <li key={s.url}><a className="text-mute hover:text-cyan" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
            ))}
            <li><a className="text-mute hover:text-cyan" href={mainSite} target="_blank" rel="noopener noreferrer">setmiindia.com</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
