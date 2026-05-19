'use client'

import { Download, File } from 'lucide-react'

import type { ParsedEmail } from "@/lib/api.ts";

interface AttachmentsListProps {
  attachments: ParsedEmail['attachments']
  emailPath: string
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function AttachmentsList({
  attachments,
  emailPath,
}: AttachmentsListProps) {
  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="font-semibold mb-4 text-base">Attachments</h3>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <File className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.filename || `Attachment ${index + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(attachment.size)}
                </p>
              </div>
            </div>
            <a
              href={`/api/${encodeURIComponent(
                emailPath,
              )}/attachments/${encodeURIComponent(attachment.filename || `attachment-${index}`)}`}
              download={attachment.filename}
              className="shrink-0 p-2 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground"
              title="Download attachment"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
