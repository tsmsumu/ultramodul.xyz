import crypto from "crypto";
import { db } from "@ultra/db";
import { systemLogs } from "@ultra/db/schema";
import { v4 as uuidv4 } from "uuid";

// The OmniLogger (Singleton Pattern)
export class OmniLogger {
  private static lastHash: string = "GENESIS_BLOCK";

  // Simulate grabbing the latest hash from DB in a real production system
  private static async getPreviousHash(): Promise<string> {
    // Optimistic cache for high throughput
    return this.lastHash;
  }

  static async log(params: {
    module: string;
    userId: string;
    actionData: any;
    ipAddress?: string;
    userAgent?: string;
    severity?: "INFO" | "WARNING" | "CRITICAL" | "FATAL";
  }) {
    const timestamp = Date.now();
    const payloadStr = params.actionData ? JSON.stringify(params.actionData) : "{}";
    const previousHash = await this.getPreviousHash();

    // Create Immutable SHA-256 Hash
    const cryptoHash = crypto
      .createHash("sha256")
      .update(`${timestamp}|${params.module}|${params.userId}|${payloadStr}|${previousHash}`)
      .digest("hex");

    this.lastHash = cryptoHash;

    await db.insert(systemLogs).values({
      id: uuidv4(),
      timestamp,
      module: params.module,
      actionData: payloadStr,
      userId: params.userId,
      ipAddress: params.ipAddress || "0.0.0.0",
      userAgent: params.userAgent || "Unknown",
      severity: params.severity || "INFO",
      cryptoHash
    }).execute();

    return cryptoHash;
  }
}
