
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CompareItems from "@/components/ui/CompareItems/CompareItems";

export default function ComparePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <CompareItems />
      <Footer />
    </div>
  );
}