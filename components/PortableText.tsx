"use client";

import React from "react";
import { PortableText as PT } from "@portabletext/react";

export function PortableText({ value }: { value: any }) {
  if (!value) return null;
  return (
    <div className="prose prose-invert prose-slate max-w-none">
      <PT value={value} />
    </div>
  );
}
