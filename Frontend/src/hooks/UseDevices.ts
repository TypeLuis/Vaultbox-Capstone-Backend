import { useState, useEffect, useCallback } from "react";
import { fetchDevices, deleteDevice, updateDeviceStatus } from "../utilities/functions/DeviceApi";
import type { Device } from "../utilities/types/types"; 
import { useAuth } from "../context/authcontext";

type Filters = {
  status?: "online" | "offline";
  q?: string;
};

export function useDevices(filters: Filters = {}) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {token} = useAuth()

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDevices(token, filters);
      setDevices(data);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.q]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await deleteDevice(id, token);
    setDevices((prev) => prev.filter((d) => d._id !== id));
  }, []);

  const toggleStatus = useCallback(async (device: Device) => {
    const next = device.status === "online" ? "offline" : "online";
    const updated = await updateDeviceStatus(device._id, next, token);
    setDevices((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
  }, []);

  return { devices, loading, error, refresh: load, remove, toggleStatus };
}