import {createStart, createCsrfMiddleware} from '@tanstack/react-start'
import {userMiddleware} from "@/lib/api.ts";

const csrfMiddleware = createCsrfMiddleware({
    filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
    requestMiddleware: [csrfMiddleware, userMiddleware],
}))