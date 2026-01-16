import { useState, useEffect, useMemo } from 'react';
import { getSupabaseClient } from './utils/supabaseClient';
import { IDSSData, mapRowToIdssData, parseCSVText } from './utils/csvParser';
import { Dashboard } from './components/Dashboard';
import { AdvancedFilters, FilterOptions, ActiveFilters } from './components/AdvancedFilters';
import { TimelineView } from './components/TimelineView';
import { BarChart3, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

export default function App() {
  const dataSource = (import.meta.env.VITE_DATA_SOURCE || 'local').toLowerCase();
  const useLocalData = dataSource !== 'supabase';
  const localCsvUrl = new URL('../../base_dados/idss_2012_2025.csv', import.meta.url).href;
  const logoUrl = new URL('../../base_dados/logo.png', import.meta.url).href;
  const defaultModalidades = ['Cooperativa Odontológica', 'Odontologia de Grupo'];
  const [data, setData] = useState<IDSSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selectedOperadora, setSelectedOperadora] = useState<IDSSData | undefined>();
  const [operadoraQuery, setOperadoraQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'timeline'>('dashboard');
  
  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    anos: [],
    modalidades: [],
    razoesSociais: [],
    numerosANS: [],
    portes: [],
    uniodontos: [],
    idssRange: { min: 0, max: 1 },
    beneficiariosRange: { min: 0, max: 1000000 }
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    anos: [],
    modalidades: defaultModalidades,
    razoesSociais: [],
    numerosANS: [],
    portes: [],
    uniodontos: ['SIM', 'NÃO'],
    idssMin: 0,
    idssMax: 1,
    beneficiariosMin: 0,
    beneficiariosMax: 1000000
  });

  useEffect(() => {
    fetchData();
  }, []);

  const operadoraOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(item => {
      if (item.reg_ans && !map.has(item.reg_ans)) {
        map.set(item.reg_ans, item.razao_social);
      }
    });
    return Array.from(map.entries()).map(([ans, razao]) => `${ans} - ${razao}`);
  }, [data]);

  useEffect(() => {
    if (activeFilters.anos.length === 0 && filterOptions.anos.length > 0) {
      setActiveFilters(prev => ({
        ...prev,
        anos: [filterOptions.anos[0]]
      }));
    }
  }, [activeFilters.anos.length, filterOptions.anos]);

  useEffect(() => {
    if (!selectedOperadora) return;
    setOperadoraQuery(`${selectedOperadora.reg_ans} - ${selectedOperadora.razao_social}`);
  }, [selectedOperadora]);

  useEffect(() => {
    if (!selectedOperadora) return;

    setActiveFilters(prev => ({
      ...prev,
      anos: prev.anos.length > 0 ? prev.anos : (selectedOperadora.ano ? [selectedOperadora.ano] : prev.anos),
      modalidades: selectedOperadora.modalidade_operadora ? [selectedOperadora.modalidade_operadora] : [],
      portes: selectedOperadora.porte ? [selectedOperadora.porte] : [],
      uniodontos: selectedOperadora.uniodonto ? [selectedOperadora.uniodonto] : [],
      razoesSociais: [],
      numerosANS: []
    }));
  }, [selectedOperadora]);

  useEffect(() => {
    const includesOdontoGrupo = activeFilters.modalidades.includes('Odontologia de Grupo');
    if (!includesOdontoGrupo) return;
    if (activeFilters.uniodontos.includes('NÃO')) return;

    setActiveFilters(prev => ({
      ...prev,
      uniodontos: prev.uniodontos.includes('NÃO') ? prev.uniodontos : [...prev.uniodontos, 'NÃO']
    }));
  }, [activeFilters.modalidades, activeFilters.uniodontos]);

  useEffect(() => {
    const fallbackYear = filterOptions.anos[0];
    const selectedYear = activeFilters.anos[0] || fallbackYear;
    const normalizedQuery = operadoraQuery.trim();
    if (!normalizedQuery) {
      setSelectedOperadora(undefined);
      return;
    }

    const matchByYear = (item: IDSSData) => (selectedYear ? item.ano === selectedYear : true);
    const normalized = normalizedQuery.toLowerCase();
    const byAns = data.filter(item => item.reg_ans.toLowerCase() === normalized);
    const byRazao = data.filter(item => item.razao_social.toLowerCase() === normalized);
    const compositeMatch = normalizedQuery.includes(' - ')
      ? normalizedQuery.split(' - ')[0].trim()
      : '';
    const byComposite = compositeMatch
      ? data.filter(item => item.reg_ans === compositeMatch)
      : [];

    const candidates = byAns.length > 0 ? byAns : byRazao.length > 0 ? byRazao : byComposite;
    if (candidates.length === 0) return;

    const selected = candidates.find(matchByYear) || candidates[0];
    setSelectedOperadora(selected);
  }, [operadoraQuery, activeFilters.anos, data, filterOptions.anos]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('');

      console.log('🔄 Iniciando busca de dados...');
      let formattedData: IDSSData[] = [];

      if (useLocalData) {
        console.log('📂 Carregando dados locais...');
        const response = await fetch(localCsvUrl);
        if (!response.ok) {
          throw new Error(`Erro ao carregar CSV local: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();
        formattedData = await parseCSVText(csvText);
        console.log('✅ Dados locais carregados com sucesso!', formattedData.length, 'registros');
      } else {
        const supabase = getSupabaseClient();
        console.log('📊 Buscando dados da tabela idss_2025...');

        // Adicionar .range() ou aumentar limite para pegar TODOS os dados históricos
        const { data: idssData, error: fetchError, count } = await supabase
          .from('idss_2025')
          .select('*', { count: 'exact' })
          .order('Ano', { ascending: false })
          .limit(100000); // Limite alto para garantir todos os dados

        console.log('📈 Resposta do Supabase:', { 
          hasData: !!idssData, 
          dataLength: idssData?.length,
          count,
          error: fetchError 
        });

        // Log detalhado dos anos retornados ANTES da formatação
        if (idssData && idssData.length > 0) {
          const anosRaw = Array.from(new Set(idssData.map((item: any) => item['Ano']))).sort();
          console.log('🔍 Anos BRUTOS do Supabase (antes de formatar):', anosRaw);
          console.log('🔍 Total de registros retornados:', idssData.length);
          console.log('🔍 Amostra de 3 registros com anos diferentes:', [
            idssData.find((item: any) => item['Ano'] === 2012),
            idssData.find((item: any) => item['Ano'] === 2020),
            idssData.find((item: any) => item['Ano'] === 2025)
          ]);
        }

        if (fetchError) {
          console.error('❌ Erro do Supabase:', fetchError);
          
          if (fetchError.code === 'PGRST301' || fetchError.message.includes('permission') || fetchError.message.includes('policy')) {
            throw new Error(
              `Erro de permissão: ${fetchError.message}\n\n` +
              `Por favor, configure as políticas RLS no Supabase:\n\n` +
              `CREATE POLICY "Enable read access for all users" \n` +
              `ON public."idss_2025" \n` +
              `FOR SELECT \n` +
              `USING (true);`
            );
          }
          
          throw new Error(`Erro ao buscar dados: ${fetchError.message} (Código: ${fetchError.code || 'N/A'})`);
        }

        if (!idssData || idssData.length === 0) {
          throw new Error('Nenhum dado foi retornado. Verifique as políticas RLS no Supabase.');
        }

        console.log('✅ Dados carregados com sucesso!', idssData.length, 'registros');

        // Convert to expected format
        formattedData = idssData.map(item => mapRowToIdssData(item as Record<string, unknown>));
      }

      console.log('📊 Amostra de dados (primeiros 5):', formattedData.slice(0, 5));

      // Calculate filter options
      const anos = Array.from(new Set(formattedData.map(d => d.ano))).filter(Boolean).sort((a, b) => parseInt(b) - parseInt(a));
      
      console.log('📅 Anos únicos encontrados:', anos);
      console.log('📅 Total de anos diferentes:', anos.length);
      if (!useLocalData) {
        console.log('⚠️ IMPORTANTE: Se só aparecem 2024 e 2025, os dados históricos NÃO foram importados no Supabase!');
        console.log('⚠️ Execute esta query no SQL Editor do Supabase:');
        console.log('   SELECT "Ano", COUNT(*) FROM public."idss_2025" GROUP BY "Ano" ORDER BY "Ano" DESC;');
      }
      
      const modalidades = Array.from(new Set(formattedData.map(d => d.modalidade_operadora))).filter(Boolean).sort();
      const razoesSociais = Array.from(new Set(formattedData.map(d => d.razao_social))).filter(Boolean).sort();
      const numerosANS = Array.from(new Set(formattedData.map(d => d.reg_ans))).filter(Boolean).sort();
      const portes = Array.from(new Set(formattedData.map(d => d.porte))).filter(Boolean).sort();
      const uniodontos = Array.from(new Set(formattedData.map(d => d.uniodonto))).filter(Boolean).sort();
      
      console.log('🏢 Uniodontos únicos encontrados:', uniodontos);
      console.log('🏢 Total de valores Uniodonto:', uniodontos.length);
      
      const idssValues = formattedData
        .map(d => d.idss)
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));
      const beneficiariosValues = formattedData
        .map(d => d.qt_beneficiarios)
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));
      
      const newOptions: FilterOptions = {
        anos,
        modalidades,
        razoesSociais,
        numerosANS,
        portes,
        uniodontos,
        idssRange: {
          min: Math.min(...idssValues, 0),
          max: Math.max(...idssValues, 1)
        },
        beneficiariosRange: {
          min: Math.min(...beneficiariosValues, 0),
          max: Math.max(...beneficiariosValues, 1000000)
        }
      };

      const preselectedModalidades = defaultModalidades.filter(modalidade =>
        newOptions.modalidades.includes(modalidade)
      );
      const preselectedUniodontos = ['SIM', 'NÃO'].filter(uniodonto =>
        newOptions.uniodontos.includes(uniodonto)
      );
      const latestYear = newOptions.anos[0] || '';

      setFilterOptions(newOptions);
      setActiveFilters({
        anos: latestYear ? [latestYear] : [],
        modalidades: preselectedModalidades,
        razoesSociais: [],
        numerosANS: [],
        portes: [],
        uniodontos: preselectedUniodontos,
        idssMin: newOptions.idssRange.min,
        idssMax: newOptions.idssRange.max,
        beneficiariosMin: newOptions.beneficiariosRange.min,
        beneficiariosMax: newOptions.beneficiariosRange.max
      });

      setData(formattedData);
      setLoading(false);
      
      console.log('🎉 Dashboard pronto com', formattedData.length, 'registros!');
    } catch (err) {
      console.error('💥 Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getFilteredData = (options?: { ignoreYear?: boolean; ignoreOperadora?: boolean }) => {
    return data.filter(item => {
      // Filter by anos
      if (!options?.ignoreYear && activeFilters.anos.length > 0 && !activeFilters.anos.includes(item.ano)) {
        return false;
      }

      // Filter by modalidades
      if (activeFilters.modalidades.length > 0 && !activeFilters.modalidades.includes(item.modalidade_operadora)) {
        return false;
      }

      if (!options?.ignoreOperadora) {
        // Filter by razão social
        if (activeFilters.razoesSociais.length > 0 && !activeFilters.razoesSociais.includes(item.razao_social)) {
          return false;
        }

        // Filter by Nº ANS
        if (activeFilters.numerosANS.length > 0 && !activeFilters.numerosANS.includes(item.reg_ans)) {
          return false;
        }
      }

      // Filter by portes
      if (activeFilters.portes.length > 0 && !activeFilters.portes.includes(item.porte)) {
        return false;
      }

      // Filter by uniodontos
      if (activeFilters.uniodontos.length > 0 && !activeFilters.uniodontos.includes(item.uniodonto)) {
        return false;
      }

      // Filter by IDSS range
      const idss = item.idss;
      if (typeof idss === 'number' && (idss < activeFilters.idssMin || idss > activeFilters.idssMax)) {
        return false;
      }

      // Filter by beneficiarios range
      const beneficiarios = item.qt_beneficiarios;
      if (typeof beneficiarios === 'number' && (beneficiarios < activeFilters.beneficiariosMin || beneficiarios > activeFilters.beneficiariosMax)) {
        return false;
      }

      if (!options?.ignoreYear && activeFilters.anos.length > 0) {
        const hasPositiveIndice =
          (item.idss ?? 0) > 0 ||
          (item.idqs ?? 0) > 0 ||
          (item.idga ?? 0) > 0 ||
          (item.idsm ?? 0) > 0 ||
          (item.idgr ?? 0) > 0;
        if (!hasPositiveIndice) {
          return false;
        }
      }

      return true;
    });
  };

  const clearAllFilters = () => {
    const fallbackYear = activeFilters.anos.length > 0 ? activeFilters.anos : [filterOptions.anos[0] || ''];
    const preselectedModalidades = defaultModalidades.filter(modalidade =>
      filterOptions.modalidades.includes(modalidade)
    );
    const preselectedUniodontos = ['SIM', 'NÃO'].filter(uniodonto =>
      filterOptions.uniodontos.includes(uniodonto)
    );

    setSelectedOperadora(undefined);
    setOperadoraQuery('');
    setActiveFilters({
      anos: fallbackYear,
      modalidades: preselectedModalidades,
      razoesSociais: [],
      numerosANS: [],
      portes: [],
      uniodontos: preselectedUniodontos,
      idssMin: filterOptions.idssRange.min,
      idssMax: filterOptions.idssRange.max,
      beneficiariosMin: filterOptions.beneficiariosRange.min,
      beneficiariosMax: filterOptions.beneficiariosRange.max
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--brand-bg-start)] to-[var(--brand-bg-end)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[var(--brand-wine-dark)] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl text-gray-800 mb-2">Carregando dados do IDSS...</h2>
          <p className="text-gray-600">Conectando ao Supabase</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--brand-peach-soft)] to-[var(--brand-goiaba-soft)] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl text-gray-800 mb-2 text-center">Erro ao Carregar Dados</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="w-full px-6 py-3 bg-[var(--brand-wine-dark)] text-white rounded-lg hover:bg-[var(--brand-wine-ultra)] transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const historyData = getFilteredData({ ignoreYear: true });
  const filteredOperadorasCount = new Set(filteredData.map(item => item.reg_ans).filter(Boolean)).size;
  const totalOperadorasCount = new Set(data.map(item => item.reg_ans).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-bg-start)] to-[var(--brand-bg-end)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="w-full px-[3vw] py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo Uniodonto" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-2xl text-gray-900">Dashboard IDSS - ANS</h1>
                <p className="text-sm text-gray-600">Índice de Desenvolvimento da Saúde Suplementar</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-[var(--brand-wine-dark)] text-white rounded-lg hover:bg-[var(--brand-wine-ultra)] transition-colors flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Atualizar Dados
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-[var(--brand-wine-dark)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'timeline'
                  ? 'bg-[var(--brand-wine-dark)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Histórico
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-[3vw] py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="lg:sticky lg:top-24 h-fit">
            <AdvancedFilters
              options={filterOptions}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
              onClearAll={clearAllFilters}
            />
          </aside>

          <div className="space-y-6">
            {/* Results Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Ano</span>
                    <select
                      value={activeFilters.anos[0] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setActiveFilters(prev => ({ ...prev, anos: value ? [value] : [] }));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent"
                    >
                      {filterOptions.anos.map((ano) => (
                        <option key={ano} value={ano}>
                          {ano}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Operadora</span>
                    <input
                      list="operadora-options"
                      value={operadoraQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setOperadoraQuery(value);
                      }}
                      placeholder="Buscar por Nº ANS ou Razão Social"
                      className="w-72 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:ring-2 focus:ring-[var(--brand-wine)] focus:border-transparent"
                    />
                    <datalist id="operadora-options">
                      {operadoraOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>

                  <p className="text-gray-700">
                    Operadoras: <span className="font-bold text-[var(--brand-wine-dark)]">{filteredOperadorasCount}</span> de{' '}
                    <span className="font-bold">{totalOperadorasCount}</span>
                  </p>
                </div>
                {selectedOperadora && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Operadora Selecionada:</span>
                    <span className="px-3 py-1 bg-[var(--brand-roxo-soft)] text-[var(--brand-wine-ultra)] rounded-lg font-medium text-sm">
                      {selectedOperadora.razao_social}
                    </span>
                    <button
                      onClick={() => setSelectedOperadora(undefined)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content based on tab */}
            {filteredData.length > 0 ? (
              currentTab === 'dashboard' ? (
                <Dashboard 
                  data={filteredData} 
                  historyData={historyData}
                  selectedYear={activeFilters.anos[0]}
                  selectedOperadora={selectedOperadora}
                  totalOperadoras={totalOperadorasCount}
                  onSelectOperadora={setSelectedOperadora}
                />
              ) : (
                <TimelineView 
                  data={historyData}
                  selectedOperadora={selectedOperadora}
                />
              )
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg text-gray-700 mb-2">Nenhum dado disponível</h3>
                <p className="text-gray-500 mb-4">
                  Não há dados disponíveis para os filtros selecionados
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-[var(--brand-wine-dark)] text-white rounded-lg hover:bg-[var(--brand-wine-ultra)] transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8">
        <div className="w-full px-[3vw]">
          <div className="text-center text-sm text-gray-600">
            <p>Dashboard desenvolvido para análise dos dados do IDSS - ANS</p>
            <p className="mt-1">
              Total de operadoras: {totalOperadorasCount} | Filtradas: {filteredOperadorasCount}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
