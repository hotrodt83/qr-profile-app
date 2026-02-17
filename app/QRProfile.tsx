"use client";

import React from "react";
import { useRouter } from "next/navigation";
import HologramQR from "./components/HologramQR";

export default function QRProfile({ value }: { value: string }) {
  const router = useRouter();

  return (
    <HologramQR
      value={value}
      onQrClick={() => router.push("/edit")}
    />
  );
}
