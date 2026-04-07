import { redirect } from "next/navigation";

export default function VerifyPage() {
  redirect("/?sheet=auth-sms");
}
