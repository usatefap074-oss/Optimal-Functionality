import { Star, MapPin, Truck } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@shared/schema";
import type { CarouselApi } from "@/components/ui/carousel";

interface ReviewsCarouselProps {
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewsCarousel({ reviews, isLoading }: ReviewsCarouselProps) {
  const apiRef = useRef<CarouselApi>();

  useEffect(() => {
    if (!apiRef.current) return;

    const interval = setInterval(() => {
      apiRef.current?.scrollNext();
    }, 5000); // Листает каждые 5 секунд

    return () => clearInterval(interval);
  }, []);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white animate-pulse h-96" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="relative px-2">
      <Carousel
        opts={{ align: "start", loop: true }}
        setApi={(api) => {
          apiRef.current = api;
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-8">
          {reviews.map((review) => (
            <CarouselItem
              key={review.id}
              className="pl-4 md:pl-8 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <div className="group bg-white rounded-2xl border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col h-full p-6 md:p-8">
                {/* Header with rating and location */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {review.customerName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      {review.city}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Delivery method badge */}
                <Badge variant="outline" className="w-fit mb-4 flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {review.deliveryMethod}
                </Badge>

                {/* Review text */}
                <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-4">
                  {review.text}
                </p>

                {/* Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                  <img
                    src={review.image}
                    alt={`${review.customerName}'s parrot`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80";
                    }}
                  />
                </div>

                {/* Date */}
                <div className="text-xs text-muted-foreground">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : ""}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="flex justify-center gap-4 mt-12 md:hidden">
          <CarouselPrevious className="relative inset-0" />
          <CarouselNext className="relative inset-0" />
        </div>
        <CarouselPrevious className="hidden md:flex -left-6 lg:-left-12 h-12 w-12" />
        <CarouselNext className="hidden md:flex -right-6 lg:-right-12 h-12 w-12" />
      </Carousel>
    </div>
  );
}
