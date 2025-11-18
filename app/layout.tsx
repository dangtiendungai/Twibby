import type { Metadata } from "next";
import { Sarala } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      <body className={`${sarala.variable} font-sans antialiased`}>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastClassName="dark:bg-gray-800 dark:text-gray-100 !font-sans"
        />
      </body>
    </html>
  );
}
