import { Suspense } from "react";
import TopUpOperatorClient from "./TopUpOperatorClient";

export default function TopUpOperatorPage() {
  return (
    <Suspense fallback={<div className="min-h-[50dvh] bg-white" />}>
      <TopUpOperatorClient />
    </Suspense>
  );
}
