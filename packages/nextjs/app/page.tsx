"use client";

import TokenMinter from "~~/components/TokenMinter";

export default function Home() {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <TokenMinter />
    </div>
  );
}