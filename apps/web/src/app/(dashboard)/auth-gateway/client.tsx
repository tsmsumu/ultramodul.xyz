"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  Key, Shield, Mail, MessageSquare, Phone, 
  Smartphone, FileSignature, CheckCircle2, XCircle, 
  Settings2, Activity, Fingerprint, Lock, Send
} from "lucide-react";

interface ProviderConfig {
  id?: string;
  type: string;
  provider: string;
  name: string;
  isActive: boolean;
  configPayload: string;
}

export default function AuthGatewayClient() {
  const t = useTranslations("auth_gateway");
  const [activeTab, setActiveTab] = useState<"SSO" | "MESSAGING" | "E_SIGNATURE">("MESSAGING");
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for Configuration Modal
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null);
  const [configText, setConfigText] = useState("");

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/auth-gateway');
      const data = await res.json();
      if (data.ultra_status === 'SUCCESS') {
        setProviders(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const toggleProvider = async (provider: string, type: string, name: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setProviders(prev => {
        const exists = prev.find(p => p.provider === provider);
        if (exists) {
          return prev.map(p => p.provider === provider ? { ...p, isActive: !currentStatus } : p);
        }
        return [...prev, { type, provider, name, isActive: !currentStatus, configPayload: "{}" }];
      });

      await fetch('/api/auth-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT',
          type,
          provider,
          name,
          isActive: !currentStatus
        })
      });
      
    } catch (e) {
      console.error(e);
      // Revert on error
      fetchProviders();
    }
  };

  const openConfig = (p: { type: string, provider: string, name: string }) => {
    const existing = providers.find(x => x.provider === p.provider);
    setSelectedProvider(existing || { type: p.type, provider: p.provider, name: p.name, isActive: false, configPayload: "{\n  \"api_key\": \"\"\n}" });
    setConfigText(existing?.configPayload || "{\n  \"api_key\": \"\"\n}");
  };

  const saveConfig = async () => {
    if (!selectedProvider) return;
    setSaving(true);
    try {
      await fetch('/api/auth-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT',
          type: selectedProvider.type,
          provider: selectedProvider.provider,
          name: selectedProvider.name,
          configPayload: configText
        })
      });
      await fetchProviders();
      setSelectedProvider(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const MASTER_LIST = {
    "SSO": [
      { provider: "google", name: "Google Workspace SSO", icon: <Fingerprint className="w-8 h-8 text-rose-500" /> },
      { provider: "microsoft", name: "Microsoft Entra ID", icon: <Lock className="w-8 h-8 text-blue-500" /> },
      { provider: "github", name: "GitHub Enterprise", icon: <Key className="w-8 h-8 text-gray-400" /> },
      { provider: "apple", name: "Sign in with Apple", icon: <Shield className="w-8 h-8 text-gray-200" /> }
    ],
    "MESSAGING": [
      { provider: "whatsapp", name: "WhatsApp Gateway (WABA)", icon: <MessageSquare className="w-8 h-8 text-green-500" /> },
      { provider: "telegram", name: "Telegram Bot", icon: <Send className="w-8 h-8 text-sky-500" /> },
      { provider: "signal", name: "Signal Protocol", icon: <Activity className="w-8 h-8 text-indigo-500" /> },
      { provider: "sms", name: "SMS OTP (Twilio/Nexmo)", icon: <Phone className="w-8 h-8 text-amber-500" /> },
      { provider: "email", name: "Email SMTP (SendGrid)", icon: <Mail className="w-8 h-8 text-rose-400" /> }
    ],
    "E_SIGNATURE": [
      { provider: "docusign", name: "DocuSign Enterprise", icon: <FileSignature className="w-8 h-8 text-blue-600" /> },
      { provider: "privyid", name: "PrivyID (Indonesian Root CA)", icon: <Shield className="w-8 h-8 text-red-500" /> },
      { provider: "custom_pki", name: "Custom PKI Infrastructure", icon: <Key className="w-8 h-8 text-emerald-500" /> }
    ]
  };

  const currentList = MASTER_LIST[activeTab];

  return (
    <div className="w-full h-full text-slate-200 fade-in pb-10">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          {t('title')}
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base border-l-2 border-slate-700 pl-3">
          {t('subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl mb-8 w-max border border-slate-800">
        <button onClick={() => setActiveTab("SSO")} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'SSO' ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
          {t('tab_sso')}
        </button>
        <button onClick={() => setActiveTab("MESSAGING")} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'MESSAGING' ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
          {t('tab_messaging')}
        </button>
        <button onClick={() => setActiveTab("E_SIGNATURE")} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'E_SIGNATURE' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
          {t('tab_esign')}
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentList.map((item) => {
          const dbData = providers.find(p => p.provider === item.provider);
          const isActive = dbData?.isActive || false;

          return (
            <div key={item.provider} className={`relative group p-6 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
              
              {/* Top Row: Icon & Status */}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${isActive ? 'bg-slate-900 shadow-inner' : 'bg-slate-800'}`}>
                  {item.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-full ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-500'}`}>
                    {isActive ? t('status_active') : t('status_inactive')}
                  </span>
                  
                  {/* The actual Ultra Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isActive}
                      onChange={() => toggleProvider(item.provider, activeTab, item.name, isActive)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Title & Actions */}
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2">Enterprise {activeTab.toLowerCase().replace('_', ' ')} protocol layer for secure transmission.</p>
                
                <button 
                  onClick={() => openConfig({ type: activeTab, provider: item.provider, name: item.name })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors text-sm font-medium text-slate-300"
                >
                  <Settings2 className="w-4 h-4" />
                  {t('configure_btn')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Vault Configuration</h3>
                  <p className="text-xs text-slate-400">{selectedProvider.name} | AES-256 Encrypted</p>
                </div>
              </div>
              <button onClick={() => setSelectedProvider(null)} className="text-slate-500 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-grow overflow-y-auto">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Secret Payload (JSON Format)
              </label>
              <textarea
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                className="w-full h-64 bg-black/50 border border-slate-800 rounded-xl p-4 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none shadow-inner"
                spellCheck={false}
              />
              <p className="text-xs text-amber-500/80 mt-3 flex items-start gap-1.5">
                <Shield className="w-4 h-4 shrink-0" />
                WARNING: Do not expose these API Keys. The payloads here are natively injected into the Node.js backend processes directly.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {t('save_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
