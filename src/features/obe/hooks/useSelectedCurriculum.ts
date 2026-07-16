import { useEffect, useState } from "react";
import { useCurriculums } from "./useObe";

// Loads the curriculum list and tracks a selected id, defaulting to the active
// curriculum (or the first one). Shared by all curriculum-scoped OBE pages.
export function useSelectedCurriculum() {
  const { data: curriculums = [], isLoading } = useCurriculums();
  const [curriculumId, setCurriculumId] = useState("");

  useEffect(() => {
    if (!curriculumId && curriculums.length) {
      const active = curriculums.find((c) => c.is_active) ?? curriculums[0];
      setCurriculumId(active.id);
    }
  }, [curriculums, curriculumId]);

  const selected = curriculums.find((c) => c.id === curriculumId) ?? null;
  return { curriculums, curriculumId, setCurriculumId, selected, isLoading };
}
