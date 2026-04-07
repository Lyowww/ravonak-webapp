import { RavonakProvider } from "@/context/RavonakContext";
import { AppShell } from "@/app/components/ravonak/AppShell";
import { ToastProvider } from "@/app/components/ravonak/ToastProvider";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RavonakProvider>
      <ToastProvider>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </RavonakProvider>
  );
}
