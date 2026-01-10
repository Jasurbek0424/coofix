
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import FavoriteItems from "@/components/ui/FavoriteItems/FavoriteItems";

export default function FavoritesPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <FavoriteItems />
      <Footer />
    </div>
  );
}