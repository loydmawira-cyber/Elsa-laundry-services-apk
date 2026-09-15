import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
  Package,
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { store } from '../../services/store';

interface AdminInventoryViewProps {
  inventory: InventoryItem[];
}

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({ inventory }) => {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(20);
  const [newItemUnit, setNewItemUnit] = useState('Bottles (64 oz)');
  const [newItemThreshold, setNewItemThreshold] = useState(10);

  const handleUpdateQuantity = (id: string, delta: number) => {
    store.updateInventoryQuantity(id, delta);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    store.setInventoryItem(editingItem.id, {
      quantity: Number(editingItem.quantity),
      unit: editingItem.unit,
      low_stock_threshold: Number(editingItem.low_stock_threshold),
    });
    setEditingItem(null);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    store.addInventoryItem({
      item_name: newItemName.trim(),
      quantity: Number(newItemQty),
      unit: newItemUnit,
      low_stock_threshold: Number(newItemThreshold),
    });

    setNewItemName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Supplies & Inventory
          </h2>
          <p className="text-xs text-slate-500">Detergents, packaging bags, hangers & tags</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Supply</span>
        </button>
      </div>

      {/* Inventory Compact List */}
      <div className="space-y-2.5">
        {inventory.map((item) => {
          const isLowStock = item.quantity <= item.low_stock_threshold;

          return (
            <div
              key={item.id}
              className={`p-3.5 bg-white rounded-2xl border transition-all text-xs shadow-xs ${
                isLowStock ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 leading-snug">
                      {item.item_name}
                    </h4>
                    {isLowStock && (
                      <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{item.unit}</p>
                  <p className="text-[10px] text-slate-400">
                    Threshold: {item.low_stock_threshold} {item.unit.split(' ')[0]}
                  </p>
                </div>

                {/* Quick Editable Controls: - / QTY / + & Edit Pencil */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`w-9 text-center font-black text-sm ${
                        isLowStock ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl border border-slate-200"
                    title="Edit item specifics"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Edit Supply Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Item Name</label>
                <p className="font-semibold text-slate-900 p-2 bg-slate-50 rounded-xl border">
                  {editingItem.item_name}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Quantity on Hand</label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.quantity}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, quantity: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Packaging Unit</label>
                <input
                  type="text"
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingItem.low_stock_threshold}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      low_stock_threshold: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add New Inventory Supply</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supply Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Citrus Fabric Softener"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Unit Description</label>
                <input
                  type="text"
                  placeholder="Bottles, Boxes, Rolls..."
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Low-Stock Alert Level</label>
                <input
                  type="number"
                  min="1"
                  value={newItemThreshold}
                  onChange={(e) => setNewItemThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Add Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
