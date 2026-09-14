import { Sidebar } from "@/components/dashboard/sidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar projects={projects} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
