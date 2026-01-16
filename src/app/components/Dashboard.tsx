import { useMemo } from 'react';
import { IDSSData } from '../utils/csvParser';
import { OverviewCards } from './OverviewCards';
import { ChartsSection } from './ChartsSection';
import { DataTable } from './DataTable';
import { ComparisonSection } from './ComparisonSection';
import { Trash2 } from 'lucide-react';

interface DashboardProps {
  data: IDSSData[];
  historyData: IDSSData[];
  comparisonGroupData: IDSSData[];
  selectedModalidades: string[];
  selectedPortes: string[];
  selectedOperadora?: IDSSData;
  totalOperadoras?: number;
  onClearData: () => void;
  onSelectOperadora?: (operadora: IDSSData) => void;
}

export function Dashboard({
  data,
  historyData,
  comparisonGroupData,
  selectedModalidades,
  selectedPortes,
  selectedOperadora,
  totalOperadoras,
  onClearData,
  onSelectOperadora
}: DashboardProps) {
  const filteredOperadoras = useMemo(
    () => new Set(data.map(item => item.reg_ans).filter(Boolean)).size,
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-gray-700">
              <span className="text-2xl text-[var(--brand-wine-dark)]">{filteredOperadoras}</span>
              {' '}
              <span className="text-sm">
                {filteredOperadoras === 1 ? 'operadora' : 'operadoras'}
                {typeof totalOperadoras === 'number' && totalOperadoras > 0 && totalOperadoras !== filteredOperadoras && (
                  <span className="text-gray-500"> (de {totalOperadoras} total)</span>
                )}
              </span>
            </p>
          </div>

          <button
            onClick={onClearData}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Dados
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards data={data} />

      {/* Table */}
      <DataTable data={data} onSelectOperadora={onSelectOperadora} />

      {/* Charts */}
      <ChartsSection data={data} />

      {/* Comparison */}
      <ComparisonSection
        snapshotData={data}
        historyData={historyData}
        groupData={comparisonGroupData}
        selectedModalidades={selectedModalidades}
        selectedPortes={selectedPortes}
        selectedOperadora={selectedOperadora}
      />
    </div>
  );
}
