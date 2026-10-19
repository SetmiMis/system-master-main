import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

/** Header for the regular pages. Same gradient bar as the reference site; the home film has its own. */
export function Header() {
  return (
    <header className="header-gradient sticky top-0 z-40 shadow-[0_6px_20px_-12px_rgba(1,53,86,0.8)]">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-3 px-6">
        <Link href="/" aria-label="SETMI INDIA home"><Image src="/brand/setmi-logo.png" alt="SETMI INDIA" width={130} height={43} priority className="h-8 w-auto" /></Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
          <Link href="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-white/80 hover:text-white sm:flex"><Play size={14} aria-hidden /> Film</Link>
          <Link href="/products" className="rounded-lg px-3 py-2 text-white/80 hover:text-white">Products</Link>
          <Link href="/expo" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white md:block">Expos</Link>
          <Link href="/faq" className="hidden rounded-lg px-3 py-2 text-white/80 hover:text-white md:block">FAQ</Link>
          <Link href="/enquiry" className="btn !min-h-9 !border-white !bg-white !text-[#013556]">Enquire</Link>
        </nav>
      </div>
    </header>
  );
}
