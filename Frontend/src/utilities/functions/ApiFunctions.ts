import axios from "axios"
import type { FormData, SetCookie } from "../types/types"
import { selfHosted } from "./configFunctions"

export async function authFunction(formdata: FormData, url: string, setCookies: SetCookie) {
    let res = await axios.post(url, formdata)
    setCookies('token', res.data.token)
    return res.data
}



export async function apiCreateDevice(token?: string, q?: string) {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
  
      const { data } = await axios.post(
        `/api/device?${params.toString()}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
  
      return data;
  
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        "Failed to create device";
  
      console.error(message);
      throw new Error(message);
    }
  }




export async function apiFetchDevices(token?: string) {
    const r = await axios.get(`/api/device`, {
        headers: { "x-auth-token": token, },
    });
    const d = await r.data;
    // if (!r.ok) throw new Error("Failed to fetch devices");
    return d;
}

export async function apiFetchFiles(token: string, deviceId: string, q: string) {
    const params = new URLSearchParams({ deviceId });
    if (q) params.set("q", q);
    const r = await fetch(`/api/file?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json();
    if (!r.ok) throw new Error("Failed to fetch files");
    return d;
}

export async function apiDownload(token: string, fileId: string, filename: string) {
    if(!selfHosted) return
    const r = await fetch(`/api/file/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("Download failed");
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function apiGetImageUrl(token: string, fileId: string) {
    const r = await fetch(`/api/file/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("Preview failed");
    const blob = await r.blob();
    return URL.createObjectURL(blob);
}

export async function apiDeleteFile(token: string, fileId: string) {
    const r = await fetch(`/api/file/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("Delete failed");
}