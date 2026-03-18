import { memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomLineProps {
  room: string | null;
  rooms: string[];
  onChangeRoom: (room: string) => void;
}

/**
 * Room selector — matches old app: large bold "Room" text + dropdown.
 * Old styles: fontSize 47px, fontWeight 700, position absolute, top -160px.
 * We use relative positioning instead for cleaner layout.
 */
export const RoomLine = memo(({ room, rooms, onChangeRoom }: RoomLineProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "he";

  if (!room || !rooms || rooms.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute top-[-160px] flex flex-row items-baseline",
        "text-[47px] font-bold",
        "2xl:text-[47px]",
        // Responsive: below 1600px → 35px
        "max-[1600px]:text-[35px]",
        // Height-based responsive (match old app media queries)
        "max-[900px]:h-auto max-[900px]:text-[35px]",
      )}
    >
      <div className={cn("mx-2", isRtl && "text-right")}>
        {t("Room")}
      </div>

      <div className="w-[150px] ml-[10px]">
        <Select
          value={room || undefined}
          onValueChange={onChangeRoom}
          dir={isRtl ? "rtl" : "ltr"}
        >
          <SelectTrigger className="text-[47px] max-[1600px]:text-[35px] font-bold h-auto border-slate-400 bg-white py-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem
                key={r}
                value={r}
                className={cn("text-lg", isRtl && "text-right")}
              >
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

RoomLine.displayName = "RoomLine";
