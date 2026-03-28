import { useEffect } from "react";
import { AdminStatsWidgets } from "../components/AdminStatsWidgets";
import { AdminDashboardGraph } from "../components/AdminDashboardGraph";
import { AdminFieldStatsTable } from "../components/AdminFieldStatsTable";
import { CoursesAdminTable } from "../components/tbls/CoursesAdminTable";
import { HostsAdminTable } from "../components/tbls/HostsAdminTable";
import { AttendeesAdminTable } from "../components/tbls/AttendeesAdminTable";
import { useAdminStore } from "../store/admin.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ADMIN_VIEWS } from "@/config/constants";
import { format, parseISO, endOfWeek } from "date-fns";

function useAdminBasePayload() {
  const { user } = useAuthStore();
  const { viewType, dates } = useAdminStore();
  const defaultTo = endOfWeek(new Date());
  const defaultFrom = new Date(
    defaultTo.getFullYear(),
    defaultTo.getMonth() - 5,
    1,
  );
  return {
    groupId:
      user?.group ||
      user?.groupData?.id ||
      user?.groupData?._id,
    facultiesToInclude: null,
    faculty: user?.facultyManager || null,
    datesViewType: (viewType?.datesType || "WEEK").toLowerCase(),
    fromDate: format(
      dates?.from ? parseISO(dates.from) : defaultFrom,
      "ddMMyyyy",
    ),
    toDate: format(dates?.to ? parseISO(dates.to) : defaultTo, "ddMMyyyy"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function DashboardView() {
  const payload = useAdminBasePayload();
  const {
    elementsView,
    view,
    viewType,
    dates,
    getGeneralStats,
    getCoursesStats,
    getHostsStats,
  } = useAdminStore();

  useEffect(() => {
    // Determine the viewType parameter for the API
    let apiViewType: string | null = view;
    if (view === ADMIN_VIEWS.MAIN_DASHBOARD) {
      apiViewType = ADMIN_VIEWS.MAIN_DASHBOARD;
      getGeneralStats({ ...payload, viewType: apiViewType });
    } else if (view === ADMIN_VIEWS.MAIN_DASHBOARD_COURSES) {
      apiViewType = ADMIN_VIEWS.MAIN_DASHBOARD_COURSES;
      getGeneralStats({ ...payload, viewType: apiViewType });
      getCoursesStats({ ...payload, viewType: apiViewType });
    } else if (view === ADMIN_VIEWS.MAIN_DASHBOARD_HOSTS) {
      apiViewType = ADMIN_VIEWS.MAIN_DASHBOARD_HOSTS;
      getGeneralStats({ ...payload, viewType: apiViewType });
      getHostsStats({ ...payload, viewType: apiViewType });
    }
  }, [
    view,
    viewType?.datesType,
    dates?.from,
    dates?.to,
    payload.groupId,
    payload.faculty,
    getGeneralStats,
    getCoursesStats,
    getHostsStats,
  ]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <AdminDashboardGraph />
      {elementsView.adminMainStatsShow && <AdminStatsWidgets />}
      {elementsView.adminMainTableShow && (
        <>
          {view === ADMIN_VIEWS.MAIN_DASHBOARD && <AdminFieldStatsTable />}
          {view === ADMIN_VIEWS.MAIN_DASHBOARD_COURSES && <CoursesAdminTable />}
          {view === ADMIN_VIEWS.MAIN_DASHBOARD_HOSTS && <HostsAdminTable />}
        </>
      )}
    </div>
  );
}

export function AttendeesView() {
  const payload = useAdminBasePayload();
  const {
    viewType,
    dates,
    getInstituteAttendeesStats,
    instituteAttendeesStats,
  } = useAdminStore();

  useEffect(() => {
    getInstituteAttendeesStats(payload);
  }, [
    viewType?.datesType,
    dates?.from,
    dates?.to,
    payload.groupId,
    payload.faculty,
    getInstituteAttendeesStats,
  ]);

  const getAttendeeCount = () => {
    // We can assume it has classroomData or type it properly, let's type the stats
    const data = (instituteAttendeesStats as Record<string, any>)?.classroomData;
    return Array.isArray(data) ? data.length : 0;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Institute members ({getAttendeeCount()})
          </h2>
        </div>
      </div>
      <AttendeesAdminTable />
    </div>
  );
}

// Removed AdminPage completely as it's replaced by AdminLayoutPage & specific view routes
