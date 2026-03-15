"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type EventData = {
  name?: string;
  date?: string;
  time?: string;
  location?: string;
  gatesOpenAt?: string;
  scanTotalMs?: number;
  scanCount?: number;
  imageDataUrl?: string;
  qrX?: number;
  qrY?: number;
  qrSize?: number;
  nameX?: number;
  nameY?: number;
  nameColor?: string;
  nameSize?: number;
  nameFont?: string;
  nameBg?: boolean;
  status?: string;
  guestTableLayout?: SheetLayout | null;
};

type Guest = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone: string;
  email: string;
  sourceType?: "table" | "list";
  tableName?: string;
  tableRowIndex?: number;
  tableColumnIndex?: number;
  sheetColumns?: string[];
  sheetRow?: Record<string, string>;
  status?: "invited" | "accepted" | "declined";
  checkedIn?: boolean;
  checkedInAt?: string;
  checkInCount?: number;
};

type InviteTarget = {
  name: string;
  phone: string;
  email: string;
};

type SheetLayout = {
  columns: string[];
  rows: string[][];
  blocks: Array<{ titleCol: number; checkCol: number | null }>;
};

type StoredSheetLayout = {
  columns: string[];
  blocks: Array<{ titleCol: number; checkCol: number | null }>;
  rows: Array<Record<string, string>>;
};

const tableCardPalettes = [
  {
    border: "border-amber-300",
    header: "bg-amber-400 text-slate-900",
    body: "bg-amber-50",
  },
  {
    border: "border-cyan-300",
    header: "bg-cyan-400 text-slate-900",
    body: "bg-cyan-50",
  },
  {
    border: "border-fuchsia-300",
    header: "bg-fuchsia-600 text-white",
    body: "bg-fuchsia-50",
  },
  {
    border: "border-emerald-300",
    header: "bg-emerald-500 text-white",
    body: "bg-emerald-50",
  },
  {
    border: "border-violet-300",
    header: "bg-violet-600 text-white",
    body: "bg-violet-50",
  },
];

const isLikelyTableTitle = (value: string) => {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (v.includes("check-in")) return true;
  if (v.includes("table")) return true;
  if (v.includes("side") && v.includes("vip")) return true;
  if (v.includes("section") || v.includes("group")) return true;
  return false;
};

const serializeSheetLayout = (
  layout: SheetLayout | null,
): StoredSheetLayout | null => {
  if (!layout) return null;
  return {
    columns: layout.columns,
    blocks: layout.blocks,
    rows: layout.rows.map((row) =>
      Object.fromEntries(row.map((value, index) => [`c${index}`, value])),
    ),
  };
};

const deserializeSheetLayout = (value: unknown): SheetLayout | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as {
    columns?: unknown;
    blocks?: unknown;
    rows?: unknown;
  };
  if (!Array.isArray(raw.columns) || !Array.isArray(raw.blocks) || !Array.isArray(raw.rows)) {
    return null;
  }
  const columns = raw.columns.map((column) => String(column ?? ""));
  const blocks = raw.blocks
    .map((block) => {
      const b = block as { titleCol?: unknown; checkCol?: unknown };
      if (typeof b.titleCol !== "number") return null;
      const checkCol = typeof b.checkCol === "number" ? b.checkCol : null;
      return { titleCol: b.titleCol, checkCol };
    })
    .filter(Boolean) as Array<{ titleCol: number; checkCol: number | null }>;
  const rows = raw.rows.map((row) => {
    if (!row || typeof row !== "object") return columns.map(() => "");
    const r = row as Record<string, unknown>;
    return columns.map((_, index) => String(r[`c${index}`] ?? ""));
  });
  return { columns, blocks, rows };
};

const toMillis = (
  value?: { toDate?: () => Date; toMillis?: () => number; seconds?: number } | null,
) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return null;
};

