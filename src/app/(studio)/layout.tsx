export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full-screen layout — no sidebar, no chrome
  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
}
