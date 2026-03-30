import { useState } from 'react';
import {
  Search,
  Edit,
  Trash2,
  Copy,
  FileText,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import type { QuotationStatus } from '../types';

const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; color: string }
> = {
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
};

export default function QuotationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>(
    'all'
  );

  const quotations = useAppStore((s) => s.quotations);
  const setCurrentQuotation = useAppStore((s) => s.setCurrentQuotation);
  const removeQuotation = useAppStore((s) => s.removeQuotation);
  const duplicateQuotation = useAppStore((s) => s.duplicateQuotation);
  const updateQuotation = useAppStore((s) => s.updateQuotation);
  const setView = useAppStore((s) => s.setView);

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      !searchTerm ||
      q.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id: string) => {
    const q = quotations.find((x) => x.id === id);
    if (q) {
      setCurrentQuotation(q);
      setView('builder');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
      removeQuotation(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Teklifler</h1>
          <p className="text-sm text-gray-500 mt-1">
            {quotations.length} teklif kayıtlı
          </p>
        </div>
        <button
          onClick={() => {
            useAppStore.getState().resetCurrentQuotation();
            setView('builder');
          }}
          className="px-6 py-3 bg-adotek-red text-white rounded-full font-bold shadow-lg shadow-adotek-red/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yeni Teklif
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Müşteri adı veya teklif no ile ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm"
          />
        </div>

        <div className="flex gap-2">
          {(
            [
              'all',
              'draft',
              'sent',
              'approved',
              'rejected',
            ] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                statusFilter === status
                  ? 'bg-adotek-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {status === 'all' ? 'Tümü' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">Teklif bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => handleEdit(q.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {q.customerCompany || 'İsimsiz Müşteri'}
                  </h3>
                  <p className="text-sm text-gray-500">{q.customerName}</p>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold',
                    STATUS_CONFIG[q.status].color
                  )}
                >
                  {STATUS_CONFIG[q.status].label}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>{q.number}</span>
                <span>{q.date}</span>
              </div>

              <div className="text-xs text-gray-400 mb-4">
                {q.machines.length} makine · {q.type}
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2 pt-4 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleEdit(q.id)}
                  className="p-2 text-gray-400 hover:text-adotek-red transition-colors"
                  title="Düzenle"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => duplicateQuotation(q.id)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Kopyala"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <select
                  value={q.status}
                  onChange={(e) =>
                    updateQuotation(q.id, {
                      status: e.target.value as QuotationStatus,
                    })
                  }
                  className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-adotek-red"
                >
                  <option value="draft">Taslak</option>
                  <option value="sent">Gönderildi</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                </select>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
