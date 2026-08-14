/**
 * Image upload field.
 *
 * There was no file upload anywhere in the previous app: the "Upload New Photo"
 * button had no handler and no file input, and the menu form accepted a pasted
 * URL. This posts to the API, which validates, strips EXIF, re-encodes to
 * WebP, and proxies to object storage - the upload key never reaches here.
 */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Image } from "@/components/common/Image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const MAX_BYTES = 8 * 1024 * 1024;

export type UploadKind = "menu" | "canteen" | "avatar" | "complaint";

function readCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function ImageUploadField({
  kind,
  label,
  value,
  onChange,
  aspect = "video",
  className,
}: {
  kind: UploadKind;
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  aspect?: "square" | "video" | "wide";
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Images must be smaller than 8 MB.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("file", file);

      const csrf = readCsrfToken();
      const response = await fetch(`${API_URL}/api/uploads/image`, {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "x-csrf-token": csrf } : undefined,
        body: form,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { detail?: string; error?: { message?: string } }
          | null;
        throw new Error(
          payload?.detail ??
            payload?.error?.message ??
            "The image could not be uploaded.",
        );
      }

      const result = (await response.json()) as { url: string };
      onChange(result.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <Label>{label}</Label>

      <div className="mt-1.5 flex items-start gap-4">
        <div className={cn("relative", aspect === "square" ? "w-24" : "w-40")}>
          <Image
            src={value}
            alt={label}
            aspect={aspect}
            seed={label}
            className="border border-border"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="mr-1.5 h-4 w-4" aria-hidden />
            )}
            {value ? "Replace" : "Upload"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            JPEG, PNG, WebP or AVIF. Up to 8 MB. Converted to WebP on upload.
          </p>
        </div>
      </div>
    </div>
  );
}
