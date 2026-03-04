import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";
import { MobileTopBar } from "@/components/nav/MobileTopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-56 pb-20 md:pb-0">
        <MobileTopBar />
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
