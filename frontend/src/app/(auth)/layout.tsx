import { DevModeBanner } from "@/components/dev/DevModeBanner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DevModeBanner />
    </>
  );
}
