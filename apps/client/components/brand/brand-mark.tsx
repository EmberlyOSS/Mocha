"use client";

import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  size?: number;
  showWordmark?: boolean;
};

export function BrandMark({
  className,
  size = 40,
  showWordmark = true,
}: BrandMarkProps) {
  return (
    <div className={className ?? "flex items-center gap-3"}>
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.svg"
          alt="Mocha"
          width={size}
          height={size}
          priority={false}
          className="h-full w-full object-contain"
        />
      </div>
      {showWordmark ? (
        <div className="leading-none">
          <p className="text-sm font-semibold tracking-tight text-white">
            Mocha
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
            Support operations
          </p>
        </div>
      ) : null}
    </div>
  );
}
