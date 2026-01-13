import Contacts from "@/components/layout/Contacts";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function ContactsPage() {
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      <div className="flex-1">
        <Contacts />
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}