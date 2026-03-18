/**
 * useTemplates — hook for course template CRUD operations.
 * Mirrors old app's useTemplates.js hook.
 */

import { useState, useCallback } from "react";
import * as courseService from "@/shared/services/course.service";
import type { CourseTemplate } from "@/shared/types";

export function useTemplates(groupId: string | null) {
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTemplates = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const result = await courseService.getCourseTemplates(groupId);
      setTemplates(result);
      setLoading(false);
    } catch (err) {
      console.error("Error loading templates:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [groupId]);

  const createTemplate = useCallback(
    async (data: Partial<CourseTemplate>) => {
      try {
        const result = await courseService.createCourseTemplate(data);
        await loadTemplates();
        return result;
      } catch (err) {
        console.error("Error creating template:", err);
        setError(err as Error);
        return null;
      }
    },
    [loadTemplates],
  );

  const updateTemplate = useCallback(
    async (data: Partial<CourseTemplate> & { id: string }) => {
      try {
        const result = await courseService.updateCourseTemplate(data);
        await loadTemplates();
        return result;
      } catch (err) {
        console.error("Error updating template:", err);
        setError(err as Error);
        return null;
      }
    },
    [loadTemplates],
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        await courseService.deleteCourseTemplate(templateId);
        await loadTemplates();
        return true;
      } catch (err) {
        console.error("Error deleting template:", err);
        setError(err as Error);
        return false;
      }
    },
    [loadTemplates],
  );

  return {
    templates,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
