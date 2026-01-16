import { useMemo, useState } from 'react';
import { IDSSData, calculateAverage } from '../utils/csvParser';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

type IndicatorKey = 'idss' | 'idqs' | 'idga' | 'idsm' | 'idgr';

interface ComparisonSectionProps {
  snapshotData: IDSSData[];
  comparisonTargets: IDSSData[];
  historyData: IDSSData[];
  selectedYear?: string;
  selectedOperadora?: IDSSData;
}

const INDICATORS: Array<{ key: IndicatorKey; label: string }> = [
  { key: 'idss', label: 'IDSS' },
  { key: 'idqs', label: 'IDQS' },
  { key: 'idga', label: 'IDGA' },
  { key: 'idsm', label: 'IDSM' },
  { key: 'idgr', label: 'IDGR' }
];

const getShortName = (razaoSocial: string) => {
  const parts = razaoSocial.trim().split(/\s+/);
  if (parts.length <= 2) return parts.join(' ');
  return `${parts[0]} ${parts[1]}`;
};

const buildAverageByYear = (data: IDSSData[], indicator: IndicatorKey) => {
  const grouped: Record<string, { sum: number; count: number }> = {};

  data.forEach(item => {
    const value = item[indicator];
    if (typeof value !== 'number' || Number.isNaN(value)) return;
    const year = item.ano;
    if (!grouped[year]) {
      grouped[year] = { sum: 0, count: 0 };
    }
    grouped[year].sum += value;
    grouped[year].count += 1;
  });

  const result = new Map<string, number>();
  Object.entries(grouped).forEach(([year, totals]) => {
    if (totals.count > 0) {
      result.set(year, parseFloat((totals.sum / totals.count).toFixed(4)));
    }
  });

  return result;
};

