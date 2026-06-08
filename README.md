# 📊 Dashboard CME - Materiais Desinfectados

Um painel analítico moderno e dinâmico projetado para monitorar, analisar e gerenciar a distribuição e o consumo de materiais esterilizados/desinfectados pela **CME (Central de Material e Esterilização)** entre diferentes setores hospitalares.

Os dados são consumidos diretamente em tempo real a partir de uma planilha pública do Google Sheets, proporcionando transparência e atualização imediata das informações para tomada de decisões estratégicas.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando as tecnologias mais modernas do ecossistema React:

- **Framework**: [TanStack Start](https://tanstack.com/router/latest/docs/start/overview) (com TanStack Router) para uma arquitetura ágil e de alta performance.
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) garantindo tipagem estática e segurança de código.
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) para criação de layouts responsivos e de alta qualidade estética.
- **Componentes**: [Radix UI](https://www.radix-ui.com/) (base do Shadcn/ui) provendo componentes acessíveis e elegantes.
- **Gráficos**: [Recharts](https://recharts.org/) para a exibição de dados estatísticos de forma interativa.
- **Manipulação de Dados**:
  - [PapaParse](https://www.papaparse.com/) para fazer o parsing dos dados CSV integrados do Google Sheets.
  - [xlsx](https://github.com/SheetJS/sheetjs) para exportação de dados estruturados para planilhas Excel.
  - [jsPDF](https://github.com/parallax/jsPDF) e [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) para a geração de relatórios formatados em PDF.

---

## 📊 Funcionalidades

- **Integração em Tempo Real**: Conexão direta com planilha de dados do Google Sheets.
- **Indicadores de Desempenho (KPIs)**: Monitoramento rápido do total de materiais processados, médias diárias/mensais e distribuição percentual.
- **Filtros Avançados**:
  - Filtragem por **Ano** e **Mês**.
  - Seleção múltipla de **Materiais** específicos.
  - Divisão de visualização por **Setores**: *Internação, Emergência, Centro Cirúrgico e Saúde Mental*.
- **Gráficos Dinâmicos**:
  - Evolução temporal do consumo de materiais.
  - Comparativo de distribuição entre setores.
  - Ranking de materiais mais solicitados.
- **Exportação de Relatórios**:
  - Geração de relatórios executivos em **PDF**.
  - Download das tabelas filtradas em formato **Excel (XLSX)** ou **CSV**.
- **Acessibilidade e Responsividade**: Interface adaptável para dispositivos móveis, tablets e computadores, mantendo uma experiência visual premium.

---

## 📁 Estrutura de Pastas Principal

```bash
dashboard-CME-Materiais-Desinfectados/
├── src/
│   ├── components/
│   │   ├── cme/          # Componentes específicos do painel (Gráficos, KPIs, Tabelas, etc.)
│   │   └── ui/           # Componentes base reutilizáveis (Radix / Shadcn)
│   ├── lib/
│   │   ├── cme-data.ts   # Conectividade com a planilha, parser de dados e regras de filtros
│   │   ├── cme-export.ts # Funções utilitárias de exportação (PDF e XLSX)
│   │   └── utils.ts      # Funções auxiliares de estilo e formatação
│   ├── routes/           # Sistema de roteamento (TanStack Router)
│   ├── styles.css        # Configurações globais de estilos e Tailwind CSS
│   └── main.tsx          # Ponto de entrada do aplicativo React
├── vite.config.ts        # Configuração do Vite e plugins do TanStack Router
├── tsconfig.json         # Configurações do compilador TypeScript
└── package.json          # Dependências e scripts do projeto
```

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos

Certifique-se de possuir o [Node.js](https://nodejs.org/) (versão 18+) ou o [Bun](https://bun.sh/) instalado em sua máquina.

### Passos para Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/KaelBittencourt/dashboard-CME-Materiais-Desinfectados.git
   cd dashboard-CME-Materiais-Desinfectados
   ```

2. **Instale as dependências:**
   Caso use npm:
   ```bash
   npm install
   ```
   Caso use Bun:
   ```bash
   bun install
   ```

3. **Inicie o servidor de desenvolvimento:**
   Caso use npm:
   ```bash
   npm run dev
   ```
   Caso use Bun:
   ```bash
   bun dev
   ```

4. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000) (ou a porta indicada no terminal) para visualizar o dashboard.

---

## ☁️ Hospedagem e Deploy na Vercel

Este projeto foi desenvolvido com suporte nativo a deploys na **Vercel** usando as capacidades de auto-detecção do **Nitro** e do **TanStack Start**.

### Como publicar na Vercel:

1. **Repositório**: Certifique-se de que o projeto foi enviado para o seu repositório no GitHub (já concluído).
2. **Importação**: 
   - Vá para o painel da [Vercel](https://vercel.com/) e clique em **Add New > Project**.
   - Importe o repositório `dashboard-CME-Materiais-Desinfectados`.
3. **Configuração do Projeto**:
   - A Vercel detectará automaticamente o framework (TanStack Start / Nitro).
   - O comando de Build padrão configurado deve ser `vite build` (ou `npm run build`), e o diretório de saída deve ser deixado em branco (o Nitro gerará automaticamente na pasta `.vercel/output`).
4. **Variáveis de Ambiente**:
   - Não há necessidade de configurar variáveis de ambiente adicionais, pois a conexão com o banco de dados/planilha é pública e estática, mas se futuramente você adicionar APIs protegidas, configure-as na aba **Environment Variables** da Vercel.
5. **Deploy**:
   - Clique em **Deploy**. O build executará e a Vercel criará automaticamente uma Serverless Function para rodar o servidor SSR e servirá os recursos estáticos de forma otimizada.

---

## 📄 Licença

Este projeto é de uso interno e acadêmico/institucional. Consulte os termos para fins de distribuição e uso.

