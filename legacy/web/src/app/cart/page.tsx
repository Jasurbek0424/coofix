
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CartItems from "@/components/ui/CartItems/CartItems";

export default function CartPage() {
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      <div className="flex-1">
      <CartItems />
      </div>
      <div className="mt-auto">
      <Footer />
      </div>
    </div>
  );
}