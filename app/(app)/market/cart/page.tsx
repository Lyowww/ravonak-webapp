import { redirect } from "next/navigation";

export default function CartPage() {
  redirect("/market?sheet=cart");
}
