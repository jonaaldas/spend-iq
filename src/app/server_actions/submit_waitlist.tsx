"use server"

import { waitlist } from "@/database/schema"
import db from "@/database/turso"


export async function submitWaitlist(email: string, name: string) {
  await db.insert(waitlist).values({ email, name })
}
