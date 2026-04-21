"use server";

import { cookies } from "next/headers";

import { revalidatePath } from "next/cache";

export async function setLanguageCookie(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 }); // 1 year
  revalidatePath("/", "layout");
}
