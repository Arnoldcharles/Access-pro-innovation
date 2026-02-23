const marketingRoutes = new Set([
  "",
  "benefits",
  "contact",
  "features",
  "gallery",
  "join",
  "onboarding",
  "pricing",
  "privacy",
  "security",
  "success-stories",
  "terms",
  "workflow",
]);

export function shouldHideGlobalChrome(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const hideByExactRoute = pathname === "/sign-in" || pathname === "/org-deleted";
  const isOrgRoute = !marketingRoutes.has(firstSegment);
  return pathname.startsWith("/onboarding") || hideByExactRoute || isOrgRoute;
}
