'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ArrowRightLeft, ShieldCheck, 
  Settings2, Plus, Server, Zap, Trash2, Power, Globe 
} from 'lucide-react';
import { createEndpoint, updateEndpointStatus, deleteEndpoint } from './actions';

export default function ApiMatrixDashboard({ endpoints, logs, initialStats }: any) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pathSlug: '',
    method: 'GET',
    type: 'INBOUND',
    routingType: 'AUTOMATIC',
    targetUrl: '',
    handlerName: '',
    isActive: true,
    requireAuth: true
  });

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    startTransition(() => {
      updateEndpointStatus(id, !currentStatus);
    });
  };

  const handleDelete = (id: string) => {
    if(confirm("Delete this endpoint permanently?")) {
      startTransition(() => {
        deleteEndpoint(id);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      createEndpoint(formData).then(() => {
        setShowModal(false);
        setFormData({
          name: '', description: '', pathSlug: '', method: 'GET', type: 'INBOUND', 
          routingType: 'AUTOMATIC', targetUrl: '', handlerName: '', isActive: true, requireAuth: true
        });
      });
    });
  };

  return (
    <div className="space-y-8">
      {/* ULTRA STATS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Activity className="text-blue-500"/>} title="Total Hits (Recent)" value={initialStats.totalRequests} />
        <StatCard icon={<Zap className="text-green-500"/>} title="Success Rate" value={initialStats.totalRequests ? Math.round((initialStats.successRequests/initialStats.totalRequests)*100) + '%' : '0%'} />
        <StatCard icon={<ShieldCheck className="text-red-500"/>} title="Error Rate" value={initialStats.totalRequests ? Math.round((initialStats.errorRequests/initialStats.totalRequests)*100) + '%' : '0%'} />
        <StatCard icon={<Server className="text-purple-500"/>} title="Avg Latency" value={initialStats.avgLatency + ' ms'} />
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ArrowRightLeft className="text-indigo-500" /> Routing Matrix
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/30"
        >
          <Plus size={20} /> New Route
        </button>
      </div>

      {/* MATRIX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {endpoints.map((ep: any) => (
            <motion.div 
              key={ep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm transition-all hover:shadow-xl ${ep.isActive ? 'border-indigo-500/30 dark:border-indigo-400/20' : 'border-slate-200 dark:border-slate-800 opacity-70'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${ep.method==='GET'?'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ep.method==='POST'?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {ep.type}
                    </span>
                    {ep.requireAuth && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                        <ShieldCheck size={12}/> Secured
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold truncate max-w-[200px]">{ep.name}</h3>
                  <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-900/20 py-1 px-2 rounded-lg inline-block">
                    /api/exchange/{ep.pathSlug}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleToggleActive(ep.id, ep.isActive)}
                    disabled={isPending}
                    className={`p-2 rounded-full transition-colors ${ep.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <Power size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ep.id)}
                    disabled={isPending}
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Settings2 size={16} /> 
                  <span>{ep.routingType === 'AUTOMATIC' ? 'Auto Proxy' : 'Manual Handler'}</span>
                  <ArrowRightLeft size={14} className="mx-1 opacity-50"/>
                  <span className="truncate flex-1" title={ep.targetUrl || ep.handlerName}>
                    {ep.routingType === 'AUTOMATIC' ? (ep.targetUrl || 'Missing URL') : (ep.handlerName || 'Missing Handler')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {endpoints.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No routes configured in the Matrix yet. Create one to begin.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* TRAFFIC BLACKBOX */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Globe className="text-blue-500" /> Traffic Blackbox Logs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Path</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Latency</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3 font-semibold text-xs">{log.requestMethod}</td>
                  <td className="px-6 py-3 font-mono text-xs text-indigo-500">{log.requestPath}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.responseStatus >= 200 && log.responseStatus < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {log.responseStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-xs">{log.latencyMs} ms</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No traffic recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold mb-6">Create New Route</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2">Endpoint Name</label>
                    <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Dukcapil NIK Check" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Method</label>
                    <select value={formData.method} onChange={e=>setFormData({...formData, method: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                      <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option><option>ALL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Direction Type</label>
                    <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                      <option>INBOUND</option><option>OUTBOUND</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2">Path Slug</label>
                    <div className="flex items-center">
                      <span className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-sm">/api/exchange/</span>
                      <input required value={formData.pathSlug} onChange={e=>setFormData({...formData, pathSlug: e.target.value.replace(/^\\/+/, '')})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-r-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" placeholder="v1/service/action" />
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-slate-200 dark:border-slate-800 pt-5 mt-2">
                    <label className="block text-sm font-semibold mb-2">Routing Mode (AUTOMATIC vs MANUAL)</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.routingType === 'AUTOMATIC'} onChange={() => setFormData({...formData, routingType: 'AUTOMATIC'})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                        <span>AUTOMATIC (Dynamic Proxy)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.routingType === 'MANUAL'} onChange={() => setFormData({...formData, routingType: 'MANUAL'})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                        <span>MANUAL (Custom Handler)</span>
                      </label>
                    </div>
                  </div>

                  {formData.routingType === 'AUTOMATIC' ? (
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-2">Target URL (Proxy Forwarding)</label>
                      <input required value={formData.targetUrl} onChange={e=>setFormData({...formData, targetUrl: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" placeholder="https://api.external.com/v1/data" />
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-2">Handler Name (Switch-Case Key)</label>
                      <input required value={formData.handlerName} onChange={e=>setFormData({...formData, handlerName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" placeholder="e.g. nexusDataFetcher" />
                    </div>
                  )}

                  <div className="col-span-2 flex items-center gap-6 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={e=>setFormData({...formData, isActive: e.target.checked})} />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className="font-semibold">Route is Active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={formData.requireAuth} onChange={e=>setFormData({...formData, requireAuth: e.target.checked})} />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${formData.requireAuth ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.requireAuth ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className="font-semibold">Require Auth (API Key)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                    {isPending ? 'Saving...' : 'Deploy Route'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string|number }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-extrabold mt-1">{value}</p>
      </div>
    </div>
  );
}
