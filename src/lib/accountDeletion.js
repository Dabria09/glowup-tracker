import { base44 } from "@/api/base44Client";
import { clearAuthSession } from "@/lib/authRules";

export async function deleteCurrentAccount() {
  const response = await base44.functions.invoke("deleteAccount", {});
  const data = response?.data || {};

  if (!data.success) {
    throw new Error(data.error || "Account deletion failed.");
  }

  await clearAuthSession();
  window.location.href = "/";
}
