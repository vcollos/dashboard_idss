import { IDSSData, groupByField, calculateAverage } from '../utils/csvParser';
import { Trophy, TrendingUp, Building2, Target } from 'lucide-react';

interface OverviewCardsProps {
  data: IDSSData[];
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const uniqueOperadoras = new Set(data.map(item => item.reg_ans).filter(Boolean)).size;
  const modalidadeGroups = groupByField(data, 'modalidade_operadora');
  const ufGroups = groupByField(data, 'uf');

  const avgIDSS = calculateAverage(data, 'idss');
  const avgIDQS = calculateAverage(data, 'idqs');
  const avgIDGA = calculateAverage(data, 'idga');
  const avgIDSM = calculateAverage(data, 'idsm');
  const avgIDGR = calculateAverage(data, 'idgr');

  // Top performer
  const topPerformer = data.length > 0 ? data.reduce((top, current) => {
    const topScore = top?.idss ?? 0;
    const currentScore = current?.idss ?? 0;
    return currentScore > topScore ? current : top;
  }, data[0]) : null;

  const cards = [
    {
      title: 'Total de Operadoras',
      value: uniqueOperadoras.toString(),
      icon: Building2,
      color: 'blue',
      subtitle: `${Object.keys(modalidadeGroups).length} modalidades`
    },
    {
      title: 'IDSS Médio',
      value: avgIDSS.toFixed(4),
      icon: Target,
      color: 'green',
      subtitle: 'Índice de Desenvolvimento'
    },
    {
      title: 'Melhor Desempenho',
      value: topPerformer ? (topPerformer.idss ?? 0).toFixed(4) : '0.0000',
      icon: Trophy,
      color: 'yellow',
      subtitle: topPerformer?.razao_social ? (topPerformer.razao_social.substring(0, 30) + '...') : 'N/A'
    },
    {
      title: 'Média Geral',
      value: ((avgIDQS + avgIDGA + avgIDSM + avgIDGR) / 4).toFixed(4),
      icon: TrendingUp,
      color: 'purple',
      subtitle: 'Média dos 4 indicadores'
    }
  ];

  const colorClasses = {
    blue: 'bg-[var(--brand-wine-soft)] text-[var(--brand-wine-dark)]',
    green: 'bg-[var(--brand-lime-soft)] text-[var(--brand-wine-ultra)]',
    yellow: 'bg-[var(--brand-peach-soft)] text-[var(--brand-wine-ultra)]',
    purple: 'bg-[var(--brand-roxo-soft)] text-[var(--brand-wine-dark)]'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">{card.title}</h3>
          <p className="text-3xl text-gray-900 mb-1">{card.value}</p>
          <p className="text-sm text-gray-500 truncate">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
