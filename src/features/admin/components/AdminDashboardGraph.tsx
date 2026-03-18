import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAdminStore } from "../store/admin.store";
import { ADMIN_VIEWS } from "@/config/constants";

export function AdminDashboardGraph() {
  const { t } = useTranslation();
  const {
    adminStats,
    view,
    changeView,
    viewType,
    dates,
    changeViewType,
    elementsView,
    setElementsView,
    setDates,
    selectedGraphItems,
  } = useAdminStore();

  const navigate = useNavigate();
  const search: any = useSearch({ strict: false });

  // Sync URL view to store on load/change
  useEffect(() => {
    const desiredView = search.view || ADMIN_VIEWS.MAIN_DASHBOARD;
    if (desiredView !== view) {
      changeView(desiredView as any);
    }
  }, [search.view, view, changeView]);

  const handleDropdownChange = (newView: string) => {
    changeView(newView as any);
    navigate({
      to: "/admin",
      search: (prev: any) => ({ ...prev, view: newView }),
    });
  };

  const graphData = (adminStats as any)?.generalGraph || [];
  const fieldGraph = (adminStats as any)?.fieldGraph || [];

  const defaultTo = endOfWeek(new Date());
  const defaultFrom = new Date(
    defaultTo.getFullYear(),
    defaultTo.getMonth() - 5,
    1,
  );

  const fromDate = dates?.from ? parseISO(dates.from) : defaultFrom;
  const toDate = dates?.to ? parseISO(dates.to) : defaultTo;

  // Re-create the legacy getWeek function to perfectly match backend _id
  function getLegacyWeek(d: Date) {
    const target = new Date(d.valueOf());
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
  }

  const isDayView = viewType.datesType === "DAY";
  const data = [];

  let deltaInDays =
    (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24);
  if (!isDayView) {
    deltaInDays += fromDate.getDay();
  }

  const datesJump = isDayView ? 1 : 7;

  for (let i = 0; i <= deltaInDays; i += datesJump) {
    let date = new Date(fromDate);
    let lookupId = "";
    let displayLabel = "";

    if (isDayView) {
      date.setDate(date.getDate() + i);
      lookupId = format(date, "MM dd yyyy");
      displayLabel = format(date, "MMM dd yyyy");
    } else {
      date.setDate(date.getDate() + i - date.getDay() + 2);
      const week = getLegacyWeek(date);
      const year = date.getFullYear();

      lookupId = `${year}-${week}`;

      const labelDate = new Date(fromDate);
      labelDate.setHours(0, 0, 0, 0);
      labelDate.setDate(labelDate.getDate() + i);
      const startOfWeekDate = new Date(labelDate);
      startOfWeekDate.setDate(labelDate.getDate() - labelDate.getDay());
      displayLabel = format(startOfWeekDate, "MMM dd yyyy");
    }

    const point = graphData.find(
      (p: any) => p._id === lookupId || p.id === lookupId,
    );
    let value = 0;
    if (point) {
      value =
        viewType.dataType === "PERCENT"
          ? Math.floor((point.rate || 0) * 1000) / 10
          : point.checkins || 0;
    }

    const dataPoint: Record<string, any> = {
      name: displayLabel,
      value, // Always 'value' for average/overall
    };

    // Process fieldGraph for selected faculties
    if (fieldGraph && fieldGraph.length > 0) {
      fieldGraph.forEach((facultyItem: any) => {
        if (selectedGraphItems.includes(facultyItem.itemId)) {
          let count = 0;
          let rate = 0;
          let checkins = 0;
          facultyItem.dates?.forEach((d: any) => {
            if (d.date === lookupId) {
              count++;
              rate += d.rate;
              checkins += d.checkins;
            }
          });

          let facultyValue = 0;
          if (count > 0) {
            facultyValue =
              viewType.dataType === "PERCENT"
                ? Math.floor((rate / count) * 1000) / 10
                : checkins;
          }
          dataPoint[`val_${facultyItem.itemId}`] = facultyValue;
        }
      });
    }

    data.push(dataPoint);
  }

  const yAxisDomain =
    viewType.dataType === "PERCENT" ? [0, 100] : ["auto", "auto"];
  const yAxisTickFormatter = (val: number) =>
    viewType.dataType === "PERCENT" ? `${val}%` : val.toString();

  const fromStr = dates?.from
    ? format(parseISO(dates.from), "yyyy-MM-dd")
    : format(defaultFrom, "yyyy-MM-dd");
  const toStr = dates?.to
    ? format(parseISO(dates.to), "yyyy-MM-dd")
    : format(defaultTo, "yyyy-MM-dd");

  // A static palette of 10 nice distinct colors, similar to config.admin.colors in legacy
  const COLORS = [
    "#F44336",
    "#9C27B0",
    "#E91E63",
    "#673AB7",
    "#3F51B5",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#FF9800",
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 flex flex-col overflow-hidden">
      {/* Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-white border-b border-gray-200 gap-4">
        {/* Left Side: Select & Checkboxes */}
        <div className="flex items-center gap-6">
          <select
            value={search.view || view}
            onChange={(e) => handleDropdownChange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-48 p-2 cursor-pointer shadow-sm"
          >
            <option value={ADMIN_VIEWS.MAIN_DASHBOARD}>Academic Units</option>
            <option value={ADMIN_VIEWS.MAIN_DASHBOARD_COURSES}>Courses</option>
            <option value={ADMIN_VIEWS.MAIN_DASHBOARD_HOSTS}>
              Instructors
            </option>
          </select>

          <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={elementsView.adminMainGraphShow}
                onChange={(e) =>
                  setElementsView({
                    ...elementsView,
                    adminMainGraphShow: e.target.checked,
                  })
                }
                className="w-4 h-4 text-[#039be5] bg-gray-100 border-gray-300 rounded focus:ring-[#039be5]"
              />
              Graph
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={elementsView.adminMainStatsShow}
                onChange={(e) =>
                  setElementsView({
                    ...elementsView,
                    adminMainStatsShow: e.target.checked,
                  })
                }
                className="w-4 h-4 text-[#039be5] bg-gray-100 border-gray-300 rounded focus:ring-[#039be5]"
              />
              Overall
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={elementsView.adminMainTableShow}
                onChange={(e) =>
                  setElementsView({
                    ...elementsView,
                    adminMainTableShow: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              List
            </label>
          </div>
        </div>

        {/* Right Side: Toggle Switch & Dates */}
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-transparent rounded-md p-0.5 border border-[#039be5]">
            <button
              onClick={() => changeViewType({ dataType: "PERCENT" })}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${viewType.dataType === "PERCENT" ? "bg-[#039be5] text-white" : "text-[#039be5] bg-white hover:bg-blue-50"}`}
            >
              Percent
            </button>
            <button
              onClick={() => changeViewType({ dataType: "COUNT" })}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${viewType.dataType === "COUNT" ? "bg-[#039be5] text-white" : "text-[#039be5] bg-white hover:bg-blue-50"}`}
            >
              Check-ins
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-0.5 cursor-default">
                Start week
              </span>
              <input
                type="date"
                value={fromStr}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const selected = parseISO(e.target.value);
                  const snapped = startOfWeek(selected);
                  setDates({ from: format(snapped, "yyyy-MM-dd"), to: toStr });
                }}
                className="text-sm font-medium text-gray-800 border-b border-gray-400 pb-0.5 min-w-[130px] bg-transparent outline-none cursor-pointer focus:border-blue-500 transition-colors"
                max={toStr}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-0.5 cursor-default">
                End week
              </span>
              <input
                type="date"
                value={toStr}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const selected = parseISO(e.target.value);
                  const snapped = endOfWeek(selected);
                  setDates({
                    from: fromStr,
                    to: format(snapped, "yyyy-MM-dd"),
                  });
                }}
                className="text-sm font-medium text-gray-800 border-b border-gray-400 pb-0.5 min-w-[130px] bg-transparent outline-none cursor-pointer focus:border-blue-500 transition-colors"
                min={fromStr}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {elementsView.adminMainGraphShow && (
        <div className="h-[400px] w-full p-4 relative flex flex-col items-center justify-center">
          {data.length === 0 ? (
            <p className="text-gray-500 font-medium text-lg">
              {t("No graph data available for the selected dates.")}
            </p>
          ) : (
            <>
              <div className="absolute top-6 left-12">
                <span className="text-xs font-medium text-gray-500">
                  {viewType.dataType === "PERCENT" ? "100" : ""}
                </span>
              </div>
              <ResponsiveContainer
                width="100%"
                height="100%"
                className="border border-gray-300 mt-2 bg-[#fcfcfc]"
              >
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="0"
                    vertical={true}
                    stroke="#e0e0e0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#888888" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={yAxisDomain}
                    tickFormatter={yAxisTickFormatter}
                    tick={{ fontSize: 11, fill: "#888888" }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "4px",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => [
                      viewType.dataType === "PERCENT" ? `${value}%` : value,
                      viewType.dataType === "PERCENT"
                        ? t("Average")
                        : t("Check-ins"),
                    ]}
                  />
                  {selectedGraphItems.includes("all") && (
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={t("Average")}
                      stroke={
                        viewType.dataType === "PERCENT" ? "#000000" : "#2563EB"
                      }
                      strokeWidth={2.2}
                      dot={{ r: 2, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{
                        r: 4,
                        strokeWidth: 0,
                        fill:
                          viewType.dataType === "PERCENT"
                            ? "#000000"
                            : "#2563EB",
                      }}
                    />
                  )}
                  {fieldGraph.map((item: any, index: number) => {
                    if (!selectedGraphItems.includes(item.itemId)) return null;
                    return (
                      <Line
                        key={item.itemId}
                        type="monotone"
                        dataKey={`val_${item.itemId}`}
                        name={item.itemName || "Unknown"}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{
                          r: 4,
                          strokeWidth: 0,
                          fill: COLORS[index % COLORS.length],
                        }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}
    </div>
  );
}
