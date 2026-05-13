import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Gaegu } from "next/font/google";
import Header from "@/components/Header";
import MobileTabBar from "@/components/MobileTabBar";
import "./globals.css";

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gaegu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "영희네 작업실",
  description: "두 사람의 글과 사진이 만나는 곳",
  openGraph: {
    title: "영희네 작업실",
    description: "두 사람의 글과 사진이 만나는 곳",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSerif.variable} ${gaegu.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <div className="app">
          <Header />
          <main className="content">{children}</main>
          <MobileTabBar />
        </div>
      </body>
    </html>
  );
}
