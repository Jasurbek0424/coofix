
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CompareItems from "@/components/ui/CompareItems/CompareItems";

export default function ComparePage() {
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      <div className="flex-1">
        <CompareItems />
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}