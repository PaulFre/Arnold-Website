import { HomeSlideshow } from "@/components/home-slideshow";
import { SellSection } from "@/components/sell-section";
import { VehicleCardsCarousel } from "@/components/vehicle-cards-carousel";

export default function HomePage() {
  return (
    <>
      <HomeSlideshow />
      <VehicleCardsCarousel />
      <SellSection />
    </>
  );
}
