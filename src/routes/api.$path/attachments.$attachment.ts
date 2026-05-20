import {createFileRoute} from "@tanstack/react-router";
import {readEmail, toAttachmentMeta} from "@/lib/mailfs.server.ts";
import {userMiddleware} from "@/lib/api.ts";

export const Route = createFileRoute("/api/$path/attachments/$attachment")({
    server: {
        middleware: [userMiddleware],
        handlers: {
            GET: async ({context, params: {path, attachment: attachmentName}}) => {
                const email = await readEmail(context.currentUser, path);

                const attachment = email.attachments?.find(
                    (att) => att.filename === attachmentName,
                );

                if (!attachment) {
                    return Response.json(null);
                }

                const metadata = toAttachmentMeta(attachment);

                const response = new Response(
                    typeof attachment.content === "string"
                        ? attachment.content
                        : new Blob([
                            attachment.content instanceof ArrayBuffer
                                ? attachment.content
                                : Buffer.copyBytesFrom(attachment.content),
                        ]),
                );

                response.headers.set(
                    "Content-Type",
                    attachment.mimeType ?? "application/octet-stream",
                );
                response.headers.set(
                    "Content-Disposition",
                    `attachment; filename="${attachment.filename}"`,
                );
                response.headers.set("Content-Length", metadata.size.toFixed(0));

                return response;
            },
        },
    },
});
