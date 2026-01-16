import Papa from 'papaparse';

export interface IDSSData {
  reg_ans: string;
  cnpj: string;
  razao_social: string;
  ano: string;
  idss: number | null;
  idas: number | null;
  idef: number | null;
  ideo: number | null;
  idga: number | null;
  idgr: number | null;
  idqs: number | null;
  idsb: number | null;
  idsm: number | null;
  modalidade_idss: string;
  modalidade_operadora: string;
  cidade: string;
  uf: string;
  porte: string;
  qt_beneficiarios: number | null;
  uniodonto: string;
}

export const normalizeTextValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const parseIndicatorValue = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value).trim();
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  const decimalSeparator = lastComma > lastDot ? ',' : '.';
  const normalized = raw
    .replace(new RegExp(`[^0-9${decimalSeparator}]`, 'g'), '')
    .replace(decimalSeparator, '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  let scaled = parsed;
  while (scaled > 1) {
    scaled /= 10;
  }
  return scaled;
};

export const parseIntegerValue = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : null;
  const normalized = String(value).trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

export const getPorteByBeneficiarios = (beneficiarios: number | null): string => {
  if (beneficiarios === null || !Number.isFinite(beneficiarios)) return '';
  if (beneficiarios <= 19999) return 'Pequeno Porte';
  if (beneficiarios <= 99999) return 'Médio Porte';
  return 'Grande Porte';
};

const getRowValue = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      return row[key];
    }
  }
  return undefined;
};

export const mapRowToIdssData = (row: Record<string, unknown>): IDSSData => {
  const beneficiarios = parseIntegerValue(
    getRowValue(row, ['Qt_Beneficiários', 'qt_beneficiarios', 'Qt Beneficiarios'])
  );
  return {
    reg_ans: normalizeTextValue(getRowValue(row, ['REG_ANS', 'reg_ans', 'REG_INS', 'reg_ins'])),
    cnpj: normalizeTextValue(getRowValue(row, ['CNPJ', 'cnpj'])),
    razao_social: normalizeTextValue(getRowValue(row, ['Razão Social', 'razao_social', 'Razao Social'])),
    ano: normalizeTextValue(getRowValue(row, ['Ano', 'ano'])),
    idss: parseIndicatorValue(getRowValue(row, ['IDSS', 'idss'])),
    idas: parseIndicatorValue(getRowValue(row, ['IDAS', 'idas'])),
    idef: parseIndicatorValue(getRowValue(row, ['IDEF', 'idef'])),
    ideo: parseIndicatorValue(getRowValue(row, ['IDEO', 'ideo'])),
    idga: parseIndicatorValue(getRowValue(row, ['IDGA', 'idga'])),
    idgr: parseIndicatorValue(getRowValue(row, ['IDGR', 'idgr'])),
    idqs: parseIndicatorValue(getRowValue(row, ['IDQS', 'idqs'])),
    idsb: parseIndicatorValue(getRowValue(row, ['IDSB', 'idsb'])),
    idsm: parseIndicatorValue(getRowValue(row, ['IDSM', 'idsm'])),
    modalidade_idss: normalizeTextValue(getRowValue(row, ['modalidade_idss', 'Modalidade IDSS'])),
    modalidade_operadora: normalizeTextValue(getRowValue(row, ['Modalidade', 'modalidade_operadora'])),
    cidade: normalizeTextValue(getRowValue(row, ['Cidade', 'cidade'])),
    uf: normalizeTextValue(getRowValue(row, ['UF', 'uf'])),
    porte: getPorteByBeneficiarios(beneficiarios),
    qt_beneficiarios: beneficiarios,
    uniodonto: normalizeTextValue(getRowValue(row, ['Uniodonto', 'uniodonto'])),
  };
};

export const parseCSVFile = (file: File): Promise<IDSSData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        const normalized = results.data.map(mapRowToIdssData);
        resolve(normalized);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseCSVData = parseCSVFile;

export const parseCSVText = (csvText: string): Promise<IDSSData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        const normalized = results.data.map(mapRowToIdssData);
        resolve(normalized);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const getUniqueValues = (data: IDSSData[], field: keyof IDSSData): string[] => {
  const values = data
    .map(item => item[field])
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(value => String(value));
  return Array.from(new Set(values)).sort();
};

export const filterData = (
  data: IDSSData[],
  filters: Partial<Record<keyof IDSSData, string>>
): IDSSData[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(item[key as keyof IDSSData] ?? '').toLowerCase().includes(value.toLowerCase());
    });
  });
};

export const groupByField = (data: IDSSData[], field: keyof IDSSData): Record<string, number> => {
  const groups: Record<string, number> = {};
  data.forEach(item => {
    const rawValue = item[field];
    const value = rawValue === null || rawValue === undefined || rawValue === '' ? 'Não informado' : String(rawValue);
    groups[value] = (groups[value] || 0) + 1;
  });
  return groups;
};

export const calculateAverage = (
  data: IDSSData[],
  field: 'idss' | 'idqs' | 'idga' | 'idsm' | 'idgr' | 'idas' | 'idef' | 'ideo' | 'idsb'
): number => {
  const values = data
    .map(item => item[field])
    .filter((val): val is number => typeof val === 'number' && !isNaN(val));
  
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const getTopPerformers = (data: IDSSData[], limit: number = 10): IDSSData[] => {
  return [...data]
    .sort((a, b) => (b.idss ?? 0) - (a.idss ?? 0))
    .slice(0, limit);
};

export const getLatestDataByOperadora = (data: IDSSData[]): IDSSData[] => {
  const grouped: Record<string, IDSSData> = {};
  
  data.forEach(item => {
    const key = item.reg_ans + item.cnpj;
    const currentYear = parseInt(item.ano);
    
    if (!grouped[key] || parseInt(grouped[key].ano) < currentYear) {
      grouped[key] = item;
    }
  });
  
  return Object.values(grouped);
};
