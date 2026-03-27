export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="box-border flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden">
      {children}
    </div>
  );
}
