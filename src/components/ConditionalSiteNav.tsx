"use client";

import { usePathname } from "next/navigation";
import SiteNav from "./SiteNav";

const marketingRoutes = new Set([
  "",
  "benefits",
  "contact",
  "features",
  "gallery",
  "join",
  "onboarding",
  "org-deleted",
  "pricing",
  "privacy",
  "security",
  "sign-in",
  "success-stories",
  "terms",
  "workflow",
]);

export default function ConditionalSiteNav() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const isOrgRoute = !marketingRoutes.has(firstSegment);
  const hideNav = pathname.startsWith("/onboarding") || isOrgRoute;

  if (hideNav) {
    return null;
  }

  return <SiteNav />;
}
