
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import FavoriteItems from "@/components/ui/FavoriteItems/FavoriteItems";

export default function FavoritesPage() {
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      <div className="flex-1">
        <FavoriteItems />
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}