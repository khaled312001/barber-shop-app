import { db } from "./db";
import { activityLogs } from "@shared/schema";

export async function logActivity(params: {
  userId?: string;
  userRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await db.insert(activityLogs).values({
      userId: params.userId || "",
      userRole: params.userRole || "",
      action: params.action,
      entityType: params.entityType || "",
      entityId: params.entityId || "",
      metadata: params.metadata || {},
    });
  } catch {
    // Never crash the request due to logging failure
  }
}
