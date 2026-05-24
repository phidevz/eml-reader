import {createMiddleware, createServerFn} from "@tanstack/react-start";
import {z} from "zod";
import {
    getFileTree as getFileTreeImpl,
    readEmail,
    toAttachmentMeta,
} from "@/lib/mailfs.server.ts";
import {getOptions} from "@/lib/options.server.ts";

export type AppContext = {
    isSignedIn: false
    currentUser: string
} | {
    isSignedIn: true
    currentUser: string
}

export class PathNotFoundError extends Error {
    constructor() {
        super("Mail or file path does not exist");
    }
}

export class AuthError extends Error {
    constructor() {
        super("Unauthorized");
    }
}

export type Username = AppContext["currentUser"];

export const CatchAllUser = "*" as const;

export const userMiddleware = createMiddleware()
    .server(({next, request}) => {
        const {
            userSpecificFolders,
            usernameHeader,
            _iReallyWantToEmulateTheFollowingUser,
            proxySharedSecret
        } = getOptions();

        if (!userSpecificFolders) {
            return next({
                context: {
                    isSignedIn: false,
                    currentUser: CatchAllUser
                } as AppContext
            });
        }

        if (!!_iReallyWantToEmulateTheFollowingUser) {
            return next({
                context: {
                    isSignedIn: true,
                    currentUser: _iReallyWantToEmulateTheFollowingUser!,
                } as AppContext
            });
        }

        if (!!proxySharedSecret && request.headers.get("Shared-Secret")?.trim() != proxySharedSecret) {
            console.error("Shared secret missing or wrong")
            throw new AuthError();
        }

        const usernameValue = request.headers.get(usernameHeader!)?.trim();
        if (!usernameValue) {
            console.error("Username header missing")
            throw new AuthError();
        }
        if (usernameValue === CatchAllUser) {
            console.error("Catch-all username is not allowed")
            throw new AuthError();
        }

        return next({
            context: {
                isSignedIn: true,
                currentUser: usernameValue!,
            } as AppContext
        });
    })

export const getCurrentUser = createServerFn({method: "GET"})
    .middleware([userMiddleware])
    .handler(async ({context}) => {
        return context.currentUser;
    })

export const GetFileTreeSchema = z
    .object({
        forceRefresh: z.boolean().optional().default(false),
    })
    .optional();

export type GetFileTreeOptions = z.infer<typeof GetFileTreeSchema>;

export const getFileTree = createServerFn({method: "GET"})
    .middleware([userMiddleware])
    .inputValidator(GetFileTreeSchema)
    .handler(async ({context, data}) => {
        return await getFileTreeImpl(context.currentUser, data);
    });

export const GetEmailSchema = z.object({
    path: z.string().nonempty(),
});

export const getEmail = createServerFn({method: "GET"})
    .middleware([userMiddleware])
    .inputValidator(GetEmailSchema)
    .handler(async ({context, data: {path: relativePath}}) => {
        const email = await readEmail(context.currentUser, relativePath);

        return {
            pathOnDisk: relativePath,
            headers: Object.fromEntries(email.headers.entries()),
            subject: email.subject,
            from: email.from?.name,
            to: email.to?.at(0)?.name,
            date: !!email.date ? new Date(email.date) : undefined,
            text: email.text,
            html: email.html || undefined,
            attachments: (email.attachments || []).map(toAttachmentMeta),
        };
    });

export interface ParsedEmail {
    pathOnDisk: string;
    headers: Record<string, any>;
    subject?: string;
    from?: string;
    to?: string;
    date?: Date;
    text?: string;
    html?: string;
    attachments: Array<{
        filename?: string;
        cid?: string;
        contentType?: string;
        size: number;
        contentDisposition?: string;
    }>;
}
