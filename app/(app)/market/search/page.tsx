import { Suspense } from "react";
import MarketSearchClient from "./MarketSearchClient";

export default function MarketSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[50dvh] bg-white" />}>
      <MarketSearchClient />
    </Suspense>
  );
}
