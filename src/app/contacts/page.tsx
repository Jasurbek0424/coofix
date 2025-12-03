import Contacts from "@/components/layout/Contacts";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function ContactsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <Contacts />
      <Footer />
    </div>
  );
}