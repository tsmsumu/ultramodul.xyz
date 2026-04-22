import { db } from '@ultra/db';
import { apiEndpoints, apiTrafficLogs } from '@ultra/db/src/schema';
import { desc } from 'drizzle-orm';
import ApiMatrixDashboard from './client';

export const dynamic = 'force-dynamic';

export default async function ApiExchangePage() {
  // Fetch all endpoints
  const endpoints = await db.select().from(apiEndpoints).orderBy(desc(apiEndpoints.createdAt));
  
  // Fetch recent traffic logs (limit 100 for performance)
  const logs = await db.select().from(apiTrafficLogs).orderBy(desc(apiTrafficLogs.timestamp)).limit(100);

  // Aggregate some ultra basic stats
  const totalRequests = logs.length;
  const successRequests = logs.filter(l => l.responseStatus >= 200 && l.responseStatus < 300).length;
  const errorRequests = totalRequests - successRequests;
  const avgLatency = totalRequests > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalRequests) : 0;

  const stats = {
    totalRequests,
    successRequests,
    errorRequests,
    avgLatency
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Omni API Exchange Matrix
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Centralized Inbound/Outbound Routing Gateway & Traffic Blackbox.
        </p>
      </div>

      <ApiMatrixDashboard endpoints={endpoints} logs={logs} initialStats={stats} />
    </div>
  );
}
