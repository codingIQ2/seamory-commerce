import { NextResponse } from "next/server";

import { mergeGuestCartIntoMember } from "@/features/cart/data/cart-repository";

export async function POST() {
  await mergeGuestCartIntoMember();
  return NextResponse.json({ ok: true });
}
