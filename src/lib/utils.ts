import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import {useEffect, useMemo, useState} from "react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
};

export const useAge = (ts: number) => {
    const [age, setAge] = useState(Date.now() - ts);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        setAge(Date.now() - ts);

        const id = window.setInterval(() => {
            setAge(Date.now() - ts);
        }, 1000);

        return () => window.clearInterval(id);
    }, [ts]);

    return useMemo(() => formatTime(age), [age])
}