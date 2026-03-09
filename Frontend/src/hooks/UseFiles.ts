import { useState, useEffect, useCallback } from "react";
import { fetchFiles, deleteFile, type FileFilters } from "../utilities/functions/FilesApi";
import type { VaultFile } from "../utilities/types/types";
import { useAuth } from "../context/authcontext";

export function useFiles(filters: FileFilters | null) {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {token} = useAuth()

  const load = useCallback(async () => {
    if (!filters?.deviceId) { setFiles([]); return; }
    setLoading(true);
    setError(null);
    setFiles([]);
    try {
      const data = await fetchFiles(filters, token);
      // setFiles(data);
      console.log(data)
      setFiles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters?.deviceId, filters?.q, filters?.min, filters?.max]);

  useEffect(() => { load(); }, [load]);

  const remove = useCallback(async (id: string) => {
    await deleteFile(id, token);
    setFiles((prev) => prev.filter((f) => f._id !== id));
  }, []);

  return { files, loading, error, refresh: load, remove };
}