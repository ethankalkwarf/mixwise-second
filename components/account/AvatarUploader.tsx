"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Cropper, { type Area } from "react-easy-crop";
import Image from "next/image";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";

interface AvatarUploaderProps {
  avatarUrl?: string | null;
  displayName: string;
  onUploaded: (url: string | null) => void;
  /** Optional identity/meta shown beside the avatar; upload actions move below. */
  details?: ReactNode;
}

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function getCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = Math.min(512, Math.round(Math.max(crop.width, crop.height)));
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.9
    );
  });
}

export function AvatarUploader({
  avatarUrl,
  displayName,
  onUploaded,
  details,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const shownUrl = preview || avatarUrl;
  const initial = displayName.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    setPreview(null);
  }, [avatarUrl]);

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const openFile = (file: File) => {
    if (!ALLOWED.has(file.type)) {
      toast.error("Use a JPEG, PNG, or WebP image");
      return;
    }
    if (file.size > MAX_BYTES * 4) {
      toast.error("Image is too large — try one under 8MB");
      return;
    }
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const applyCrop = async () => {
    if (!cropSrc || !croppedArea) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedArea);
      if (blob.size > MAX_BYTES) {
        toast.error("Cropped image is still over 2MB — zoom in a bit more");
        return;
      }
      const localPreview = URL.createObjectURL(blob);
      setPreview(localPreview);
      closeCrop();

      const body = new FormData();
      body.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/profile/avatar", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPreview(null);
        toast.error(data.error || "Couldn't upload photo");
        return;
      }
      setPreview(data.avatar_url ?? null);
      onUploaded(data.avatar_url ?? null);
      toast.success("Profile photo updated");
      URL.revokeObjectURL(localPreview);
    } catch {
      toast.error("Couldn't crop photo");
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Couldn't remove photo");
        return;
      }
      setPreview(null);
      onUploaded(null);
      toast.success("Profile photo removed");
    } catch {
      toast.error("Couldn't remove photo");
    } finally {
      setUploading(false);
    }
  };

  const avatarButton = (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive disabled:opacity-60"
      aria-label="Change profile photo"
    >
      {shownUrl ? (
        <Image
          src={shownUrl}
          alt=""
          width={64}
          height={64}
          className="h-full w-full object-cover"
          unoptimized={shownUrl.startsWith("blob:")}
        />
      ) : (
        <span className="text-xl font-bold text-olive">{initial}</span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-forest/45 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <CameraIcon className="h-5 w-5 text-cream drop-shadow" />
      </span>
    </button>
  );

  const uploadActions = (
    <div className="min-w-0 space-y-1">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-olive hover:text-olive-dark disabled:opacity-50"
        >
          {uploading ? "Uploading…" : shownUrl ? "Change photo" : "Upload photo"}
        </button>
        {(avatarUrl || preview) && !uploading && (
          <button
            type="button"
            onClick={() => void remove()}
            className="text-sm text-sage hover:text-forest"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-sage">Crop to a square · JPEG/PNG/WebP · up to 2MB</p>
    </div>
  );

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) openFile(file);
      }}
    />
  );

  return (
    <>
      {details ? (
        <div className="space-y-3">
          <div className="flex min-w-0 items-start gap-4">
            {avatarButton}
            <div className="min-w-0 flex-1 overflow-hidden">{details}</div>
          </div>
          {uploadActions}
          {fileInput}
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-4">
          {avatarButton}
          {uploadActions}
          {fileInput}
        </div>
      )}

      {cropSrc && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-charcoal/80 sm:items-center sm:justify-center sm:p-6">
          <div className="flex h-full w-full flex-col bg-cream sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl sm:overflow-hidden">
            <div className="flex items-center justify-between border-b border-mist px-4 py-3">
              <h2 className="font-serif text-lg font-bold text-forest">Crop photo</h2>
              <button
                type="button"
                onClick={closeCrop}
                className="rounded-full p-2 text-sage hover:bg-mist hover:text-forest"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-[280px] flex-1 bg-charcoal">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-4 border-t border-mist bg-white px-4 py-4">
              <label className="block text-sm text-sage">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-2 w-full accent-olive"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCrop}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-forest hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploading || !croppedArea}
                  onClick={() => void applyCrop()}
                  className="btn-primary disabled:opacity-50"
                >
                  {uploading ? "Saving…" : "Use photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
