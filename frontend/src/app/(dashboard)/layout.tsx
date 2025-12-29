import { ConditionalLayout } from "@/components/ConditionalLayout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-gray-50">
      <ConditionalLayout>{children}</ConditionalLayout>
    </div>
  );
}
