import OrgPresenceTracker from "@/components/OrgPresenceTracker";

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OrgPresenceTracker />
      {children}
    </>
  );
}
