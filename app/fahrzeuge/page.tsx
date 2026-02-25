import { VehicleInventory } from "@/components/vehicle-inventory";
import { listBrands, readVehicles } from "@/lib/vehicles";

export default async function FahrzeugePage() {
  const vehicles = await readVehicles();
  const brands = listBrands(vehicles);
  return (
    <VehicleInventory vehicles={vehicles} brands={brands} />
  );
}
