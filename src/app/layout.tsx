import type { Metadata } from "next";
import localFont from "next/font/local";
import { Anton, Space_Mono } from "next/font/google";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OFF UP",
  description: "오프라인 팝업·축제·신규 브랜드 알림과 온라인 핫딜을 한 곳에 모은 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${anton.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
