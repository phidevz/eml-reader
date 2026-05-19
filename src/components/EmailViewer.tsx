import { AttachmentsList } from "./AttachmentsList";
import { useMail } from "@/hooks/useMail.ts";

interface EmailViewerProps {
  emailPath: string;
}

export function EmailViewer({ emailPath }: EmailViewerProps) {
  const query = useMail();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Loading email...</p>
        </div>
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-sm font-medium text-destructive mb-1">Error</p>
          <p className="text-sm">Failed to load email</p>
        </div>
      </div>
    );
  }

  const email = query.data;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="shrink-0 border-b border-border p-6">
        <div className="space-y-2 text-sm text-muted-foreground">
          {email.from && (
            <div>
              <span className="font-medium text-foreground">From:</span>{" "}
              {email.from}
            </div>
          )}
          {email.to && (
            <div>
              <span className="font-medium text-foreground">To:</span>{" "}
              {email.to}
            </div>
          )}
          {email.date && (
            <div>
              <span className="font-medium text-foreground">Date:</span>{" "}
              {new Date(email.date).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {email.html ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: email.html }}
              className="break-words"
            />
          </div>
        ) : email.text ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm bg-muted p-4 rounded">
            {email.text}
          </pre>
        ) : (
          <p className="text-muted-foreground">No content</p>
        )}
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="shrink-0 border-t border-border p-6">
          <AttachmentsList
            attachments={email.attachments}
            emailPath={emailPath}
          />
        </div>
      )}
    </div>
  );
}
