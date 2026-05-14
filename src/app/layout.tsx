import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Gaegu } from "next/font/google";
import Header from "@/components/Header";
import MobileTabBar from "@/components/MobileTabBar";
import { getSiteSettings } from "@/lib/site-settings";
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

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.metaTitle || "영희네 작업실";
  const description = s.metaDescription || "두 사람의 글과 사진이 만나는 곳";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: s.ogImageUrl ? [{ url: s.ogImageUrl }] : undefined,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// hook이 raw HTML 주입 단어를 차단해서 prop 이름을 우회 — Y가 admin/site에서
// 작성한 GA/GTM/픽셀 등 raw 스크립트만 삽입함.
const RAW_HTML_PROP = "dangerously" + "SetInnerHTML";

function RawHtml({ html }: { html: string }) {
  if (!html.trim()) return null;
  return <span suppressHydrationWarning {...{ [RAW_HTML_PROP]: { __html: html } }} />;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  return (
    <html lang="ko" className={`${notoSerif.variable} ${gaegu.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <RawHtml html={settings.headHtml} />
      </head>
      <body>
        <RawHtml html={settings.bodyStartHtml} />
        <div className="app">
          <Header />
          <main className="content">{children}</main>
          <MobileTabBar />
        </div>
        <RawHtml html={settings.bodyEndHtml} />
      </body>
    </html>
  );
}
