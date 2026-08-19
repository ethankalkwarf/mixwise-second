import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

export type NativeAccelEvent = {
  x: number;
  y: number;
  z: number;
};

export type MixwiseShakePlugin = {
  start(): Promise<{ available: boolean }>;
  stop(): Promise<void>;
  addListener(
    eventName: "accel",
    listener: (event: NativeAccelEvent) => void
  ): Promise<PluginListenerHandle>;
};

export const MixwiseShake = registerPlugin<MixwiseShakePlugin>("MixwiseShake");
