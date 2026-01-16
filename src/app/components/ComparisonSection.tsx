import { useMemo, useState } from 'react';
import { IDSSData } from '../utils/csvParser';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  historyData: IDSSData[];
  groupData: IDSSData[];
  selectedModalidades: string[];
  selectedPortes: string[];
  selectedOperadora?: IDSSData;
}

const INDICATORS: Array<{ key: IndicatorKey; label: string }> = [
  { key: 'idss', label: 'IDSS' },
  { key: 'idqs', label: 'IDQS' },
  { key: 'idga', label: 'IDGA' },
  { key: 'idsm', label: 'IDSM' },
  { key: 'idgr', label: 'IDGR' }
];

const COLORS = [
  'var(--brand-wine-dark)',
  'var(--brand-wine)',
  'var(--brand-wine-light)',
  'var(--brand-roxo)',
  'var(--brand-peach)',
  'var(--brand-cyan)',
  'var(--brand-goiaba)',
  'var(--brand-wine-ultra)',
  '#bf9cff'
];

const GROUP_COLORS = [
  'var(--brand-goiaba)',
  'var(--brand-cyan)',
  'var(--brand-peach)',
  'var(--brand-roxo)'
];

const getLatestByOperadora = (data: IDSSData[]) => {
  const grouped = new Map<string, IDSSData>();

  data.forEach(item => {
    if (!item.reg_ans) return;
    const currentYear = Number.parseInt(item.ano, 10) || 0;
    const existing = grouped.get(item.reg_ans);
    const existingYear = existing ? Number.parseInt(existing.ano, 10) || 0 : 0;

    if (!existing || existingYear < currentYear) {
      grouped.set(item.reg_ans, item);
    }
  });

  return grouped;
};

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

