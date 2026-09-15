import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MonoArchitect",
  description: "Architecture design and planning tool",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col relative">
        {/* Ambient mesh glow */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[60vw] rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[15%] h-[70vh] w-[50vw] rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute -bottom-[30%] left-[30%] h-[60vh] w-[50vw] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
