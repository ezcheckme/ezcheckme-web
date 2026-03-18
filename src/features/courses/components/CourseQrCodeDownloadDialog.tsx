/**
 * Course QR Code Download Dialog — generates a printable QR sign PDF.
 * Replaces old CourseQrCodeDownloadDialog.js (115 lines) + QrPdf.js.
 * Uses qr-logo for QR generation and @react-pdf/renderer for PDF output.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, QrCode as QrCodeIcon, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/features/auth/store/auth.store";

// Import QRLogo from the qr-logo package
// eslint-disable-next-line @typescript-eslint/no-require-imports
import QRLogo from "qr-logo";

// PDF components
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

interface CourseQrCodeDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    id: string;
    _id?: string;
    name: string;
  };
}

// ---------------------------------------------------------------------------
// PDF Document
// ---------------------------------------------------------------------------

const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  courseName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    maxWidth: 400,
  },
  qrImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  scanText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});

function QrPdfDocument({
  course,
  qrImage,
  theme,
  t,
}: {
  course: { name: string };
  qrImage: string;
  theme?: { bgColor?: string; image?: string };
  t: (key: string) => string;
}) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {theme?.image && (
          <View
            style={[
              pdfStyles.logoContainer,
              { backgroundColor: theme.bgColor || "#0277bd" },
            ]}
          >
            <Image src={theme.image} style={pdfStyles.logo} />
          </View>
        )}
        <Text style={pdfStyles.courseName}>{course.name}</Text>
        <Image src={qrImage} style={pdfStyles.qrImage} />
        <Text style={pdfStyles.scanText}>
          {t("Scan the Code to Self Check-in")}
        </Text>
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateRandomString(): string {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 2; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseQrCodeDownloadDialog({
  open,
  onOpenChange,
  course,
}: CourseQrCodeDownloadDialogProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const theme = (user as any)?.data?.theme;
  const courseId = course._id || course.id;

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setQrImage(null);

    const r = generateRandomString;
    const url = `https://ezcheck.me/${r()}${r()}${r()}/${r()}${courseId}${r()}/self`;

    const qrLogo = new QRLogo("assets/images/logos/printable_session_logo.png");

    qrLogo
      .generate(url, { errorCorrectionLevel: "H", margin: 0, width: 1200 }, 3.3)
      .then((image: string) => {
        setQrImage(image);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("QR generation failed:", err);
        setLoading(false);
      });
  }, [open, courseId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5" />
            Download Printable Course Sign
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">Generating QR code...</p>
          </div>
        ) : qrImage ? (
          <div className="flex flex-col items-center py-4 space-y-4">
            {/* Preview */}
            <div className="border rounded-lg p-6 bg-white shadow-sm flex flex-col items-center space-y-3">
              {theme?.image && (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.bgColor || "#0277bd" }}
                >
                  <img
                    src={theme.image}
                    alt=""
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}
              <p className="font-bold text-lg text-center">{course.name}</p>
              <img
                src={qrImage}
                alt="QR Code"
                className="w-48 h-48 object-contain"
              />
              <p className="text-sm text-gray-500">
                {t("Scan the Code to Self Check-in")}
              </p>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 text-center space-y-1 px-4">
              <p>
                Download and print this sign and hang it at the self-check-in
                location to help attendees to check-in easily.
              </p>
              <p>
                Note: This is optional. Attendees listed in the course can
                self-check-in without scanning the QR.
              </p>
            </div>

            {/* Download PDF */}
            <PDFDownloadLink
              document={
                <QrPdfDocument
                  course={course}
                  qrImage={qrImage}
                  theme={theme}
                  t={t}
                />
              }
              fileName={`${course.name} QR check-in sign.pdf`}
              className="inline-flex items-center gap-2 bg-link hover:bg-link/90 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              {({ loading: pdfLoading }) =>
                pdfLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download the Sign
                  </>
                )
              }
            </PDFDownloadLink>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p>Failed to generate QR code. Please try again.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
