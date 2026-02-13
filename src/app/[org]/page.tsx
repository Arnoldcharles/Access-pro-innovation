"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type OrgData = {
  name?: string;
  slug?: string;
  plan?: 'free' | 'pro';
  ownerId?: string;
  blocked?: boolean;
};

type UserData = {
  name?: string;
  orgSlug?: string;
};

export default function OrgDashboardPage() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [events, setEvents] = useState<
    Array<{
      id: string;
      name?: string;
      date?: string;
      time?: string;
      location?: string;
      gatesOpen?: string;
      peakStart?: string;
      peakEnd?: string;
      avgScanSeconds?: number;
    }>
  >([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const [eventsUnsub, setEventsUnsub] = useState<null | (() => void)>(null);
  const [orgs, setOrgs] = useState<Array<{ slug: string; name?: string }>>([]);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [uid, setUid] = useState("");
  const siteOwnerUid = "krpJL2xq7Rf1NUumK3G6nzpZWsM2";
  const [orgPlan, setOrgPlan] = useState<"free" | "pro">("free");
  const isFree = orgPlan !== "pro";
  const maxEvents = 5;
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [blockedOrgOpen, setBlockedOrgOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [introCanSkip, setIntroCanSkip] = useState(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeIntro = () => {
    setIntroOpen(false);
    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/sign-in");
        return;
      }
      setUid(firebaseUser.uid);
      const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userSnap.exists() ? (userSnap.data() as UserData) : null;
      const userBlocked = userSnap.exists() ? Boolean((userSnap.data() as { blocked?: boolean }).blocked) : false;
      if (userBlocked) {
        setUpgradeOpen(false);
        await signOut(auth);
        router.replace("/sign-in");
        return;
      }
      setUser(userData);

      const slug = params?.org;
      if (!slug) return;

      const orgSnap = await getDoc(doc(db, "orgs", slug));
      if (!orgSnap.exists()) {
        router.replace("/onboarding");
        return;
      }
      const orgMeta = orgSnap.data() as { deletedAt?: unknown; blocked?: boolean };
      if (orgMeta?.deletedAt) {
        router.replace(`/org-deleted?org=${slug}`);
        return;
      }
      if (orgMeta?.blocked) {
        setBlockedOrgOpen(true);
        setTimeout(() => {
          if (orgs.length > 0) {
            router.replace(`/${orgs[0].slug}`);
          } else {
            router.replace("/onboarding");
          }
        }, 1200);
        return;
      }

      const orgData = orgSnap.data() as OrgData;
      setOrg(orgData);
      setOrgPlan(orgData.plan === "pro" ? "pro" : "free");
      if (typeof window !== "undefined") {
        const introKey = `ap:intro:${firebaseUser.uid}:${slug}`;
        const introEverKey = `ap:intro-ever:${firebaseUser.uid}:${slug}`;
        const seenIntro = window.sessionStorage.getItem(introKey) === "1";
        const seenEver = window.localStorage.getItem(introEverKey) === "1";
        if (!seenIntro) {
          window.sessionStorage.setItem(introKey, "1");
          if (!seenEver) window.localStorage.setItem(introEverKey, "1");
          setIntroCanSkip(seenEver);
          setIntroOpen(true);
          introTimerRef.current = setTimeout(() => {
            setIntroOpen(false);
            introTimerRef.current = null;
          }, 90000);
        } else {
          setIntroCanSkip(false);
          setIntroOpen(false);
        }
      }

      setLoading(false);
      setEventsLoading(true);
      if (eventsUnsub) eventsUnsub();
      const unsubEvents = onSnapshot(
        collection(db, "orgs", slug, "events"),
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as object),
          })) as Array<{
            id: string;
            name?: string;
            date?: string;
            time?: string;
            location?: string;
            gatesOpen?: string;
            peakStart?: string;
            peakEnd?: string;
            avgScanSeconds?: number;
          }>;
          setEvents(items);
          setEventsLoading(false);
        },
        (err) => {
          const code = (err as { code?: string }).code;
          if (code === "permission-denied") return;
          console.error(err);
        },
      );
      setEventsUnsub(() => unsubEvents);

      const orgsQuery = query(
        collection(db, "orgs"),
        where("ownerId", "==", firebaseUser.uid),
      );
      const unsubOrgs = onSnapshot(
        orgsQuery,
        (snapshot) => {
          const items = snapshot.docs
            .map((docSnap) => ({
              slug: docSnap.id,
              ...(docSnap.data() as object),
            }))
            .filter(
              (item) => !(item as { deletedAt?: unknown }).deletedAt,
            ) as Array<{ slug: string; name?: string }>;
          setOrgs(items);
        },
        (err) => {
          const code = (err as { code?: string }).code;
          if (code === "permission-denied") return;
          console.error(err);
        },
      );
      return () => {
        unsubOrgs();
      };
    });
    return () => {
      unsub();
      if (eventsUnsub) eventsUnsub();
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
  }, [params, router]);

  const handleSignOut = async () => {
    if (typeof window !== "undefined" && uid) {
      const keyPrefix = `ap:intro:${uid}:`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i += 1) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(keyPrefix)) keysToRemove.push(key);
      }
      keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    }
    await signOut(auth);
    router.replace("/sign-in");
  };

  const handleDeleteOrg = async () => {
    const orgSlug = params?.org;
    const currentUser = auth.currentUser;
    if (!orgSlug || !currentUser) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOrg = async () => {
    const orgSlug = params?.org;
    const currentUser = auth.currentUser;
    if (!orgSlug || !currentUser) return;
    const currentName = org?.name ?? orgSlug;
    const normalizedInput = deleteInput.trim().toLowerCase();
    const normalizedName = currentName.trim().toLowerCase();
    if (normalizedInput !== normalizedName) return;
    await updateDoc(doc(db, "orgs", orgSlug), { deletedAt: serverTimestamp() });
    const remainingOrgs = orgs.filter((item) => item.slug !== orgSlug);
    if (remainingOrgs.length === 0) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        orgSlug: null,
        orgName: null,
      });
      router.replace("/onboarding");
      return;
    }
    router.replace(`/org-deleted?org=${orgSlug}`);
    setShowDeleteConfirm(false);
    setDeleteInput("");
  };

  const handleDeleteEvent = async (eventId: string) => {
    const orgSlug = params?.org;
    if (!orgSlug) return;
    const confirmed = window.confirm(
      "Delete this event? This cannot be undone.",
    );
    if (!confirmed) return;
    await updateDoc(doc(db, "orgs", orgSlug), { eventCount: increment(-1) });
    await deleteDoc(doc(db, "orgs", orgSlug, "events", eventId));
    setEvents((prev) => prev.filter((item) => item.id !== eventId));
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const today = new Date();
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const filteredEvents = events
    .filter((event) => {
      if (!search.trim()) return true;
      const haystack =
        `${event.name ?? ""} ${event.location ?? ""}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    })
    .filter((event) => {
      if (filter === "all") return true;
      if (!event.date) return false;
      const eventTime = new Date(event.date).getTime();
      if (Number.isNaN(eventTime)) return false;
      return filter === "upcoming"
        ? eventTime >= normalizedToday
        : eventTime < normalizedToday;
    })
    .sort((a, b) => {
      const aTime = a.date
        ? new Date(a.date).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.date
        ? new Date(b.date).getTime()
        : Number.MAX_SAFE_INTEGER;
      return sortDir === "asc" ? aTime - bTime : bTime - aTime;
    });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalEvents = events.length;
  const upcomingEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventTime = new Date(event.date).getTime();
    return !Number.isNaN(eventTime) && eventTime >= normalizedToday;
  }).length;
  const pastEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventTime = new Date(event.date).getTime();
    return !Number.isNaN(eventTime) && eventTime < normalizedToday;
  }).length;
  const nextEvent = filteredEvents.find((event) => event.date);
  const nextEventDateTime = nextEvent?.date
    ? `${nextEvent.date}${nextEvent.time ? ` ${nextEvent.time}` : ""}`
    : undefined;
  const peakWindow =
    nextEvent?.peakStart || nextEvent?.peakEnd
      ? `${nextEvent?.peakStart ?? "0"} - ${nextEvent?.peakEnd ?? "0"}`
      : "0";
  const avgScan = nextEvent?.avgScanSeconds
    ? `${nextEvent.avgScanSeconds} sec`
    : "0";

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.nav
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-xl tracking-tight">
                  {org?.name ?? "Organization"}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full border ${
                    isFree
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {isFree ? "Free" : "Pro"}
                </span>
                {uid === siteOwnerUid && org?.ownerId !== siteOwnerUid ? (
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900"
                    onClick={async () => {
                      const nextPlan = orgPlan === "pro" ? "free" : "pro";
                      await updateDoc(doc(db, "orgs", params.org), { plan: nextPlan });
                      setOrgPlan(nextPlan);
                    }}
                  >
                    Set {orgPlan === "pro" ? "Free" : "Pro"}
                  </button>
                ) : null}
              </div>
              <div className="text-xs text-slate-500">Dashboard</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-700"
              href="/"
            >
              Marketing site
            </Link>
            <div className="relative">
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 inline-flex items-center gap-2"
                onClick={() => setOrgMenuOpen((prev) => !prev)}
              >
                {org?.name ?? "Switch org"}
                <span className="text-slate-500">▾</span>
              </button>
              {orgMenuOpen ? (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg text-sm z-20">
                  <div className="px-4 py-2 text-xs text-slate-500">
                    Your organizations
                  </div>
                  {orgs.map((item) => (
                    <Link
                      key={item.slug}
                      className="block px-4 py-2 hover:bg-slate-50"
                      href={`/${item.slug}`}
                      onClick={() => setOrgMenuOpen(false)}
                    >
                      {item.name ?? item.slug}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 ${
                      isFree && orgs.length >= 2
                        ? "text-slate-400 cursor-not-allowed"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      if (isFree && orgs.length >= 2) {
                        setUpgradeOpen(true);
                      } else {
                        router.replace("/onboarding?newOrg=1");
                      }
                    }}
                  >
                    {isFree && orgs.length >= 2
                      ? "Org limit reached"
                      : "+ Add new org"}
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600"
                    onClick={handleDeleteOrg}
                  >
                    Delete org
                  </button>
                </div>
              ) : null}
            </div>
            <button
              className="px-4 py-2 rounded-full bg-slate-900 text-white"
              onClick={handleSignOut}
            >
              Sign out
            </button>
            {uid === siteOwnerUid ? (
              <Link
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                href={`/${params.org}/admin`}
              >
                Admin
              </Link>
            ) : null}
          </div>
        </motion.nav>

        {uid === siteOwnerUid && org?.blocked ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            This organization is currently blocked.
          </div>
        ) : null}
        <motion.section
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Welcome{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="text-slate-600">
              Here is your live event overview for{" "}
              {org?.name ?? "your organization"}.
            </p>
          </div>
          <Link
            className={`px-5 py-3 rounded-2xl font-bold text-sm ${
              isFree && events.length >= maxEvents
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
            href={`/${params.org}/create-new-event`}
            onClick={(event) => {
              if (isFree && events.length >= maxEvents) {
                event.preventDefault();
                setUpgradeOpen(true);
              }
            }}
          >
            {isFree && events.length >= maxEvents
              ? "Event limit reached"
              : "Create event"}
          </Link>
        </motion.section>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: "Total events",
              value: String(totalEvents),
              note: `${upcomingEvents} upcoming`,
            },
            {
              label: "Upcoming events",
              value: String(upcomingEvents),
              note: nextEvent?.name
                ? `Next: ${nextEvent.name}`
                : "No upcoming events",
            },
            {
              label: "Past events",
              value: String(pastEvents),
              note: pastEvents ? "Archived and searchable" : "No past events",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm"
            >
              <div className="text-xs uppercase tracking-widest text-slate-500">
                {card.label}
              </div>
              <div className="text-3xl font-black mt-2">{card.value}</div>
              <div className="text-sm text-slate-500 mt-2">{card.note}</div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your events</h2>
            <Link
              className={`text-sm ${
                isFree && events.length >= maxEvents
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-blue-400 hover:text-blue-300"
              }`}
              href={`/${params.org}/create-new-event`}
              onClick={(event) => {
                if (isFree && events.length >= maxEvents) {
                  event.preventDefault();
                  setUpgradeOpen(true);
                }
              }}
            >
              {isFree && events.length >= maxEvents
                ? "Event limit reached"
                : "Create another event"}
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <input
              className="w-full sm:max-w-sm bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
              placeholder="Search events"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <div className="flex items-center gap-2 text-sm">
              {(["all", "upcoming", "past"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`px-3 py-2 rounded-full border ${
                    filter === item
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-200 text-slate-600"
                  }`}
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                >
                  {item === "all"
                    ? "All"
                    : item === "upcoming"
                      ? "Upcoming"
                      : "Past"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                className="px-3 py-2 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900"
                onClick={() =>
                  setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                Sort: {sortDir === "asc" ? "Date asc" : "Date desc"}
              </button>
            </div>
          </div>
          {eventsLoading ? (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              Loading events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-sm text-slate-500">
              No events yet. Create your first event.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pagedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-blue-500/40 transition-colors shadow-sm"
                >
                  <Link href={`/${params.org}/${event.id}`}>
                    <div className="text-lg font-bold mb-1">
                      {event.name ?? event.id}
                    </div>
                    <div className="text-sm text-slate-600">
                      {event.date ? `Date: ${event.date}` : "Date: TBD"}
                      {event.time ? ` - Time: ${event.time}` : " - Time: TBD"}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {event.location ?? "Location: TBD"}
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 mt-4 text-sm">
                    <Link
                      className="text-blue-400 hover:text-blue-300"
                      href={`/${params.org}/${event.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredEvents.length > 0 ? (
            <div className="flex items-center justify-between mt-6 text-sm text-slate-600">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-full border border-slate-200 disabled:opacity-40"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-full border border-slate-200 disabled:opacity-40"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-10 grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Today's check-in flow</h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Gates open</span>
                <span>{nextEvent?.gatesOpen || nextEventDateTime || "0"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Peak window</span>
                <span>{peakWindow}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average scan time</span>
                <span>{avgScan}</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Next steps</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>Upload today's guest list</div>
              <div>Assign staff to scan lanes</div>
              <div>Enable SMS reminders</div>
            </div>
          </div>
        </section>
      </div>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteInput("");
            }}
          />
          <div className="relative z-10 w-full max-w-[480px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Confirm delete</h3>
            <p className="text-sm text-slate-600 mb-4">
              Type{" "}
              <span className="font-semibold">{org?.name ?? params?.org}</span>{" "}
              to permanently delete this organization.
            </p>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
              placeholder="Organization name"
              value={deleteInput}
              onChange={(event) => setDeleteInput(event.target.value)}
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-red-600 text-white disabled:opacity-40"
                onClick={confirmDeleteOrg}
                disabled={
                  deleteInput.trim().toLowerCase() !==
                  (org?.name ?? params?.org ?? "").trim().toLowerCase()
                }
              >
                Delete org
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <AnimatePresence>
        {introOpen ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center px-6 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <div className="max-w-xl w-full text-center">
              <motion.div
                className="mx-auto mb-6 w-40 h-40"
                initial={{ scale: 0.94, opacity: 0.75 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full"
                  fill="none"
                  aria-hidden="true"
                >
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="#bfdbfe"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M36 74C36 59 47 48 60 48C73 48 84 59 84 74"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                  />
                  <motion.path
                    d="M48 49C48 42 53 37 60 37C67 37 72 42 72 49C72 56 67 61 60 61C53 61 48 56 48 49Z"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.05, ease: "easeOut", delay: 0.25 }}
                  />
                  <motion.path
                    d="M27 83H93"
                    stroke="#60a5fa"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                  />
                </svg>
              </motion.div>
              <motion.h2
                className="text-2xl font-black text-slate-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeOut, delay: 0.4 }}
              >
                Preparing your workspace
              </motion.h2>
              <motion.p
                className="text-sm text-slate-600 mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeOut, delay: 0.5 }}
              >
                Loading events, guests, and live check-in tools.
              </motion.p>
              {introCanSkip ? (
                <button
                  type="button"
                  className="mt-6 text-xs text-slate-500 hover:text-slate-800"
                  onClick={closeIntro}
                >
                  Skip
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {upgradeOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/60"
              onClick={() => setUpgradeOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Upgrade required</h3>
              <p className="text-sm text-slate-600 mb-4">
                Free mode limits reached. Upgrade to unlock more organizations
                and events.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                  onClick={() => setUpgradeOpen(false)}
                >
                  Not now
                </button>
                <Link
                  className="px-4 py-2 rounded-2xl bg-blue-600 text-white"
                  href={`/${params.org}/pricing`}
                >
                  View pricing
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {blockedOrgOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/60"
              onClick={() => setBlockedOrgOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Organization blocked</h3>
              <p className="text-sm text-slate-600 mb-4">
                This organization has been blocked by an administrator. Redirecting you to another workspace.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                onClick={() => setBlockedOrgOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
