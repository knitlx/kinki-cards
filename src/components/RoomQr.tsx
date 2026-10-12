"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function RoomQr() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      margin: 1,
      width: 224,
      color: { dark: "#0b0b0c", light: "#f5f5f4" },
    }).then(setSrc);
  }, []);

  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      width={224}
      height={224}
      unoptimized
      className="rounded-2xl"
    />
  );
}
