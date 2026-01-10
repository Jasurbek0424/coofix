import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Redirect to orders page by default
  redirect("/profile/orders");
}

