import React from "react";
import Image from "next/image";

interface ClinicPhotosProps {
  photos: string[];
}

export default function ClinicPhotos({ photos }: ClinicPhotosProps) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">
        Clinic Photos
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photoUrl, idx) => (
          <div
            key={idx}
            className="relative aspect-video rounded-lg overflow-hidden bg-secondary/20 group cursor-pointer"
          >
            <Image
              src={photoUrl}
              alt={`Clinic photo ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
