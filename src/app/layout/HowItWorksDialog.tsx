import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Mail, FileText } from "lucide-react";

interface HowItWorksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VIDEO_TYPE = {
  CLASSROOM: "CLASSROOM",
  SHIFTS: "SHIFTS",
};

const HELP_DATA = {
  [VIDEO_TYPE.CLASSROOM]: {
    video: "https://player.vimeo.com/video/463712945?autoplay=1",
    pdf: "https://1drv.ms/b/s!Aq-Nsy-hvpiYhoA-JAe9Qvg_CjPv3w?e=Ql892f",
    pdfText: "Classroom attendance tracking - Printable instructions",
    label: "Classroom Help",
  },
  [VIDEO_TYPE.SHIFTS]: {
    video: "https://player.vimeo.com/video/935417892?autoplay=1",
    pdf: "https://1drv.ms/b/s!Aq-Nsy-hvpiYhoBAUkJAt1FNhj47jw?e=7fFV0u",
    pdfText: "Shifts attendance tracking - Printable instructions",
    label: "Shifts Help",
  },
};

export function HowItWorksDialog({
  open,
  onOpenChange,
}: HowItWorksDialogProps) {
  const [activeTab, setActiveTab] = useState(VIDEO_TYPE.CLASSROOM);

  const activeData = HELP_DATA[activeTab];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] p-0 overflow-hidden bg-black/95 text-white border-0 gap-0">
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab(VIDEO_TYPE.CLASSROOM)}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === VIDEO_TYPE.CLASSROOM
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {HELP_DATA[VIDEO_TYPE.CLASSROOM].label}
          </button>
          <button
            onClick={() => setActiveTab(VIDEO_TYPE.SHIFTS)}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === VIDEO_TYPE.SHIFTS
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {HELP_DATA[VIDEO_TYPE.SHIFTS].label}
          </button>
        </div>

        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            title="How does it work"
            src={activeData.video}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black">
          <a
            href="mailto:info@ezcheck.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <Mail className="h-5 w-5" />
            Contact us
          </a>
          <a
            href={activeData.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <FileText className="h-5 w-5" />
            {activeData.pdfText}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
