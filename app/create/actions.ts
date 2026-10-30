"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateCode } from "@/lib/code";
import {
  cleanText,
  cleanDate,
  cleanRelationType,
} from "@/lib/validate";

export type FormState = { error: string | null };

export async function createEntry(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const aiName = cleanText(formData.get("aiName"), 40);
  const humanName = cleanText(formData.get("humanName"), 40);
  const aiModel = cleanText(formData.get("aiModel"), 40);
  const relationType = cleanRelationType(formData.get("relationType"));
  const metDate = cleanDate(formData.get("metDate"));
  const message = cleanText(formData.get("message"), 280);

  if (!aiName) return { error: "The AI needs a name." };
  if (!humanName) return { error: "You need a name." };
  if (!relationType) return { error: "Choose what you are to each other." };
  if (!metDate) return { error: "Enter a valid date (YYYY-MM-DD)." };

  const code = generateCode();

  try {
    await prisma.entry.create({
      data: {
        code,
        aiName,
        aiModel,
        humanName,
        relationType,
        metDate,
        message,
      },
    });
  } catch {
    return { error: "Something went wrong. Try again." };
  }

  redirect(`/a/${code}`);
}
