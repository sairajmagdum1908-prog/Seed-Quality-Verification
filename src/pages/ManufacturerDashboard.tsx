import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Package, History, Trash2, 
  Search, Filter, LogOut, User as UserIcon,
  Factory, TrendingUp, Activity, ChevronRight,
  QrCode, Info, Calendar, MapPin, RefreshCcw
} from 'lucide-react';
import { api } from '../services/api';
import { Card, Badge, LoadingOverlay, ConfirmationModal } from '../components/UI';

export const ManufacturerDashboard = ({ user, onLogout, showToast }: { user: any, onLogout: () => void, showToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [seeds, setSeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'add'>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    batch_date: new Date().toISOString().split('T')[0],
    origin: ''
  });

  useEffect(() => {
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSeeds();
      setSeeds(data.filter((s: any) => s.manufacturer_id === user.id));
    } catch (err) {
      console.error('Failed to fetch seeds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.createSeed(formData);
      showToast("Seed batch created successfully", "success");
      setFormData({
        name: '',
        variety: '',
        batch_date: new Date().toISOString().split('T')[0],
        origin: ''
      });
      setActiveTab('inventory');
      fetchSeeds();
    } catch (err: any) {
      showToast(err.message || "Failed to create seed batch", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!selectedSeedId) return;
    setIsLoading(true);
    try {
      await api.recallSeed(selectedSeedId);
      showToast("Seed batch recalled successfully", "success");
      fetchSeeds();
    } catch (err: any) {
      showToast(err.message || "Recall failed", "error");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setSelectedSeedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {isLoading && <LoadingOverlay message="Processing..." />}
      
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Recall Seed Batch"
        message="Are you sure you want to recall this seed batch? This action will mark all seeds in this batch as recalled and notify relevant parties."
        onConfirm={handleRecall}
        onCancel={() => setIsModalOpen(false)}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-green/20 flex items-center justify-center border border-agri-green/30">
              <Factory className="w-6 h-6 text-agri-green" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AgriTrust</h1>
              <p className="text-[10px] text-agri-green font-bold uppercase tracking-widest">Manufacturer Portal</p>
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
          
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-gradient-to-br from-agri-green/20 to-transparent border-agri-green/20">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-agri-green uppercase tracking-widest">Active Batches</p>
                    <h2 className="text-4xl font-bold">{seeds.length}</h2>
                  </div>
                  <div className="p-3 rounded-2xl bg-agri-green/20">
                    <TrendingUp className="w-6 h-6 text-agri-green" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4 text-agri-green" />
                  <span>Production efficiency: 94%</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 ml-2">Management</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 ${
                    activeTab === 'inventory' 
                    ? 'bg-agri-green border-agri-green text-white shadow-lg shadow-agri-green/20' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Package className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">Inventory</span>
                </button>
                <button 
                  onClick={() => setActiveTab('add')}
                  className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 ${
                    activeTab === 'add' 
                    ? 'bg-agri-green border-agri-green text-white shadow-lg shadow-agri-green/20' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">Add New</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'inventory' ? (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-bold">Seed Inventory</h2>
                    <button onClick={fetchSeeds} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <RefreshCcw className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {seeds.length === 0 ? (
                      <Card className="text-center py-20">
                        <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No seed batches found</p>
                      </Card>
                    ) : (
                      seeds.map((seed, idx) => (
                        <Card key={idx} className="hover:bg-white/5 transition-all group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-agri-green/20 transition-all">
                                <QrCode className="w-6 h-6 text-gray-500 group-hover:text-agri-green" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold">{seed.name}</h4>
                                  <Badge color={seed.status === 'recalled' ? 'red' : 'green'}>{seed.status}</Badge>
                                </div>
                                <p className="text-xs text-gray-500 font-mono">{seed.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden md:block text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Variety</p>
                                <p className="text-sm font-medium">{seed.variety}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setSelectedSeedId(seed.id);
                                  setIsModalOpen(true);
                                }}
                                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <ChevronRight className="w-5 h-5 text-gray-700" />
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="p-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-agri-green/20 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-agri-green" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Create New Batch</h2>
                          <p className="text-sm text-gray-400">Register a new seed batch on the blockchain</p>
                        </div>
                      </div>

                      <form onSubmit={handleAddSeed} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Seed Name</label>
                            <div className="relative">
                              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-agri-green/50 transition-all"
                                placeholder="e.g., Premium Wheat"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Variety</label>
                            <div className="relative">
                              <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input
                                type="text"
                                value={formData.variety}
                                onChange={(e) => setFormData({...formData, variety: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-agri-green/50 transition-all"
                                placeholder="e.g., Durum"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Batch Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input
                                type="date"
                                value={formData.batch_date}
                                onChange={(e) => setFormData({...formData, batch_date: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-agri-green/50 transition-all"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Origin</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input
                                type="text"
                                value={formData.origin}
                                onChange={(e) => setFormData({...formData, origin: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-agri-green/50 transition-all"
                                placeholder="e.g., Punjab, India"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-agri-green hover:bg-agri-green/90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-agri-green/20 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Register Batch
                        </button>
                      </form>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
