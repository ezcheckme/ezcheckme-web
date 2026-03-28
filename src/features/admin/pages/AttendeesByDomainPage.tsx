/**
 * AttendeesByDomain — Super Admin page
 * Mirrors legacy superAdmin/AttendeesByDomain.js.
 * Shows attendees grouped by email domain for a given date range.
 */

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAttendeesByDomain } from "@/shared/services/admin.service";

function formatDateParam(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}${m}${date.getFullYear()}`;
}

export function AttendeesByDomainPage() {
  const now = new Date();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );

  const [from, setFrom] = useState(yesterday);
  const [to, setTo] = useState(now);
  const [data, setData] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (f: Date, t: Date, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res: any = await getAttendeesByDomain(
        formatDateParam(f),
        formatDateParam(t),
      );
      const entries = Object.entries(res?.data || res || {}) as [
        string,
        number,
      ][];
      setData(entries);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(from, to, false);
  }, []); // eslint-disable-line

  const totalAttendees = useMemo(
    () => data.reduce((sum, [, qty]) => sum + qty, 0),
    [data],
  );

  const sorted = useMemo(() => [...data].sort((a, b) => b[1] - a[1]), [data]);

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Attendees by Domain</h1>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
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
        <div className="text-xl font-bold">
          Total new attendees: {totalAttendees}
        </div>
      </div>

      {!loading && (
        <div className="overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Domain</th>
                <th className="p-2 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(([domain, qty], i) => (
                <tr key={domain} className="border-t">
                  <td className="p-2 text-gray-400">{i + 1}</td>
                  <td className="p-2">{domain}</td>
                  <td className="p-2 text-right font-medium">{qty}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">
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
