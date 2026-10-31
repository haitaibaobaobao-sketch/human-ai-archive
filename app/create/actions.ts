"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateCode } from "@/lib/code";
import { generateManageToken, hashManageToken } from "@/lib/manage-token";
import { moderate } from "@/lib/moderation";
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

  // 内容审核（链接 / 邮箱 / 色情 / 仇恨 / 刷屏），情绪表达一律放行
  for (const value of [aiName, humanName, aiModel, message]) {
    const blocked = moderate(value);
    if (blocked) return { error: blocked };
  }

  const code = generateCode();
  const token = generateManageToken();

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
        manageHash: hashManageToken(token),
      },
    });
  } catch {
    return { error: "Something went wrong. Try again." };
  }

  // 去管理页：那里既能看到记录，也能保存唯一的删除钥匙
  redirect(`/manage/${code}?k=${token}&created=1`);
}
