import {useAge} from "@/lib/utils.ts";

export function AgeDisplay(props: { timestamp: number | undefined }) {
    const age = useAge(props.timestamp ?? Date.now())

    return `Age: ${age}`;
}