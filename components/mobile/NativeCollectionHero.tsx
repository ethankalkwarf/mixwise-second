"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

type Props = {
  name: string;
  headline?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  count: number;
  parentName?: string | null;
  parentSlug?: string | null;
};

/** Photo-first collection header for the native shell. No website breadcrumbs or cream wash. */
export function NativeCollectionHero({
  name,
  headline,
  description,
  imageUrl,
  count,
  parentName,
  parentSlug,
}: Props) {
  const router = useRouter();
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  const src = nativePhotoUrl(imageUrl, 1080, 85) || imageUrl || null;
  const drinks = `${count} drink${count === 1 ? "" : "s"}`;
  const backLabel = parentSlug && parentName ? parentName : "Search";

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (parentSlug) {
      router.push(`/occasions/${parentSlug}`);
      return;
    }

    router.push("/cocktails?browse=collections", { scroll: false });
  };

  return (
    <section className="native-collection-hero">
      <button type="button" onClick={goBack} className="native-collection-hero__back">
        <ChevronLeftIcon aria-hidden />
        <span>{backLabel}</span>
      </button>
      <div className="native-collection-hero__stage">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="native-collection-hero__photo" src={src} alt="" />
        ) : (
          <div className="native-collection-hero__fallback" />
        )}
        <div className="native-collection-hero__shade" aria-hidden />
        <span className="native-collection-hero__count">{drinks}</span>
        <div className="native-collection-hero__copy">
          <p className="native-collection-hero__eyebrow">{parentName || "Collection"}</p>
          <h1 className="native-collection-hero__title">{name}</h1>
          {headline ? <p className="native-collection-hero__headline">{headline}</p> : null}
          {description ? <p className="native-collection-hero__description">{description}</p> : null}
        </div>
      </div>
    </section>
  );
}
