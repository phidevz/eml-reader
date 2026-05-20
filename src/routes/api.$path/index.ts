import {createFileRoute} from "@tanstack/react-router";
import {readEmlFile} from "@/lib/mailfs.server.ts";
import {userMiddleware} from "@/lib/api.ts";

export const Route = createFileRoute("/api/$path/")({
    server: {
        middleware: [userMiddleware],
        handlers: {
            GET: async ({context, params: {path}}) => {
                const content = await readEmlFile(context.currentUser, path);

                const response = new Response(content);

                // Extract filename from path
                const filename = path.split("/").pop() || "email.eml";

                // Set response headers
                response.headers.set("Content-Type", "message/rfc822");
                response.headers.set(
                    "Content-Disposition",
                    `attachment; filename="${filename}"`,
                );
                response.headers.set(
                    "Content-Length",
                    Buffer.byteLength(content, "utf-8").toFixed(0),
                );

                return response;
            },
        },
    },
});
