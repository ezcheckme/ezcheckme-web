/**
 * CoronaMessageDialog
 * Mirrors legacy CoronaMessageDialog.js.
 * Informational dialog about tracking attendance in online lectures (COVID-era).
 * Shown once; dismissed with "Got It!" and stored in localStorage.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CoronaMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoronaMessageDialog({
  open,
  onOpenChange,
}: CoronaMessageDialogProps) {
  const [showMore, setShowMore] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem("_usersSawCoronaDialog_", "true");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Tracking Attendance in Online Lectures</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="text-sm space-y-2">
            <p>
              Do you want to verify that your students are{" "}
              <strong>actually</strong> present in your online lectures?
            </p>
            <p>
              Just share your screen via your video conference platform (Zoom,
              Google Hangouts, etc.), and use EZCheck.me to run a regular
              check-in session. Students can check-in remotely, using their
              smartphones.
            </p>
            {!showMore && (
              <button
                onClick={() => setShowMore(true)}
                className="text-link hover:underline text-sm cursor-pointer"
              >
                Learn more...
              </button>
            )}
          </div>
          <div className="flex items-center justify-center">
            <img
              src="assets/images/home/zoom.jpg"
              alt="zoom"
              className="rounded-lg max-w-full"
            />
          </div>

          {showMore && (
            <div className="col-span-2 text-sm space-y-2 border-t pt-3">
              <p className="underline">
                Advantages of using EZCheck.me to track online attendance:
              </p>
              <p>
                <strong>Portability</strong> – Attendance reports are generated
                per student, irrespective of the different video conferencing
                platforms used.
              </p>
              <p>
                <strong>Consistency</strong> – Students are identified by their
                unique IDs, irrespective of the various nicknames they use.
              </p>
              <p>
                <strong>Integrity</strong> – Several check-in sessions can be
                staged during the same online lecture, e.g. at beginning and
                end.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleDismiss}>Got It!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
