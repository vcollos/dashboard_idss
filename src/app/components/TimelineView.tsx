import { IDSSData } from '../utils/csvParser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Activity } from 'lucide-react';

interface TimelineViewProps {
  data: IDSSData[];
  selectedOperadora?: IDSSData;
}

export function TimelineView({ data, selectedOperadora }: TimelineViewProps) {
  // Group data by year and calculate averages
  const getTimelineData = () => {
    const grouped: Record<string, { ano: string; idss: number; idqs: number; idga: number; idsm: number; idgr: number; count: number }> = {};

    data.forEach(item => {
      const year = item.ano;
      if (!grouped[year]) {
        grouped[year] = { ano: year, idss: 0, idqs: 0, idga: 0, idsm: 0, idgr: 0, count: 0 };
      }

      grouped[year].idss += item.idss ?? 0;
      grouped[year].idqs += item.idqs ?? 0;
      grouped[year].idga += item.idga ?? 0;
      grouped[year].idsm += item.idsm ?? 0;
      grouped[year].idgr += item.idgr ?? 0;
      grouped[year].count++;
    });

    return Object.values(grouped)
      .map(g => ({
        ano: g.ano,
        IDSS: parseFloat((g.idss / g.count).toFixed(2)),
        IDQS: parseFloat((g.idqs / g.count).toFixed(2)),
        IDGA: parseFloat((g.idga / g.count).toFixed(2)),
        IDSM: parseFloat((g.idsm / g.count).toFixed(2)),
        IDGR: parseFloat((g.idgr / g.count).toFixed(2)),
      }))
      .sort((a, b) => parseInt(a.ano) - parseInt(b.ano));
  };

  // Get timeline for selected operadora
  const getOperadoraTimeline = () => {
    if (!selectedOperadora) return [];

    return data
      .filter(item => item.reg_ans === selectedOperadora.reg_ans)
      .map(item => ({
        ano: item.ano,
        IDSS: item.idss ?? 0,
        IDQS: item.idqs ?? 0,
        IDGA: item.idga ?? 0,
        IDSM: item.idsm ?? 0,
        IDGR: item.idgr ?? 0,
      }))
      .sort((a, b) => parseInt(a.ano) - parseInt(b.ano));
  };

  // Get operadoras count over time
  const getOperadorasCountTimeline = () => {
    const grouped: Record<string, Set<string>> = {};

    data.forEach(item => {
      const year = item.ano;
      if (!grouped[year]) {
        grouped[year] = new Set();
      }
      grouped[year].add(item.reg_ans);
    });

    return Object.entries(grouped)
      .map(([ano, operadoras]) => ({
        ano,
        quantidade: operadoras.size,
      }))
      .sort((a, b) => parseInt(a.ano) - parseInt(b.ano));
  };

  const timelineData = getTimelineData();
  const operadoraTimeline = getOperadoraTimeline();
  const operadorasCount = getOperadorasCountTimeline();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--brand-wine-soft)] to-[var(--brand-peach-soft)] rounded-xl p-6 border border-[var(--brand-border)]">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-[var(--brand-wine-dark)]" />
          <h2 className="text-2xl text-gray-900">Análise Histórica e Temporal</h2>
        </div>
        <p className="text-gray-600">
          Visualize a evolução dos indicadores ao longo dos anos
        </p>
      </div>

      {/* Operadora Timeline (if selected) */}
      {selectedOperadora && operadoraTimeline.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg text-gray-900 mb-1">
              Evolução Histórica: {selectedOperadora.razao_social}
            </h3>
            <p className="text-sm text-gray-600">
              Nº ANS: {selectedOperadora.reg_ans}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={operadoraTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}
                formatter={(value: number) => value.toFixed(3)}
              />
              <Legend />
              <Line type="monotone" dataKey="IDSS" stroke="#810e56" strokeWidth={3} name="IDSS" />
              <Line type="monotone" dataKey="IDQS" stroke="#a60069" strokeWidth={2} name="IDQS" />
              <Line type="monotone" dataKey="IDGA" stroke="#bc5688" strokeWidth={2} name="IDGA" />
              <Line type="monotone" dataKey="IDSM" stroke="#ff637e" strokeWidth={2} name="IDSM" />
              <Line type="monotone" dataKey="IDGR" stroke="#bf9cff" strokeWidth={2} name="IDGR" />
            </LineChart>
          </ResponsiveContainer>

          {/* Trend Analysis */}
          <div className="mt-4 grid grid-cols-5 gap-4">
            {['IDSS', 'IDQS', 'IDGA', 'IDSM', 'IDGR'].map(index => {
              const values = operadoraTimeline.map(d => d[index as keyof typeof d] as number);
              const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
              const trendPercent = values.length >= 2 ? ((trend / values[0]) * 100) : 0;

              return (
                <div key={index} className="bg-[var(--brand-wine-soft)] rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">{index}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-[var(--brand-wine-dark)]' : 'text-[var(--brand-goiaba)] rotate-180'}`} />
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-[var(--brand-wine-dark)]' : 'text-[var(--brand-goiaba)]'}`}>
                      {trend >= 0 ? '+' : ''}{trendPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Average Timeline (All Operadoras) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg text-gray-900 mb-1">Média Geral dos Indicadores por Ano</h3>
          <p className="text-sm text-gray-600">
            Evolução da média de todas as operadoras filtradas
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis domain={[0, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}
              formatter={(value: number) => value.toFixed(3)}
            />
            <Legend />
            <Area type="monotone" dataKey="IDSS" stackId="1" stroke="#810e56" fill="#810e56" fillOpacity={0.3} />
            <Area type="monotone" dataKey="IDQS" stackId="2" stroke="#a60069" fill="#a60069" fillOpacity={0.2} />
            <Area type="monotone" dataKey="IDGA" stackId="3" stroke="#bc5688" fill="#bc5688" fillOpacity={0.2} />
            <Area type="monotone" dataKey="IDSM" stackId="4" stroke="#ff637e" fill="#ff637e" fillOpacity={0.2} />
            <Area type="monotone" dataKey="IDGR" stackId="5" stroke="#bf9cff" fill="#bf9cff" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Operadoras Count Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-900 mb-1">Quantidade de Operadoras por Ano</h3>
            <p className="text-sm text-gray-600">
              Total de operadoras registradas em cada ano
            </p>
          </div>
          <Calendar className="w-8 h-8 text-[var(--brand-wine-dark)]" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={operadorasCount}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            <Area 
              type="monotone" 
              dataKey="quantidade" 
              stroke="#810e56" 
              fill="#810e56" 
              fillOpacity={0.4}
              name="Operadoras"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-[var(--brand-wine-soft)] rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Anos Analisados</p>
            <p className="text-2xl font-bold text-[var(--brand-wine-dark)]">{operadorasCount.length}</p>
          </div>
          <div className="bg-[var(--brand-lime-soft)] rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Máximo</p>
            <p className="text-2xl font-bold text-[var(--brand-wine-ultra)]">
              {Math.max(...operadorasCount.map(d => d.quantidade))}
            </p>
          </div>
          <div className="bg-[var(--brand-peach-soft)] rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Mínimo</p>
            <p className="text-2xl font-bold text-[var(--brand-goiaba)]">
              {Math.min(...operadorasCount.map(d => d.quantidade))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
