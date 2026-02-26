import { NextRequest, NextResponse } from "next/server";
import { getOccupiedSlotsForDate } from "@/lib/booking";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    const occupiedHours = await getOccupiedSlotsForDate(date);
    return NextResponse.json({ date, occupiedHours });
  } catch (error) {
    console.error("Booking availability failed", error);
    return NextResponse.json({ error: "Could not fetch availability" }, { status: 500 });
  }
}
