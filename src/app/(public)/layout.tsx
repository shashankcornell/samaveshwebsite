import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ScrollProgress } from "@/components/public/ScrollProgress";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <ScrollProgress />
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
