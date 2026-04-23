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

export default function RsvpInvitePage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string; token: string }>();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [finalStatus, setFinalStatus] = useState<"accepted" | "declined" | null>(null);
  const [followupStatus, setFollowupStatus] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      const { org, event, token } = params;
      if (!org || !event || !token) return;
      try {
        const docRef = doc(db, "orgs", org, "events", event, "invites", token);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          setError("Invite not found.");
          setLoading(false);
          return;
        }
        const data = snap.data() as Omit<InviteData, "id">;
        if (data.used) {
          setError("This RSVP link has already been used.");
        } else {
          setInvite({ id: snap.id, ...data });
        }
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load invite";
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
        doc(db, "orgs", params.org, "events", params.event, "invites", invite.id),
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
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setFollowupStatus(data?.error || "Unable to send WhatsApp confirmation.");
        } else {
          setFollowupStatus("Confirmation sent on WhatsApp.");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to accept invite";
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
        doc(db, "orgs", params.org, "events", params.event, "invites", invite.id),
        {
          used: true,
          declinedAt: new Date().toISOString(),
          status: "declined",
        },
      );
      setInvite({ ...invite, used: true });
      setFinalStatus("declined");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to decline invite";
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
          Loading RSVP invite...
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_38%),linear-gradient(160deg,#070b1a_0%,#0a1737_52%,#111f44_100%)] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-[520px] rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
            RSVP Invite
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
                <span className="absolute inset-0 rounded-full bg-emerald-400/10" />
                <span className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-emerald-600 text-3xl font-black text-white">
                  RSVP
                </span>
              </div>
              <div className="text-3xl font-black">
                {finalStatus === "accepted"
                  ? "RSVP confirmed"
                  : "RSVP declined"}
              </div>
              <p className="mt-3 text-sm text-white/80">
                {finalStatus === "accepted"
                  ? "Thanks for confirming your attendance. We look forward to seeing you!"
                  : "We have recorded your RSVP decline."}
              </p>
              {followupStatus ? (
                <div className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                  {followupStatus}
                </div>
              ) : null}
              <button
                type="button"
                className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900"
                onClick={() => router.replace(`/${params.org}/${params.event}`)}
              >
                Return to event
              </button>
            </div>
          ) : (
            <div className="p-8 sm:p-12">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
                RSVP Invite
              </div>
              <h1 className="mt-4 text-4xl font-black">You're invited</h1>
              <p className="mt-3 text-sm text-white/80 sm:text-base">
                {invite?.message || "Please confirm your attendance."}
              </p>
              <div className="mt-10 space-y-4">
                <div className="rounded-3xl bg-white/10 p-5 text-sm text-white/80">
                  <div className="font-semibold text-white">Event</div>
                  <div className="mt-1">{invite?.eventName}</div>
                  <div className="mt-2">{invite?.eventDate}</div>
                  <div>{invite?.eventLocation}</div>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 text-sm text-white/80">
                  <div className="font-semibold text-white">Guest</div>
                  <div className="mt-1">{invite?.guestName}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-200/80">
                    RSVP actions
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex min-w-[160px] items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                  onClick={handleAccept}
                  disabled={accepting}
                >
                  {accepting ? "Confirming..." : "Yes, I’m coming"}
                </button>
                <button
                  type="button"
                  className="inline-flex min-w-[160px] items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
                  onClick={handleDecline}
                  disabled={accepting}
                >
                  {accepting ? "Processing..." : "No, I can’t attend"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
