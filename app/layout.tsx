import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mawuli Christoson | Web Developer & Designer",
  description:
    "Mawuli Christoson designs and builds digital products, websites, and visual identities that help businesses solve practical problems.",
  openGraph: {
    title: "Mawuli Christoson | Web Developer & Designer",
    description:
      "Digital products, websites, and visual identities built for practical impact.",
    type: "website",
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mawuli Christoson | Web Developer & Designer",
    description: "Digital products, websites, and visual identities from Accra, Ghana.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