export function ComparisonSection({
  snapshotData,
  comparisonTargets,
  historyData,
  selectedYear,
  selectedOperadora
}: ComparisonSectionProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorKey>('idss');

  const selectedSnapshot = useMemo(() => {
    if (!selectedOperadora?.reg_ans) return undefined;
    const matchInSnapshot = snapshotData.find(item => item.reg_ans === selectedOperadora.reg_ans);
    if (matchInSnapshot) return matchInSnapshot;
    if (selectedYear) {
      return historyData.find(item => item.reg_ans === selectedOperadora.reg_ans && item.ano === selectedYear);
    }
    return undefined;
  }, [snapshotData, historyData, selectedOperadora, selectedYear]);

  const comparisonIndices = useMemo(() => {
    return INDICATORS.map(indicator => {
      const selectedValue = selectedSnapshot?.[indicator.key] ?? null;
      return {
        index: indicator.label,
        operadora: selectedValue,
        media: calculateAverage(comparisonTargets, indicator.key)
      };
    });
  }, [comparisonTargets, selectedSnapshot]);

  const groupAverageByYear = useMemo(() => {
    return buildAverageByYear(historyData, selectedIndicator);
  }, [historyData, selectedIndicator]);

  const selectedTimeline = useMemo(() => {
    if (!selectedOperadora?.reg_ans) return [];
    return historyData
      .filter(item => item.reg_ans === selectedOperadora.reg_ans)
      .map(item => ({ ano: item.ano, value: item[selectedIndicator] ?? 0 }));
  }, [historyData, selectedIndicator, selectedOperadora]);

  const timelineData = useMemo(() => {
    const years = new Set<string>();
    selectedTimeline.forEach(item => years.add(item.ano));
    groupAverageByYear.forEach((_value, year) => years.add(year));

    return Array.from(years)
      .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
      .map(year => {
        const point: Record<string, number | string> = { ano: year };
        const selectedValue = selectedTimeline.find(item => item.ano === year)?.value;
        if (typeof selectedValue === 'number') {
          point.selected = selectedValue;
        }
        const groupValue = groupAverageByYear.get(year);
        if (typeof groupValue === 'number') {
          point.group = groupValue;
        }
        return point;
      });
  }, [groupAverageByYear, selectedTimeline]);

  const hasComparisonTargets = comparisonTargets.length > 0;
  const selectedLabel = selectedOperadora?.razao_social ? getShortName(selectedOperadora.razao_social) : '';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg text-gray-800">Comparacoes</h3>
          {selectedOperadora ? (
            <div className="text-sm text-gray-600">
              Operadora selecionada: <span className="text-[var(--brand-wine-ultra)] font-semibold">{selectedOperadora.razao_social}</span> (Nº ANS {selectedOperadora.reg_ans})
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Ajuste os filtros para montar o grupo de comparacao.
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {selectedOperadora?.modalidade_operadora && (
              <span className="px-2 py-1 rounded-full bg-[var(--brand-wine-soft)] text-[var(--brand-wine-ultra)]">
                {selectedOperadora.modalidade_operadora}
              </span>
            )}
            {selectedOperadora?.porte && (
              <span className="px-2 py-1 rounded-full bg-[var(--brand-peach-soft)] text-[var(--brand-wine-ultra)]">
                {selectedOperadora.porte}
              </span>
            )}
            {selectedOperadora?.uniodonto && (
              <span className="px-2 py-1 rounded-full bg-[var(--brand-roxo-soft)] text-[var(--brand-wine-ultra)]">
                Uniodonto: {selectedOperadora.uniodonto}
              </span>
            )}
          </div>
        </div>
      </div>

      {hasComparisonTargets ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg text-gray-800">Comparacao Ano a Ano</h3>
                <p className="text-sm text-gray-500">Operadora selecionada vs media do grupo filtrado.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {INDICATORS.map(indicator => (
                  <button
                    key={indicator.key}
                    onClick={() => setSelectedIndicator(indicator.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedIndicator === indicator.key
                        ? 'bg-[var(--brand-wine-dark)] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {indicator.label}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ano" />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  formatter={(value: number, name: string) => [value.toFixed(4), name]}
                  labelFormatter={(label) => `Ano: ${label}`}
                />
                <Legend />
                {selectedOperadora && (
                  <Line
                    type="monotone"
                    dataKey="selected"
                    name={selectedLabel || 'Operadora'}
                    stroke="var(--brand-wine-dark)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="group"
                  name="Media do grupo"
                  stroke="var(--brand-roxo)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-800">Comparacao por Indice</h3>
              {selectedYear && (
                <span className="text-sm text-gray-500">Ano: {selectedYear}</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={comparisonIndices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value: number | null) => (value ?? 0).toFixed(4)} />
                <Legend />
                {selectedOperadora && (
                  <Bar dataKey="operadora" fill="var(--brand-wine-dark)" name={selectedLabel || 'Operadora'} />
                )}
                <Bar dataKey="media" fill="var(--brand-roxo)" name="Media do grupo" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg text-gray-800">Tabela Comparativa Detalhada</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Operadora</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">Ano</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">IDSS</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">IDQS</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">IDGA</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">IDSM</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">IDGR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedOperadora && selectedSnapshot ? (
                    [
                      {
                        label: selectedOperadora.razao_social,
                        ano: selectedSnapshot.ano,
                        idss: selectedSnapshot.idss,
                        idqs: selectedSnapshot.idqs,
                        idga: selectedSnapshot.idga,
                        idsm: selectedSnapshot.idsm,
                        idgr: selectedSnapshot.idgr
                      },
                      {
                        label: 'Media do grupo',
                        ano: selectedYear || selectedSnapshot.ano,
                        idss: calculateAverage(comparisonTargets, 'idss'),
                        idqs: calculateAverage(comparisonTargets, 'idqs'),
                        idga: calculateAverage(comparisonTargets, 'idga'),
                        idsm: calculateAverage(comparisonTargets, 'idsm'),
                        idgr: calculateAverage(comparisonTargets, 'idgr')
                      }
                    ].map((row, index) => (
                      <tr key={`summary-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{row.label}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{row.ano || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-[var(--brand-wine-dark)]">{(row.idss ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(row.idqs ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(row.idga ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(row.idsm ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(row.idgr ?? 0).toFixed(4)}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    comparisonTargets.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.razao_social}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{item.ano || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-[var(--brand-wine-dark)]">{(item.idss ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(item.idqs ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(item.idga ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(item.idsm ?? 0).toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-700">{(item.idgr ?? 0).toFixed(4)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg text-gray-700 mb-2">Sem comparacoes disponiveis</h3>
          <p className="text-gray-500">
            Ajuste os filtros para montar o grupo de comparacao.
          </p>
        </div>
      )}
    </div>
  );
}
