import { useMemo } from 'react';
import { IDSSData } from '../utils/csvParser';
import { OverviewCards } from './OverviewCards';
import { ChartsSection } from './ChartsSection';
import { DataTable } from './DataTable';
import { ComparisonSection } from './ComparisonSection';

interface DashboardProps {
  data: IDSSData[];
  historyData: IDSSData[];
  selectedYear?: string;
  selectedOperadora?: IDSSData;
  totalOperadoras?: number;
  onSelectOperadora?: (operadora: IDSSData) => void;
}

export function Dashboard({
  data,
  historyData,
  selectedYear,
  selectedOperadora,
  totalOperadoras,
  onSelectOperadora
}: DashboardProps) {
  const filteredOperadoras = useMemo(
    () => new Set(data.map(item => item.reg_ans).filter(Boolean)).size,
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards data={data} />

      {/* Table */}
      <DataTable data={data} onSelectOperadora={onSelectOperadora} />

      {/* Charts */}
      <ChartsSection
        data={data}
        selectedOperadora={selectedOperadora}
      />

      {/* Comparison */}
      <ComparisonSection
        snapshotData={data}
        comparisonTargets={data}
        historyData={historyData}
        selectedYear={selectedYear}
        selectedOperadora={selectedOperadora}
      />
    </div>
  );
}
