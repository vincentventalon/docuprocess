"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState } from "react";

interface TemplateData {
  id: string;
  name: string;
  thumbnail_url: string;
}

interface BarcodeSheetCarouselProps {
  templates?: TemplateData[];
}

const BARCODE_SHEET_TEMPLATES = [
  {
    id: "bf466686-77a3-4838-a43d-73bb837f659e",
    name: "Barcode Sheet",
    thumbnail_url:
      "https://xipyoqrqbhnypwuhonoh.supabase.co/storage/v1/object/public/thumbnails/example-templates/bf466686-77a3-4838-a43d-73bb837f659e.png?v=1770486815440",
  },
];

export default function BarcodeSheetCarousel({ templates }: BarcodeSheetCarouselProps = {}) {
  const [api, setApi] = useState<CarouselApi>();
  const TEMPLATE_LIST = templates || BARCODE_SHEET_TEMPLATES;

  const scrollNext = useCallback(() => {
    if (api) api.scrollNext();
  }, [api]);

  // Auto-advance every 3 seconds (when more templates are added)
  useEffect(() => {
    if (!api || TEMPLATE_LIST.length <= 1) return;
    const interval = setInterval(scrollNext, 3000);
    // Pause on pointer interaction
    const onPointerDown = () => clearInterval(interval);
    api.on("pointerDown", onPointerDown);
    return () => {
      clearInterval(interval);
      api.off("pointerDown", onPointerDown);
    };
  }, [api, scrollNext]);

  return (
    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
      <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
        <CarouselContent>
          {TEMPLATE_LIST.map((template) => (
            <CarouselItem key={template.id}>
              <Image
                src={template.thumbnail_url}
                alt={template.name}
                width={500}
                height={707}
                className="rounded-lg w-full h-auto"
                sizes="(max-width: 768px) 90vw, 500px"
              />
              <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                {template.name}
              </p>
            </CarouselItem>
          ))}
        </CarouselContent>
        {BARCODE_SHEET_TEMPLATES.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
}
