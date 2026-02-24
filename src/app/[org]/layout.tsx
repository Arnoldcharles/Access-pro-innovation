import OrgPresenceTracker from "@/components/OrgPresenceTracker";
import OrgPlanExpiryNotice from "@/components/OrgPlanExpiryNotice";
import OrgProWelcomeModal from "@/components/OrgProWelcomeModal";

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OrgPresenceTracker />
      <OrgPlanExpiryNotice />
      <OrgProWelcomeModal />
      {children}
    </>
  );
}
