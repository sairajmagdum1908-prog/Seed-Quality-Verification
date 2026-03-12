import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldCheck, ShieldAlert, History, MapPin, 
  Calendar, Info, AlertTriangle, CheckCircle2, 
  ChevronRight, QrCode, LogOut, User as UserIcon,
  Leaf, TrendingUp, Activity, Smartphone
} from 'lucide-react';
import { api } from '../services/api';
import { Card, Badge, LoadingOverlay } from '../components/UI';

export const FarmerDashboard = ({ user, onLogout, showToast }: { user: any, onLogout: () => void, showToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [seedId, setSeedId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'verify' | 'history'>('verify');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getTransactions();
      setHistory(data.filter((t: any) => t.user_id === user.id));
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedId.trim()) return;
    
    setIsLoading(true);
    setVerificationResult(null);
    try {
      const result = await api.verifySeed(seedId);
      setVerificationResult(result);
      fetchHistory();
      if (result.is_fraudulent) {
        showToast("Warning: Potential fraudulent seed detected!", "error");
      } else {
        showToast("Seed verified successfully", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Verification failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {isLoading && <LoadingOverlay message="Verifying Seed..." />}
      
      {/* Sidebar / Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-green/20 flex items-center justify-center border border-agri-green/30">
              <Leaf className="w-6 h-6 text-agri-green" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AgriTrust</h1>
              <p className="text-[10px] text-agri-green font-bold uppercase tracking-widest">Farmer Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-agri-green/20 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-agri-green" />
              </div>
              <span className="text-sm font-bold">{user.username}</span>
            </div>
            <button onClick={onLogout} className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/20">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stats & Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-gradient-to-br from-agri-green/20 to-transparent border-agri-green/20">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-agri-green uppercase tracking-widest">Total Verifications</p>
                    <h2 className="text-4xl font-bold">{history.length}</h2>
                  </div>
                  <div className="p-3 rounded-2xl bg-agri-green/20">
                    <TrendingUp className="w-6 h-6 text-agri-green" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4 text-agri-green" />
                  <span>Last verification: {history[0] ? new Date(history[0].timestamp).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 ml-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab('verify')}
                  className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 ${
                    activeTab === 'verify' 
                    ? 'bg-agri-green border-agri-green text-white shadow-lg shadow-agri-green/20' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <QrCode className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">Verify</span>
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 ${
                    activeTab === 'history' 
                    ? 'bg-agri-green border-agri-green text-white shadow-lg shadow-agri-green/20' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <History className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'verify' ? (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <Card className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-agri-green/20 flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-agri-green" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Verify Seed Packet</h2>
                          <p className="text-sm text-gray-400">Enter the unique ID from your seed packet</p>
                        </div>
                      </div>

                      <form onSubmit={handleVerify} className="flex gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            value={seedId}
                            onChange={(e) => setSeedId(e.target.value)}
                            placeholder="Enter Seed ID (e.g., SEED-123...)"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-agri-green/50 transition-all"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="px-8 bg-agri-green hover:bg-agri-green/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-agri-green/20"
                        >
                          Verify
                        </button>
                      </form>
                    </div>
                  </Card>

                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className={`border-2 ${verificationResult.is_fraudulent ? 'border-red-500/50 bg-red-500/5' : 'border-agri-green/50 bg-agri-green/5'}`}>
                        <div className="space-y-8">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${verificationResult.is_fraudulent ? 'bg-red-500/20' : 'bg-agri-green/20'}`}>
                                {verificationResult.is_fraudulent ? <ShieldAlert className="w-8 h-8 text-red-500" /> : <ShieldCheck className="w-8 h-8 text-agri-green" />}
                              </div>
                              <div>
                                <Badge color={verificationResult.is_fraudulent ? 'red' : 'green'}>
                                  {verificationResult.is_fraudulent ? 'Suspicious' : 'Authentic'}
                                </Badge>
                                <h3 className="text-2xl font-bold mt-2">{verificationResult.seed.name}</h3>
                                <p className="text-gray-400 font-mono text-sm">{verificationResult.seed.id}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Seed Details</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                  <Info className="w-4 h-4 text-agri-green" />
                                  <span className="text-gray-400">Variety:</span>
                                  <span className="font-bold">{verificationResult.seed.variety}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <Calendar className="w-4 h-4 text-agri-green" />
                                  <span className="text-gray-400">Batch Date:</span>
                                  <span className="font-bold">{new Date(verificationResult.seed.batch_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <MapPin className="w-4 h-4 text-agri-green" />
                                  <span className="text-gray-400">Origin:</span>
                                  <span className="font-bold">{verificationResult.seed.origin}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Security Analysis</h4>
                              <div className="space-y-3">
                                <div className={`p-4 rounded-2xl border ${verificationResult.is_fraudulent ? 'bg-red-500/10 border-red-500/20' : 'bg-agri-green/10 border-agri-green/20'}`}>
                                  <div className="flex items-center gap-3 mb-2">
                                    {verificationResult.is_fraudulent ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-agri-green" />}
                                    <span className={`text-xs font-bold uppercase tracking-widest ${verificationResult.is_fraudulent ? 'text-red-500' : 'text-agri-green'}`}>
                                      {verificationResult.is_fraudulent ? 'Fraud Alert' : 'Security Check'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 leading-relaxed">
                                    {verificationResult.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-bold">Verification History</h2>
                    <Badge color="blue">{history.length} Records</Badge>
                  </div>

                  <div className="space-y-4">
                    {history.length === 0 ? (
                      <Card className="text-center py-20">
                        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No verification history found</p>
                      </Card>
                    ) : (
                      history.map((item, idx) => (
                        <Card key={idx} className="hover:bg-white/5 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-agri-green/20 transition-all">
                                <ShieldCheck className="w-6 h-6 text-gray-500 group-hover:text-agri-green" />
                              </div>
                              <div>
                                <h4 className="font-bold">{item.seed_name}</h4>
                                <p className="text-xs text-gray-500 font-mono">{item.seed_id}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-6">
                              <div className="hidden md:block">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Timestamp</p>
                                <p className="text-sm font-medium">{new Date(item.timestamp).toLocaleString()}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-agri-green transition-all" />
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
