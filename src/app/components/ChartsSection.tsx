import { IDSSData, groupByField, calculateAverage, getTopPerformers } from '../utils/csvParser';
import { BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartsSectionProps {
  data: IDSSData[];
}

export function ChartsSection({ data }: ChartsSectionProps) {
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

  // Data for modalidade distribution
  const modalidadeData = Object.entries(groupByField(data, 'modalidade_operadora')).map(([name, value]) => ({
    name,
    value
  }));

  const porteData = Object.entries(groupByField(data, 'porte')).map(([name, value]) => ({
    name,
    value
  }));

  // Average indices comparison
  const avgIndices = [
    { index: 'IDQS', value: calculateAverage(data, 'idqs') },
    { index: 'IDGA', value: calculateAverage(data, 'idga') },
    { index: 'IDSM', value: calculateAverage(data, 'idsm') },
    { index: 'IDGR', value: calculateAverage(data, 'idgr') }
  ];

  // Top 10 performers
  const topPerformers = getTopPerformers(data, 10)
    .filter(item => item.razao_social) // Filter out items without name
    .map(item => ({
      name: (item.razao_social || 'N/A').substring(0, 30),
      idss: item.idss ?? 0,
      idqs: item.idqs ?? 0,
      idga: item.idga ?? 0,
      idsm: item.idsm ?? 0,
      idgr: item.idgr ?? 0
    }));
  const topPerformersMin = topPerformers.length > 0
    ? Math.max(0, Math.min(...topPerformers.map(item => item.idss)))
    : 0;

  // Radar chart data - average of indices
  const radarData = [
    { subject: 'IDQS', A: calculateAverage(data, 'idqs'), fullMark: 1 },
    { subject: 'IDGA', A: calculateAverage(data, 'idga'), fullMark: 1 },
    { subject: 'IDSM', A: calculateAverage(data, 'idsm'), fullMark: 1 },
    { subject: 'IDGR', A: calculateAverage(data, 'idgr'), fullMark: 1 }
  ];

  const rankingByPorte = () => {
    const grouped: Record<string, { sum: number; count: number }> = {};

    data.forEach(item => {
      const porte = item.porte || 'Não informado';
      const idss = item.idss;

      if (typeof idss === 'number' && !isNaN(idss)) {
        if (!grouped[porte]) {
          grouped[porte] = { sum: 0, count: 0 };
        }
        grouped[porte].sum += idss;
        grouped[porte].count += 1;
      }
    });

    return Object.entries(grouped)
      .map(([name, { sum, count }]) => ({
        porte: name,
        idss: parseFloat((sum / count).toFixed(4)),
        operadoras: count
      }))
      .sort((a, b) => b.idss - a.idss);
  };

  // Ranking by Modalidade - Calculate average IDSS for each modalidade
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
  const porteRanking = rankingByPorte();

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
      {/* Contexto IDSS */}
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
            <p className="text-sm font-semibold text-[var(--brand-wine-ultra)]">Indicadores odontologicos mais relevantes</p>
            <p className="text-sm text-gray-600">
              {indicadoresOdonto.join(' • ')}.
            </p>
          </div>
        </div>
      </div>

      {/* Row 1 - Distribution and Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Distribuição por Modalidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modalidadeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.substring(0, 20)}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
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
          <h3 className="text-lg mb-4 text-gray-800">Visão Geral dos Índices (Médias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} />
              <Radar name="Média" dataKey="A" stroke="#810e56" fill="#810e56" fillOpacity={0.6} />
              <Tooltip formatter={(value: number) => value.toFixed(4)} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 - Top Performers and Average Indices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Top 10 Operadoras por IDSS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPerformers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[topPerformersMin, 1]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value: number) => value.toFixed(4)} />
              <Bar dataKey="idss" name="IDSS">
                {topPerformers.map((entry, index) => (
                  <Cell key={`top-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Comparação de Índices Médios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgIndices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value: number) => value.toFixed(4)} />
              <Legend />
              <Bar dataKey="value" name="Média">
                {avgIndices.map((entry, index) => (
                  <Cell key={`avg-${entry.index}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 - Porte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Distribuicao por Porte</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={porteData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
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
          <h3 className="text-lg mb-4 text-gray-800">Media de IDSS por Porte</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porteRanking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0.5, 1]} />
              <YAxis dataKey="porte" type="category" width={140} />
              <Tooltip formatter={(value: number) => value.toFixed(4)} />
              <Legend />
              <Bar dataKey="idss" name="IDSS Medio">
                {porteRanking.map((entry, index) => (
                  <Cell key={`porte-${entry.porte}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 - Ranking IDSS por Modalidade */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">🏆 Ranking de Notas por Modalidade</h3>
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
        
        {/* Stats Table */}
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
