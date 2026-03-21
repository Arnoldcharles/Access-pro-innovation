"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, cubicBezier } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type InviteData = {
  id: string;
  token: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  imageDataUrl?: string;
  used: boolean;
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string; token: string }>();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [finalStatus, setFinalStatus] = useState<
    "accepted" | "declined" | null
  >(null);
  const [followupStatus, setFollowupStatus] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      const { org, event, token } = params;
      if (!org || !event || !token) return;
      try {
        // Fetch directly by document id (token) to avoid needing "list" permissions.
        const docRef = doc(db, "orgs", org, "events", event, "invites", token);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          setError("Invite not found.");
          setLoading(false);
          return;
        }
        const data = snap.data() as Omit<InviteData, "id">;
        if (data.used) {
          setError("This invite link has already been used.");
        } else {
          setInvite({ id: snap.id, ...data });
        }
        setLoading(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load invite";
        setError(message);
        setLoading(false);
      }
    };
    loadInvite();
  }, [params]);

  const handleAccept = async () => {
    if (!invite) return;
    setAccepting(true);
    setFollowupStatus("");
    try {
      await updateDoc(
        doc(
          db,
          "orgs",
          params.org,
          "events",
          params.event,
          "invites",
          invite.id,
        ),
        {
          used: true,
          acceptedAt: new Date().toISOString(),
          status: "accepted",
        },
      );
      setInvite({ ...invite, used: true });
      setFinalStatus("accepted");

      const sig =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("k") || ""
          : "";
      if (sig) {
        const res = await fetch("/api/whatsapp/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: invite.guestPhone,
            token: invite.token,
            sig,
            eventName: invite.eventName,
            guestName: invite.guestName,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setFollowupStatus(
            data?.error || "Unable to send WhatsApp confirmation.",
          );
        } else {
          setFollowupStatus("Confirmation sent on WhatsApp.");
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to accept invite";
      setError(message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invite) return;
    setAccepting(true);
    try {
      await updateDoc(
        doc(
          db,
          "orgs",
          params.org,
          "events",
          params.event,
          "invites",
          invite.id,
        ),
        {
          used: true,
          declinedAt: new Date().toISOString(),
          status: "declined",
        },
      );
      setInvite({ ...invite, used: true });
      setFinalStatus("declined");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to decline invite";
      setError(message);
    } finally {
      setAccepting(false);
    }
  };

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_38%),linear-gradient(160deg,#070b1a_0%,#0a1737_52%,#111f44_100%)] text-white flex items-center justify-center px-6">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="h-4 w-4 rounded-full border-2 border-white/25 border-r-emerald-300 animate-spin" />
          Loading invite...
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_38%),linear-gradient(160deg,#070b1a_0%,#0a1737_52%,#111f44_100%)] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-[520px] rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
            Invite
          </div>
          <div className="mt-2 text-xl font-black">Unable to open link</div>
          <div className="mt-3 text-sm text-white/80 break-words">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_38%),linear-gradient(160deg,#070b1a_0%,#0a1737_52%,#111f44_100%)] text-white font-sans antialiased">
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur"
        >
          {finalStatus ? (
            <div className="text-center py-10 px-6 sm:px-10 relative overflow-hidden">
              {finalStatus === "accepted" ? (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(14)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute h-2 w-2 rounded-full animate-confetti"
                      style={{
                        left: `${(i * 7) % 100}%`,
                        animationDelay: `0s, ${1.2 + i * 0.23}s`,
                        animationDuration: `0.6s, ${3.6 + (i % 5) * 0.5}s`,
                        backgroundColor: [
                          "#2563eb",
                          "#16a34a",
                          "#f59e0b",
                          "#ef4444",
                        ][i % 4],
                      }}
                    />
                  ))}
                </div>
              ) : null}
              <div className="relative mx-auto mb-6 h-24 w-24">
                <span
                  className={`absolute inset-0 rounded-full ${finalStatus === "accepted" ? "bg-emerald-100" : "bg-rose-100"} animate-ping`}
                ></span>
                <span
                  className={`absolute inset-2 rounded-full ${finalStatus === "accepted" ? "bg-emerald-500" : "bg-rose-500"}`}
                ></span>
              </div>
              <motion.h2
                className="text-2xl font-black mb-2"
                initial={
                  finalStatus === "accepted" ? { x: 40, opacity: 0 } : false
                }
                animate={
                  finalStatus === "accepted" ? { x: 0, opacity: 1 } : false
                }
                transition={{ duration: 0.5, ease: easeOut }}
              >
                {finalStatus === "accepted"
                  ? "Invite accepted"
                  : "Invite declined"}
              </motion.h2>
              <motion.p
                className="text-white/80"
                initial={
                  finalStatus === "accepted" ? { x: 40, opacity: 0 } : false
                }
                animate={
                  finalStatus === "accepted" ? { x: 0, opacity: 1 } : false
                }
                transition={{ duration: 0.5, ease: easeOut, delay: 0.05 }}
              >
                {finalStatus === "accepted"
                  ? "You are confirmed for this event. Your QR code will be sent."
                  : "We have recorded your response. Thank you."}
              </motion.p>
            </div>
          ) : (
            <>
              <div className="px-6 sm:px-10 pt-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
                      Event invite
                    </div>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-black leading-tight">
                      {invite?.eventName || "Your event"}
                    </h1>
                    <div className="mt-2 text-sm text-white/80">
                      {invite?.eventDate || "TBD"}
                      {invite?.eventLocation
                        ? ` • ${invite.eventLocation}`
                        : ""}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/70">
                      Guest
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {invite?.guestName || "Guest"}
                    </div>
                  </div>
                </div>
              </div>

              {invite?.imageDataUrl ? (
                <div className="relative w-full bg-black/25">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.22),transparent_45%),radial-gradient(circle_at_70%_10%,rgba(59,130,246,0.18),transparent_52%)]" />
                  <img
                    src={invite.imageDataUrl}
                    alt="Invite design"
                    className="relative w-full max-h-[420px] object-contain sm:object-cover"
                  />
                </div>
              ) : (
                <div className="px-6 sm:px-10">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                    No invite image was attached for this event.
                  </div>
                </div>
              )}

              <div className="px-6 sm:px-10 py-8">
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                      Message
                    </div>
                    <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/90 whitespace-pre-wrap">
                      {invite?.message || "You have been invited."}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-black disabled:opacity-60"
                      disabled={accepting}
                      onClick={handleAccept}
                    >
                      {accepting ? "Accepting..." : "I accept"}
                    </button>
                    <button
                      className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 disabled:opacity-60"
                      disabled={accepting}
                      onClick={handleDecline}
                    >
                      Decline
                    </button>
                  </div>

                  {error ? (
                    <div className="text-sm text-rose-200 border border-rose-200/20 bg-rose-500/10 rounded-2xl px-4 py-3">
                      {error}
                    </div>
                  ) : null}

                  <div className="pt-2 text-xs text-white/60">
                    Powered by Access Pro Innovation
                  </div>
                  {followupStatus ? (
                    <div className="text-xs text-white/70">
                      {followupStatus}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
