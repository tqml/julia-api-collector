import { DiffViewer } from "@/components/diff-viewer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-10 mx-auto">
          <DiffViewer />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
