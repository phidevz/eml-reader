import {createServerOnlyFn} from "@tanstack/react-start";
import {z} from "zod";

/**
 * if you specify userSpecificFolders, users need to be logged in: The username header
 * also then, file trees etc. are scoped to the current user (which will be "*" otherwise)
 * and you can emulate a user being set via EML__I_REALLY_WANT_TO_EMULATE_THE_FOLLOWING_USER (do not do this in PROD)
 *
 * You _SHOULD_ use EML_PROXY_SHARED_SECRET and supply the header Shared-Secret from the proxy
 */
const envSchema = z.object({
    ttlSeconds: z.coerce.number().positive().int().optional().default(300),
    mailRoot: z.string().nonempty().optional().default("/var/mail"),
    userSpecificFolders: z.enum(["1", "0", "yes", "no", "true", "false"]).optional().transform(value => value === "1" || value === "yes" || value === "true").default(false),
    usernameHeader: z.string().trim().nonempty().optional(),
    _iReallyWantToEmulateTheFollowingUser: z.string().nonempty().optional(),
    proxySharedSecret: z.string().trim().min(20).optional(),
}).refine(({
               userSpecificFolders,
               usernameHeader
           }) => !userSpecificFolders || !!usernameHeader?.trim(),
    {error: "Username header can only be set exactly when userSpecificFolders is turned on"});

let options: ReturnType<typeof envSchema.parse> | undefined = undefined;

export const getOptions = createServerOnlyFn(() => {
    if (!options) {
        try {
            const envVariables = Object.entries(process.env)
                .filter((tuple) => /^EML_/i.test(tuple[0]));
            const transformed = Object.fromEntries(envVariables
                .map((tuple) => {
                    let key = tuple[0].substring(4).toLowerCase();
                    if (key.length > 0) {
                        key = key[0] + key.slice(1).replaceAll(/_./g, (match) => match.substring(1).toUpperCase())
                    }
                    return [key, tuple[1]];
                }),
            );

            // Leave this here for debugging purposes
            // console.log("Validating ENV", envVariables, transformed);

            options = envSchema.parse(transformed);
        } catch (error) {
            console.error("Failed to parse env", error);
            options = envSchema.parse({}); // gets defaults
        }
    }

    return options;
});
