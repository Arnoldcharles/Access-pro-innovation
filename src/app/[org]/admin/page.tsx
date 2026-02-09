"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, cubicBezier } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserItem = {
  id: string;
  name?: string;
  email?: string;
  orgSlug?: string;
  orgName?: string;
};

type OrgItem = {
  id: string;
  name?: string;
  ownerId?: string;
  plan?: "free" | "pro";
};

export default function AdminPage() {
  const params = useParams<{ org: string }>();
  const siteOwnerUid = "krpJL2xq7Rf1NUumK3G6nzpZWsM2";
  const [uid, setUid] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid("");
        setLoading(false);
        return;
      }
      setUid(user.uid);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid || uid !== siteOwnerUid) return;
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as object),
        })) as UserItem[];
        setUsers(items);
      },
      (err) => {
        const code = (err as { code?: string }).code;
        if (code === "permission-denied") return;
        console.error(err);
      }
    );
    const unsubOrgs = onSnapshot(
      collection(db, "orgs"),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as object),
        })) as OrgItem[];
        setOrgs(items);
      },
      (err) => {
        const code = (err as { code?: string }).code;
        if (code === "permission-denied") return;
        console.error(err);
      }
    );
    return () => {
      unsubUsers();
      unsubOrgs();
    };
  }, [uid]);

  const orgsByOwner = useMemo(() => {
    const map = new Map<string, OrgItem[]>();
    orgs.forEach((org) => {
      const ownerId = org.ownerId ?? "";
      if (!map.has(ownerId)) map.set(ownerId, []);
      map.get(ownerId)?.push(org);
    });
    return map;
  }, [orgs]);

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return users
      .filter((user) => {
        if (!normalized) return true;
        const haystack = `${user.name ?? ""} ${user.email ?? ""} ${user.orgName ?? ""} ${user.orgSlug ?? ""}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .map((user) => ({
        user,
        orgs: orgsByOwner.get(user.id) ?? [],
      }));
  }, [users, orgsByOwner, search]);

  const toggleOrgPlan = async (orgId: string, current: "free" | "pro" | undefined) => {
    const nextPlan = current === "pro" ? "free" : "pro";
    await updateDoc(doc(db, "orgs", orgId), { plan: nextPlan });
  };

  const toggleOrgBlocked = async (orgId: string, current?: boolean) => {
    await updateDoc(doc(db, "orgs", orgId), { blocked: !current });
  };

  const toggleUserBlocked = async (userId: string, current?: boolean) => {
    const nextBlocked = !current;
    await updateDoc(doc(db, "users", userId), { blocked: nextBlocked });
    const owned = orgsByOwner.get(userId) ?? [];
    await Promise.all(
      owned.map((org) => updateDoc(doc(db, "orgs", org.id), { blocked: nextBlocked })),
    );
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="text-sm text-slate-600">Loading admin…</div>
      </div>
    );
  }

  if (uid !== siteOwnerUid) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-6">
        <div className="max-w-[520px] text-center">
          <h1 className="text-2xl font-black mb-2">Admin access only</h1>
          <p className="text-slate-600 mb-6">You do not have permission to view this page.</p>
          <Link className="px-4 py-2 rounded-2xl bg-slate-900 text-white" href={`/${params.org}`}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black">Admin dashboard</h1>
              <p className="text-slate-600 text-sm">Manage org plans by owner.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm" href={`/${params.org}`}>
                Back to dashboard
              </Link>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm"
                onClick={() => signOut(auth)}
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mb-6">
            <input
              className="w-full sm:max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
              placeholder="Search users or orgs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="space-y-4">
            {rows.length === 0 ? (
              <div className="text-sm text-slate-500">No users found.</div>
            ) : (
              rows.map(({ user, orgs: ownedOrgs }) => (
                <div key={user.id} className="p-5 border border-slate-200 rounded-3xl bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{user.name ?? "Unnamed user"}</div>
                      <div className="text-xs text-slate-500">{user.email ?? user.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500">
                        {ownedOrgs.length} org{ownedOrgs.length === 1 ? "" : "s"}
                      </div>
                      <button
                        type="button"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                          (user as { blocked?: boolean }).blocked
                            ? "bg-rose-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                        onClick={() => toggleUserBlocked(user.id, (user as { blocked?: boolean }).blocked)}
                      >
                        {(user as { blocked?: boolean }).blocked ? "Unblock user" : "Block user"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {ownedOrgs.length === 0 ? (
                      <div className="text-sm text-slate-500">No orgs for this user.</div>
                    ) : (
                      ownedOrgs.map((org) => (
                        <div key={org.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{org.name ?? org.id}</div>
                            <div className="text-xs text-slate-500">/{org.id}</div>
                            {(org as { blocked?: boolean }).blocked ? (
                              <div className="mt-1 text-[10px] uppercase tracking-widest text-rose-500">Blocked</div>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                                org.plan === "pro" ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-700"
                              }`}
                              onClick={() => toggleOrgPlan(org.id, org.plan)}
                            >
                              {org.plan === "pro" ? "Set Free" : "Set Pro"}
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                                (org as { blocked?: boolean }).blocked
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                              onClick={() => toggleOrgBlocked(org.id, (org as { blocked?: boolean }).blocked)}
                            >
                              {(org as { blocked?: boolean }).blocked ? "Unblock org" : "Block org"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
