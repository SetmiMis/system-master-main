import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

const links = [
  { href: "/#who", label: "Who we are" },
  { href: "/#supply", label: "What we supply" },
  { href: "/#uses", label: "Where it is used" },
  { href: "/#process", label: "How we work" },
  { href: "/#faq", label: "Questions" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:px-10">
        <Link href="/" aria-label="SETMI INDIA home">
          <Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={140} height={46} priority className="h-9 w-auto" />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-mute lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-paper">{l.label}</Link>
          ))}
          <Link href="/products" className="transition-colors hover:text-paper">Products</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/#enquiry" className="btn btn-primary !min-h-10 !px-4">Enquire</Link>
          <details className="relative lg:hidden">
            <summary className="grid h-10 w-10 cursor-pointer place-items-center border border-line" aria-label="Menu">
              <Menu size={18} aria-hidden />
            </summary>
            <nav aria-label="Mobile" className="absolute right-0 mt-2 w-56 border border-line bg-panel p-2">
              {[...links, { href: "/products", label: "Products" }].map((l) => (
                <Link key={l.href} href={l.href} className="block px-3 py-3 text-sm hover:text-cyan">{l.label}</Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
