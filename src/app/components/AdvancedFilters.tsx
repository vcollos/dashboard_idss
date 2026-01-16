import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface FilterOptions {
  anos: string[];
  modalidades: string[];
  razoesSociais: string[];
  numerosANS: string[];
  portes: string[];
  uniodontos: string[];
  idssRange: { min: number; max: number };
  beneficiariosRange: { min: number; max: number };
}

export interface ActiveFilters {
  anos: string[];
  modalidades: string[];
  razoesSociais: string[];
  numerosANS: string[];
  portes: string[];
  uniodontos: string[];
  idssMin: number;
  idssMax: number;
  beneficiariosMin: number;
  beneficiariosMax: number;
}

interface AdvancedFiltersProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onClearAll: () => void;
}

export function AdvancedFilters({ options, activeFilters, onFiltersChange, onClearAll }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleFilter = (category: 'anos' | 'modalidades' | 'razoesSociais' | 'numerosANS' | 'portes' | 'uniodontos', value: string) => {
    const current = activeFilters[category];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFiltersChange({ ...activeFilters, [category]: updated });
  };

  const hasActiveFilters = 
    activeFilters.anos.length > 0 ||
    activeFilters.modalidades.length > 0 ||
    activeFilters.razoesSociais.length > 0 ||
    activeFilters.numerosANS.length > 0 ||
    activeFilters.portes.length > 0 ||
    activeFilters.uniodontos.length > 0 ||
    activeFilters.idssMin > options.idssRange.min ||
    activeFilters.idssMax < options.idssRange.max ||
    activeFilters.beneficiariosMin > options.beneficiariosRange.min ||
    activeFilters.beneficiariosMax < options.beneficiariosRange.max;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[var(--brand-wine-soft)] to-[var(--brand-roxo-soft)] border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[var(--brand-wine-dark)]" />
            <div>
              <h3 className="font-semibold text-gray-900">Filtros Avançados</h3>
              <p className="text-xs text-gray-600">Combine múltiplos filtros para análise detalhada</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 text-sm bg-[var(--brand-goiaba-soft)] text-[var(--brand-wine-ultra)] rounded-lg hover:bg-[var(--brand-peach-soft)] transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpar Tudo
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <MultiSelectDropdown
              label="Nº ANS"
              options={options.numerosANS}
              selected={activeFilters.numerosANS}
              onChange={(values) => onFiltersChange({ ...activeFilters, numerosANS: values })}
              searchable
              searchPlaceholder="Buscar Nº ANS..."
            />
            <MultiSelectDropdown
              label="Razão Social"
              options={options.razoesSociais}
              selected={activeFilters.razoesSociais}
              onChange={(values) => onFiltersChange({ ...activeFilters, razoesSociais: values })}
              searchable
              searchPlaceholder="Buscar razão social..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <MultiSelectDropdown
              label="Anos"
              options={options.anos}
              selected={activeFilters.anos}
              onChange={(values) => onFiltersChange({ ...activeFilters, anos: values })}
              singleSelect
            />

            <MultiSelectDropdown
              label="Modalidades"
              options={options.modalidades}
              selected={activeFilters.modalidades}
              onChange={(values) => onFiltersChange({ ...activeFilters, modalidades: values })}
            />

            <MultiSelectDropdown
              label="Porte"
              options={options.portes}
              selected={activeFilters.portes}
              onChange={(values) => onFiltersChange({ ...activeFilters, portes: values })}
            />

            <MultiSelectDropdown
              label="Uniodonto"
              options={options.uniodontos}
              selected={activeFilters.uniodontos}
              onChange={(values) => onFiltersChange({ ...activeFilters, uniodontos: values })}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Range IDSS</label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Mínimo: {activeFilters.idssMin.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={options.idssRange.min}
                    max={options.idssRange.max}
                    step={0.01}
                    value={activeFilters.idssMin}
                    onChange={(e) => onFiltersChange({ 
                      ...activeFilters, 
                      idssMin: parseFloat(e.target.value) 
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-wine-dark)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Máximo: {activeFilters.idssMax.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={options.idssRange.min}
                    max={options.idssRange.max}
                    step={0.01}
                    value={activeFilters.idssMax}
                    onChange={(e) => onFiltersChange({ 
                      ...activeFilters, 
                      idssMax: parseFloat(e.target.value) 
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-wine-dark)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Beneficiários</label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Mínimo: {activeFilters.beneficiariosMin.toLocaleString('pt-BR')}
                  </label>
                  <input
                    type="range"
                    min={options.beneficiariosRange.min}
                    max={options.beneficiariosRange.max}
                    step={1000}
                    value={activeFilters.beneficiariosMin}
                    onChange={(e) => onFiltersChange({ 
                      ...activeFilters, 
                      beneficiariosMin: parseInt(e.target.value) 
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-wine-dark)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Máximo: {activeFilters.beneficiariosMax.toLocaleString('pt-BR')}
                  </label>
                  <input
                    type="range"
                    min={options.beneficiariosRange.min}
                    max={options.beneficiariosRange.max}
                    step={1000}
                    value={activeFilters.beneficiariosMax}
                    onChange={(e) => onFiltersChange({ 
                      ...activeFilters, 
                      beneficiariosMax: parseInt(e.target.value) 
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-wine-dark)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && isExpanded && (
        <div className="px-6 pb-6">
          <div className="bg-[var(--brand-wine-soft)] border border-[var(--brand-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--brand-wine-ultra)] font-medium mb-2">Filtros Ativos:</p>
            <div className="flex flex-wrap gap-2">
              {activeFilters.anos.map(ano => (
                <ActiveFilterBadge
                  key={`ano-${ano}`}
                  label={`Ano: ${ano}`}
                  onRemove={() => {
                    const updated = activeFilters.anos.filter(a => a !== ano);
                    onFiltersChange({ ...activeFilters, anos: updated });
                  }}
                />
              ))}
              {activeFilters.modalidades.map(mod => (
                <ActiveFilterBadge
                  key={`mod-${mod}`}
                  label={`Modalidade: ${mod}`}
                  onRemove={() => {
                    const updated = activeFilters.modalidades.filter(m => m !== mod);
                    onFiltersChange({ ...activeFilters, modalidades: updated });
                  }}
                />
              ))}
              {activeFilters.numerosANS.map(numero => (
                <ActiveFilterBadge
                  key={`ans-${numero}`}
                  label={`Nº ANS: ${numero}`}
                  onRemove={() => {
                    const updated = activeFilters.numerosANS.filter(o => o !== numero);
                    onFiltersChange({ ...activeFilters, numerosANS: updated });
                  }}
                />
              ))}
              {activeFilters.razoesSociais.map(razao => (
                <ActiveFilterBadge
                  key={`razao-${razao}`}
                  label={`Razão Social: ${razao}`}
                  onRemove={() => {
                    const updated = activeFilters.razoesSociais.filter(r => r !== razao);
                    onFiltersChange({ ...activeFilters, razoesSociais: updated });
                  }}
                />
              ))}
              {activeFilters.portes.map(porte => (
                <ActiveFilterBadge
                  key={`porte-${porte}`}
                  label={`Porte: ${porte}`}
                  onRemove={() => {
                    const updated = activeFilters.portes.filter(p => p !== porte);
                    onFiltersChange({ ...activeFilters, portes: updated });
                  }}
                />
              ))}
              {activeFilters.uniodontos.map(uniodonto => (
                <ActiveFilterBadge
                  key={`uniodonto-${uniodonto}`}
                  label={`Uniodonto: ${uniodonto}`}
                  onRemove={() => {
                    const updated = activeFilters.uniodontos.filter(u => u !== uniodonto);
                    onFiltersChange({ ...activeFilters, uniodontos: updated });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Multi-Select Dropdown Component
function MultiSelectDropdown({ 
  label, 
  options, 
  selected, 
  onChange,
  searchable,
  searchPlaceholder,
  className,
  singleSelect
}: { 
  label: string; 
  options: string[]; 
  selected: string[]; 
  onChange: (values: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  singleSelect?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const toggleOption = (value: string) => {
    if (singleSelect) {
      const updated = selected.includes(value) ? [] : [value];
      onChange(updated);
      setIsOpen(false);
      return;
    }
    const updated = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(updated);
  };

  const selectAll = () => {
    if (singleSelect) return;
    onChange(options);
  };

  const clearAll = () => {
    onChange([]);
  };

  const filteredOptions = searchTerm
    ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className={`relative ${className ?? ''}`} ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-900 mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-[var(--brand-wine)] transition-colors"
      >
        <span className="text-sm text-gray-700 truncate">
          {selected.length === 0 
            ? `Selecione ${label.toLowerCase()}...` 
            : `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200">
            {searchable && (
              <div className="p-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder || `Buscar ${label.toLowerCase()}...`}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent"
                />
              </div>
            )}
            <div className="bg-gray-50 border-t border-gray-200 p-2 flex gap-2">
              {!singleSelect && (
                <button
                  onClick={selectAll}
                  className="flex-1 px-2 py-1 text-xs bg-[var(--brand-wine-soft)] text-[var(--brand-wine-dark)] rounded hover:bg-[var(--brand-peach-soft)] transition-colors"
                >
                  Selecionar Todos
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="p-1">
            {filteredOptions.map(option => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-[var(--brand-wine-dark)] border-gray-300 rounded focus:ring-[var(--brand-wine)]"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selected count badge */}
      {selected.length > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-wine-dark)] text-white text-xs rounded-full flex items-center justify-center">
          {selected.length}
        </div>
      )}
    </div>
  );
}

function ActiveFilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-[var(--brand-wine-ultra)] text-xs rounded-full border border-[var(--brand-border)]">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-[var(--brand-wine-soft)] rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
