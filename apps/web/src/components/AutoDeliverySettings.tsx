import { useState, useEffect } from "react";
import { Clock, Send, Trash2, Plus } from "lucide-react";
import { getLogbookSchedules, addLogbookSchedule, removeLogbookSchedule } from "@/app/actions/wa-monitor";

interface AutoDeliverySettingsProps {
  providerId: string;
  logType: string;
}

export default function AutoDeliverySettings({ providerId, logType }: AutoDeliverySettingsProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [interval, setInterval] = useState('daily');
  const [format, setFormat] = useState('pdf');
  const [destinationType, setDestinationType] = useState('email');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [includeMedia, setIncludeMedia] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getLogbookSchedules(providerId, logType);
    setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [providerId, logType]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationAddress) return;
    await addLogbookSchedule({
      providerId, logType, interval, format, destinationType, destinationAddress, includeMedia
    });
    setDestinationAddress("");
    fetchData();
  };

  const handleRemove = async (id: string) => {
    await removeLogbookSchedule(id);
    fetchData();
  };

  return (
    <div className="space-y-6 print:hidden">
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" /> New Delivery Schedule
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">Interval</label>
              <select value={interval} onChange={e=>setInterval(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none">
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">Format</label>
              <select value={format} onChange={e=>setFormat(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none">
                <option value="pdf">PDF Document</option>
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="txt">Plain Text</option>
                <option value="docx">Word (.docx)</option>
                <option value="parquet">Parquet</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">Destination</label>
              <select value={destinationType} onChange={e=>setDestinationType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="signal">Signal</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">Address (Email / Phone)</label>
              <input type="text" value={destinationAddress} onChange={e=>setDestinationAddress(e.target.value)} placeholder="admin@omni.com / 081234..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" id="includeMedia" checked={includeMedia} onChange={e=>setIncludeMedia(e.target.checked)} className="w-4 h-4 rounded bg-black/40 border-white/10 text-blue-500 focus:ring-blue-500" />
              <label htmlFor="includeMedia" className="text-xs text-zinc-400 whitespace-nowrap">Include Media Links</label>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 h-[46px] whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Schedule
            </button>
          </div>
        </form>
      </div>

      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading schedules...</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4">Interval</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Media</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {schedules.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-bold text-white capitalize">{s.interval}</td>
                  <td className="px-6 py-4 uppercase font-mono text-xs text-blue-400">{s.format}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white capitalize">{s.destinationType}</div>
                    <div className="text-xs text-zinc-500">{s.destinationAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    {s.includeMedia ? <span className="text-emerald-400 text-xs">Included</span> : <span className="text-zinc-500 text-xs">No</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleRemove(s.id)} className="text-zinc-500 hover:text-red-400 p-2">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500 italic">No automated delivery scheduled.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
