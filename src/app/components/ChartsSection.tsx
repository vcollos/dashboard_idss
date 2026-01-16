import { IDSSData, groupByField, calculateAverage } from '../utils/csvParser';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  ResponsiveContainer
} from 'recharts';

interface ChartsSectionProps {
  data: IDSSData[];
  selectedOperadora?: IDSSData;
}

export function ChartsSection({ data, selectedOperadora }: ChartsSectionProps) {
  const contextoDimensoes = [
    {
      titulo: 'IDQS',
      descricao: 'Qualidade em Atenção à Saúde: promoção, prevenção e cuidado aos beneficiários.'
    },
    {
      titulo: 'IDGA',
      descricao: 'Garantia de Acesso: disponibilidade de rede e acesso aos serviços contratados.'
    },
    {
      titulo: 'IDSM',
      descricao: 'Sustentabilidade do Mercado: saúde econômico-financeira e satisfação do beneficiário.'
    },
    {
      titulo: 'IDGR',
      descricao: 'Gestão de Processos e Regulação: qualidade dos dados e relação com prestadores.'
    }
  ];

  const indicadoresOdonto = [
    '1.7 Prevenção de Cárie',
    '1.8 Prevenção de Periodontia',
    '2.4 Primeira Consulta ao Dentista',
    '2.5 Rede Odontológica',
    '2.9 Tratamento Endodôntico'
  ];

  const modalidadeData = Object.entries(groupByField(data, 'modalidade_operadora')).map(([name, value]) => ({
    name,
    value
  }));

  const porteData = Object.entries(groupByField(data, 'porte')).map(([name, value]) => ({
    name,
    value
  }));

  const selectedSnapshot = selectedOperadora
    ? data.find(item => item.reg_ans === selectedOperadora.reg_ans)
    : undefined;

  const comparisonGroup = selectedOperadora
    ? data.filter(item => item.reg_ans !== selectedOperadora.reg_ans)
    : data;

  const comparisonIndices = [
    { index: 'IDSS', operadora: selectedSnapshot?.idss ?? null, media: calculateAverage(comparisonGroup, 'idss') },
    { index: 'IDQS', operadora: selectedSnapshot?.idqs ?? null, media: calculateAverage(comparisonGroup, 'idqs') },
    { index: 'IDGA', operadora: selectedSnapshot?.idga ?? null, media: calculateAverage(comparisonGroup, 'idga') },
    { index: 'IDSM', operadora: selectedSnapshot?.idsm ?? null, media: calculateAverage(comparisonGroup, 'idsm') },
    { index: 'IDGR', operadora: selectedSnapshot?.idgr ?? null, media: calculateAverage(comparisonGroup, 'idgr') }
  ];

  const radarData = [
    {
      subject: 'IDQS',
      operadora: selectedSnapshot?.idqs ?? 0,
      media: calculateAverage(comparisonGroup, 'idqs')
    },
    {
      subject: 'IDGA',
      operadora: selectedSnapshot?.idga ?? 0,
      media: calculateAverage(comparisonGroup, 'idga')
    },
    {
      subject: 'IDSM',
      operadora: selectedSnapshot?.idsm ?? 0,
      media: calculateAverage(comparisonGroup, 'idsm')
    },
    {
      subject: 'IDGR',
      operadora: selectedSnapshot?.idgr ?? 0,
      media: calculateAverage(comparisonGroup, 'idgr')
    }
  ];

  const rankedPerformers = [...data]
    .filter(item => item.razao_social)
    .sort((a, b) => (b.idss ?? 0) - (a.idss ?? 0));

  const selectedRankIndex = selectedOperadora
    ? rankedPerformers.findIndex(item => item.reg_ans === selectedOperadora.reg_ans)
    : -1;
  const selectedRank = selectedRankIndex >= 0 ? selectedRankIndex + 1 : null;

  const topPerformersBase = rankedPerformers.slice(0, 10).map((item, index) => ({
    name: item.razao_social || 'N/A',
    idss: item.idss ?? 0,
    rank: index + 1,
    isSelected: selectedOperadora?.reg_ans === item.reg_ans,
    fullName: item.razao_social || 'N/A',
    modalidadeIdss: item.modalidade_idss || '-',
    modalidadeOperadora: item.modalidade_operadora || '-'
  }));

  let topPerformers = topPerformersBase;
  if (selectedOperadora && selectedRank && selectedRank > 10) {
    const selectedItem = rankedPerformers[selectedRankIndex];
    if (selectedItem) {
      topPerformers = [
        ...topPerformersBase,
        {
          name: selectedItem.razao_social || 'N/A',
          idss: selectedItem.idss ?? 0,
          rank: selectedRank,
          isSelected: true,
          fullName: selectedItem.razao_social || 'N/A',
          modalidadeIdss: selectedItem.modalidade_idss || '-',
          modalidadeOperadora: selectedItem.modalidade_operadora || '-'
        }
      ];
    }
  }

  const topPerformersMin = topPerformers.length > 0
    ? Math.max(0, Math.min(...topPerformers.map(item => item.idss)))
    : 0;

  const rankingByModalidade = () => {
    const grouped: Record<string, { sum: number; count: number }> = {};

    data.forEach(item => {
      const modalidade = item.modalidade_operadora || 'Não informado';
      const idss = item.idss;

      if (typeof idss === 'number' && !isNaN(idss)) {
        if (!grouped[modalidade]) {
          grouped[modalidade] = { sum: 0, count: 0 };
        }
        grouped[modalidade].sum += idss;
        grouped[modalidade].count += 1;
      }
    });

    return Object.entries(grouped)
      .map(([name, { sum, count }]) => ({
        modalidade: name.length > 30 ? name.substring(0, 30) + '...' : name,
        idss: parseFloat((sum / count).toFixed(4)),
        operadoras: count
      }))
      .sort((a, b) => b.idss - a.idss);
  };

  const modalidadeRanking = rankingByModalidade();

  const COLORS = [
    '#810e56',
    '#a60069',
    '#bc5688',
    '#bf9cff',
    '#ff9fad',
    '#60ebff',
    '#ff637e',
    '#550039'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg text-gray-800">Contexto do IDSS (ANS)</h3>
            <p className="text-sm text-gray-600">
              O IDSS avalia as operadoras por quatro dimensões. A leitura abaixo ajuda a interpretar os gráficos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contextoDimensoes.map(dimensao => (
              <div key={dimensao.titulo} className="bg-[var(--brand-wine-soft)] rounded-lg p-4 border border-[var(--brand-border)]">
                <p className="text-sm font-semibold text-[var(--brand-wine-ultra)]">{dimensao.titulo}</p>
                <p className="text-sm text-gray-600">{dimensao.descricao}</p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--brand-peach-soft)] rounded-lg p-4 border border-[var(--brand-border)]">
            <p className="text-sm font-semibold text-[var(--brand-wine-ultra)]">Indicadores odontológicos mais relevantes</p>
            <p className="text-sm text-gray-600">
              {indicadoresOdonto.join(' • ')}.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Distribuição por Modalidade</h3>
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie
                data={modalidadeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.substring(0, 24)}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={110}
                fill="#810e56"
                dataKey="value"
              >
                {modalidadeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-1 text-gray-800">Comparação dos índices médios</h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedOperadora ? 'Operadora selecionada vs média do grupo filtrado.' : 'Média do grupo filtrado.'}
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={comparisonIndices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value: number | null) => (value ?? 0).toFixed(4)} />
              <Legend />
              {selectedOperadora && (
                <Bar dataKey="operadora" fill="var(--brand-wine-dark)" name="Operadora" />
              )}
              <Bar dataKey="media" fill="var(--brand-roxo)" name="Média do grupo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Distribuição por Porte</h3>
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie
                data={porteData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={110}
                fill="#810e56"
                dataKey="value"
              >
                {porteData.map((entry, index) => (
                  <Cell key={`porte-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-2 text-gray-800">Análise dos índices por radar</h3>
          <p className="text-sm text-gray-600 mb-4">
          {selectedOperadora ? 'Operadora selecionada vs média das outras operadoras filtradas.' : 'Média das operadoras filtradas.'}
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} />
              {selectedOperadora && (
                <Radar name="Operadora" dataKey="operadora" stroke="var(--brand-wine-dark)" fill="var(--brand-wine-dark)" fillOpacity={0.4} />
              )}
            <Radar name="Média do grupo" dataKey="media" stroke="#550039" fill="#550039" fillOpacity={0.25} />
              <Tooltip formatter={(value: number) => value.toFixed(4)} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Top 10 operadoras por IDSS</h3>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={topPerformers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[topPerformersMin, 1]} />
            <YAxis dataKey="fullName" type="category" width={320} />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label) => {
                const entry = topPerformers.find(item => item.fullName === label);
                if (!entry) return label;
                return `${entry.fullName} (Rank ${entry.rank})`;
              }}
            />
            <Bar dataKey="idss" name="IDSS">
              {topPerformers.map((entry, index) => (
                <Cell
                  key={`top-${entry.fullName}-${index}`}
                  fill={entry.isSelected ? 'var(--brand-wine-ultra)' : COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {selectedOperadora && selectedRank && selectedRank > 10 && (
          <p className="text-xs text-gray-500 mt-3">
            Operadora selecionada aparece na posição {selectedRank} do filtro de comparação.
          </p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Modalidade IDSS</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Modalidade</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Operadora</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">IDSS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPerformers.map((item, index) => (
                <tr key={item.fullName + index} className={item.isSelected ? 'bg-[var(--brand-wine-soft)]' : 'hover:bg-gray-50 transition-colors'}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      item.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      item.rank === 2 ? 'bg-gray-300 text-gray-800' :
                      item.rank === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.modalidadeIdss}</td>
                  <td className="px-4 py-3 text-gray-700">{item.modalidadeOperadora}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 bg-[var(--brand-wine-soft)] text-[var(--brand-wine-ultra)] rounded-lg font-medium">
                      {item.idss.toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">🏆 Ranking de notas por modalidade</h3>
        <p className="text-sm text-gray-600 mb-4">Média do IDSS por modalidade de operadora (do maior para o menor)</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={modalidadeRanking} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0.5, 1]} />
            <YAxis dataKey="modalidade" type="category" width={200} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'idss') return [value.toFixed(4), 'IDSS Médio'];
                if (name === 'operadoras') return [value, 'Operadoras'];
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="idss" fill="#a60069" name="IDSS Médio">
              {modalidadeRanking.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Modalidade</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">IDSS Médio</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Operadoras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modalidadeRanking.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-800' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.modalidade}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 bg-[var(--brand-wine-soft)] text-[var(--brand-wine-ultra)] rounded-lg font-medium">
                      {item.idss.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.operadoras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
