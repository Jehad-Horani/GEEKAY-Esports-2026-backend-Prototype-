import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface RepeaterProps<T> {
  title: string;
  items: T[];
  onItemsChange: (items: T[]) => void;
  createDefaultItem: () => T;
  renderItemFields: (item: T, index: number, onChange: (updated: T) => void) => React.ReactNode;
  itemTitle?: (item: T, index: number) => string;
}

export function FormRepeater<T>({
  title,
  items,
  onItemsChange,
  createDefaultItem,
  renderItemFields,
  itemTitle
}: RepeaterProps<T>) {
  const safeItems = Array.isArray(items) ? items : [];

  const handleAdd = () => {
    onItemsChange([...safeItems, createDefaultItem()]);
  };

  const handleRemove = (index: number) => {
    onItemsChange(safeItems.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= safeItems.length) return;
    const newItems = [...safeItems];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    onItemsChange(newItems);
  };

  const handleItemUpdate = (index: number, updated: T) => {
    const newItems = [...safeItems];
    newItems[index] = updated;
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-4 border border-slate-800 p-4 bg-[#040E1E] rounded-sm">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h4 className="font-syncopate text-[10px] font-bold text-[#FFC400] uppercase tracking-widest">{title}</h4>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC400]/10 border border-[#FFC400]/30 hover:bg-[#FFC400] hover:text-black text-[#FFC400] font-syncopate text-[8px] font-bold tracking-widest uppercase transition-all"
        >
          <Plus size={12} /> ADD ITEM
        </button>
      </div>

      {safeItems.length === 0 ? (
        <p className="text-slate-500 font-syncopate text-[9px] uppercase tracking-wider py-4 text-center border border-dashed border-slate-800">
          No items registered. Click "+ ADD ITEM" to add one.
        </p>
      ) : (
        <div className="space-y-4">
          {safeItems.map((item, index) => (
            <div key={index} className="bg-[#081B3A] border border-slate-800 p-4 space-y-4 relative group">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-syncopate text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                  #{index + 1} {itemTitle ? itemTitle(item, index) : `ITEM ${index + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === safeItems.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 text-red-400 hover:text-red-300 ml-2"
                    title="Remove Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {renderItemFields(item, index, (updated) => handleItemUpdate(index, updated))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormRepeater;
