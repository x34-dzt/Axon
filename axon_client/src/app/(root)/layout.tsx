import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "../prosemirror.css";
import Navbar from "@/components/navbar/navabar";
import ReactQueryProvider from "@/utils/providers/ReactQueryProvider";
import Auth from "@/components/auth/Auth";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axon",
  description: "An all in one AI powered digital workspace for taking notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-white flex`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* top loader to show the loading of page */}
          <NextTopLoader
            color="#ffffff"
            shadow="0 4px 20px #ffffff"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            template='<div class="bar" role="bar"><div class="peg"></div></div> 
					<div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
            zIndex={10000000000000}
            showAtBottom={false}
          />
          <ReactQueryProvider>
            <Auth />
            <Navbar />
            {children}
          </ReactQueryProvider>
          <Toaster className="border-neutral-500 bg-customPrimary backdrop-blur-xl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
