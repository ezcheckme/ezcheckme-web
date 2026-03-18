/**
 * GroupAdminPage — admin hosts activity dashboard.
 * Date range filter, plan filters, search, sortable table.
 *
 * Source: old GroupAdminHostsActivity.js (278 lines) → ~200 lines.
 */

import { useState, useEffect, useMemo, startTransition } from "react";

import {
  Search,
  Calendar,
  Users,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth } from "date-fns";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { get } from "@/shared/services/api-client";
import { API_PATHS } from "@/config/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HostActivity {
  hostName: string;
  email: string;
  sessions: number;
  checkins: number;
  attendees: number;
  averageSession: number;
  courses: string[];
  createdat: string;
  plan: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateForApi(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}${m}${date.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GroupAdminPage() {
  const [from, setFrom] = useState(() => startOfMonth(new Date()));
  const [to, setTo] = useState(() => new Date());
  const [rows, setRows] = useState<HostActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [newOnly, setNewOnly] = useState(false);
  const [planFilter, setPlanFilter] = useState<"all" | "Standard" | "Premium">(
    "all",
  );
  const [sortCol, setSortCol] = useState<keyof HostActivity>("checkins");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [from, to]);

  async function fetchActivity() {
    setLoading(true);
    try {
      const res = await get<{ result: HostActivity[] }>(
        `${API_PATHS.HOST}/admin/hosts-activity?from=${formatDateForApi(from)}&to=${formatDateForApi(to)}`,
      );
      setRows(res.result || []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }

  // Filtered + sorted rows
  const filtered = useMemo(() => {
    let result = rows;

    if (newOnly) {
      result = result.filter((r) => {
        const created = new Date(r.createdat);
        return created >= from && created <= to;
      });
    }

    if (planFilter !== "all") {
      result = result.filter((r) => r.plan === planFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.hostName.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term),
      );
    }

    result = [...result].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return result;
  }, [rows, newOnly, planFilter, searchTerm, sortCol, sortAsc, from, to]);

  // Stats
  const stats = useMemo(() => {
    let standard = 0,
      premium = 0,
      checkins = 0;
    filtered.forEach((r) => {
      if (r.plan === "Standard") standard++;
      else if (r.plan === "Premium") premium++;
      checkins += r.checkins;
    });
    return { standard, premium, checkins, total: filtered.length };
  }, [filtered]);

  const columns: { key: keyof HostActivity; label: string; align?: string }[] =
    [
      { key: "hostName", label: "Host Name" },
      { key: "email", label: "Email" },
      { key: "sessions", label: "Sessions", align: "center" },
      { key: "checkins", label: "Check-ins", align: "center" },
      { key: "attendees", label: "Unique Attendees", align: "center" },
      { key: "averageSession", label: "Avg Session", align: "center" },
      { key: "createdat", label: "Joined", align: "center" },
      { key: "plan", label: "Plan", align: "center" },
    ];

  function handleSort(col: keyof HostActivity) {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-link" />
        <h1 className="text-2xl font-bold text-gray-800">Host Activity</h1>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <input
            type="date"
            value={format(from, "yyyy-MM-dd")}
            onChange={(e) => setFrom(new Date(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={format(to, "yyyy-MM-dd")}
            onChange={(e) => setTo(new Date(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="new-only"
            checked={newOnly}
            onCheckedChange={setNewOnly}
          />
          <Label htmlFor="new-only" className="text-sm">
            New hosts only
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          {(["all", "Standard", "Premium"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                planFilter === p
                  ? "bg-link text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            className="pl-8 h-8 w-[200px] text-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-600">
          Total: <strong>{stats.total}</strong>
        </span>
        <span className="text-gray-600">
          Standard: <strong>{stats.standard}</strong>
        </span>
        <span className="text-green-600">
          Premium: <strong>{stats.premium}</strong>
        </span>
        <span className="text-blue-600 flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          Check-ins: <strong>{stats.checkins.toLocaleString()}</strong>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 flex gap-4">
            {columns.map((col) => (
              <Skeleton key={col.key} width={col.key === "hostName" || col.key === "email" ? 120 : 72} height={14} borderRadius={3} />
            ))}
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-2.5">
                <Skeleton width={20} height={12} borderRadius={3} />
                <Skeleton width={`${20 + (i % 3) * 5}%`} height={12} borderRadius={3} />
                <Skeleton width={`${18 + (i % 2) * 6}%`} height={12} borderRadius={3} />
                <Skeleton width={48} height={12} borderRadius={3} />
                <Skeleton width={48} height={12} borderRadius={3} />
                <Skeleton width={48} height={12} borderRadius={3} />
                <Skeleton width={48} height={12} borderRadius={3} />
                <Skeleton width={64} height={12} borderRadius={3} />
                <Skeleton width={56} height={20} borderRadius={10} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500 w-10">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-2 font-medium text-gray-600 cursor-pointer hover:text-gray-900 ${
                      col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.label}
                    {sortCol === col.key && (
                      <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.email}
                  className={`border-t border-gray-100 hover:bg-gray-50 ${
                    row.plan === "Premium" ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {row.hostName}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{row.email}</td>
                  <td className="px-3 py-2 text-center">{row.sessions}</td>
                  <td className="px-3 py-2 text-center">{row.checkins}</td>
                  <td className="px-3 py-2 text-center">{row.attendees}</td>
                  <td className="px-3 py-2 text-center">
                    {row.averageSession}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-500">
                    {row.createdat
                      ? format(new Date(row.createdat), "MMM dd, yyyy")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.plan === "Premium"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.plan}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No hosts match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
