import { useState, useEffect } from 'react';
import { IDSSData, getUniqueValues } from '../utils/csvParser';
import { Filter, X } from 'lucide-react';

interface FilterPanelProps {
  data: IDSSData[];
  onFilterChange: (filteredData: IDSSData[]) => void;
}

export function FilterPanel({ data, onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    modalidade_operadora: '',
    uniodonto: '',
    minIDSS: '',
    maxIDSS: '',
    ano: ''
  });

  const modalidades = getUniqueValues(data, 'modalidade_operadora');
  const uniodontos = getUniqueValues(data, 'uniodonto');
  const anos = getUniqueValues(data, 'ano').sort((a, b) => parseInt(b) - parseInt(a));

  useEffect(() => {
    let filtered = data;

    // Apply text filters
    if (filters.modalidade_operadora) {
      filtered = filtered.filter(item => 
        item.modalidade_operadora.toLowerCase().includes(filters.modalidade_operadora.toLowerCase())
      );
    }

    if (filters.uniodonto) {
      filtered = filtered.filter(item => 
        item.uniodonto.toLowerCase() === filters.uniodonto.toLowerCase()
      );
    }

    if (filters.ano) {
      filtered = filtered.filter(item => 
        item.ano === filters.ano
      );
    }

    // Apply IDSS range filters
    if (filters.minIDSS) {
      const minValue = parseFloat(filters.minIDSS);
      filtered = filtered.filter(item => (item.idss ?? 0) >= minValue);
    }

    if (filters.maxIDSS) {
      const maxValue = parseFloat(filters.maxIDSS);
      filtered = filtered.filter(item => (item.idss ?? 0) <= maxValue);
    }

    onFilterChange(filtered);
  }, [filters, data, onFilterChange]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      modalidade_operadora: '',
      uniodonto: '',
      minIDSS: '',
      maxIDSS: '',
      ano: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-gray-900">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="bg-[var(--brand-wine-dark)] text-white text-xs px-2.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Modalidade</label>
              <select
                value={filters.modalidade_operadora}
                onChange={(e) => handleFilterChange('modalidade_operadora', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent bg-white"
              >
                <option value="">Todas</option>
                {modalidades.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Uniodonto</label>
              <select
                value={filters.uniodonto}
                onChange={(e) => handleFilterChange('uniodonto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent bg-white"
              >
                <option value="">Todos</option>
                {uniodontos.map(uniodonto => (
                  <option key={uniodonto} value={uniodonto}>{uniodonto}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Ano</label>
              <select
                value={filters.ano}
                onChange={(e) => handleFilterChange('ano', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent bg-white"
              >
                <option value="">Todos</option>
                {anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">IDSS Mínimo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={filters.minIDSS}
                onChange={(e) => handleFilterChange('minIDSS', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">IDSS Máximo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={filters.maxIDSS}
                onChange={(e) => handleFilterChange('maxIDSS', e.target.value)}
                placeholder="1.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
