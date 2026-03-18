/**
 * HostsActivity — Super Admin page
 * Mirrors legacy superAdmin/HostsActivity.js.
 * Shows a date-filtered table of all host activity with filters for plan type,
 * min sessions/checkins, search, and "new hosts only" toggle.
 */

import { useState, useEffect, useMemo, startTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getHostsByActivity } from "@/shared/services/admin.service";

interface HostRow {
  hostName: string;
  email: string;
  sessions: number;
  checkins: number;
  attendees: number;
  averageSession: number;
  courses: unknown[];
  createdat: string;
  plan: string;
}

function formatDateParam(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}${m}${date.getFullYear()}`;
}

export function HostsActivityPage() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(now);
  const [rows, setRows] = useState<HostRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [standardOnly, setStandardOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [minSessions, setMinSessions] = useState(0);
  const [minCheckins, setMinCheckins] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (f: Date, t: Date) => {
    setLoading(true);
    try {
      const data: any = await getHostsByActivity(
        formatDateParam(f),
        formatDateParam(t),
      );
      setRows((data?.result || data || []) as HostRow[]);
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(from, to);
  }, []); // eslint-disable-line

  const filteredRows = useMemo(() => {
    let result = rows;
    if (newOnly) {
      result = result.filter((r) => {
        const created = new Date(r.createdat);
        return created > from && created < to;
      });
    }
    result = result.filter((r) => {
      if (r.sessions < minSessions || r.checkins < minCheckins) return false;
      if (standardOnly && r.plan !== "Standard") return false;
      if (premiumOnly && r.plan !== "Premium") return false;
      if (
        searchTerm &&
        !r.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
    return result;
  }, [
    rows,
    newOnly,
    standardOnly,
    premiumOnly,
    minSessions,
    minCheckins,
    searchTerm,
    from,
    to,
  ]);

  const stats = useMemo(() => {
    let standard = 0,
      premium = 0,
      checkins = 0;
    filteredRows.forEach((r) => {
      if (r.plan === "Standard") standard++;
      if (r.plan === "Premium") premium++;
      checkins += r.checkins || 0;
    });
    return { standard, premium, checkins };
  }, [filteredRows]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hosts Activity</h1>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label>From</Label>
          <Input
            type="date"
            value={from.toISOString().split("T")[0]}
            onChange={(e) => {
              const d = new Date(e.target.value);
              setFrom(d);
              fetchData(d, to);
            }}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>To</Label>
          <Input
            type="date"
            value={to.toISOString().split("T")[0]}
            onChange={(e) => {
              const d = new Date(e.target.value);
              setTo(d);
              fetchData(from, d);
            }}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={newOnly} onCheckedChange={setNewOnly} />
          <Label>New hosts only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label>Min sessions</Label>
          <Input
            type="number"
            className="w-20"
            value={minSessions}
            onChange={(e) => setMinSessions(Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Min checkins</Label>
          <Input
            type="number"
            className="w-20"
            value={minCheckins}
            onChange={(e) => setMinCheckins(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Stats + plan toggles */}
      <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
        {!premiumOnly && (
          <span className="font-semibold">Standard: {stats.standard}</span>
        )}
        {!standardOnly && (
          <span className="font-semibold">Premium: {stats.premium}</span>
        )}
        <span className="font-semibold">Checkins: {stats.checkins}</span>

        <div className="flex items-center gap-2">
          <Switch
            checked={standardOnly}
            onCheckedChange={(v) => {
              setStandardOnly(v);
              if (v) setPremiumOnly(false);
            }}
          />
          <Label>Standard only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={premiumOnly}
            onCheckedChange={(v) => {
              setPremiumOnly(v);
              if (v) setStandardOnly(false);
            }}
          />
          <Label>Premium only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="w-48"
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
          />
        </div>
      </div>

      {/* Table */}
      {!loading && (
        <div className="overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Host Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-right">Sessions</th>
                <th className="p-2 text-right">Checkins</th>
                <th className="p-2 text-right">Unique Attendees</th>
                <th className="p-2 text-right">Avg Session</th>
                <th className="p-2 text-right"># Courses</th>
                <th className="p-2 text-left">Joined</th>
                <th className="p-2 text-left">Plan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t ${row.plan === "Premium" ? "bg-green-50" : ""}`}
                >
                  <td className="p-2 text-gray-400">{i + 1}</td>
                  <td className="p-2">{row.hostName}</td>
                  <td className="p-2">{row.email}</td>
                  <td className="p-2 text-right">{row.sessions}</td>
                  <td className="p-2 text-right">{row.checkins}</td>
                  <td className="p-2 text-right">{row.attendees}</td>
                  <td className="p-2 text-right">{row.averageSession || 0}</td>
                  <td className="p-2 text-right">{row.courses?.length ?? 0}</td>
                  <td className="p-2 text-xs">
                    {row.createdat
                      ? new Date(row.createdat).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-2 font-medium">{row.plan}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    No data
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
