import {ErrorComponent as PrimitiveErrorComponent, type ErrorComponentProps} from "@tanstack/react-router";
import {PathNotFoundError} from "@/lib/api.ts";

export function ErrorComponent(props: ErrorComponentProps) {
    if (props.error instanceof PathNotFoundError) {
        return props.error.message;
    }

    return <PrimitiveErrorComponent error={props.error}/>
}