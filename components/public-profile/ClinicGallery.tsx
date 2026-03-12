import Image from "next/image";
import type { GalleryImage } from "@/types/doctor-profile";

interface ClinicGalleryProps {
  images: GalleryImage[];
}

export function ClinicGallery({ images }: ClinicGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Clinic Photos</h3>
      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => (
          <div
            key={img.src}
            className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border group"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 200px"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}