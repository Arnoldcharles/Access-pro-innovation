import OrgPresenceTracker from "@/components/OrgPresenceTracker";
import OrgPlanExpiryNotice from "@/components/OrgPlanExpiryNotice";
import OrgProWelcomeModal from "@/components/OrgProWelcomeModal";
import OrgProDowngradeModal from "@/components/OrgProDowngradeModal";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrgPresenceTracker />
      <OrgPlanExpiryNotice />
      <OrgProWelcomeModal />
      <OrgProDowngradeModal />
      {children}
    </>
  );
}
