/** @deprecated Use replayNativeIntro from @/lib/mobile/nativeIntro */
export {
  replayNativeIntro as replayNativeTour,
  NATIVE_TOUR_STORAGE_KEY,
} from "@/lib/mobile/nativeIntro";

export { NATIVE_INTRO_EVENT as NATIVE_TOUR_EVENT } from "@/lib/mobile/nativeIntro";

/** @deprecated Replaced by NativeIntroFlow */
export function AppTour() {
  return null;
}
