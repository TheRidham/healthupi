import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface ClinicPhotosProps {
  photos: string[];
}

export default function ClinicPhotos({ photos }: ClinicPhotosProps) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <Card className="p-5 sm:p-6 bg-gradient-to-br from-card via-card to-accent/5 border-border shadow-md">
      <h3 className="text-lg font-bold text-foreground mb-4">
        Clinic Gallery
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {photos.map((photoUrl, idx) => (
          <div
            key={idx}
            className="relative aspect-video rounded-lg overflow-hidden bg-secondary/30 group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all"
          >
            <Image
              src={photoUrl}
              alt={`Clinic photo ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </Card>
  );
}
