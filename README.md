# Onde-no-Mundo

Projeto focado em consumo e tratamento de dados estruturados (JSON) de fontes externas.

Aplicação React inspirada no desafio “REST Countries API”, com busca, filtro por região e página de detalhes do país.

![Design preview](./design/desktop-preview.jpg)

## Visão geral

Este repositório foi pensado como um projeto de portfólio que evidencia **Data Ingestion no frontend**:

- Consumo de uma API pública (REST Countries)
- Tratamento do JSON (normalização, limpeza e padronização)
- Resiliência (cache e fallback offline)
- Consumo do “contrato de dados” normalizado nos componentes

## Por que este projeto é “Data Ingestion”

O ponto central aqui é a ingestão de dados: o app consome uma API pública de países (REST Countries), recebe um JSON com estrutura extensa e **transforma** esse JSON em um formato estável para uso na UI.

Na prática, isso demonstra o tipo de trabalho que analistas e engenheiros de dados fazem o tempo todo ao integrar fontes externas: padronizar campos, tratar nulos, lidar com variações de schema e manter uma camada de dados consistente.

## Como o JSON é tratado (pipeline)

O pipeline de ingestão foi isolado em uma camada própria para deixar o projeto mais profissional e fácil de evoluir:

- Ingestão (API externa) com timeout e tratamento de erro
- Normalização do JSON para um “schema” interno estável
- Deduplicação e ordenação
- Cache (localStorage) com TTL para reduzir chamadas
- Fallback para dataset local (modo offline / GitHub Pages)

Arquivos principais:

- [src/services/countriesIngestion.js](src/services/countriesIngestion.js)
- [src/hooks/useCountries.js](src/hooks/useCountries.js)

### Arquitetura (fluxo de dados)

1. `loadCountries()` busca na API externa (`/all?fields=...`)
2. Se falhar, faz fallback para `public/data.json`
3. `normalizeCountries()` aplica limpeza + padronização + dedupe + sort
4. O hook `useCountries()` expõe `{ countries, loading, error }` para a UI
5. Componentes consomem apenas o **schema normalizado**, evitando transformação espalhada

### Normalização (exemplos do que foi tratado)

O JSON da API pode variar (ex.: versões diferentes retornam formatos distintos). A normalização garante que a UI sempre receba algo consistente:

- `name`: pode vir como string (v2) ou como objeto (`name.common` / `name.official` em v3)
- `capital`: pode ser string (v2) ou array (v3)
- `languages`: pode ser array de objetos (v2) ou objeto-chave/valor (v3)
- `currencies`: pode ser array (v2) ou objeto (v3)
- `flags`: pode vir como `flags.png/svg` (v2) ou `flag` legado

Além disso, o pipeline trata qualidade de dados para evitar quebras comuns:

- Campos ausentes viram valores default (ex.: `population: 0`, listas vazias)
- Conversões seguras (string/array → string, object → array, `Number(...)` com fallback)
- Deduplicação por `alpha3Code` (quando disponível) e ordenação por `name`

Schema normalizado (campos usados pela UI):

- `name`, `alpha3Code`, `nativeName`
- `region`, `capital`, `population`
- `topLevelDomain`
- `languages` (lista de strings)
- `currenciesCode`
- `borders`
- `flags` (`png`/`svg`)

Esse “contrato de dados” é o que os componentes usam, independentemente do formato exato retornado pela fonte.

### Estratégia de fallback (resiliência)

Se a API estiver indisponível (ou sem rede), o app tenta carregar [public/data.json](public/data.json) para manter a experiência funcionando.

### Cache (performance)

O resultado da API é cacheado em `localStorage` com TTL de 24h para reduzir chamadas e deixar a navegação mais fluida.

Caso você queira forçar um recarregamento (sem cache), existe `clearCountriesCache()` no service.

## Rodando localmente

Pré-requisitos: Node.js + npm

- Instalar dependências: `npm install`
- Ambiente dev: `npm start`
- Build produção: `npm run build`
- Testes: `npm test -- --watchAll=false`

## Scripts

- `npm start`: servidor de desenvolvimento
- `npm test -- --watchAll=false`: testes em modo CI
- `npm run build`: build de produção
- `npm run deploy`: publica no GitHub Pages

## Deploy (GitHub Pages)

Este projeto está configurado para deploy via `gh-pages`.

1. Gere o build: `npm run build`
2. Publique: `npm run deploy`

Observação: o campo `homepage` em [package.json](package.json) está configurado para funcionar com GitHub Pages.

### Configuração opcional

Você pode apontar para outro endpoint base via variável de ambiente:

- `REACT_APP_COUNTRIES_API_BASE` (padrão: `https://restcountries.com/v2`)

Exemplo:

- `REACT_APP_COUNTRIES_API_BASE=https://restcountries.com/v2 npm start`

## Tecnologias

- React 18 (Create React App)
- React Router v6
- Reactstrap + Bootstrap + Bulma
- Fetch API

## Estrutura relevante

- [src/services/countriesIngestion.js](src/services/countriesIngestion.js): ingestão, fallback, normalização e cache
- [src/hooks/useCountries.js](src/hooks/useCountries.js): estado de loading/erro + entrega do dataset para UI
- [src/Components/content.jsx](src/Components/content.jsx): busca e filtro em cima do dataset normalizado
- [src/Components/Details.jsx](src/Components/Details.jsx): detalhes consumindo somente o schema normalizado

## Funcionalidades

- Busca por país
- Filtro por região
- Página de detalhes
- Tema dark/light

## Notas

O texto do UI está em inglês por conta do desafio original, mas o foco deste repositório é a parte de ingestão e tratamento de dados (JSON) para consumo no frontend.

### Avisos de dependências

Alguns pacotes do ecossistema do CRA podem emitir warnings de depreciação em versões mais novas do Node; o build funciona normalmente.
