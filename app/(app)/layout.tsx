import Sidebar from "../components/layout/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      {children}
    </div>
  );
}

