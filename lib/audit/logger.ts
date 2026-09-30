import { getDB } from "@/lib/db/store";
import { AuditAction, AuditLog } from "@/types/database.types";

export interface LogAuditParams {
  collegeId: string;
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}

export async function logAuditEvent(params: LogAuditParams): Promise<AuditLog> {
  const db = getDB();
  const newLog: AuditLog = {
    id: crypto.randomUUID(),
    college_id: params.collegeId,
    actor_id: params.actorId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    metadata: params.metadata || {},
    ip_address: params.ipAddress || "127.0.0.1",
    created_at: new Date().toISOString(),
  };

  db.auditLogs.unshift(newLog);
  return newLog;
}

export async function getAuditLogs(collegeId: string, limit = 50): Promise<AuditLog[]> {
  const db = getDB();
  return db.auditLogs
    .filter((log) => log.college_id === collegeId)
    .slice(0, limit)
    .map((log) => {
      const actor = db.profiles.find((p) => p.id === log.actor_id);
      return { ...log, actor };
    });
}
