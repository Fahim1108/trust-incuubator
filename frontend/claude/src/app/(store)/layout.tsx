import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

/** Storefront chrome (header, footer, mobile nav). Admin routes live outside this group. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
