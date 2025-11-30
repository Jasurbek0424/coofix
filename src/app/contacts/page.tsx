import ThemeToggle from "@/components/ui/ToggleTheme/ThemeToggle";
import Contacts from "@/components/layout/Contacts";
import Footer from "@/components/layout/Footer";

export default function ContactsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-8 right-8 z-10">
        <ThemeToggle />
      </div>
      <Contacts />
      <Footer />
    </div>
  );
}