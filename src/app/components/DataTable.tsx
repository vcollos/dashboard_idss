import { useState, useMemo } from 'react';
import { IDSSData } from '../utils/csvParser';
import { Search, ChevronDown, ChevronUp, Award, MapPin } from 'lucide-react';

interface DataTableProps {
  data: IDSSData[];
  onSelectOperadora?: (operadora: IDSSData) => void;
}

type SortKey = keyof IDSSData;
type SortDirection = 'asc' | 'desc';

export function DataTable({ data, onSelectOperadora }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('idss');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    filtered.sort((a, b) => {
      const aValue = a[sortKey] ?? '';
      const bValue = b[sortKey] ?? '';
      
      // Special handling for numeric fields
      if (['idss', 'idqs', 'idga', 'idsm', 'idgr', 'ano', 'reg_ans', 'qt_beneficiarios'].includes(sortKey)) {
        const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue.toString().replace(',', '.')) || 0;
        const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue.toString().replace(',', '.')) || 0;
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, searchTerm, sortKey, sortDirection]);

  const rankedByIdss = useMemo(() => {
    const uniqueByOperadora = new Map<string, IDSSData>();
    data.forEach(item => {
      if (!item.reg_ans) return;
      const existing = uniqueByOperadora.get(item.reg_ans);
      if (!existing || (item.idss ?? 0) > (existing.idss ?? 0)) {
        uniqueByOperadora.set(item.reg_ans, item);
      }
    });

    return Array.from(uniqueByOperadora.values()).sort((a, b) => {
      const scoreDiff = (b.idss ?? 0) - (a.idss ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      const nameDiff = (a.razao_social || '').localeCompare(b.razao_social || '');
      if (nameDiff !== 0) return nameDiff;
      return (a.reg_ans || '').localeCompare(b.reg_ans || '');
    });
  }, [data]);

  const rankByKey = useMemo(() => {
    const map = new Map<string, number>();
    rankedByIdss.forEach((item, index) => {
      map.set(item.reg_ans, index + 1);
    });
    return map;
  }, [rankedByIdss]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const SortButton = ({ columnKey, label }: { columnKey: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(columnKey)}
      className="flex items-center gap-1 hover:text-[var(--brand-wine-dark)] transition-colors"
    >
      {label}
      {sortKey === columnKey && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  const getScoreColor = (score: number | null) => {
    if (score === null || score === undefined || Number.isNaN(score)) return 'text-gray-500 bg-gray-50';
    const value = score;
    if (value >= 0.9) return 'text-[var(--brand-wine-ultra)] bg-[var(--brand-wine-soft)]';
    if (value >= 0.8) return 'text-[var(--brand-wine-dark)] bg-[var(--brand-peach-soft)]';
    if (value >= 0.7) return 'text-[var(--brand-wine)] bg-[var(--brand-roxo-soft)]';
    return 'text-[var(--brand-goiaba)] bg-[var(--brand-goiaba-soft)]';
  };

  // Calculate rank based on sorted IDSS
  const dataWithRank = useMemo(() => {
    return paginatedData.map(item => ({
      ...item,
      calculatedRank: rankByKey.get(item.reg_ans) ?? 0
    }));
  }, [paginatedData, rankByKey]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filtro (reduz a tabela)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar operadora, modalidade, Uniodonto, indices..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-700">
                Rank (IDSS)
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">
                <SortButton columnKey="razao_social" label="Razão Social" />
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">
                <SortButton columnKey="modalidade_operadora" label="Modalidade" />
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">
                <SortButton columnKey="uniodonto" label="Uniodonto" />
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">
                <SortButton columnKey="ano" label="Ano" />
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">
                <SortButton columnKey="idss" label="IDSS" />
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">
                <SortButton columnKey="idqs" label="IDQS" />
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">
                <SortButton columnKey="idga" label="IDGA" />
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">
                <SortButton columnKey="idsm" label="IDSM" />
              </th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">
                <SortButton columnKey="idgr" label="IDGR" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dataWithRank.map((item) => {
              const rowKey = `${item.reg_ans}-${item.ano}`;
              return (
              <tr
                key={rowKey}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {item.calculatedRank > 0 && item.calculatedRank <= 3 && (
                      <Award className={`w-4 h-4 ${
                        item.calculatedRank === 1 ? 'text-yellow-500' :
                        item.calculatedRank === 2 ? 'text-gray-400' :
                        'text-orange-600'
                      }`} />
                    )}
                    <span className="text-gray-900">{item.calculatedRank || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="max-w-xs">
                    <div className="truncate font-medium">{item.razao_social}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>Nº ANS: {item.reg_ans}</span>
                      {item.cidade && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.cidade}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-[var(--brand-wine-soft)] text-[var(--brand-wine-ultra)]">
                    {item.modalidade_operadora}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  <span className="font-medium">{item.uniodonto || '-'}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {item.ano}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${getScoreColor(item.idss)}`}>
                    {item.idss !== null && item.idss !== undefined ? item.idss.toFixed(4) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm ${getScoreColor(item.idqs)}`}>
                    {item.idqs !== null && item.idqs !== undefined ? item.idqs.toFixed(4) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm ${getScoreColor(item.idga)}`}>
                    {item.idga !== null && item.idga !== undefined ? item.idga.toFixed(4) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm ${getScoreColor(item.idsm)}`}>
                    {item.idsm !== null && item.idsm !== undefined ? item.idsm.toFixed(4) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm ${getScoreColor(item.idgr)}`}>
                    {item.idgr !== null && item.idgr !== undefined ? item.idgr.toFixed(4) : '-'}
                  </span>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} registros
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center gap-2">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`
                        w-10 h-10 rounded-lg
                        ${currentPage === page 
                          ? 'bg-[var(--brand-wine-dark)] text-white' 
                          : 'border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {paginatedData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Nenhum resultado encontrado para "{searchTerm}"
        </div>
      )}
    </div>
  );
}