const buildAverageSnapshot = (data: IDSSData[], indicator: IndicatorKey) => {
  const values = data
    .map(item => item[indicator])
    .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
  if (values.length === 0) return 0;
  return parseFloat((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(4));
};

export function ComparisonSection({
  snapshotData,
  historyData,
  groupData,
  selectedModalidades,
  selectedPortes,
  selectedOperadora
}: ComparisonSectionProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorKey>('idss');
  const [showModalidadeComparison, setShowModalidadeComparison] = useState(true);
  const [showPorteComparison, setShowPorteComparison] = useState(true);

  const snapshotMap = useMemo(() => getLatestByOperadora(snapshotData), [snapshotData]);
  const historyMap = useMemo(() => getLatestByOperadora(historyData), [historyData]);
  const selectedOperadoras = selectedOperadora?.reg_ans ? [selectedOperadora.reg_ans] : [];

  const comparisonRecords = useMemo(() => {
    return selectedOperadoras
      .map(regAns => snapshotMap.get(regAns) || historyMap.get(regAns))
      .filter((item): item is IDSSData => Boolean(item));
  }, [selectedOperadoras, snapshotMap, historyMap]);

  const snapshotLabel = useMemo(() => {
    const yearsFromRecords = new Set(comparisonRecords.map(item => item.ano).filter(Boolean));
    const yearsFromSnapshot = new Set(snapshotData.map(item => item.ano).filter(Boolean));
    const years = yearsFromRecords.size > 0 ? yearsFromRecords : yearsFromSnapshot;

    if (years.size === 1) {
      return Array.from(years)[0];
    }
    if (years.size > 1) {
      return 'Ultimo ano disponivel';
    }
    return '';
  }, [comparisonRecords, snapshotData]);

  const comparisonData = useMemo(() => {
    return comparisonRecords.map(item => {
      const shortName = getShortName(item.razao_social);
      return {
        name: shortName,
        displayName: shortName,
        fullName: `${item.razao_social} (Nº ANS ${item.reg_ans})`,
        seriesKey: item.reg_ans,
        idss: item.idss ?? 0,
        idqs: item.idqs ?? 0,
        idga: item.idga ?? 0,
        idsm: item.idsm ?? 0,
        idgr: item.idgr ?? 0,
        reg_ans: item.reg_ans,
        ano: item.ano
      };
    });
  }, [comparisonRecords]);

  const groupSnapshotData = useMemo(() => {
    const groups: Array<{
      name: string;
      displayName: string;
      fullName: string;
      seriesKey: string;
      idss: number;
      idqs: number;
      idga: number;
      idsm: number;
      idgr: number;
      ano: string;
    }> = [];

    selectedModalidades.forEach(modalidade => {
      const filtered = snapshotData.filter(item => item.modalidade_operadora === modalidade);
      if (filtered.length === 0) return;
      const label = `Modalidade: ${modalidade}`;
      groups.push({
        name: label,
        displayName: label,
        fullName: label,
        seriesKey: `modalidade:${modalidade}`,
        idss: buildAverageSnapshot(filtered, 'idss'),
        idqs: buildAverageSnapshot(filtered, 'idqs'),
        idga: buildAverageSnapshot(filtered, 'idga'),
        idsm: buildAverageSnapshot(filtered, 'idsm'),
        idgr: buildAverageSnapshot(filtered, 'idgr'),
        ano: snapshotLabel
      });
    });

    selectedPortes.forEach(porte => {
      const filtered = snapshotData.filter(item => item.porte === porte);
      if (filtered.length === 0) return;
      const label = `Porte: ${porte}`;
      groups.push({
        name: label,
        displayName: label,
        fullName: label,
        seriesKey: `porte:${porte}`,
        idss: buildAverageSnapshot(filtered, 'idss'),
        idqs: buildAverageSnapshot(filtered, 'idqs'),
        idga: buildAverageSnapshot(filtered, 'idga'),
        idsm: buildAverageSnapshot(filtered, 'idsm'),
        idgr: buildAverageSnapshot(filtered, 'idgr'),
        ano: snapshotLabel
      });
    });

    return groups;
  }, [snapshotData, selectedModalidades, selectedPortes, snapshotLabel]);

  const combinedComparisonData = useMemo(() => {
    return [...comparisonData, ...groupSnapshotData];
  }, [comparisonData, groupSnapshotData]);

  const radarComparisonData = useMemo(() => {
    if (combinedComparisonData.length === 0) return [];

    return [
      {
        subject: 'IDQS',
        ...combinedComparisonData.reduce((acc, item) => ({ ...acc, [item.seriesKey]: item.idqs }), {})
      },
      {
        subject: 'IDGA',
        ...combinedComparisonData.reduce((acc, item) => ({ ...acc, [item.seriesKey]: item.idga }), {})
      },
      {
        subject: 'IDSM',
        ...combinedComparisonData.reduce((acc, item) => ({ ...acc, [item.seriesKey]: item.idsm }), {})
      },
      {
        subject: 'IDGR',
        ...combinedComparisonData.reduce((acc, item) => ({ ...acc, [item.seriesKey]: item.idgr }), {})
      }
    ];
  }, [combinedComparisonData]);

  const operadoraTimelineValues = useMemo(() => {
    const selectedSet = new Set(selectedOperadoras);
    const values: Record<string, Record<string, number>> = {};

    historyData.forEach(item => {
      if (!selectedSet.has(item.reg_ans)) return;
      const value = item[selectedIndicator];
      if (typeof value !== 'number' || Number.isNaN(value)) return;
      if (!values[item.reg_ans]) {
        values[item.reg_ans] = {};
      }
      values[item.reg_ans][item.ano] = value;
    });

    return values;
  }, [historyData, selectedOperadoras, selectedIndicator]);

  const modalidadeSeries = useMemo(() => {
    if (!showModalidadeComparison || selectedModalidades.length === 0) return [];
    return selectedModalidades
      .map((modalidade, index) => {
        const values = buildAverageByYear(
          groupData.filter(item => item.modalidade_operadora === modalidade),
          selectedIndicator
        );
        return {
          key: `modalidade:${modalidade}`,
          label: `Modalidade: ${modalidade}`,
          color: GROUP_COLORS[index % GROUP_COLORS.length],
          values
        };
      })
      .filter(series => series.values.size > 0);
  }, [groupData, selectedModalidades, selectedIndicator, showModalidadeComparison]);

  const porteSeries = useMemo(() => {
    if (!showPorteComparison || selectedPortes.length === 0) return [];
    return selectedPortes
      .map((porte, index) => {
        const values = buildAverageByYear(
          groupData.filter(item => item.porte === porte),
          selectedIndicator
        );
        return {
          key: `porte:${porte}`,
          label: `Porte: ${porte}`,
          color: GROUP_COLORS[(index + modalidadeSeries.length) % GROUP_COLORS.length],
          values
        };
      })
      .filter(series => series.values.size > 0);
  }, [groupData, selectedPortes, selectedIndicator, showPorteComparison, modalidadeSeries.length]);

  const timelineData = useMemo(() => {
    const years = new Set<string>();
    Object.values(operadoraTimelineValues).forEach(values => {
      Object.keys(values).forEach(year => years.add(year));
    });
    modalidadeSeries.forEach(series => {
      series.values.forEach((_value, year) => years.add(year));
    });
    porteSeries.forEach(series => {
      series.values.forEach((_value, year) => years.add(year));
    });

    return Array.from(years)
      .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
      .map(year => {
        const point: Record<string, number | string> = { ano: year };
        selectedOperadoras.forEach(regAns => {
          const value = operadoraTimelineValues[regAns]?.[year];
          if (typeof value === 'number') {
            point[regAns] = value;
          }
        });
        modalidadeSeries.forEach(series => {
          const value = series.values.get(year);
          if (typeof value === 'number') {
            point[series.key] = value;
          }
        });
        porteSeries.forEach(series => {
          const value = series.values.get(year);
          if (typeof value === 'number') {
            point[series.key] = value;
          }
        });
        return point;
      });
  }, [operadoraTimelineValues, selectedOperadoras, modalidadeSeries, porteSeries]);

  const operadoraLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    comparisonRecords.forEach(item => {
      map.set(item.reg_ans, getShortName(item.razao_social));
    });
    return map;
  }, [comparisonRecords]);

  const shouldShowGroupControls = selectedModalidades.length > 0 || selectedPortes.length > 0;
  const hasComparisonTargets = combinedComparisonData.length > 0;
  const hasTimelineSeries = selectedOperadoras.length > 0 || modalidadeSeries.length > 0 || porteSeries.length > 0;

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
              Selecione uma operadora na tabela ou use Modalidade/Porte para comparar medias.
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
          </div>
        </div>
      </div>

      {hasComparisonTargets || hasTimelineSeries ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg text-gray-800">Comparacao Ano a Ano</h3>
                <p className="text-sm text-gray-500">Evolucao do indicador selecionado por operadora e grupos.</p>
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

            {shouldShowGroupControls && (
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                {selectedModalidades.length > 0 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showModalidadeComparison}
                      onChange={(e) => setShowModalidadeComparison(e.target.checked)}
                      className="w-4 h-4 text-[var(--brand-wine-dark)] border-gray-300 rounded focus:ring-[var(--brand-wine)]"
                    />
                    Comparar modalidades selecionadas
                  </label>
                )}
                {selectedPortes.length > 0 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showPorteComparison}
                      onChange={(e) => setShowPorteComparison(e.target.checked)}
                      className="w-4 h-4 text-[var(--brand-wine-dark)] border-gray-300 rounded focus:ring-[var(--brand-wine)]"
                    />
                    Comparar portes selecionados
                  </label>
                )}
              </div>
            )}

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
                {selectedOperadoras.map((regAns, index) => (
                  <Line
                    key={regAns}
                    type="monotone"
                    dataKey={regAns}
                    name={operadoraLabelMap.get(regAns) || regAns}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
                {modalidadeSeries.map((series, index) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={series.color || GROUP_COLORS[index % GROUP_COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                ))}
                {porteSeries.map((series, index) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={series.color || GROUP_COLORS[(index + modalidadeSeries.length) % GROUP_COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-800">Comparacao de IDSS</h3>
              {snapshotLabel && (
                <span className="text-sm text-gray-500">Ano: {snapshotLabel}</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  formatter={(value: number) => value.toFixed(4)}
                  labelFormatter={(label) => {
                    const item = combinedComparisonData.find(d => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="idss" fill="var(--brand-wine-dark)" name="IDSS" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-800">Comparacao de Todos os Indices</h3>
              {snapshotLabel && (
                <span className="text-sm text-gray-500">Ano: {snapshotLabel}</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={combinedComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  formatter={(value: number) => value.toFixed(4)}
                  labelFormatter={(label) => {
                    const item = combinedComparisonData.find(d => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="idss" fill="var(--brand-wine-dark)" name="IDSS" />
                <Bar dataKey="idqs" fill="var(--brand-wine)" name="IDQS" />
                <Bar dataKey="idga" fill="var(--brand-wine-light)" name="IDGA" />
                <Bar dataKey="idsm" fill="var(--brand-goiaba)" name="IDSM" />
                <Bar dataKey="idgr" fill="var(--brand-roxo)" name="IDGR" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">Comparacao Radar (Perfil de Desempenho)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarComparisonData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 1]} />
                {combinedComparisonData.map((item, index) => (
                  <Radar
                    key={item.seriesKey}
                    name={item.displayName}
                    dataKey={item.seriesKey}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.3}
                  />
                ))}
                <Tooltip formatter={(value: number) => value.toFixed(4)} />
                <Legend />
              </RadarChart>
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
                  {combinedComparisonData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.fullName}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{item.ano || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-[var(--brand-wine-dark)]">{item.idss.toFixed(4)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">{item.idqs.toFixed(4)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">{item.idga.toFixed(4)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">{item.idsm.toFixed(4)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">{item.idgr.toFixed(4)}</span>
                      </td>
                    </tr>
                  ))}
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
            Selecione uma operadora na tabela ou use Modalidade/Porte para comparar medias.
          </p>
        </div>
      )}
    </div>
  );
}
