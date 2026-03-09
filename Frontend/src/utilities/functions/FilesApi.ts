import axios from "axios";
import type { VaultFile } from "../types/types";

export type FileFilters = {
    deviceId: string;
    q?: string;
    min?: number;
    max?: number;
    fileType?: string;
};


export async function fetchFiles(filters: FileFilters, token?: string): Promise<VaultFile[]> {
    try {
        const params = new URLSearchParams();
        params.set("deviceId", filters.deviceId);
        if (filters.q) params.set("q", filters.q);
        if (filters.min != null) params.set("min", String(filters.min));
        if (filters.max != null) params.set("max", String(filters.max));
        if (filters.fileType) params.set("fileType", filters.fileType);

        const res = await axios.get(`/api/file?${params.toString()}`, {
            headers: { "x-auth-token": token },
            responseType: "json", // ← force JSON parsing
        });

        console.log("raw res.data:", res.data);

        // Handle string response (axios failed to parse)
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

        if (!Array.isArray(data)) {
            console.warn("fetchFiles: expected array, got:", data);
            return [];
        }

        return data;
    } catch (error: any) {
        const message =
            error?.response?.data?.errors?.[0]?.msg ||  // ← your backend uses this shape
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error.message ||
            "Failed to fetch files";

        console.error("fetchFiles error:", error?.response?.data);
        throw new Error(message); // throws a string, never an object
    }
}


export async function deleteFile(id: string, token?: string): Promise<void> {
    try {
        await axios.delete(`/api/file/${id}`, {
            method: "DELETE",
            headers: { "x-auth-token": token },
        });
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


export async function downloadFile(id: string, filename: string, token?: string): Promise<void> {
    const res = await axios.get(`/api/file/${id}/download`, {
        headers: { "x-auth-token": token },
        responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export async function uploadFile(
    deviceId: string,
    file: File,
    onProgress?: (pct: number) => void,
    token?: string
): Promise<VaultFile> {
    return new Promise((resolve, reject) => {
        // const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/file/upload?deviceId=${deviceId}`);
        if (token) xhr.setRequestHeader("x-auth-token", token);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`Upload failed (${xhr.status})`));
            }
        };

        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.send(formData);
    });
}