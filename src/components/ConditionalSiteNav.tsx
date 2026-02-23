"use client";

import { usePathname } from "next/navigation";
import SiteNav from "./SiteNav";
import { shouldHideGlobalChrome } from "./chromeVisibility";

export default function ConditionalSiteNav() {
  const pathname = usePathname();
  const hideNav = shouldHideGlobalChrome(pathname);

  if (hideNav) {
    return null;
  }

  return <SiteNav />;
}
