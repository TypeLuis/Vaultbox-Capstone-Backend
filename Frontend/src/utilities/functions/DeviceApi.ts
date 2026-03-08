import axios from "axios";
import type { Device } from "../types/types";

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


export async function fetchDevices(token?: string, params?: {
    status?: "online" | "offline";
    q?: string;
}): Promise<Device[]> {
    try {

        const param = new URLSearchParams()
        if (params?.q) param.set('q', params.q) 
        if (params?.status) param.set('status', params.status) 


        const res = await axios.get(`/api/device?${param.toString()}`, {
            headers: { "x-auth-token": token, },
        });
        return res.data;
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



export async function updateDeviceStatus(
    deviceId: string,
    status: "online" | "offline",
    token?: string,
) {
    try {
        const updates = {
            "status": status
        }
        const { data } = await axios.put(
            `/api/device/${deviceId}`,
            updates,
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
            "Failed to update device";

        throw new Error(message);
    }
}

export async function deleteDevice(
    deviceId: string,
    token?: string,
) {
    try {
        const { data } = await axios.delete(
            `/api/device/${deviceId}`,
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
            "Failed to update device";

        throw new Error(message);
    }
}