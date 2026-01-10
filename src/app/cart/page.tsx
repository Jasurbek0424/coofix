
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CartItems from "@/components/ui/CartItems/CartItems";

export default function CartPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <CartItems />
      <Footer />
    </div>
  );
}