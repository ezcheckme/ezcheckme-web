import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import {
  getCheckinPendingRequests,
  handleLateRequestCheckin,
  handleFieldLateRequestCheckin,
} from "@/shared/services/course.service";
import { format } from "date-fns";

export interface PendingRequest {
  id?: string;
  attendeeid?: string;
  method?: "field";
  sessionid?: string;
  name?: string;
  sessionName?: string;
  coursename?: string;
  reason?: string;
  totalRequests?: number;
  createdat?: number | string;
}

export interface PendingRequestsResponse {
  requests: PendingRequest[];
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [handlingId, setHandlingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Fetch when opened
  useEffect(() => {
    if (open) fetchRequests();
  }, [open]);

  // Initial fetch to get the badge count
  useEffect(() => {
    fetchRequests();

    // Set up polling every 3 minutes like the legacy app
    const interval = setInterval(() => fetchRequests(), 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const data = (await getCheckinPendingRequests()) as PendingRequestsResponse;
      setRequests(data?.requests || []);
    } catch (e) {
      console.error("Error fetching checkin requests", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveAll() {
    if (
      !confirm(
        "Are you sure you want to approve all the late check-in requests? This action cannot be undone.",
      )
    )
      return;

    try {
      const promises = requests.map((req) => {
        if (req.method !== "field") {
          if (!req.sessionid || !req.id) return Promise.resolve();
          return handleLateRequestCheckin(req.sessionid, {
            approval: "approved",
            attendeeid: req.id,
          });
        } else {
          return handleFieldLateRequestCheckin({
            approval: "approved",
            ...req,
          });
        }
      });
      await Promise.all(promises);
      await fetchRequests();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRequest(
    approval: "approved" | "denied",
    request: PendingRequest,
  ) {
    try {
      setHandlingId(request.id || request.attendeeid || null); // use an ID tracker to show loading state
      if (request.method !== "field") {
        if (!request.sessionid || !request.id) return;
        await handleLateRequestCheckin(request.sessionid, {
          approval,
          attendeeid: request.id,
        });
      } else {
        await handleFieldLateRequestCheckin({
          approval,
          ...request,
        });
      }
      await fetchRequests();
    } catch (e) {
      console.error(e);
    } finally {
      setHandlingId(null);
    }
  }

  const hasRequests = requests.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 transition-colors hover:bg-gray-100 cursor-pointer"
        style={{ color: "#224866" }}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {/* Red notification badge */}
        {hasRequests && (
          <span
            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: "#da0511" }}
          >
            {requests.length > 9 ? "9+" : requests.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-xl py-1 z-50 max-h-[400px] flex flex-col">
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Pending Requests
            </h3>
            {loading && (
              <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-link animate-spin" />
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {!hasRequests && !loading && (
              <div className="text-center py-6 text-xs text-gray-500">
                No new pending requests.
              </div>
            )}

            {hasRequests && (
              <button
                onClick={handleApproveAll}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#158946] hover:bg-green-50 rounded transition-colors mb-2 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                Approve all late requests...
              </button>
            )}

            <div className="flex flex-col gap-2">
              {requests
                .sort((a, b) => Number(b.createdat || 0) - Number(a.createdat || 0))
                .map((req, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded p-3 bg-gray-50 flex flex-col gap-2"
                  >
                    <p className="text-xs text-gray-800 leading-relaxed">
                      <span className="font-semibold">{req.name}</span> asked
                      for late check-in{" "}
                      {req.method !== "field"
                        ? `to session ${req.sessionName} of the `
                        : "in "}
                      <span className="font-semibold">{req.coursename}</span>{" "}
                      course.
                    </p>

                    <div className="text-xs mt-1">
                      <p className="text-gray-500">The provided reason was:</p>
                      <p className="font-semibold italic font-serif">
                        "{req.reason || "No reason provided"}"
                      </p>
                    </div>

                    <p className="text-[10px] text-gray-500 mt-1">
                      {(req.totalRequests || 0) > 1
                        ? `This attendee requested ${req.totalRequests} late check-ins at this course.`
                        : "This is the first late check-in request of this attendee at this course."}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="text-[11px] text-gray-500">
                        {req.createdat
                          ? format(new Date(req.createdat), "MMM d HH:mm")
                          : "Unknown time"}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequest("denied", req)}
                          disabled={handlingId === (req.id || req.attendeeid)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Deny
                        </button>
                        <button
                          onClick={() => handleRequest("approved", req)}
                          disabled={handlingId === (req.id || req.attendeeid)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
