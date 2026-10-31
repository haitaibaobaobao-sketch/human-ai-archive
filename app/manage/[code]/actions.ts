"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyManageToken } from "@/lib/manage-token";

export async function deleteEntry(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const token = String(formData.get("k") ?? "");

  if (!code) redirect("/");

  const entry = await prisma.entry.findUnique({ where: { code } });

  // 记录已经没了 → 当成删除成功
  if (!entry) {
    redirect(`/manage/${encodeURIComponent(code)}?deleted=1`);
  }

  if (!verifyManageToken(token, entry.manageHash)) {
    redirect(`/manage/${encodeURIComponent(code)}?error=1`);
  }

  await prisma.entry.delete({ where: { code } });
  redirect(`/manage/${encodeURIComponent(code)}?deleted=1`);
}
