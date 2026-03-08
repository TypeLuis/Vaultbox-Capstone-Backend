import axios from "axios";

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


export async function fetchDevices(token?: string, q?: string) {
    try {

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        const r = await axios.get(`/api/device?${params.toString()}`, {
            headers: { "x-auth-token": token, },
        });
        const d = await r.data;
        // if (!r.ok) throw new Error("Failed to fetch devices");
        return d;
    } catch (error:any) {
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