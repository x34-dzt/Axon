import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "../blog.css";
import ReactQueryProvider from "@/utils/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "axon blog",
  description: "An all in one AI powered digital workspace for taking notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
