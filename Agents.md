# 📊 Dashboard IDSS - ANS
## Documentação Completa do Projeto

---

## 📋 Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Histórico de Desenvolvimento](#histórico-de-desenvolvimento)
3. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
4. [Instalação em VPS](#instalação-em-vps)
5. [Configuração do Supabase](#configuração-do-supabase)
6. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Deploy e Execução](#deploy-e-execução)
9. [Troubleshooting](#troubleshooting)
10. [Manutenção e Atualizações](#manutenção-e-atualizações)

---

## 🎯 Visão Geral do Projeto

### Descrição
Dashboard interativo de análise, comparação e apresentação dos resultados do **IDSS (Índice de Desenvolvimento da Saúde Suplementar)** da ANS para Operadoras de Saúde.

### Funcionalidades Principais

#### ✅ Visualizações Interativas
- **Gráficos de Pizza**: Distribuição por modalidade
- **Gráficos de Radar**: Visão geral dos 4 índices (IDQS, IDGA, IDSM, IDGR)
- **Gráficos de Barras Verticais**: Comparação de índices médios
- **Gráficos de Barras Horizontais**: 
  - Top 10 operadoras por IDSS
  - Ranking de notas por modalidade (com medalhas 🥇🥈🥉)
  - Top 15 estados por quantidade de operadoras

#### ✅ Sistema de Filtros Avançados
- **Anos**: 2012 a 2025 (multi-seleção, 2025 pré-selecionado)
- **Modalidades**: Todas as modalidades de operadoras
- **Estados (UF)**: Todos os estados brasileiros
- **Porte**: Pequeno, Médio, Grande
- **Uniodonto**: SIM/NÃO (novo campo)
- **Range IDSS**: Filtro por faixa de índice (0 a 1)
- **Range Beneficiários**: Filtro por quantidade de beneficiários

#### ✅ Abas de Navegação
1. **📊 Dashboard**: Visão geral com gráficos e tabelas
2. **📈 Histórico**: Análise temporal com gráficos de evolução dos 5 índices (IDSS, IDQS, IDGA, IDSM, IDGR)

#### ✅ Tabelas Interativas
- **Tabela de Comparação**: Com ranking, medalhas e badges visuais
- **Seleção de Operadora**: Clique em uma linha para selecionar e comparar
- **Ordenação**: Por qualquer coluna
- **Paginação**: Navegação eficiente

#### ✅ Interface Responsiva
- Design moderno com Tailwind CSS v4
- Gradientes e animações suaves
- Adaptável para desktop, tablet e mobile

---

## 🛠 Histórico de Desenvolvimento

### Sessão 1 - Estrutura Inicial
**Data**: Janeiro 2026

**Implementações:**
1. ✅ Criação da estrutura base do dashboard
2. ✅ Integração com Supabase
3. ✅ Sistema de filtros básicos
4. ✅ Gráficos iniciais (Pizza, Radar, Barras)
5. ✅ Tabela de comparação com ranking

### Sessão 2 - Otimizações e Novos Recursos
**Data**: Janeiro 2026

**Implementações:**
1. ✅ **Filtros Compactos**: Substituição de todos os filtros por dropdowns multi-seleção
   - Economiza espaço vertical
   - Botões "Selecionar Todos" e "Limpar"
   - Badge de contagem de itens selecionados

2. ✅ **Gráfico Top 10 Legível**: Ajuste do eixo Y de 0.5 a 1
   - Barras maiores e mais fáceis de comparar
   - Melhor visualização das diferenças

3. ✅ **Logs Detalhados**: Sistema de debug para identificar problemas
   - Logs de anos carregados do Supabase
   - Logs de quantidade de registros
   - Logs de amostra de dados

4. ✅ **Campo "Uniodonto"**: Novo filtro para identificar operadoras Uniodonto
   - Interface `IDSSData` atualizada
   - Dropdown de filtro funcional
   - Badge nos filtros ativos

5. ✅ **Anos Históricos**: Suporte completo para 14 anos de dados (2012-2025)
   - 2025 pré-selecionado por padrão
   - Todos os anos disponíveis no dropdown
   - Limite de 100.000 registros na query do Supabase

6. ✅ **Gráfico de Ranking por Modalidade**: Nova visualização
   - Ranking de IDSS médio por modalidade
   - Gráfico de barras horizontais colorido
   - Tabela com medalhas para Top 3
   - Quantidade de operadoras por modalidade

---

## 🏗 Arquitetura e Tecnologias

### Stack Tecnológico

#### Frontend
- **React 18+**: Biblioteca principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Tailwind CSS v4**: Framework de estilização
- **Recharts**: Biblioteca de gráficos
- **Lucide React**: Ícones

#### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Realtime subscriptions (opcional)

#### Hospedagem
- **Frontend**: VPS (Nginx ou Apache)
- **Backend**: Supabase Cloud

### Estrutura de Pastas

```
/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx           # Componente principal do dashboard
│   │   │   ├── AdvancedFilters.tsx     # Sistema de filtros avançados
│   │   │   ├── ChartsSection.tsx       # Seção de gráficos
│   │   │   ├── ComparisonTable.tsx     # Tabela de comparação
│   │   │   ├── TimelineView.tsx        # Aba de histórico temporal
│   │   │   └── figma/
│   │   │       └── ImageWithFallback.tsx
│   │   ├── utils/
│   │   │   ├── csvParser.ts            # Funções de processamento de dados
│   │   │   └── supabaseClient.ts       # Cliente Supabase
│   │   └── App.tsx                     # Componente raiz
│   ├── styles/
│   │   ├── theme.css                   # Tokens CSS customizados
│   │   └── fonts.css                   # Importação de fontes
│   └── main.tsx                        # Entry point
├── public/                             # Assets estáticos
├── package.json                        # Dependências
├── tsconfig.json                       # Configuração TypeScript
├── vite.config.ts                      # Configuração Vite
└── Agents.md                          # Esta documentação
```

---

## 🚀 Instalação em VPS

### Pré-requisitos

#### Sistema Operacional
- Ubuntu 20.04 LTS ou superior (recomendado)
- Debian 11+ (alternativa)
- CentOS 8+ (alternativa)

#### Requisitos Mínimos de Hardware
- **CPU**: 2 cores
- **RAM**: 2GB (mínimo), 4GB (recomendado)
- **Disco**: 10GB livres
- **Rede**: Conexão estável à internet

#### Software Necessário
1. **Node.js 18+** (LTS recomendado)
2. **npm** ou **yarn**
3. **Git**
4. **Nginx** ou **Apache** (servidor web)
5. **PM2** (gerenciador de processos Node.js)
6. **Certbot** (opcional, para SSL/HTTPS)

---

### Passo 1: Preparação do Servidor

#### 1.1 Atualizar o Sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt upgrade -y

# CentOS
sudo yum update -y
```

#### 1.2 Instalar Node.js e npm

```bash
# Instalar via NodeSource (recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
```

#### 1.3 Instalar Git

```bash
sudo apt install -y git
git --version
```

#### 1.4 Instalar Nginx

```bash
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

#### 1.5 Instalar PM2

```bash
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

---

### Passo 2: Clonar e Configurar o Projeto

#### 2.1 Criar Diretório de Aplicação

```bash
# Criar diretório
sudo mkdir -p /var/www/dashboard-idss
sudo chown -R $USER:$USER /var/www/dashboard-idss

# Navegar para o diretório
cd /var/www/dashboard-idss
```

#### 2.2 Transferir Arquivos do Projeto

**Opção A: Via Git (se você tem um repositório)**

```bash
git clone https://github.com/seu-usuario/dashboard-idss.git .
```

**Opção B: Via SCP (transferir do local)**

```bash
# No seu computador local (não na VPS)
scp -r /caminho/do/projeto/* usuario@ip-da-vps:/var/www/dashboard-idss/
```

**Opção C: Via SFTP**
- Use FileZilla, WinSCP ou qualquer cliente SFTP
- Conecte na VPS
- Faça upload dos arquivos para `/var/www/dashboard-idss/`

#### 2.3 Instalar Dependências

```bash
cd /var/www/dashboard-idss

# Instalar dependências do projeto
npm install

# Ou usando yarn (se preferir)
# yarn install
```

---

### Passo 3: Configurar Variáveis de Ambiente

#### 3.1 Criar Arquivo .env

```bash
nano .env
```

#### 3.2 Adicionar Variáveis

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Optional: Production URL
VITE_APP_URL=https://seu-dominio.com

# Optional: Environment
NODE_ENV=production
```

**⚠️ IMPORTANTE**: Substitua `seu-projeto` e `sua-anon-key-aqui` pelos valores reais do seu projeto Supabase.

#### 3.3 Salvar e Fechar

```bash
# Pressione Ctrl+X, depois Y, depois Enter
```

---

### Passo 4: Build da Aplicação

#### 4.1 Executar Build de Produção

```bash
npm run build

# Ou usando yarn
# yarn build
```

Este comando irá:
1. Compilar o TypeScript
2. Otimizar o código com Vite
3. Minificar CSS e JS
4. Gerar os arquivos estáticos na pasta `dist/`

#### 4.2 Verificar Build

```bash
ls -la dist/

# Deve mostrar:
# - index.html
# - assets/ (JS e CSS otimizados)
# - Outros arquivos estáticos
```

---

### Passo 5: Configurar Nginx

#### 5.1 Criar Arquivo de Configuração

```bash
sudo nano /etc/nginx/sites-available/dashboard-idss
```

#### 5.2 Adicionar Configuração

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name seu-dominio.com www.seu-dominio.com;
    
    root /var/www/dashboard-idss/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # SPA routing - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Disable logging for favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    # Disable logging for robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
    
    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**⚠️ IMPORTANTE**: Substitua `seu-dominio.com` pelo seu domínio real.

#### 5.3 Habilitar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/dashboard-idss /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Se OK, recarregar Nginx
sudo systemctl reload nginx
```

---

### Passo 6: Configurar SSL/HTTPS (Opcional mas Recomendado)

#### 6.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 6.2 Obter Certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções interativas:
1. Digite seu email
2. Aceite os termos
3. Escolha se quer compartilhar email com EFF
4. Certbot irá configurar SSL automaticamente

#### 6.3 Testar Renovação Automática

```bash
sudo certbot renew --dry-run
```

O Certbot configura automaticamente renovação via cron/systemd.

---

### Passo 7: Configurar Firewall (Opcional mas Recomendado)

#### 7.1 Instalar UFW

```bash
sudo apt install -y ufw
```

#### 7.2 Configurar Regras

```bash
# Permitir SSH (IMPORTANTE: faça isso primeiro!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'
# Ou manualmente:
# sudo ufw allow 80/tcp
# sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## 🗄 Configuração do Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Dashboard IDSS
   - **Database Password**: Escolha uma senha forte (guarde-a!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde ~2 minutos para o projeto ser criado

### Passo 2: Obter Credenciais

1. No painel do projeto, vá em **Settings → API**
2. Copie os seguintes valores:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Passo 3: Criar Tabela IDSS

#### 3.1 Via SQL Editor (Recomendado)

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o seguinte SQL:

```sql
-- Criar tabela IDSS
CREATE TABLE IF NOT EXISTS public."IDSS" (
    id BIGSERIAL PRIMARY KEY,
    reg_ans TEXT,
    cnpj TEXT,
    razao_social TEXT,
    ano INTEGER NOT NULL,
    idss NUMERIC(5,4),
    idqs NUMERIC(5,4),
    idga NUMERIC(5,4),
    idsm NUMERIC(5,4),
    idgr NUMERIC(5,4),
    modalidade_idss TEXT,
    modalidade_operadora TEXT,
    cidade TEXT,
    uf TEXT,
    porte TEXT,
    qt_beneficiarios INTEGER,
    uniodonto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_idss_ano ON public."IDSS"(ano);
CREATE INDEX IF NOT EXISTS idx_idss_razao_social ON public."IDSS"(razao_social);
CREATE INDEX IF NOT EXISTS idx_idss_uf ON public."IDSS"(uf);
CREATE INDEX IF NOT EXISTS idx_idss_modalidade ON public."IDSS"(modalidade_operadora);
CREATE INDEX IF NOT EXISTS idx_idss_uniodonto ON public."IDSS"(uniodonto);

-- Comentários nas colunas
COMMENT ON TABLE public."IDSS" IS 'Dados do Índice de Desenvolvimento da Saúde Suplementar da ANS';
COMMENT ON COLUMN public."IDSS".ano IS 'Ano de referência (2012-2025)';
COMMENT ON COLUMN public."IDSS".idss IS 'Índice de Desenvolvimento da Saúde Suplementar';
COMMENT ON COLUMN public."IDSS".idqs IS 'Índice de Qualidade da Saúde';
COMMENT ON COLUMN public."IDSS".idga IS 'Índice de Gestão Administrativa';
COMMENT ON COLUMN public."IDSS".idsm IS 'Índice de Sustentabilidade do Mercado';
COMMENT ON COLUMN public."IDSS".idgr IS 'Índice de Garantia de Recursos';
COMMENT ON COLUMN public."IDSS".uniodonto IS 'Indica se é operadora Uniodonto (SIM/NÃO)';
```

4. Clique em "Run" para executar
5. Deve aparecer "Success. No rows returned"

### Passo 4: Configurar Row Level Security (RLS)

#### 4.1 Habilitar RLS

```sql
-- Habilitar RLS na tabela
ALTER TABLE public."IDSS" ENABLE ROW LEVEL SECURITY;
```

#### 4.2 Criar Política de Leitura Pública

```sql
-- Permitir leitura para todos (anônimos e autenticados)
CREATE POLICY "Enable read access for all users" 
ON public."IDSS" 
FOR SELECT 
USING (true);
```

**⚠️ NOTA**: Esta política permite que qualquer pessoa **leia** os dados. Se você quiser restringir o acesso, ajuste a política conforme necessário.

#### 4.3 (Opcional) Política de Escrita Restrita

```sql
-- Permitir INSERT/UPDATE/DELETE apenas para usuários autenticados
CREATE POLICY "Enable insert for authenticated users only" 
ON public."IDSS" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON public."IDSS" 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON public."IDSS" 
FOR DELETE 
TO authenticated
USING (true);
```

### Passo 5: Importar Dados

#### 5.1 Via Table Editor (Método Simples)

1. Vá em **Table Editor** → Selecione a tabela "IDSS"
2. Clique em **Insert** → **Import data from CSV**
3. Faça upload do seu arquivo CSV com os dados
4. Mapeie as colunas corretamente
5. Clique em "Import"

#### 5.2 Via SQL (Método Avançado)

Se você tem muitos dados, use o comando `COPY`:

```sql
COPY public."IDSS" (reg_ans, cnpj, razao_social, ano, idss, idqs, idga, idsm, idgr, modalidade_idss, modalidade_operadora, cidade, uf, porte, qt_beneficiarios, uniodonto)
FROM '/path/to/your/data.csv'
DELIMITER ','
CSV HEADER;
```

**⚠️ NOTA**: O comando `COPY` só funciona via `psql` ou pgAdmin conectado diretamente ao banco.

### Passo 6: Verificar Dados Importados

```sql
-- Contar registros
SELECT COUNT(*) FROM public."IDSS";

-- Ver distribuição por ano
SELECT ano, COUNT(*) as quantidade
FROM public."IDSS"
GROUP BY ano
ORDER BY ano DESC;

-- Ver operadoras Uniodonto
SELECT uniodonto, COUNT(*) as quantidade
FROM public."IDSS"
WHERE uniodonto IS NOT NULL
GROUP BY uniodonto;

-- Ver primeiros 10 registros
SELECT * FROM public."IDSS" LIMIT 10;
```

---

## 🔐 Estrutura do Banco de Dados

### Tabela: IDSS

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `id` | BIGSERIAL | Chave primária auto-incremento | 1 |
| `reg_ans` | TEXT | Registro ANS da operadora | 123456 |
| `cnpj` | TEXT | CNPJ da operadora | 12.345.678/0001-99 |
| `razao_social` | TEXT | Nome da operadora | UNIMED BH COOPERATIVA |
| `ano` | INTEGER | Ano de referência | 2025 |
| `idss` | NUMERIC(5,4) | Índice geral (0-1) | 0.8756 |
| `idqs` | NUMERIC(5,4) | Índice de Qualidade (0-1) | 0.9123 |
| `idga` | NUMERIC(5,4) | Índice de Gestão (0-1) | 0.8534 |
| `idsm` | NUMERIC(5,4) | Índice de Sustentabilidade (0-1) | 0.7891 |
| `idgr` | NUMERIC(5,4) | Índice de Garantia (0-1) | 0.9456 |
| `modalidade_idss` | TEXT | Modalidade para cálculo IDSS | Cooperativa Médica |
| `modalidade_operadora` | TEXT | Modalidade da operadora | Cooperativa Médica |
| `cidade` | TEXT | Cidade da sede | Belo Horizonte |
| `uf` | TEXT | Estado da sede | MG |
| `porte` | TEXT | Porte da operadora | Grande |
| `qt_beneficiarios` | INTEGER | Quantidade de beneficiários | 450000 |
| `uniodonto` | TEXT | É Uniodonto? | SIM ou NÃO |
| `created_at` | TIMESTAMP | Data de criação do registro | 2026-01-14 10:30:00 |

### Índices Criados

- `idx_idss_ano`: Índice no campo `ano` (melhora filtros por ano)
- `idx_idss_razao_social`: Índice no campo `razao_social` (melhora buscas)
- `idx_idss_uf`: Índice no campo `uf` (melhora filtros por estado)
- `idx_idss_modalidade`: Índice no campo `modalidade_operadora` (melhora filtros)
- `idx_idss_uniodonto`: Índice no campo `uniodonto` (melhora filtros)

### Políticas RLS

1. **Enable read access for all users**: Permite leitura pública
2. **(Opcional) Enable insert for authenticated users only**: Restringe inserção
3. **(Opcional) Enable update for authenticated users only**: Restringe atualização
4. **(Opcional) Enable delete for authenticated users only**: Restringe deleção

---

## 🔧 Variáveis de Ambiente

### Arquivo .env (Desenvolvimento)

```env
# Supabase Configuration (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration (opcional)
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

### Arquivo .env.production (Produção)

```env
# Supabase Configuration (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration (opcional)
VITE_APP_URL=https://seu-dominio.com
NODE_ENV=production
```

### Como Obter as Chaves do Supabase

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em **Settings → API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

**⚠️ SEGURANÇA**:
- ✅ A `anon key` é segura para expor publicamente (já tem RLS)
- ❌ NUNCA exponha a `service_role key` no frontend
- ✅ Use `.gitignore` para não versionar o `.env`

---

## 🚢 Deploy e Execução

### Opção 1: Servir com Nginx (Recomendado para Produção)

Este método já foi configurado nos passos anteriores. Para verificar:

```bash
# Verificar status do Nginx
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Recarregar após mudanças
sudo systemctl reload nginx

# Reiniciar se necessário
sudo systemctl restart nginx
```

### Opção 2: Servir com Node.js + PM2 (Alternativa)

Se preferir servir diretamente com Node.js:

#### 2.1 Instalar Servidor HTTP Simples

```bash
npm install -g serve
```

#### 2.2 Criar Script PM2

```bash
pm2 serve dist 3000 --name "dashboard-idss" --spa
```

#### 2.3 Salvar Configuração PM2

```bash
pm2 save
pm2 startup
```

#### 2.4 Verificar Status

```bash
pm2 status
pm2 logs dashboard-idss
```

### Comandos Úteis do PM2

```bash
# Ver status de todos os processos
pm2 status

# Ver logs em tempo real
pm2 logs dashboard-idss

# Reiniciar aplicação
pm2 restart dashboard-idss

# Parar aplicação
pm2 stop dashboard-idss

# Remover aplicação do PM2
pm2 delete dashboard-idss

# Ver informações detalhadas
pm2 info dashboard-idss

# Monitorar recursos
pm2 monit
```

### Atualizar Aplicação

Quando fizer mudanças no código:

```bash
cd /var/www/dashboard-idss

# 1. Atualizar código (se usando Git)
git pull origin main

# 2. Instalar novas dependências (se houver)
npm install

# 3. Rebuild
npm run build

# 4. Recarregar Nginx (se usando Nginx)
sudo systemctl reload nginx

# Ou reiniciar PM2 (se usando PM2)
# pm2 restart dashboard-idss
```

---

## 🔍 Troubleshooting

### Problema 1: "Failed to fetch" ou erro de CORS

**Causa**: Configuração incorreta do Supabase ou RLS bloqueando acesso.

**Solução**:
1. Verifique se as variáveis de ambiente estão corretas
2. Verifique se o RLS está habilitado e com política de leitura pública:
   ```sql
   ALTER TABLE public."IDSS" ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Enable read access for all users" 
   ON public."IDSS" 
   FOR SELECT 
   USING (true);
   ```
3. Teste a conexão via console do navegador (F12)

### Problema 2: Só aparecem dados de 2024 e 2025

**Causa**: Dados históricos não foram importados ou há limite na query.

**Solução**:
1. Verifique os dados no Supabase:
   ```sql
   SELECT ano, COUNT(*) as quantidade
   FROM public."IDSS"
   GROUP BY ano
   ORDER BY ano DESC;
   ```
2. Se só aparecer 2024 e 2025, reimporte os dados completos
3. Verifique os logs do console (F12) após clicar em "Atualizar Dados"

### Problema 3: Nginx retorna 502 Bad Gateway

**Causa**: Nginx não está conseguindo se conectar ao backend ou arquivo não existe.

**Solução**:
1. Verifique se o build foi feito:
   ```bash
   ls -la /var/www/dashboard-idss/dist/
   ```
2. Verifique permissões:
   ```bash
   sudo chown -R www-data:www-data /var/www/dashboard-idss/dist/
   sudo chmod -R 755 /var/www/dashboard-idss/dist/
   ```
3. Verifique logs do Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Problema 4: Certificado SSL não funciona

**Causa**: Certbot não conseguiu validar o domínio.

**Solução**:
1. Verifique se o domínio aponta para o IP da VPS:
   ```bash
   dig seu-dominio.com +short
   nslookup seu-dominio.com
   ```
2. Verifique se a porta 80 está aberta:
   ```bash
   sudo ufw status
   sudo netstat -tlnp | grep :80
   ```
3. Tente novamente:
   ```bash
   sudo certbot --nginx -d seu-dominio.com
   ```

### Problema 5: Página em branco após deploy

**Causa**: Path incorreto ou erro no JavaScript.

**Solução**:
1. Abra o console do navegador (F12) e veja os erros
2. Verifique o arquivo `index.html` no `dist/`:
   ```bash
   cat /var/www/dashboard-idss/dist/index.html
   ```
3. Verifique se os assets estão sendo carregados:
   ```bash
   curl -I https://seu-dominio.com/assets/index-abc123.js
   ```
4. Limpe o cache do navegador (Ctrl+Shift+R)

### Problema 6: Filtros não funcionam

**Causa**: Campo faltando no banco de dados (ex: `uniodonto`).

**Solução**:
1. Verifique se a coluna existe:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'IDSS' 
   AND table_schema = 'public';
   ```
2. Se faltar, adicione:
   ```sql
   ALTER TABLE public."IDSS" 
   ADD COLUMN IF NOT EXISTS uniodonto TEXT;
   
   CREATE INDEX IF NOT EXISTS idx_idss_uniodonto 
   ON public."IDSS"(uniodonto);
   ```

### Problema 7: Gráficos não aparecem

**Causa**: Biblioteca Recharts não foi instalada ou erro nos dados.

**Solução**:
1. Verifique se a dependência está instalada:
   ```bash
   npm list recharts
   ```
2. Se não estiver, instale:
   ```bash
   npm install recharts
   npm run build
   ```
3. Verifique console do navegador (F12) para erros

### Problema 8: Performance lenta

**Causa**: Muitos dados sem paginação ou índices faltando.

**Solução**:
1. Criar índices no banco (veja seção de Estrutura do Banco)
2. Verificar quantidade de dados:
   ```sql
   SELECT COUNT(*) FROM public."IDSS";
   ```
3. Se necessário, implementar paginação server-side no futuro

### Logs e Debug

#### Ver logs da aplicação

```bash
# Console do navegador
# Pressione F12 e vá na aba "Console"
# Procure por linhas com emojis:
# 🔄 Iniciando busca de dados...
# 📊 Buscando dados da tabela IDSS...
# ✅ Dados carregados com sucesso!
# 📅 Anos únicos encontrados: [...]
```

#### Ver logs do Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log

# Filtrar por domínio
sudo tail -f /var/log/nginx/access.log | grep seu-dominio.com
```

#### Ver logs do sistema

```bash
# System logs
sudo journalctl -u nginx -f

# PM2 logs (se usar)
pm2 logs dashboard-idss --lines 100
```

---

## 🔄 Manutenção e Atualizações

### Atualização de Dados

#### Método 1: Via Supabase Table Editor

1. Acesse **Table Editor** no Supabase
2. Selecione a tabela "IDSS"
3. Clique em **Insert** → **Import data from CSV**
4. Faça upload do arquivo atualizado

#### Método 2: Via SQL (Deletar e Reimportar)

```sql
-- CUIDADO: Isso apaga TODOS os dados!
TRUNCATE TABLE public."IDSS" RESTART IDENTITY CASCADE;

-- Depois reimporte via CSV ou INSERT
```

#### Método 3: Atualização Incremental

```sql
-- Inserir apenas novos dados (exemplo para 2026)
INSERT INTO public."IDSS" (
    reg_ans, cnpj, razao_social, ano, idss, idqs, idga, idsm, idgr,
    modalidade_idss, modalidade_operadora, cidade, uf, porte, 
    qt_beneficiarios, uniodonto
)
VALUES
    ('123456', '12.345.678/0001-99', 'OPERADORA X', 2026, 0.8756, 0.9123, 0.8534, 0.7891, 0.9456, 'Cooperativa Médica', 'Cooperativa Médica', 'São Paulo', 'SP', 'Grande', 500000, 'NÃO');
```

### Backup do Banco de Dados

#### Via Supabase Dashboard

1. Vá em **Database** → **Backups**
2. Clique em **Create backup**
3. Aguarde conclusão
4. Para restaurar, clique em **Restore** ao lado do backup

#### Via pg_dump (Linha de Comando)

```bash
# Fazer backup
pg_dump "postgresql://postgres:[senha]@db.[seu-projeto].supabase.co:5432/postgres" \
  -t public.IDSS \
  -F c \
  -f backup_idss_$(date +%Y%m%d).dump

# Restaurar backup
pg_restore -d "postgresql://postgres:[senha]@db.[seu-projeto].supabase.co:5432/postgres" \
  --clean --if-exists \
  backup_idss_20260114.dump
```

**⚠️ IMPORTANTE**: Substitua `[senha]` e `[seu-projeto]` pelos valores reais.

### Monitoramento

#### Monitorar Uso de Recursos da VPS

```bash
# CPU e Memória
htop

# Ou
top

# Espaço em disco
df -h

# Uso por diretório
du -sh /var/www/dashboard-idss/*
```

#### Monitorar Supabase

1. Acesse o dashboard do Supabase
2. Vá em **Reports**
3. Monitore:
   - **Database Size**: Tamanho do banco
   - **API Requests**: Quantidade de requisições
   - **Database Connections**: Conexões ativas

### Atualização de Dependências

#### Verificar Atualizações Disponíveis

```bash
npm outdated
```

#### Atualizar Dependências

```bash
# Atualizar todas (cuidado!)
npm update

# Atualizar específica
npm install react@latest
npm install recharts@latest

# Rebuild após atualizar
npm run build
```

### Renovação de Certificado SSL

O Certbot configura renovação automática, mas você pode testar:

```bash
# Testar renovação
sudo certbot renew --dry-run

# Forçar renovação (se necessário)
sudo certbot renew --force-renewal

# Verificar certificados
sudo certbot certificates
```

---

## 📊 Estatísticas do Projeto

### Dados Atuais (Janeiro 2026)

- **Total de Registros**: 5.797
- **Anos Disponíveis**: 2012-2025 (14 anos)
- **Operadoras Únicas**: ~800
- **Estados Cobertos**: 27 UFs
- **Modalidades**: 8+ diferentes

### Performance

- **Tempo de Carregamento**: < 2 segundos (com todos os dados)
- **Tamanho do Build**: ~500KB (gzipped)
- **Requisições à API**: 1 (carregamento inicial)
- **Cache**: Ativado para assets estáticos (1 ano)

### Browsers Suportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer: Não suportado

---

## 🤝 Suporte e Contato

### Recursos Úteis

- **Documentação Supabase**: https://supabase.com/docs
- **Documentação React**: https://react.dev
- **Documentação Recharts**: https://recharts.org
- **Documentação Tailwind CSS**: https://tailwindcss.com
- **Documentação Vite**: https://vitejs.dev

### Problemas Conhecidos

1. **Filtro Uniodonto**: Se não aparecer valores, verifique se a coluna `uniodonto` está populada no banco
2. **Anos Históricos**: Se só aparecer 2024-2025, reimporte os dados completos
3. **Performance com 10k+ registros**: Considerar paginação server-side

### Próximas Melhorias Sugeridas

1. 🔄 **Exportação**: Permitir exportar dados filtrados para Excel/CSV
2. 📧 **Relatórios**: Gerar relatórios em PDF
3. 🔔 **Alertas**: Sistema de notificações para mudanças
4. 👥 **Multi-usuário**: Sistema de autenticação e perfis
5. 📱 **App Mobile**: Versão nativa para iOS/Android
6. 🤖 **IA**: Análises preditivas com Machine Learning
7. 🗺 **Mapas**: Visualização geográfica por estado
8. 📊 **Mais Gráficos**: Heatmaps, Treemaps, etc.

---

## 📝 Changelog

### Versão 2.0 (Janeiro 2026)

**Novidades:**
- ✅ Campo "Uniodonto" com filtro funcional
- ✅ Suporte completo para 14 anos de dados (2012-2025)
- ✅ Gráfico de Ranking por Modalidade com medalhas
- ✅ Filtros compactos com dropdowns multi-seleção
- ✅ Ano 2025 pré-selecionado
- ✅ Sistema de logs detalhados para debug
- ✅ Limite de 100.000 registros na query Supabase

**Melhorias:**
- ⚡ Performance otimizada com índices no banco
- 🎨 Interface mais compacta e organizada
- 📊 Gráfico Top 10 mais legível (eixo Y de 0.5 a 1)
- 🔍 Logs detalhados para troubleshooting

### Versão 1.0 (Janeiro 2026)

**Inicial:**
- ✅ Dashboard completo com múltiplos gráficos
- ✅ Sistema de filtros avançados
- ✅ Tabela de comparação com ranking
- ✅ Aba de histórico temporal
- ✅ Integração com Supabase
- ✅ Interface responsiva

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

**Uso Permitido:**
- ✅ Uso interno da organização
- ✅ Modificações para atender necessidades específicas

**Uso Não Permitido:**
- ❌ Redistribuição pública
- ❌ Comercialização
- ❌ Uso por terceiros sem autorização

---

## 🎉 Conclusão

Este dashboard foi desenvolvido para fornecer uma análise completa e interativa dos dados do IDSS da ANS. Com 14 anos de dados históricos, filtros avançados e múltiplas visualizações, é uma ferramenta poderosa para análise de operadoras de saúde no Brasil.

**Principais Diferenciais:**
- 📊 **Visualizações Diversas**: 7 tipos de gráficos diferentes
- 🔍 **Filtros Avançados**: 7 filtros combinados
- 📈 **Análise Temporal**: Evolução de 5 índices ao longo do tempo
- 🏆 **Rankings**: Com medalhas e badges visuais
- 🚀 **Performance**: Otimizado para milhares de registros
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile
- 🔒 **Seguro**: RLS no Supabase e HTTPS

**Para começar:**
1. Configure o Supabase (Seção 5)
2. Importe os dados (Seção 5.5)
3. Configure a VPS (Seção 4)
4. Faça o deploy (Seção 8)
5. Acesse e analise! 🎯

**Dúvidas?** Consulte a seção de [Troubleshooting](#troubleshooting) ou revise os logs no console do navegador.

---

**Desenvolvido com ❤️ para análise de dados de saúde suplementar no Brasil**

**Última Atualização**: Janeiro 2026  
**Versão**: 2.0  
**Status**: ✅ Produção
