import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Upload, X, DollarSign, Package, Gift, Smartphone, Star } from 'lucide-react';

const CATEGORIES = [
  { id: 'digital', label: 'Digital', icon: Smartphone, color: '#3b82f6' },
  { id: 'gift_card', label: 'Gift Card', icon: DollarSign, color: '#10b981' },
  { id: 'physical', label: 'Physical', icon: Package, color: '#f59e0b' },
  { id: 'experience', label: 'Experience', icon: Star, color: '#ec4899' },
];

const AGE_GROUPS = [
  { id: 'both', label: 'All Ages' },
  { id: 'girls', label: 'Girls (10-20)' },
  { id: 'women', label: 'Women (21+)' },
];

export default function PrizesTab() {
  const [prizes, setPrizes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: '',
    description: '',
    image_url: '',
    points_cost: 0,
    category: 'digital',
    stock_quantity: 999,
    is_active: true,
    fulfillment_instructions: '',
    shipping_required: false,
    age_group: 'both',
    retail_value: '',
  });

  useEffect(() => {
    loadPrizes();
  }, []);

  async function loadPrizes() {
    const data = await base44.entities.Prize.list('-created_date');
    setPrizes(data);
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewPrize({ ...newPrize, image_url: file_url });
    setUploading(false);
  };

  const savePrize = async () => {
    if (!newPrize.name || !newPrize.points_cost) {
      toast.error('Name and points cost are required');
      return;
    }

    const user = await base44.auth.me();
    const prizeData = {
      ...newPrize,
      created_by: user.email,
      created_date: new Date().toISOString(),
    };

    if (editingPrize) {
      await base44.entities.Prize.update(editingPrize.id, prizeData);
      toast.success('Prize updated! ✨');
    } else {
      await base44.entities.Prize.create(prizeData);
      toast.success('Prize created! 🎁');
    }

    setShowModal(false);
    setEditingPrize(null);
    setNewPrize({
      name: '',
      description: '',
      image_url: '',
      points_cost: 0,
      category: 'digital',
      stock_quantity: 999,
      is_active: true,
      fulfillment_instructions: '',
      shipping_required: false,
      age_group: 'both',
      retail_value: '',
    });
    loadPrizes();
  };

  const deletePrize = async (prize) => {
    if (!confirm(`Delete "${prize.name}"? This cannot be undone.`)) return;
    await base44.entities.Prize.delete(prize.id);
    toast.success('Prize deleted');
    loadPrizes();
  };

  const editPrize = (prize) => {
    setEditingPrize(prize);
    setNewPrize({
      name: prize.name,
      description: prize.description || '',
      image_url: prize.image_url || '',
      points_cost: prize.points_cost,
      category: prize.category,
      stock_quantity: prize.stock_quantity || 999,
      is_active: prize.is_active,
      fulfillment_instructions: prize.fulfillment_instructions || '',
      shipping_required: prize.shipping_required || false,
      age_group: prize.age_group || 'both',
      retail_value: prize.retail_value || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Manage prizes available for redemption</p>
        </div>
        <button
          onClick={() => { setEditingPrize(null); setShowModal(true); }}
          className="px-4 py-2 rounded-full font-bold text-white text-sm flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          <Plus size={16} /> Add Prize
        </button>
      </div>

      {/* Prize Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prizes.map(prize => {
          const CategoryIcon = CATEGORIES.find(c => c.id === prize.category)?.icon || Gift;
          const categoryColor = CATEGORIES.find(c => c.id === prize.category)?.color || '#ec4899';
          
          return (
            <div
              key={prize.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${prize.is_active ? 'rgba(255,255,255,0.1)' : 'rgba(255,0,0,0.3)'}`, opacity: prize.is_active ? 1 : 0.6 }}
            >
              {/* Image */}
              <div className="h-40 bg-white/5 flex items-center justify-center overflow-hidden">
                {prize.image_url ? (
                  <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
                ) : (
                  <CategoryIcon size={48} className="text-gray-600" />
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{prize.name}</h3>
                    {prize.retail_value && (
                      <p className="text-xs text-gray-400 mt-0.5">{prize.retail_value}</p>
                    )}
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: `${categoryColor}20`, color: categoryColor }}
                  >
                    {CATEGORIES.find(c => c.id === prize.category)?.label || prize.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Star size={14} />
                    {prize.points_cost.toLocaleString()} pts
                  </div>
                  <div className="text-xs text-gray-400">
                    {prize.stock_quantity >= 999 ? '∞ in stock' : `${prize.stock_quantity} left`}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${prize.age_group === 'both' ? 'bg-purple-500/20 text-purple-400' : prize.age_group === 'girls' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {AGE_GROUPS.find(a => a.id === prize.age_group)?.label || prize.age_group}
                  </span>
                  {prize.shipping_required && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                      📦 Shipping
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => editPrize(prize)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center gap-1"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => deletePrize(prize)}
                    className="py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {prizes.length === 0 && (
        <div className="text-center py-12">
          <Gift size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No prizes yet. Add your first prize!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">{editingPrize ? 'Edit Prize' : 'Add New Prize'}</h3>
              <button onClick={() => setShowModal(false)}><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Prize Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-4 py-6 text-center hover:bg-white/10 transition">
                      {newPrize.image_url ? (
                        <img src={newPrize.image_url} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                      ) : (
                        <>
                          <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                          <p className="text-sm text-gray-300">Click to upload image</p>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
                {uploading && <p className="text-xs text-pink-400 mt-2">Uploading...</p>}
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Prize Name *</label>
                <input
                  value={newPrize.name}
                  onChange={e => setNewPrize({ ...newPrize, name: e.target.value })}
                  placeholder="e.g., $10 Starbucks Gift Card"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Description</label>
                <textarea
                  value={newPrize.description}
                  onChange={e => setNewPrize({ ...newPrize, description: e.target.value })}
                  placeholder="Describe the prize..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>

              {/* Category & Age Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Category *</label>
                  <select
                    value={newPrize.category}
                    onChange={e => setNewPrize({ ...newPrize, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Age Group</label>
                  <select
                    value={newPrize.age_group}
                    onChange={e => setNewPrize({ ...newPrize, age_group: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    {AGE_GROUPS.map(age => (
                      <option key={age.id} value={age.id}>{age.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Points & Retail Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Points Cost *</label>
                  <input
                    type="number"
                    value={newPrize.points_cost}
                    onChange={e => setNewPrize({ ...newPrize, points_cost: Number(e.target.value) })}
                    placeholder="100"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Retail Value</label>
                  <input
                    value={newPrize.retail_value}
                    onChange={e => setNewPrize({ ...newPrize, retail_value: e.target.value })}
                    placeholder="e.g., $10"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Stock Quantity</label>
                <input
                  type="number"
                  value={newPrize.stock_quantity}
                  onChange={e => setNewPrize({ ...newPrize, stock_quantity: Number(e.target.value) })}
                  placeholder="999 for unlimited"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Use 999 for unlimited stock</p>
              </div>

              {/* Shipping */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="shipping"
                  checked={newPrize.shipping_required}
                  onChange={e => setNewPrize({ ...newPrize, shipping_required: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="shipping" className="text-sm font-semibold text-gray-300">Requires Shipping</label>
              </div>

              {/* Fulfillment Instructions */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Fulfillment Instructions (Admin Notes)</label>
                <textarea
                  value={newPrize.fulfillment_instructions}
                  onChange={e => setNewPrize({ ...newPrize, fulfillment_instructions: e.target.value })}
                  placeholder="e.g., Send via email within 24 hours, or ship from warehouse A..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={newPrize.is_active}
                  onChange={e => setNewPrize({ ...newPrize, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="active" className="text-sm font-semibold text-gray-300">Active (visible to users)</label>
              </div>

              {/* Save */}
              <button
                onClick={savePrize}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                {editingPrize ? 'Update Prize' : 'Create Prize'} 🎁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}