import type { CookieSetOptions } from "universal-cookie";

export type FormData = {
    name?: string,
    email:string,
    password:string,
    password2?:string
}

export type AuthContextValue = {
    token?: string;
    login: (formdata: FormData) => Promise<void>;
    signup: (formdata: FormData) => Promise<void>;
    logout: () => void;
};


export type SetCookie = (
    name: string,
    value: any,
    options?: CookieSetOptions
  ) => void;


export type Drive = {
fs: string;
type: string;
mount: string;
sizeMB: number;
usedMB: number;
availableMB: number;
usePercent: number;
rw: boolean;
};

export type Device = {
_id: string;
userId: string;
name: string;
os: string;
real: boolean;
drives: Drive[];
status: "online" | "offline";
createdAt: string;
updatedAt: string;
storageTotalGB: number;
storageUsedGB: number;
availableGB: number;
};
