/**
 * Course Students context menu — matches legacy ⋮ menu on Attendees tab.
 * Legacy menu has exactly 3 items:
 *   1. Add Attendee...
 *   2. Delete Selected...
 *   3. Upload Attendees List...
 */

import { UserPlus, Trash2, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseStudentsMenuProps {
  courseId: string;
  selectedCount?: number;
  onAddStudent?: () => void;
  onDeleteSelected?: () => void;
  onUploadList?: () => void;
  children: React.ReactNode;
}

export function CourseStudentsMenu({
  selectedCount = 0,
  onAddStudent,
  onDeleteSelected,
  onUploadList,
  children,
}: CourseStudentsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-52">
        <DropdownMenuItem onClick={onAddStudent}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Attendee...
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDeleteSelected}
          className="text-gray-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadList}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Attendees List...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