export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams<{ org: string; event: string }>();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestError, setGuestError] = useState("");
  const [guestNotice, setGuestNotice] = useState("");
  const [copyToast, setCopyToast] = useState("");
  const [guestLimitWarning, setGuestLimitWarning] = useState("");
  const [guestLimitModalOpen, setGuestLimitModalOpen] = useState(false);
  const [guestSaving, setGuestSaving] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");
  const [uploadedSheetColumns, setUploadedSheetColumns] = useState<string[]>([]);
  const [sheetLayout, setSheetLayout] = useState<SheetLayout | null>(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<"single" | "all">("single");
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [downloadingGuestCard, setDownloadingGuestCard] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardGuest, setCardGuest] = useState<Guest | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [uid, setUid] = useState("");
  const [orgPlan, setOrgPlan] = useState<"free" | "pro">("free");
  const isFree = orgPlan !== "pro";
  const maxGuests = 500;
  const [blockedOrgOpen, setBlockedOrgOpen] = useState(false);
  const guestLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeGuestLimitModal = () => {
    setGuestLimitModalOpen(false);
    if (guestLimitTimerRef.current) {
      clearTimeout(guestLimitTimerRef.current);
      guestLimitTimerRef.current = null;
    }
  };

  const openGuestLimitModal = (message: string) => {
    setGuestLimitWarning(message);
    setGuestLimitModalOpen(true);
    if (guestLimitTimerRef.current) {
      clearTimeout(guestLimitTimerRef.current);
    }
    guestLimitTimerRef.current = setTimeout(() => {
      setGuestLimitModalOpen(false);
      guestLimitTimerRef.current = null;
    }, 10000);
  };
  const maxScans = isFree ? 5 : Number.MAX_SAFE_INTEGER;
  const maxScansLabel = isFree ? String(maxScans) : "∞";

  useEffect(() => {
    return () => {
      if (guestLimitTimerRef.current) {
        clearTimeout(guestLimitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let liveOrgUnsub: null | (() => void) = null;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/sign-in");
        return;
      }
      setUid(user.uid);
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userBlocked = userSnap.exists()
        ? Boolean((userSnap.data() as { blocked?: boolean }).blocked)
        : false;
      if (userBlocked) {
        await auth.signOut();
        router.replace("/sign-in");
        return;
      }
      const orgSlug = params?.org;
      const eventSlug = params?.event;
      if (!orgSlug || !eventSlug) return;

      const orgSnap = await getDoc(doc(db, "orgs", orgSlug));
      if (!orgSnap.exists()) {
        router.replace("/onboarding");
        return;
      }
      const orgData = orgSnap.data() as {
        name?: string;
        plan?: "free" | "pro";
        proExpiresAt?: { toDate?: () => Date; toMillis?: () => number; seconds?: number } | null;
        blocked?: boolean;
      };
      if (orgData.blocked) {
        setBlockedOrgOpen(true);
        setTimeout(() => {
          router.replace("/onboarding");
        }, 1200);
        return;
      }
      let effectivePlan: "free" | "pro" = orgData.plan === "pro" ? "pro" : "free";
      const expiryMs = toMillis(orgData.proExpiresAt);
      if (effectivePlan === "pro" && typeof expiryMs === "number" && expiryMs <= Date.now()) {
        try {
          await updateDoc(doc(db, "orgs", orgSlug), { plan: "free", proExpiresAt: null });
          effectivePlan = "free";
        } catch (err) {
          console.error(err);
        }
      }
      setOrgName(orgData.name ?? "");
      setOrgPlan(effectivePlan);
      liveOrgUnsub = onSnapshot(
        doc(db, "orgs", orgSlug),
        async (liveSnap) => {
          if (!liveSnap.exists()) {
            router.replace("/onboarding");
            return;
          }
          const liveData = liveSnap.data() as {
            name?: string;
            plan?: "free" | "pro";
            proExpiresAt?: { toDate?: () => Date; toMillis?: () => number; seconds?: number } | null;
            blocked?: boolean;
          };
          if (liveData.blocked) {
            setBlockedOrgOpen(true);
          }
          let livePlan: "free" | "pro" = liveData.plan === "pro" ? "pro" : "free";
          const liveExpiryMs = toMillis(liveData.proExpiresAt);
          if (livePlan === "pro" && typeof liveExpiryMs === "number" && liveExpiryMs <= Date.now()) {
            try {
              await updateDoc(doc(db, "orgs", orgSlug), { plan: "free", proExpiresAt: null });
              livePlan = "free";
            } catch (err) {
              console.error(err);
            }
          }
          setOrgName(liveData.name ?? "");
          setOrgPlan(livePlan);
        },
      );
      const eventSnap = await getDoc(
        doc(db, "orgs", orgSlug, "events", eventSlug),
      );
      if (!eventSnap.exists()) {
        router.replace(`/${orgSlug}`);
        return;
      }
      const data = eventSnap.data() as EventData;
      setEventData(data);
      setName(data.name ?? "");
      setDate(data.date ?? "");
      setTime(data.time ?? "");
      setLocation(data.location ?? "");
      const restoredLayout = deserializeSheetLayout(data.guestTableLayout);
      setSheetLayout(restoredLayout);
      setUploadedSheetColumns(restoredLayout?.columns ?? []);
      if (!data.gatesOpenAt) {
        await updateDoc(doc(db, "orgs", orgSlug, "events", eventSlug), {
          gatesOpenAt: new Date().toISOString(),
        });
      }
      const guestsRef = collection(
        db,
        "orgs",
        orgSlug,
        "events",
        eventSlug,
        "guests",
      );
      const unsubGuests = onSnapshot(
        guestsRef,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as object),
          })) as Guest[];
          setGuests(items);
        },
        (err) => {
          const code = (err as { code?: string }).code;
          if (code === "permission-denied") return;
          console.error(err);
        },
      );

      setLoading(false);
      return () => unsubGuests();
    });
    return () => {
      unsub();
      if (liveOrgUnsub) liveOrgUnsub();
    };
  }, [params, router]);

  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const combinedGuests = useMemo(
    () => [...guests, ...pendingGuests],
    [guests, pendingGuests],
  );
  const filteredGuests = useMemo(() => {
    const query = guestSearch.trim().toLowerCase();
    if (!query) return combinedGuests;
    return combinedGuests.filter((guest) => {
      const fullName =
        `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim() || guest.name;
      return fullName.toLowerCase().includes(query);
    });
  }, [combinedGuests, guestSearch]);
  const sheetColumnsForView = useMemo(() => {
    if (uploadedSheetColumns.length > 0) return uploadedSheetColumns;
    const firstWithSheet = combinedGuests.find((guest) => guest.sheetColumns?.length);
    if (firstWithSheet?.sheetColumns?.length) return firstWithSheet.sheetColumns;
    return ["firstName", "lastName", "phone", "email"];
  }, [combinedGuests, uploadedSheetColumns]);
  const guestBucketsByName = useMemo(() => {
    const map = new Map<string, Guest[]>();
    combinedGuests.forEach((guest) => {
      const key = guest.name.trim().toLowerCase();
      if (!key) return;
      const existing = map.get(key) ?? [];
      existing.push(guest);
      map.set(key, existing);
    });
    return map;
  }, [combinedGuests]);
  const guestByTablePosition = useMemo(() => {
    const map = new Map<string, Guest>();
    combinedGuests.forEach((guest) => {
      if (
        guest.sourceType === "table" &&
        typeof guest.tableColumnIndex === "number" &&
        typeof guest.tableRowIndex === "number"
      ) {
        map.set(`${guest.tableColumnIndex}:${guest.tableRowIndex}`, guest);
      }
    });
    return map;
  }, [combinedGuests]);
  const sheetBlocksForView = useMemo(() => {
    if (!sheetLayout) return [];
    const query = guestSearch.trim().toLowerCase();
    const currentTitles = sheetLayout.blocks.map(
      (block, blockIndex) =>
        sheetLayout.columns[block.titleCol] || `Table ${blockIndex + 1}`,
    );
    const order: string[] = [];
    const rowsByTitle = new Map<
      string,
      Array<{
        key: string;
        guestName: string;
        checkCell: string;
        tableColumnIndex: number;
        tableRowIndex: number;
      }>
    >();

    const ensureTitle = (title: string) => {
      if (!rowsByTitle.has(title)) rowsByTitle.set(title, []);
      if (!order.includes(title)) order.push(title);
    };

    currentTitles.forEach((title) => ensureTitle(title));

    sheetLayout.rows.forEach((row, rowIndex) => {
      sheetLayout.blocks.forEach((block, blockIndex) => {
        const cellValue = (row[block.titleCol] ?? "").trim();
        if (!cellValue) return;
        if (isLikelyTableTitle(cellValue)) {
          currentTitles[blockIndex] = cellValue;
          ensureTitle(cellValue);
          return;
        }
        if (query && !cellValue.toLowerCase().includes(query)) return;
        const title = currentTitles[blockIndex];
        ensureTitle(title);
        const checkCell =
          block.checkCol !== null ? (row[block.checkCol] ?? "").trim() : "";
        rowsByTitle.get(title)?.push({
          key: `${blockIndex}-${rowIndex}-${cellValue}`,
          guestName: cellValue,
          checkCell,
          tableColumnIndex: block.titleCol,
          tableRowIndex: rowIndex,
        });
      });
    });

    return order
      .map((title) => ({ title, rows: rowsByTitle.get(title) ?? [] }))
      .filter((block) => block.rows.length > 0);
  }, [guestSearch, sheetLayout]);
  const totalGuestCount = guests.length + pendingGuests.length;
  const savedGuestCount = guests.length;
  const checkedInCount = guests.filter((guest) => guest.checkedIn).length;
  const remainingToCheckIn = Math.max(0, savedGuestCount - checkedInCount);

  const handleAddGuest = () => {
    setGuestError("");
    if (!guestFirstName.trim() || !guestLastName.trim() || !guestPhone.trim()) {
      setGuestError("First name, last name, and phone number are required.");
      return;
    }
    const fullName = `${guestFirstName.trim()} ${guestLastName.trim()}`.trim();
    setPendingGuests((prev) => [
      ...prev,
      {
        firstName: guestFirstName.trim(),
        lastName: guestLastName.trim(),
        name: fullName,
        phone: guestPhone.trim(),
        email: guestEmail.trim(),
        sourceType: "list",
        status: "invited",
        checkedIn: false,
        checkInCount: 0,
      },
    ]);
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
    setGuestEmail("");
  };

  const parseDelimitedRows = (text: string, delimiter: "," | "\t") => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(cell.trim());
        const hasValue = row.some((value) => value !== "");
        if (hasValue) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell.trim());
      const hasValue = row.some((value) => value !== "");
      if (hasValue) rows.push(row);
    }

    return rows;
  };

  const parseSpreadsheetRows = (rows: string[][]) => {
    if (rows.length === 0) {
      return {
        columns: [] as string[],
        guests: [] as Guest[],
        layout: null as SheetLayout | null,
      };
    }

    const rawHeader = rows[0].map((cell, index) =>
      cell.trim() ? cell.trim() : `Column ${index + 1}`,
    );
    const normalizedHeader = rawHeader.map((header) => header.toLowerCase());
    const hasHeader = normalizedHeader.some(
      (header) =>
        header.includes("name") ||
        header.includes("phone") ||
        header.includes("email"),
    );
    const looksLikeTableLayout =
      !hasHeader &&
      rows[0].length >= 6 &&
      rawHeader.some((cell) => {
        const value = cell.toLowerCase();
        return value.includes("table") || value.includes("check");
      });

    if (looksLikeTableLayout) {
      const columns = rawHeader;
      const dataRows = rows.slice(1);
      const blocks: Array<{ titleCol: number; checkCol: number | null }> = [];
      for (let i = 0; i < columns.length; i += 1) {
        const title = columns[i]?.toLowerCase().trim() ?? "";
        if (title.includes("check")) continue;
        const hasAnyData =
          title !== "" || dataRows.some((row) => (row[i] ?? "").trim() !== "");
        if (!hasAnyData) continue;
        const nextTitle = columns[i + 1]?.toLowerCase() ?? "";
        const checkCol = nextTitle.includes("check") ? i + 1 : null;
        blocks.push({ titleCol: i, checkCol });
      }

      const guests: Guest[] = [];
      const currentTitles = blocks.map(
        (block, blockIndex) =>
          columns[block.titleCol] || `Table ${blockIndex + 1}`,
      );
      dataRows.forEach((row, rowIndex) => {
        blocks.forEach((block, blockIndex) => {
          const cellValue = (row[block.titleCol] ?? "").trim();
          if (!cellValue) return;
          if (isLikelyTableTitle(cellValue)) {
            currentTitles[blockIndex] = cellValue;
            return;
          }
          const [firstName = "", ...rest] = cellValue.split(/\s+/);
          const lastName = rest.join(" ");
          guests.push({
            firstName,
            lastName,
            name: cellValue,
            phone: "",
            email: "",
            sourceType: "table",
            tableName: currentTitles[blockIndex],
            tableRowIndex: rowIndex,
            tableColumnIndex: block.titleCol,
            sheetColumns: ["Table", "Guest Name"],
            sheetRow: {
              Table: currentTitles[blockIndex],
              "Guest Name": cellValue,
            },
            status: "invited",
            checkedIn: false,
            checkInCount: 0,
          });
        });
      });

      return {
        columns,
        guests,
        layout: {
          columns,
          rows: dataRows,
          blocks,
        },
      };
    }

    const columns = hasHeader
      ? rawHeader
      : rawHeader.map((_, index) => `Column ${index + 1}`);
    const startIndex = hasHeader ? 1 : 0;
    const guests = rows.slice(startIndex).map((row) => {
      const rowMap: Record<string, string> = {};
      columns.forEach((column, index) => {
        rowMap[column] = (row[index] ?? "").trim();
      });
      const norm = (value: string) => value.toLowerCase().replace(/\s+/g, "");
      const findColumn = (candidates: string[]) => {
        const found = columns.find((column) =>
          candidates.some((candidate) => norm(column).includes(candidate)),
        );
        return found ? rowMap[found] ?? "" : "";
      };
      const firstName = findColumn(["firstname", "first", "givenname"]);
      const lastName = findColumn(["lastname", "last", "surname"]);
      const explicitName = findColumn(["fullname", "name"]);
      const phone = findColumn(["phone", "mobile", "tel"]);
      const email = findColumn(["email", "mail"]);
      const fallbackName = Object.values(rowMap).find((value) => value)?.trim() ?? "";
      const name =
        explicitName.trim() ||
        `${firstName} ${lastName}`.trim() ||
        fallbackName;
      return {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name,
        phone: phone.trim(),
        email: email.trim(),
        sourceType: "list" as const,
        sheetColumns: columns,
        sheetRow: rowMap,
        status: "invited" as const,
        checkedIn: false,
        checkInCount: 0,
      };
    });

    return { columns, guests, layout: null as SheetLayout | null };
  };

  const parseSpreadsheetText = (text: string) => {
    const delimiter: "," | "\t" = text.includes("\t") ? "\t" : ",";
    const rows = parseDelimitedRows(text, delimiter);
    return parseSpreadsheetRows(rows);
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setGuestError("");
    closeGuestLimitModal();
    const processingStart = Date.now();
    let minimumProcessingMs = 10000 + Math.floor(Math.random() * 5001);
    let stopLoadingImmediately = false;
    setUploadProcessing(true);
    const file = event.target.files?.[0];
    try {
      if (!file) return;
      const lowerName = file.name.toLowerCase();
      const isSupported =
        lowerName.endsWith(".csv") ||
        lowerName.endsWith(".tsv") ||
        lowerName.endsWith(".txt") ||
        lowerName.endsWith(".xlsx") ||
        lowerName.endsWith(".xls");
      if (!isSupported) {
        setGuestError(
          "Upload CSV/TSV or Excel (.xlsx/.xls) file.",
        );
        return;
      }
      let columns: string[] = [];
      let parsedGuests: Guest[] = [];
      let parsedLayout: SheetLayout | null = null;

      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const xlsx = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;
        if (!sheet) {
          setGuestError("No sheet found in the uploaded Excel file.");
          return;
        }
        const rawRows = xlsx.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });
        const normalizedRows = rawRows.map((row) =>
          row.map((cell) => (cell ?? "").toString().trim()),
        );
        const parsedFromRows = parseSpreadsheetRows(normalizedRows);
        columns = parsedFromRows.columns;
        parsedGuests = parsedFromRows.guests;
        parsedLayout = parsedFromRows.layout;
      } else {
        const text = await file.text();
        const parsedFromText = parseSpreadsheetText(text);
        columns = parsedFromText.columns;
        parsedGuests = parsedFromText.guests;
        parsedLayout = parsedFromText.layout;
      }

      const parsed = parsedGuests.filter(
        (guest) => guest.name || guest.email || guest.phone,
      );
      minimumProcessingMs =
        parsed.length >= 100
          ? 25000 + Math.floor(Math.random() * 5001)
          : 10000 + Math.floor(Math.random() * 5001);
      if (parsed.length === 0) {
        setGuestError("No guests found in the uploaded spreadsheet.");
        return;
      }
      if (isFree && parsed.length > maxGuests) {
        openGuestLimitModal(
          `Free mode allows up to ${maxGuests} guests per event. This file has ${parsed.length} guests, so upload was stopped.`,
        );
        stopLoadingImmediately = true;
        return;
      }
      if (isFree && totalGuestCount + parsed.length > maxGuests) {
        openGuestLimitModal(
          `This upload would exceed the ${maxGuests}-guest free limit. Upgrade to continue.`,
        );
        stopLoadingImmediately = true;
        return;
      }
      setUploadedSheetColumns(columns);
      setSheetLayout(parsedLayout);
      setPendingGuests((prev) => [...prev, ...parsed]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to process spreadsheet.";
      setGuestError(message);
    } finally {
      if (!stopLoadingImmediately) {
        const elapsed = Date.now() - processingStart;
        const waitMs = Math.max(0, minimumProcessingMs - elapsed);
        if (waitMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
      setUploadProcessing(false);
      event.target.value = "";
    }
  };

  const handleSaveGuests = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (pendingGuests.length === 0) return;
    setGuestSaving(true);
    setGuestError("");
    try {
      const batch = writeBatch(db);
      const guestsRef = collection(
        db,
        "orgs",
        orgSlug,
        "events",
        eventSlug,
        "guests",
      );
      pendingGuests.forEach((guest) => {
        const guestDoc = doc(guestsRef);
        batch.set(guestDoc, {
          firstName: guest.firstName ?? "",
          lastName: guest.lastName ?? "",
          name: guest.name,
          phone: guest.phone,
          email: guest.email,
          sourceType: guest.sourceType ?? "list",
          tableName: guest.tableName ?? null,
          tableRowIndex: guest.tableRowIndex ?? null,
          tableColumnIndex: guest.tableColumnIndex ?? null,
          sheetColumns: guest.sheetColumns ?? null,
          sheetRow: guest.sheetRow ?? null,
          status: guest.status ?? "invited",
          checkedIn: guest.checkedIn ?? false,
          checkInCount: guest.checkInCount ?? 0,
          createdAt: new Date().toISOString(),
        });
      });
      batch.set(
        doc(db, "orgs", orgSlug, "events", eventSlug),
        {
          guestCount: increment(pendingGuests.length),
          guestTableLayout: serializeSheetLayout(sheetLayout),
        },
        { merge: true },
      );
      await batch.commit();
      setPendingGuests([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save guests";
      setGuestError(message);
    } finally {
      setGuestSaving(false);
    }
  };

  const buildInviteMessage = (name: string) =>
    `Hi ${name}, you are invited to ${eventData?.name ?? "our event"} on ${eventData?.date ?? "TBD"} at ${
      eventData?.location ?? "TBD"
    }.`;

  const openInviteModal = (mode: "single" | "all", target?: InviteTarget) => {
    setInviteMode(mode);
    setInviteTarget(target ?? null);
    setInviteMessage(buildInviteMessage(target?.name ?? "there"));
    setInviteLink("");
    setInviteStatus("");
    setInviteOpen(true);
  };

  const openGuestCard = (guest: Guest) => {
    setCardGuest(guest);
    setCardOpen(true);
    setMenuOpenId(null);
  };

  const closeInviteModal = () => {
    setInviteOpen(false);
  };

  const showGuestNotice = (message: string) => {
    setGuestNotice(message);
    setTimeout(() => setGuestNotice(""), 2500);
  };

  const showCopyToast = (message: string) => {
    setCopyToast(message);
    setTimeout(() => setCopyToast(""), 1800);
  };

  const createInviteToken = (digits = 6) => {
    const min = Math.pow(10, Math.max(1, digits - 1));
    const max = Math.pow(10, digits);
    const span = Math.max(1, max - min);

    let value: number;
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      value = min + (buf[0] % span);
    } else {
      value = min + Math.floor(Math.random() * span);
    }

    return String(value);
  };

  const normalizeGuestKey = (guest: { email?: string; phone?: string }) => {
    const email = (guest.email ?? "").trim().toLowerCase();
    if (email) return `email:${email}`;
    const phoneDigits = String(guest.phone ?? "").replace(/[^\d]/g, "");
    return phoneDigits ? `phone:${phoneDigits}` : "";
  };

  const getExistingInviteByGuestKey = async (
    invitesRef: ReturnType<typeof collection>,
    guestKey: string,
  ) => {
    if (!guestKey) return null;

    // Prefer the new guestKey field (stable + unique per guest).
    type ExistingInvite = {
      id: string;
      token?: string;
      guestKey?: string;
      guestEmail?: string;
      guestPhone?: string;
      used?: boolean;
    };

    const byKey = await getDocs(
      query(invitesRef, where("guestKey", "==", guestKey), limit(1)),
    );
    if (!byKey.empty) {
      const docSnap = byKey.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<ExistingInvite, "id">) } as ExistingInvite;
    }

    // Backward-compatible fallback for older invite docs.
    if (guestKey.startsWith("email:")) {
      const email = guestKey.slice("email:".length);
      const byEmail = await getDocs(
        query(invitesRef, where("guestEmail", "==", email), limit(1)),
      );
      if (!byEmail.empty) {
        const docSnap = byEmail.docs[0];
        return { id: docSnap.id, ...(docSnap.data() as Omit<ExistingInvite, "id">) } as ExistingInvite;
      }
    }
    if (guestKey.startsWith("phone:")) {
      const phone = guestKey.slice("phone:".length);
      const byPhone = await getDocs(
        query(invitesRef, where("guestPhone", "==", phone), limit(1)),
      );
      if (!byPhone.empty) {
        const docSnap = byPhone.docs[0];
        return { id: docSnap.id, ...(docSnap.data() as Omit<ExistingInvite, "id">) } as ExistingInvite;
      }
    }

    return null as ExistingInvite | null;
  };

  const sendWhatsAppPlaceholder = async (
    phone: string,
    message: string,
    link: string,
  ) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    const token = await user.getIdToken();
    const appUrl =
      (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/g, "") ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const fullLink =
      link.startsWith("/") && appUrl ? `${appUrl}${link}` : link;

    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: phone,
        text: message,
        link: fullLink,
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; provider?: string; mode?: string; error?: string; status?: number }
      | null;

    if (!res.ok) {
      const pieces = [
        json?.error,
        typeof json?.status === "number" ? `status ${json.status}` : "",
      ].filter(Boolean);

      throw new Error(
        pieces.length ? pieces.join(" | ") : `WhatsApp send failed (${res.status})`,
      );
    }

    return {
      provider: json?.provider ?? "unknown",
      mode: json?.mode ?? "unknown",
      fullLink,
    };
  };

  const handleSendInvites = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (inviteMode === "single" && !inviteTarget) return;
    setInviteLoading(true);
    setInviteStatus("");
    try {
      const batch = writeBatch(db);
      const invitesRef = collection(
        db,
        "orgs",
        orgSlug,
        "events",
        eventSlug,
        "invites",
      );

      if (inviteMode === "single" && inviteTarget) {
        const guestKey = normalizeGuestKey({
          email: inviteTarget.email,
          phone: inviteTarget.phone,
        });

        const existing = await getExistingInviteByGuestKey(invitesRef, guestKey);
        const existingToken =
          typeof existing?.token === "string" ? existing.token : "";

        const token = existingToken || createInviteToken(6);
        const link = `/${orgSlug}/${eventSlug}/invite/${token}`;

        if (!existingToken) {
          const inviteDoc = doc(invitesRef);
          batch.set(inviteDoc, {
            token,
            guestKey,
            guestName: inviteTarget.name,
            guestPhone: inviteTarget.phone,
            guestEmail: inviteTarget.email.trim().toLowerCase(),
            eventName: eventData?.name ?? "",
            eventDate: eventData?.date ?? "",
            eventLocation: eventData?.location ?? "",
            message: inviteMessage,
            imageDataUrl: eventData?.imageDataUrl ?? "",
            qrX: eventData?.qrX ?? 0.1,
            qrY: eventData?.qrY ?? 0.1,
            qrSize: eventData?.qrSize ?? 96,
            nameX: eventData?.nameX ?? 0.1,
            nameY: eventData?.nameY ?? 0.3,
            nameColor: eventData?.nameColor ?? "#111827",
            nameSize: eventData?.nameSize ?? 16,
            nameFont: eventData?.nameFont ?? "Arial, sans-serif",
            used: false,
            createdAt: serverTimestamp(),
          });
          await batch.commit();
        }

        const sendResult = await sendWhatsAppPlaceholder(inviteTarget.phone, inviteMessage, link);
        setInviteLink(sendResult.fullLink);
        setInviteStatus(
          sendResult.mode === "session"
            ? "Invite created. WATI sent a session message (guest must have chatted with your number within 24 hours)."
            : existingToken
              ? "Invite already exists and was resent via WhatsApp."
              : "Invite created and sent via WhatsApp.",
        );
      }

      if (inviteMode === "all") {
        if (guests.length === 0) {
          setInviteStatus("No saved guests to invite. Save guests first.");
          setInviteLoading(false);
          return;
        }
        const guestKeys = guests
          .map((guest) => normalizeGuestKey(guest))
          .filter(Boolean);

        const existingByKey = new Map<
          string,
          { id: string; token: string; guestPhone?: string; guestEmail?: string }
        >();
        const existingTokens = new Set<string>();

        // Firestore "in" queries are limited (usually 30 values); chunk to support larger lists.
        for (let i = 0; i < guestKeys.length; i += 30) {
          const chunk = guestKeys.slice(i, i + 30);
          const snaps = await getDocs(
            query(invitesRef, where("guestKey", "in", chunk)),
          );
          snaps.docs.forEach((docSnap) => {
            const data = docSnap.data() as {
              token?: unknown;
              guestKey?: unknown;
              guestPhone?: unknown;
              guestEmail?: unknown;
            };
            const key = typeof data.guestKey === "string" ? data.guestKey : "";
            const token = typeof data.token === "string" ? data.token : "";
            if (!key || !token) return;
            existingByKey.set(key, {
              id: docSnap.id,
              token,
              guestPhone: typeof data.guestPhone === "string" ? data.guestPhone : undefined,
              guestEmail: typeof data.guestEmail === "string" ? data.guestEmail : undefined,
            });
            existingTokens.add(token);
          });
        }

        const usedTokens = new Set<string>(existingTokens);
        const inviteItems = guests.map((guest) => {
          const guestKey = normalizeGuestKey(guest);
          const existing = guestKey ? existingByKey.get(guestKey) : undefined;
          const token = existing?.token || (() => {
            let t = createInviteToken(6);
            while (usedTokens.has(t)) t = createInviteToken(6);
            usedTokens.add(t);
            return t;
          })();

          const link = `/${orgSlug}/${eventSlug}/invite/${token}`;
          return {
            token,
            link,
            guestKey,
            isExisting: Boolean(existing?.token),
            phone: guest.phone,
            message: buildInviteMessage(guest.name),
            guestName: guest.name,
            guestEmail: guest.email,
          };
        });
        const sendItems = inviteItems.filter((item) => Boolean(item.phone));

        inviteItems.forEach((item) => {
          if (item.isExisting) return;
          batch.set(doc(invitesRef), {
            token: item.token,
            guestKey: item.guestKey,
            guestName: item.guestName,
            guestPhone: item.phone,
            guestEmail: item.guestEmail.trim().toLowerCase(),
            eventName: eventData?.name ?? "",
            eventDate: eventData?.date ?? "",
            eventLocation: eventData?.location ?? "",
            message: item.message,
            imageDataUrl: eventData?.imageDataUrl ?? "",
            qrX: eventData?.qrX ?? 0.1,
            qrY: eventData?.qrY ?? 0.1,
            qrSize: eventData?.qrSize ?? 96,
            nameX: eventData?.nameX ?? 0.1,
            nameY: eventData?.nameY ?? 0.3,
            nameColor: eventData?.nameColor ?? "#111827",
            nameSize: eventData?.nameSize ?? 16,
            nameFont: eventData?.nameFont ?? "Arial, sans-serif",
            used: false,
            createdAt: serverTimestamp(),
          });
        });
        await batch.commit();

        let sent = 0;
        let failed = 0;
        const concurrency = 3;
        for (let i = 0; i < sendItems.length; i += concurrency) {
          const chunk = sendItems.slice(i, i + concurrency);
          const results = await Promise.allSettled(
            chunk.map((item) =>
              sendWhatsAppPlaceholder(item.phone, item.message, item.link),
            ),
          );
          results.forEach((r) => {
            if (r.status === "fulfilled") sent += 1;
            else failed += 1;
          });
        }

        setInviteStatus(
          failed
            ? `WhatsApp sends completed: ${sent} sent, ${failed} failed.`
            : `WhatsApp sends completed: ${sent} sent.`,
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create invites";
      setInviteStatus(message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyGuestInviteLink = async (guest: Guest) => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (isFree) {
      setUpgradeOpen(true);
      return;
    }
    try {
      const invitesRef = collection(
        db,
        "orgs",
        orgSlug,
        "events",
        eventSlug,
        "invites",
      );

      const guestKey = normalizeGuestKey(guest);
      const existing = await getExistingInviteByGuestKey(invitesRef, guestKey);
      const existingToken =
        typeof existing?.token === "string" ? existing.token : "";

      const token = existingToken || createInviteToken(6);
      const linkPath = `/${orgSlug}/${eventSlug}/invite/${token}`;
      const appUrl =
        (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/g, "") ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const fullLink = appUrl ? `${appUrl}${linkPath}` : linkPath;
      const now = serverTimestamp();

      if (!existingToken) {
        const batch = writeBatch(db);
        batch.set(doc(invitesRef), {
          token,
          guestKey,
          guestName: guest.name,
          guestPhone: guest.phone,
          guestEmail: guest.email.trim().toLowerCase(),
          eventName: eventData?.name ?? "",
          eventDate: eventData?.date ?? "",
          eventLocation: eventData?.location ?? "",
          message: buildInviteMessage(guest.name),
          imageDataUrl: eventData?.imageDataUrl ?? "",
          qrX: eventData?.qrX ?? 0.1,
          qrY: eventData?.qrY ?? 0.1,
          qrSize: eventData?.qrSize ?? 96,
          nameX: eventData?.nameX ?? 0.1,
          nameY: eventData?.nameY ?? 0.3,
          nameColor: eventData?.nameColor ?? "#111827",
          nameSize: eventData?.nameSize ?? 16,
          nameFont: eventData?.nameFont ?? "Arial, sans-serif",
          nameBg: eventData?.nameBg !== false,
          used: false,
          createdAt: now,
        });
        await batch.commit();
      }
      await navigator.clipboard.writeText(fullLink);
      showGuestNotice("Guest invite link copied.");
      showCopyToast("Link copied successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to copy guest invite link.";
      setGuestError(message);
    }
  };

  const startEdit = (guest: Guest) => {
    if (!guest.id) return;
    setEditingId(guest.id);
    const fallbackName = guest.name ?? "";
    setEditFirstName(guest.firstName ?? fallbackName.split(" ")[0] ?? "");
    setEditLastName(
      guest.lastName ?? fallbackName.split(" ").slice(1).join(" ") ?? "",
    );
    setEditPhone(guest.phone);
    setEditEmail(guest.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditPhone("");
    setEditEmail("");
  };

  const handleSaveEdit = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug || !editingId) return;
    setGuestError("");
    if (!editFirstName.trim() || !editLastName.trim() || !editPhone.trim()) {
      setGuestError("First name, last name, and phone number are required.");
      return;
    }
    try {
      const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
      await updateDoc(
        doc(db, "orgs", orgSlug, "events", eventSlug, "guests", editingId),
        {
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          name: fullName,
          phone: editPhone.trim(),
          email: editEmail.trim(),
        },
      );
      cancelEdit();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update guest";
      setGuestError(message);
    }
  };

  const handleDeleteGuest = async (guest: Guest, index?: number) => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (guest.id && orgSlug && eventSlug) {
      const confirmed = window.confirm("Delete this guest?");
      if (!confirmed) return;
      const batch = writeBatch(db);
      batch.delete(
        doc(db, "orgs", orgSlug, "events", eventSlug, "guests", guest.id),
      );
      batch.set(
        doc(db, "orgs", orgSlug, "events", eventSlug),
        { guestCount: increment(-1) },
        { merge: true },
      );
      await batch.commit();
      return;
    }
    if (typeof index === "number") {
      setPendingGuests((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteAllGuests = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (guests.length === 0 && pendingGuests.length === 0) {
      setDeleteAllOpen(false);
      return;
    }

    setDeleteAllLoading(true);
    setGuestError("");
    try {
      const savedGuests = guests.filter((guest) => guest.id);
      const chunkSize = 350;

      for (let i = 0; i < savedGuests.length; i += chunkSize) {
        const batch = writeBatch(db);
        const chunk = savedGuests.slice(i, i + chunkSize);
        chunk.forEach((guest) => {
          if (!guest.id) return;
          batch.delete(
            doc(db, "orgs", orgSlug, "events", eventSlug, "guests", guest.id),
          );
        });
        await batch.commit();
      }

      await updateDoc(doc(db, "orgs", orgSlug, "events", eventSlug), {
        guestCount: 0,
        guestTableLayout: null,
      });

      setPendingGuests([]);
      setSheetLayout(null);
      setUploadedSheetColumns([]);
      setGuestSearch("");
      setDeleteAllOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete all guests";
      setGuestError(message);
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleCheckInGuest = async (guest: Guest) => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    if (!guest.id) {
      setGuestError("Save imported guests before checking in.");
      return;
    }
    if (isFree && (guest.checkInCount ?? 0) >= maxScans) {
      setUpgradeOpen(true);
      return;
    }
    try {
      await updateDoc(
        doc(db, "orgs", orgSlug, "events", eventSlug, "guests", guest.id),
        {
          checkedIn: true,
          checkedInAt: new Date().toISOString(),
          checkInCount: increment(1),
        },
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to check in guest";
      setGuestError(message);
    }
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const handleDownloadGuestCard = async (guest: Guest) => {
    if (!eventData) return;
    setDownloadingGuestCard(true);
    setGuestError("");
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");

      const bgSrc = eventData.imageDataUrl ?? "";
      let width = 1080;
      let height = 1080;
      if (bgSrc) {
        const bg = await loadImage(bgSrc);
        width = bg.naturalWidth || width;
        height = bg.naturalHeight || height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(bg, 0, 0, width, height);
      } else {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);
      }

      if (!isFree) {
        const qrSize = eventData.qrSize ?? 96;
        const qrX = (eventData.qrX ?? 0.1) * width - qrSize / 2;
        const qrY = (eventData.qrY ?? 0.1) * height - qrSize / 2;
        const qrData = `${guest.name}|${params.org}/${params.event}`;
        const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData)}`;
        try {
          const qr = await loadImage(qrSrc);
          ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
        } catch {
          // QR download fallback: continue without QR image.
        }
      }

      const nameX = (eventData.nameX ?? 0.1) * width;
      const nameY = (eventData.nameY ?? 0.3) * height;
      const nameSize = eventData.nameSize ?? 16;
      const nameFont = eventData.nameFont ?? "Arial, sans-serif";
      const nameColor = eventData.nameColor ?? "#111827";
      const guestName = guest.name || "Guest";

      ctx.font = `600 ${nameSize}px ${nameFont}`;
      const textWidth = ctx.measureText(guestName).width;
      if (eventData.nameBg !== false) {
        const padX = 14;
        const padY = 10;
        const boxX = nameX - textWidth / 2 - padX;
        const boxY = nameY - nameSize - padY / 2;
        const boxW = textWidth + padX * 2;
        const boxH = nameSize + padY * 2;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 12);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = nameColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(guestName, nameX, nameY);

      const anchor = document.createElement("a");
      const safeName = guestName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = `${safeName || "guest"}-card.png`;
      anchor.click();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to download guest image card";
      setGuestError(message);
    } finally {
      setDownloadingGuestCard(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "orgs", orgSlug, "events", eventSlug), {
        name,
        date,
        time,
        location,
      });
      setEventData((prev) => ({ ...(prev ?? {}), name, date, time, location }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update event";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const orgSlug = params?.org;
    const eventSlug = params?.event;
    if (!orgSlug || !eventSlug) return;
    const confirmed = window.confirm(
      "Delete this event? This cannot be undone.",
    );
    if (!confirmed) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, "orgs", orgSlug, "events", eventSlug));
    batch.set(
      doc(db, "orgs", orgSlug),
      { eventCount: increment(-1) },
      { merge: true },
    );
    await batch.commit();
    router.replace(`/${orgSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </span>
          Loading event...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Link
            className="text-sm text-slate-600 hover:text-slate-900"
            href={`/${params.org}`}
          >
            Back to {orgName || "dashboard"}
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mt-6 mb-3">
            {eventData?.name ?? "Event"}
          </h1>
          <p className="text-slate-600 mb-8">
            {eventData?.date ? `Date: ${eventData.date}` : "Date: TBD"}
            {eventData?.time
              ? ` - Time: ${eventData.time}`
              : " - Time: TBD"} - {eventData?.location ?? "Location: TBD"}
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-500">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              Gates open:{" "}
              {eventData?.gatesOpenAt
                ? new Date(eventData.gatesOpenAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "0"}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              Peak window:{" "}
              {(() => {
                const checked = guests.filter((g) => g.checkedInAt);
                if (checked.length === 0) return "0";
                const counts: Record<number, number> = {};
                checked.forEach((g) => {
                  const d = new Date(g.checkedInAt as string);
                  const hour = d.getHours();
                  counts[hour] = (counts[hour] ?? 0) + 1;
                });
                const top = Object.entries(counts).sort(
                  (a, b) => Number(b[1]) - Number(a[1]),
                )[0];
                if (!top) return "0";
                const hour = Number(top[0]);
                const start = new Date();
                start.setHours(hour, 0, 0, 0);
                const end = new Date();
                end.setHours(hour + 1, 0, 0, 0);
                const fmt = (value: Date) =>
                  value.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                return `${fmt(start)} - ${fmt(end)}`;
              })()}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              Avg scan:{" "}
              {eventData?.scanCount
                ? `${Math.round((eventData.scanTotalMs ?? 0) / eventData.scanCount)} ms`
                : "0"}
            </div>
          </div>
          <div className="mt-4">
            <Link
              className="inline-flex items-center px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold"
              href={`/${params.org}/${params.event}/design`}
            >
              Design invite
            </Link>
            <Link
              className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold ml-3 ${
                isFree
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-slate-900 text-white"
              }`}
              href={`/${params.org}/${params.event}/scan`}
              onClick={(event) => {
                if (isFree) {
                  event.preventDefault();
                  setUpgradeOpen(true);
                }
              }}
            >
              {isFree ? "QR scanning disabled" : "Open scanner"}
            </Link>
          </div>
        </motion.div>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: "Registrations",
              value: "0",
              note: "Import guest list to begin",
            },
            {
              label: "Checked-in",
              value: "0",
              note: "Check-in opens on event day",
            },
            { label: "Staff assigned", value: "0", note: "Assign your team" },
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

        <section className="mt-10 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Edit event details</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Event name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="Event date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="Event time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="text-red-400 hover:text-red-300 text-sm"
                  onClick={handleDelete}
                >
                  Delete event
                </button>
              </div>
              {error ? (
                <div className="text-sm text-red-400">{error}</div>
              ) : null}
            </form>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Quick actions</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>Import guest list</div>
              <div>Assign staff</div>
              <div>Generate QR passes</div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Guest list</h2>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-emerald-700">Checked-in</div>
                <div className="mt-1 text-2xl font-black text-emerald-800">{checkedInCount}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-slate-600">Saved guests</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{savedGuestCount}</div>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-blue-700">Remaining</div>
                <div className="mt-1 text-2xl font-black text-blue-800">{remainingToCheckIn}</div>
              </div>
            </div>
            <div className="mb-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Search guest name to check in"
                value={guestSearch}
                onChange={(event) => setGuestSearch(event.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="First name"
                value={guestFirstName}
                onChange={(event) => setGuestFirstName(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Last name"
                value={guestLastName}
                onChange={(event) => setGuestLastName(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Phone number"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
                required
              />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                placeholder="Email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm"
                onClick={handleAddGuest}
              >
                Add guest
              </button>
              <label className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm cursor-pointer">
                Import Spreadsheet
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm"
                disabled={guestSaving || pendingGuests.length === 0}
                onClick={handleSaveGuests}
              >
                {guestSaving
                  ? "Saving files..."
                  : `Save ${pendingGuests.length} guest${pendingGuests.length === 1 ? "" : "s"}`}
              </button>
              {isFree ? (
                <div className="text-xs text-slate-500">
                  Free mode: {totalGuestCount}/{maxGuests} guests
                </div>
              ) : null}
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-sm"
                onClick={() => openInviteModal("all")}
              >
                Invite all via WhatsApp
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-red-600 text-white text-sm hover:bg-red-500"
                onClick={() => setDeleteAllOpen(true)}
              >
                Delete all
              </button>
            </div>
            {guestError ? (
              <div className="text-sm text-red-500 mb-4">{guestError}</div>
            ) : null}
            {guestNotice ? (
              <div className="text-sm text-emerald-600 mb-4">{guestNotice}</div>
            ) : null}
            {guestLimitWarning ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-800 mb-2">
                  Upload blocked in free mode
                </div>
                <div className="text-sm text-amber-700 mb-3">
                  {guestLimitWarning}
                </div>
                <Link
                  href={`/${params.org}/pricing`}
                  className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
                >
                  View pricing
                </Link>
              </div>
            ) : null}
            <div className="space-y-2">
              {filteredGuests.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No guests match your search.
                </div>
              ) : (
                <>
                  {sheetBlocksForView.length > 0 ? (
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {(() => {
                        const usage = new Map<string, number>();
                        const getLinkedGuest = (guestName: string) => {
                          const key = guestName.trim().toLowerCase();
                          const bucket = guestBucketsByName.get(key) ?? [];
                          if (bucket.length === 0) return null;
                          const used = usage.get(key) ?? 0;
                          const picked = bucket[used] ?? bucket[bucket.length - 1];
                          usage.set(key, used + 1);
                          return picked;
                        };
                        return sheetBlocksForView.map((block, index) => {
                          const palette = tableCardPalettes[index % tableCardPalettes.length];
                          return (
                          <div key={`${block.title}-${index}`} className={`rounded-xl border overflow-hidden ${palette.border}`}>
                            <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${palette.header}`}>
                              {block.title}
                            </div>
                            <div className={`max-h-72 overflow-y-auto ${palette.body}`}>
                              {block.rows.map((row) => {
                                const fromPosition = guestByTablePosition.get(
                                  `${row.tableColumnIndex}:${row.tableRowIndex}`,
                                );
                                const linkedGuest =
                                  fromPosition ?? getLinkedGuest(row.guestName);
                                return (
                                  <div
                                    key={row.key}
                                    className="grid grid-cols-[1fr,auto] items-center gap-2 border-t border-slate-200 px-3 py-2 text-sm"
                                  >
                                    <div className="pr-2 break-words">{row.guestName}</div>
                                    <button
                                      type="button"
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                                        linkedGuest?.checkedIn
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-blue-600 text-white hover:bg-blue-500"
                                      }`}
                                      onClick={() => {
                                        if (linkedGuest) handleCheckInGuest(linkedGuest);
                                      }}
                                      disabled={!linkedGuest || Boolean(linkedGuest.checkedIn)}
                                      title={!linkedGuest ? "Save guests first to enable check-in" : ""}
                                    >
                                      {linkedGuest?.checkedIn
                                        ? "Checked"
                                        : linkedGuest
                                          ? "Check in"
                                          : row.checkCell || "Pending"}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 mb-4">
                      <table className="w-full table-fixed text-sm">
                        <thead className="bg-white">
                          <tr>
                            {sheetColumnsForView.map((column) => (
                              <th
                                key={column}
                                className="px-3 py-2 text-left text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200"
                              >
                                {column}
                              </th>
                            ))}
                            <th className="px-3 py-2 text-left text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200">
                              Check-in
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGuests.map((guest, index) => (
                            <tr key={`sheet-${guest.email || guest.phone || guest.name}-${index}`} className="border-b border-slate-200 last:border-b-0">
                              {sheetColumnsForView.map((column) => {
                                const valueFromSheet = guest.sheetRow?.[column];
                                const fallbackByName =
                                  column.toLowerCase().includes("first")
                                    ? guest.firstName
                                    : column.toLowerCase().includes("last")
                                      ? guest.lastName
                                      : column.toLowerCase().includes("phone")
                                        ? guest.phone
                                        : column.toLowerCase().includes("mail")
                                          ? guest.email
                                          : column.toLowerCase().includes("name")
                                            ? guest.name
                                            : "";
                                const cellValue = valueFromSheet ?? fallbackByName ?? "";
                                return (
                                  <td key={`${column}-${index}`} className="px-3 py-2 break-words">
                                    {cellValue || "-"}
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                    guest.checkedIn
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-blue-600 text-white hover:bg-blue-500"
                                  }`}
                                  onClick={() => handleCheckInGuest(guest)}
                                  disabled={Boolean(guest.checkedIn)}
                                >
                                  {guest.checkedIn ? "Checked-in" : "Check in"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="hidden sm:grid sm:grid-cols-4 gap-3 text-xs uppercase tracking-widest text-slate-500 px-2">
                    <div>First / Last</div>
                    <div>Phone</div>
                    <div>Email</div>
                    <div>Status</div>
                  </div>
                  {filteredGuests.map((guest, index) => {
                    const isPending = !guest.id;
                    const isEditing = editingId === guest.id;
                    return (
                      <div
                        key={`${guest.email}-${index}`}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid sm:grid-cols-4 gap-3">
                              <input
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                value={editFirstName}
                                onChange={(event) =>
                                  setEditFirstName(event.target.value)
                                }
                              />
                              <input
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                value={editLastName}
                                onChange={(event) =>
                                  setEditLastName(event.target.value)
                                }
                              />
                              <input
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                value={editPhone}
                                onChange={(event) =>
                                  setEditPhone(event.target.value)
                                }
                              />
                              <input
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                value={editEmail}
                                onChange={(event) =>
                                  setEditEmail(event.target.value)
                                }
                              />
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <button
                                type="button"
                                className="text-blue-400 hover:text-blue-300"
                                onClick={handleSaveEdit}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-white"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-4 gap-3 text-sm items-center">
                            <div>
                              {guest.firstName || guest.lastName
                                ? `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim()
                                : guest.name || "Unnamed"}
                            </div>
                            <div className="text-slate-400">
                              {guest.phone || "No phone"}
                            </div>
                            <div className="text-slate-400">
                              {guest.email || "No email"}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-xs text-slate-500">
                                {guest.status ?? "invited"}{" "}
                                {guest.checkedIn
                                  ? `· Checked-in (${guest.checkInCount ?? 0}/${maxScansLabel})`
                                  : ""}
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900"
                                  onClick={() =>
                                    setMenuOpenId((prev) =>
                                      prev === guest.id
                                        ? null
                                        : (guest.id ?? null),
                                    )
                                  }
                                >
                                  ⋮
                                </button>
                                {menuOpenId === guest.id ? (
                                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg text-sm z-10">
                                    {!isPending ? (
                                      <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                        onClick={() =>
                                          openInviteModal("single", {
                                            name: guest.name,
                                            phone: guest.phone,
                                            email: guest.email,
                                          })
                                        }
                                      >
                                        Invite guest
                                      </button>
                                    ) : null}
                                    {!isPending ? (
                                      <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                        onClick={() => openGuestCard(guest)}
                                      >
                                        View guest image card
                                      </button>
                                    ) : null}
                                    {!isPending ? (
                                      <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                        onClick={() => {
                                          setMenuOpenId(null);
                                          void handleCopyGuestInviteLink(guest);
                                        }}
                                      >
                                        Copy guest invite link
                                      </button>
                                    ) : null}
                                    {!isPending && !isFree ? (
                                      <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                        onClick={() => {
                                          setMenuOpenId(null);
                                          void handleDownloadGuestCard(guest);
                                        }}
                                      >
                                        {downloadingGuestCard
                                          ? "Preparing download..."
                                          : "Download guest image card"}
                                      </button>
                                    ) : null}
                                    {!isPending ? (
                                      <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50"
                                        onClick={() => startEdit(guest)}
                                      >
                                        Edit guest
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-500"
                                      onClick={() =>
                                        handleDeleteGuest(guest, index)
                                      }
                                    >
                                      Delete guest
                                    </button>
                                    <div className="px-4 py-2 text-xs text-slate-400">
                                      More options coming soon
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Import tips</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                Upload CSV/TSV or Excel (.xlsx/.xls) to preserve your table column order.
              </div>
              <div>Wide multi-table sheets are auto-arranged into responsive table cards.</div>
              <div>Header row is optional; if present, column names are used in the guest table.</div>
              <div>Use the search bar to find guest names quickly and check them in.</div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {guestSaving ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.section
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.28, ease: easeOut },
                }}
                exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.18 } }}
                className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-slate-900">Saving guest files</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Please wait while we save your guest list and table layout.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                  <div className="text-sm font-medium text-blue-700">Saving...</div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {copyToast ? (
            <motion.div
              className="fixed top-6 right-6 z-[70] flex items-center gap-2 rounded-2xl border border-emerald-300/40 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-2xl shadow-emerald-900/35"
              initial={{ opacity: 0, y: -16, scale: 0.92, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(2px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.7 }}
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-white"
                animate={{ scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
              <span>{copyToast}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {uploadProcessing ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.section
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: easeOut },
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                  transition: { duration: 0.2 },
                }}
                className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-slate-900">Processing guest spreadsheet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Please wait while we arrange your table structure and prepare check-in search.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                  <div className="text-sm font-medium text-blue-700">Arranging guest tables...</div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {guestLimitModalOpen ? (
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
                onClick={closeGuestLimitModal}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="relative z-10 w-full max-w-[460px] bg-white border border-amber-200 rounded-3xl p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-amber-800 mb-2">Upload blocked in free mode</h3>
                <p className="text-sm text-amber-700 mb-4">{guestLimitWarning}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl bg-amber-600 text-white text-sm font-semibold"
                    onClick={closeGuestLimitModal}
                  >
                    OK
                  </button>
                  <Link
                    href={`/${params.org}/pricing`}
                    className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm font-semibold"
                    onClick={closeGuestLimitModal}
                  >
                    View pricing
                  </Link>
                </div>
                <p className="mt-3 text-xs text-slate-500">This message will close automatically in 10 seconds.</p>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {deleteAllOpen ? (
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
                onClick={() => {
                  if (!deleteAllLoading) setDeleteAllOpen(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold mb-2">Delete all guests?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  This will remove all saved and unsaved guests for this event.
                  This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700"
                    onClick={() => setDeleteAllOpen(false)}
                    disabled={deleteAllLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl bg-red-600 text-white"
                    onClick={handleDeleteAllGuests}
                    disabled={deleteAllLoading}
                  >
                    {deleteAllLoading ? "Deleting..." : "Yes, delete all"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {inviteOpen ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeInviteModal}
              />
              <motion.section
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: easeOut },
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                  transition: { duration: 0.2 },
                }}
                className="relative z-10 w-full max-w-[980px] bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">
                      {inviteMode === "single"
                        ? "Invite guest via WhatsApp"
                        : "Invite all guests via WhatsApp"}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {inviteMode === "single"
                        ? `Sending to ${inviteTarget?.name ?? ""} (${inviteTarget?.phone ?? ""})`
                        : `Sending to ${guests.length} saved guests`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-900"
                    onClick={closeInviteModal}
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500">
                      Message
                    </label>
                    <textarea
                      className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[140px] sm:min-h-[320px]"
                      value={inviteMessage}
                      onChange={(event) => setInviteMessage(event.target.value)}
                    />
                  </div>

                  {inviteMode === "single" ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="text-xs text-slate-500 mb-2">
                        Invite link
                      </div>
                      <div className="text-sm text-blue-400 break-words">
                        {inviteLink || "Link will appear after send."}
                      </div>
                      <div className="mt-4">
                        <div className="text-xs text-slate-500 mb-2">
                          Preview image
                        </div>
                        <div className="relative w-full h-48 sm:h-[320px] rounded-xl border border-slate-200 overflow-hidden bg-white">
                          {eventData?.imageDataUrl ? (
                            <img
                              src={eventData.imageDataUrl}
                              alt="Invite preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 bg-slate-50">
                              No design image yet
                            </div>
                          )}
                          {!isFree ? (
                            <div
                              className="absolute"
                              style={{
                                left: `${(eventData?.qrX ?? 0.1) * 100}%`,
                                top: `${(eventData?.qrY ?? 0.1) * 100}%`,
                                transform: "translate(-50%, -50%)",
                                width: eventData?.qrSize ?? 96,
                                height: eventData?.qrSize ?? 96,
                              }}
                            >
                              <img
                                alt="QR code"
                                className="w-full h-full object-cover rounded-xl border border-slate-200 bg-white"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                  `${inviteTarget?.name ?? ""}|${params.org}/${params.event}`,
                                )}`}
                                onError={(event) => {
                                  (
                                    event.currentTarget as HTMLImageElement
                                  ).style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="absolute left-4 top-4 rounded-full bg-amber-100 text-amber-800 text-xs px-3 py-1">
                              QR disabled in free mode
                            </div>
                          )}
                          <div
                            className={`absolute px-3 py-2 rounded-xl border border-slate-200 shadow text-sm font-semibold ${
                              eventData?.nameBg === false
                                ? "bg-transparent border-transparent shadow-none"
                                : "bg-white/90"
                            }`}
                            style={{
                              left: `${(eventData?.nameX ?? 0.1) * 100}%`,
                              top: `${(eventData?.nameY ?? 0.3) * 100}%`,
                              transform: "translate(-50%, -50%)",
                              color: eventData?.nameColor ?? "#111827",
                              fontSize: `${eventData?.nameSize ?? 16}px`,
                              fontFamily:
                                eventData?.nameFont ?? "Arial, sans-serif",
                            }}
                          >
                            {inviteTarget?.name ?? "Guest"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="text-xs uppercase tracking-widest text-slate-500">
                        Bulk Send
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        Messages will be sent to {guests.length} saved guests.
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Each guest gets a unique invite link created from this
                        page.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-slate-400">
                    {inviteStatus || ""}
                  </div>
                  <button
                    type="button"
                    className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold w-full sm:w-auto"
                    onClick={handleSendInvites}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? "Sending..." : "Send WhatsApp invite"}
                  </button>
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {cardOpen && cardGuest ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCardOpen(false)}
              />
              <motion.section
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: easeOut },
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                  transition: { duration: 0.2 },
                }}
                className="relative z-10 w-full max-w-[520px] bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Guest image card</h2>
                    <p className="text-sm text-slate-600">
                      {cardGuest.name} - {eventData?.name ?? ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-900"
                    onClick={() => setCardOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="relative w-full h-64 bg-slate-50">
                    {eventData?.imageDataUrl ? (
                      <img
                        src={eventData.imageDataUrl}
                        alt="Guest card"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : null}
                    {!isFree ? (
                      <div
                        className="absolute"
                        style={{
                          left: `${(eventData?.qrX ?? 0.1) * 100}%`,
                          top: `${(eventData?.qrY ?? 0.1) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          width: eventData?.qrSize ?? 96,
                          height: eventData?.qrSize ?? 96,
                        }}
                      >
                        <img
                          alt="QR code"
                          className="w-full h-full object-cover rounded-xl border border-slate-200 bg-white"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                            `${cardGuest.name}|${params.org}/${params.event}`,
                          )}`}
                          onError={(event) => {
                            (
                              event.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="absolute left-4 top-4 rounded-full bg-amber-100 text-amber-800 text-xs px-3 py-1">
                        QR disabled in free mode
                      </div>
                    )}
                    <div
                      className={`absolute px-3 py-2 rounded-xl border border-slate-200 shadow text-sm font-semibold ${
                        eventData?.nameBg === false
                          ? "bg-transparent border-transparent shadow-none"
                          : "bg-white/90"
                      }`}
                      style={{
                        left: `${(eventData?.nameX ?? 0.1) * 100}%`,
                        top: `${(eventData?.nameY ?? 0.3) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        color: eventData?.nameColor ?? "#111827",
                        fontSize: `${eventData?.nameSize ?? 16}px`,
                        fontFamily: eventData?.nameFont ?? "Arial, sans-serif",
                      }}
                    >
                      {cardGuest.name}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <div className="font-semibold">{cardGuest.name}</div>
                  <div>{cardGuest.email}</div>
                  <div>{cardGuest.phone}</div>
                </div>
              </motion.section>
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
                  QR scanning is disabled in free mode. Upgrade to unlock QR
                  check-in and smart invitations.
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
                  This organization has been blocked by an administrator. You
                  will be redirected.
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
    </div>
  );
}
