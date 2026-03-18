/**
 * CourseTemplates — template selector dropdown for course creation/editing.
 * Matches old app's Templates.js component behavior:
 * - Shows a select dropdown with available templates
 * - Group managers get Save/Override/Delete options
 * - Non-group-managers only see templates if they exist
 * - Returns null if user is not group manager and no templates exist
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Save,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTemplates } from "../hooks/useTemplates";
import type { CourseTemplate } from "@/shared/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CourseTemplatesProps {
  /** Currently selected template */
  template: CourseTemplate | null;
  /** Callback when template or field changes */
  onChange: (field: string, value: unknown) => void;
  /** Current course data for saving templates */
  courseData: {
    language?: string;
    location?: { lat: number; lng: number } | null;
    ivrenabled?: boolean;
    postCheckinUrl?: { message: string; url: string } | null;
    iconQuizEnabled?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isGroupManager(user: any): boolean {
  return !!(user?.groupmanager || user?.facultyManager);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseTemplates({
  template,
  onChange,
  courseData,
}: CourseTemplatesProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const groupId = user?.group ?? user?.groupId ?? null;

  const {
    templates,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates(groupId ?? null);

  // Load templates when groupId available
  useEffect(() => {
    if (groupId) loadTemplates();
  }, [groupId, loadTemplates]);

  // Dialog states
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [templateToApply, setTemplateToApply] = useState<CourseTemplate | null>(
    null,
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [templateToOverride, setTemplateToOverride] =
    useState<CourseTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<CourseTemplate | null>(null);

  // Save menu state
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // ---- Handlers ----

  const handleSelectChange = (value: string) => {
    if (value === "__save__") {
      setShowSaveMenu(true);
      return;
    }
    if (value === "__delete__") {
      setShowDeleteMenu(true);
      return;
    }
    if (value === "") {
      onChange("template", null);
      return;
    }
    // Find selected template
    const selected = templates.find((t) => t._id === value);
    if (selected) {
      setTemplateToApply(selected);
      setApplyDialogOpen(true);
    }
  };

  const applySelectedTemplate = () => {
    if (!templateToApply) return;
    onChange("template", templateToApply);
    onChange("language", templateToApply.language ?? "en");
    onChange("location", templateToApply.location ?? null);
    onChange("ivrenabled", templateToApply.ivrenabled ?? false);
    onChange("postCheckinUrl", templateToApply.postCheckinUrl ?? null);
    setApplyDialogOpen(false);
  };

  const handleSaveAsNew = async () => {
    if (!templateName.trim()) return;
    await createTemplate({
      groupId: groupId ?? undefined,
      name: templateName.trim(),
      language: courseData?.language ?? "en",
      location: courseData?.location ?? undefined,
      ivrenabled: courseData?.ivrenabled ?? false,
      postCheckinUrl: courseData?.postCheckinUrl ?? undefined,
    });
    setSaveDialogOpen(false);
    setTemplateName("");
    setShowSaveMenu(false);
  };

  const handleOverrideExisting = async () => {
    if (!templateToOverride) return;
    await updateTemplate({
      id: templateToOverride._id,
      name: templateToOverride.name,
      language: courseData?.language ?? "en",
      location: courseData?.location ?? undefined,
      ivrenabled: courseData?.ivrenabled ?? false,
      iconQuizEnabled: courseData?.iconQuizEnabled ?? true,
      postCheckinUrl: courseData?.postCheckinUrl ?? undefined,
    });
    setOverrideDialogOpen(false);
    setShowSaveMenu(false);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    await deleteTemplate(templateToDelete._id);
    setDeleteDialogOpen(false);
    setShowDeleteMenu(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-sm py-1">
        {t("error loading templates") || "Error loading templates"}
      </div>
    );
  }

  // Hide entirely if not group manager and no templates
  if (!isGroupManager(user) && templates.length === 0) {
    return null;
  }

  return (
    <>
      {/* Template Select Dropdown */}
      <div className="relative">
        <select
          value={template?._id ?? ""}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full h-14 px-3 pl-10 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none"
        >
          <option value="">Templates...</option>
          {templates.map((tmpl) => (
            <option key={tmpl._id} value={tmpl._id}>
              {tmpl.name}
            </option>
          ))}
          {isGroupManager(user) && templates.length > 0 && (
            <option disabled>──────────</option>
          )}
          {isGroupManager(user) && (
            <option value="__save__">
              💾 {t("Save current course as template...") || "Save current course as template..."}
            </option>
          )}
          {isGroupManager(user) && templates.length > 0 && (
            <option value="__delete__">
              🗑️ {t("Delete template...") || "Delete template..."}
            </option>
          )}
        </select>
        <FileText className="absolute left-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
        <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>

      {/* Save menu (popover-style) */}
      {showSaveMenu && (
        <div className="border border-gray-200 rounded-md shadow-lg bg-white p-2 mt-1">
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
            onClick={() => {
              setSaveDialogOpen(true);
              setShowSaveMenu(false);
            }}
          >
            <Save className="w-4 h-4 text-gray-500" />
            {t("Save as new template...") || "Save as new template..."}
          </button>
          {templates.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-gray-400 mt-1">
                {t("Override existing template:") ||
                  "Override existing template:"}
              </div>
              {templates.map((tmpl) => (
                <button
                  key={tmpl._id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  onClick={() => {
                    setTemplateToOverride(tmpl);
                    setOverrideDialogOpen(true);
                    setShowSaveMenu(false);
                  }}
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                  {tmpl.name}
                </button>
              ))}
            </>
          )}
          <button
            type="button"
            className="w-full text-left px-3 py-1 text-xs text-gray-400 mt-1 hover:text-gray-600"
            onClick={() => setShowSaveMenu(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Delete menu */}
      {showDeleteMenu && (
        <div className="border border-gray-200 rounded-md shadow-lg bg-white p-2 mt-1">
          {templates.length > 0 ? (
            templates.map((tmpl) => (
              <button
                key={tmpl._id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600 rounded flex items-center gap-2"
                onClick={() => {
                  setTemplateToDelete(tmpl);
                  setDeleteDialogOpen(true);
                  setShowDeleteMenu(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
                {tmpl.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400">
              {t("No templates to delete") || "No templates to delete"}
            </div>
          )}
          <button
            type="button"
            className="w-full text-left px-3 py-1 text-xs text-gray-400 mt-1 hover:text-gray-600"
            onClick={() => setShowDeleteMenu(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Apply template confirmation dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {t("Apply template") || "Apply template"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to apply the{" "}
            <strong>{templateToApply?.name}</strong> template to the course?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={applySelectedTemplate}>
              {t("Apply") || "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save as new template dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {t("Save as new template") || "Save as new template"}
            </DialogTitle>
          </DialogHeader>
          <input
            type="text"
            autoFocus
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={t("Template name") || "Template name"}
            className="w-full h-10 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-[var(--color-secondary)]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                setTemplateName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsNew}
              disabled={!templateName.trim()}
            >
              {t("Save") || "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override existing template confirmation */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {t("Override existing template") || "Override existing template"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to override the{" "}
            <strong>{templateToOverride?.name}</strong> template with the
            current course settings?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOverrideDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleOverrideExisting}>
              {t("Override") || "Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete template confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {t("Delete template") || "Delete"} {templateToDelete?.name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to delete the{" "}
            <strong>{templateToDelete?.name}</strong> template?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {t("Delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
