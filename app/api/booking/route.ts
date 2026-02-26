import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking, REQUIRED_SLOTS, SlotOccupiedError } from "@/lib/booking";

const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hour: z.number().int(),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(120).optional()
});

export async function POST(request: Request) {
  try {
    const payload = bookingSchema.parse(await request.json());
    if (!REQUIRED_SLOTS.includes(payload.hour as (typeof REQUIRED_SLOTS)[number])) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }

    await createBooking({
      dateKey: payload.date,
      hour: payload.hour,
      name: payload.name,
      phone: payload.phone,
      email: payload.email
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid booking payload" }, { status: 400 });
    }
    if (error instanceof SlotOccupiedError) {
      return NextResponse.json({ error: "Slot already occupied" }, { status: 409 });
    }
    console.error("Booking create failed", error);
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }
}
