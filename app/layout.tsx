import type { Metadata } from "next";
import { Sarala } from "next/font/google";
import "./globals.css";

const sarala = Sarala({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-sarala",
});

export const metadata: Metadata = {
  title: "Twibby - A Twitter-like Social Platform",
  description: "Connect, share, and discover on Twibby",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sarala.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
