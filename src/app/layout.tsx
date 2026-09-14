import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonoArchitect",
  description: "Architecture design and planning tool",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
        {/* Ambient mesh glow */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[60vw] rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[15%] h-[70vh] w-[50vw] rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute -bottom-[30%] left-[30%] h-[60vh] w-[50vw] rounded-full bg-cyan-500/10 blur-[120px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[size:32px_32px] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
        </div>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
