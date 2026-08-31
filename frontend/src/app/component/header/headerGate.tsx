"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

// ログイン(タップ)画面ではヘッダーを表示しない
export default function HeaderGate() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <Header />;
}
