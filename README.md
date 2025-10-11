# 🎮 Digimon Board Clash

**Um jogo de tabuleiro estratégico digital inspirado no universo Digimon**

Sistema de gerenciamento e assistente para partidas de Digimon Board Clash, um jogo estratégico para **2 a 6 jogadores** onde cada jogador controla Digimons, evolui durante o jogo, coleta itens e enfrenta bosses e eventos globais, enquanto tenta **aniquilar** todos os Digimons adversários.

## 📊 Estatísticas do Sistema

- 🎮 **466 Digimons** cadastrados (7 níveis: Armor a Super Mega)
- 🖼️ **465 Digimons com imagem** (99.79% de cobertura!) ✨
- ❌ **Apenas 1 Digimon sem imagem** (Aegiochusmon: Holy)
- 👑 **93 Bosses** configurados (antagonistas das séries)
- 💎 **7 Itens** com **16 Efeitos** diferentes
- 🎯 **Sistema de combate** baseado em D20
- 🧬 **Sistema de evolução** com XP oculto
- 🎒 **Bag compartilhada** por equipe
- 🛡️ **Sistema de defesa** e **💢 provocação**
- 📚 **Painel administrativo** completo para gerenciamento

---

## 🏗️ Overview do Sistema

### Arquitetura Geral

O **Digimon Board Clash** é uma aplicação web **full-stack** construída com Next.js 15, utilizando o **App Router** e **React Server Components**. O sistema funciona como um assistente digital para o jogo de tabuleiro físico, gerenciando todo o estado do jogo e executando cálculos complexos automaticamente.

#### Componentes Principais:

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Game UI    │  │  Admin UI    │  │  Battle UI   │      │
│  │   (Client)   │  │   (Client)   │  │   (Client)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         State Management (useGameState Hook)        │   │
│  │  • LocalStorage Persistence                         │   │
│  │  • Real-time Game State                             │   │
│  │  • Turn Management                                  │   │
│  └─────────────────────┬───────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  /api/       │  │  /api/       │  │  /api/       │      │
│  │  digimons    │  │  items       │  │  bosses      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      Business Logic (lib/ folder)                   │   │
│  │  • battle-manager.ts   → Combate e Dano             │   │
│  │  • effects-manager.ts  → Efeitos e Itens            │   │
│  │  • boss-manager.ts     → Lógica de Bosses           │   │
│  └─────────────────────┬───────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │   Development       │  │    Production       │          │
│  │  (SQLite Local)     │  │   (JSON Files)      │          │
│  │  • database.sqlite  │  │  • src/data/*.json  │          │
│  │  • CRUD completo    │  │  • Read-only        │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  📊 Dados:                                                   │
│  • 466 Digimons (465 com imagens = 99.79%!) ✨             │
│  • 93 Bosses configurados (19.96% dos Digimons)            │
│  • Sistema de HP/DP aleatório por nível                     │
│  • 7 Itens com 16 Efeitos                                   │
│  • Sistema de Drops de Bosses                               │
│  • Tamers (Avatares)                                        │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

#### 1. **Inicialização do Jogo**

```
Usuário → GameSetupModal → API /digimons/random-level1
       → Cria estado inicial → Salva em LocalStorage
```

#### 2. **Durante o Jogo (Combate)**

```
Jogador seleciona ação → useGameState atualiza estado
       → battle-manager.ts calcula dano
       → effects-manager.ts aplica efeitos
       → Estado atualizado → LocalStorage
       → UI re-renderiza com novo estado
```

#### 3. **Painel Administrativo**

```
Admin edita Digimon → API /digimons/[id] → SQLite (dev)
       → npm run export → Gera JSON → Git commit → Deploy
```

### Dual Database System

O sistema opera com **dois modos** dependendo do ambiente:

#### 🔧 **Desenvolvimento Local**

- **SQLite** (`better-sqlite3`)
- CRUD completo via painel admin
- Scripts de seed para popular dados
- Imagens armazenadas em `public/images/`

#### ☁️ **Produção (Vercel)**

- **JSON estáticos** em `src/data/*.json`
- Read-only (sem writes em produção)
- Build process: `export-db-to-json.ts` converte SQLite → JSON
- JSON files versionados no Git

### State Management

#### Client-Side State (LocalStorage)

O estado completo do jogo é armazenado no **localStorage** do navegador:

```typescript
{
  players: [
    {
      id: string,
      name: string,
      tamerId: number,
      digimons: [
        {
          id: string,
          baseDigimonId: number,
          currentHp: number,
          maxHp: number,
          xp: number,  // Sistema oculto
          level: number,
          bag: Item[], // Inventário individual
          defending: string | null,
          hasActed: boolean
        }
      ]
    }
  ],
  currentPlayerIndex: number,
  turnNumber: number,
  boss: GameBoss | null
}
```

#### Server-Side Data (API Routes)

APIs fornecem dados estáticos (Digimons, Itens, etc):

- **GET** `/api/digimons` - Lista todos
- **GET** `/api/digimons/[id]` - Detalhes
- **GET** `/api/digimons/level/[level]` - Por nível
- **POST** `/api/digimons/evolve` - Opções de evolução
- **POST/PUT/DELETE** - Admin only

### Principais Gerenciadores

#### 🎯 **battle-manager.ts**

Responsável por toda a lógica de combate:

- Cálculo de dano baseado em D20
- Modificadores de tipo (Data/Vaccine/Virus)
- Sistema de contra-ataque
- Ganho de XP proporcional ao dano recebido
- Verificação de morte

#### ✨ **effects-manager.ts**

Gerencia todos os efeitos do jogo:

- Aplicação de heal/damage/buff/debuff
- Efeitos de itens (Potion, Revive, etc)
- Efeitos de bosses
- Validações de efeitos

#### 👹 **boss-manager.ts**

Controla a lógica de bosses:

- Sistema de drops com probabilidade
- Cálculo de recompensas
- Integração com items e effects

### Renderização e Performance

#### React Server Components

- Páginas principais usam **Server Components**
- Reduz bundle JavaScript no cliente
- Dados fetched no servidor

#### Client Components

- Componentes interativos marcados com `"use client"`
- Modais, formulários, game state
- Hooks customizados (`useGameState`)

#### Otimizações

- Imagens em **WebP** (70-90% menor que PNG)
- TailwindCSS para CSS minificado
- Turbopack para builds rápidos
- Code splitting automático (Next.js)

### Build e Deploy Process

```bash
# 1. Build Trigger (Vercel)
git push origin main

# 2. Install Dependencies
npm install

# 3. Pre-build Script
npm run build
  ↓
tsx scripts/export-db-to-json.ts
  ↓
  • Se database.sqlite existe → exporta para JSON
  • Se não existe → usa JSON versionados

# 4. Next.js Build
next build --turbopack
  ↓
  • Compila TypeScript
  • Bundling com Turbopack
  • Otimiza assets

# 5. Deploy
Vercel serverless functions + Static assets
```

### Segurança e Validação

- **TypeScript** para type-safety em todo código
- **Zod** (potencial) para validação de schemas
- **ESLint** para code quality
- Sem autenticação (jogo local/casual)
- Admin panel sem proteção (desenvolvimento)

### Limitações Atuais

- ❌ Sem multiplayer online (localStorage apenas)
- ❌ Sem persistência de partidas na nuvem
- ❌ Admin panel não protegido por login
- ❌ Sem analytics ou tracking
- ❌ Sem sistema de ranking/leaderboard

### Escalabilidade Futura

Para evoluir para um sistema multiplayer:

1. **Database**: Migrar para PostgreSQL/Supabase
2. **Real-time**: WebSockets ou Supabase Realtime
3. **Auth**: NextAuth.js ou Supabase Auth
4. **State**: Migrar de LocalStorage para Server State
5. **API**: Adicionar middleware de autenticação

---

## 📋 Índice

- [Overview do Sistema](#️-overview-do-sistema)
  - [Arquitetura Geral](#arquitetura-geral)
  - [Fluxo de Dados](#fluxo-de-dados)
  - [Dual Database System](#dual-database-system)
  - [State Management](#state-management)
  - [Principais Gerenciadores](#principais-gerenciadores)
  - [Build e Deploy Process](#build-e-deploy-process)
- [Objetivo do Jogo](#-objetivo-do-jogo)
- [Sistema Implementado](#-sistema-implementado)
- [Regras do Jogo](#-regras-do-jogo)
  - [Setup Inicial](#-setup-inicial)
  - [Sistema de Atributos](#-sistema-de-atributos)
  - [Sistema de Combate](#️-sistema-de-combate)
  - [Sistema de Evolução](#-sistema-de-evolução)
  - [Sistema de Itens e Efeitos](#-sistema-de-itens-e-efeitos)
  - [Sistema de Bosses](#-sistema-de-bosses)
  - [Fluxo de Turno](#️-fluxo-de-turno)
- [Tecnologias](#-tecnologias)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Recursos Administrativos](#️-recursos-administrativos)
- [Deploy](#-deploy)

---

## 🎯 Objetivo do Jogo

- **Aniquilação Total:** Eliminar todos os Digimons adversários
- Quando um jogador fica com **0 Digimons ativos**, ele é eliminado do jogo
- O último jogador com Digimons vivos vence

## 🌟 Destaques do Sistema

### ✅ Mecânicas Implementadas

- ⚔️ **Sistema de Combate Tático**: D20 com modificadores de tipo, defesa e contra-ataque
- 🧬 **Evolução Misteriosa**: Sistema de XP oculto com surpresa ao evoluir
- 🎒 **Bag Compartilhada**: Inventário unificado por equipe para melhor colaboração
- 🛡️ **Defesa Estratégica**: Proteja aliados redirecionando ataques
- 💢 **Provocação**: Force inimigos a atacar alvos específicos (Level 2+, cooldown 3 turnos)
- 👑 **93 Bosses**: Antagonistas icônicos das séries marcados para desafios épicos
- 💰 **Sistema de Exploração**: Ganhe itens rolando D20
- 😴 **Descanso**: Recupere 20% de HP sem usar itens
- ⏸️ **Controle de Ações**: Um Digimon, uma ação por turno

### 🎨 Interface Visual

- Cards interativos com informações em tempo real
- Animações de evolução épicas
- Badges visuais para status (Defendendo, Provocado, BOSS, etc)
- Preview de linha evolutiva completa
- Sistema de cores por tipo de Digimon
- Interface responsiva (mobile-first)

### 🔧 Sistema Administrativo

- Painel completo de gerenciamento (/biblioteca)
- Upload e crop de imagens em tempo real
- Filtros e busca avançada
- Modo visualização em produção
- Organização automática por níveis
- Visual feedback para itens inativos/bosses

---

## 💻 Sistema Implementado

Este projeto é um **assistente digital** para o jogo de tabuleiro físico que:

### ✅ Funcionalidades Implementadas

1. **Gerenciamento de Partidas**

   - Criação de partidas com 2-6 jogadores
   - Seleção de avatares (Tamers) para cada jogador
   - Sistema de turnos alternados
   - Persistência de estado do jogo (LocalStorage)

2. **Sistema de Combate**

   - Combate 1v1 baseado em dados D20
   - Sistema de vantagem/desvantagem de tipos (Data/Vaccine/Virus)
   - Cálculo automático de dano baseado em DP e rolagem
   - Contra-ataque automático
   - Sistema de XP oculto (ganha XP ao receber dano)
   - **Sem volta**: Após selecionar alvo, jogador deve completar o ataque

3. **Sistema de Evolução (XP Oculto)**

   - Sistema de experiência oculto (0-100%)
   - Ganha 0.5% XP para cada 1% de HP perdido
   - XP não é visível (surpresa ao atingir 100%)
   - Seleção entre 2 opções de evolução aleatórias
   - Visualização de linha evolutiva completa
   - XP resetada para 0% após evoluir

4. **Sistema de Inventário (Bag Compartilhada)**

   - **Bag Compartilhada** entre todos os Digimons da equipe
   - **Usar Item**: Qualquer Digimon pode usar itens da bag (gasta ação)
   - **Descartar Item**: Remove do inventário compartilhado (não gasta ação)
   - Sistema de stackable items (quantidade)
   - Modal visual mostrando todos os itens da equipe
   - Itens obtidos por exploração ou drops de bosses

5. **Sistema de Defesa**

   - Digimon pode defender aliados de nível igual ou inferior
   - Defesa dura 1 turno (expira ao passar turno)
   - Ao atacar defendido, ataque é redirecionado para defensor
   - Badge visual mostra quem está protegendo quem
   - Apenas um defensor por Digimon

6. **Sistema de Provocar**

   - Digimons **Level 2+** podem provocar inimigos (gasta ação)
   - **Cooldown**: 3 turnos entre provocações
   - **Efeito**: Inimigo provocado só pode atacar o provocador no próximo turno dele
   - Badge visual indica tempo de cooldown restante
   - Estratégico para proteger aliados fracos

7. **Painel Administrativo (/biblioteca)**

   - **Gerenciamento de Digimons** (CRUD completo em dev)
     - Switch de status Ativo/Inativo
     - Visualização de linha evolutiva
     - Upload e crop de imagens
     - Filtros visuais para inativos (cinza)
   - **Gerenciamento de Itens** com efeitos
   - **Gerenciamento de Bosses** e seus drops
   - **Gerenciamento de Efeitos** do jogo
   - **Modo Produção**: Apenas visualização (sem edição)

8. **Banco de Dados**
   - **466 Digimons cadastrados** (níveis 0 a 6)
     - 465 ativos (com imagem = 99.79% de cobertura!) ✨
     - Apenas 1 inativo (Aegiochusmon: Holy)
     - 93 Digimons marcados como **Bosses** (19.96%)
     - Badge 👑 BOSS nos cards da biblioteca
   - **Sistema de HP/DP Aleatório**
     - Stats gerados dinamicamente por nível
     - Intervalos configurados por nível
   - **Sistema de tipos e evoluções** completo
   - **7 Itens com 16 Efeitos** configurados
   - **Bosses com sistema de drops** por probabilidade

### 🚧 Funcionalidades em Desenvolvimento

- **Tabuleiro Hexagonal**: Sistema de movimento e posicionamento
- **Sistema de Eclosão**: Criação de novos Digimons durante o jogo
- **Controle de Base**: Ocupação e conquista de bases inimigas
- **Eventos Globais**: Cartas de evento do Deck do Mundo
- **Casas Especiais**: Casas de captura e área central
- **Sistema de Exploração**: Implementar loot com D20 (botão já existe)
- **Esconder**: Mecânica de ocultação (em planejamento)

---

## 📖 Regras do Jogo

### ⚙️ Setup Inicial

- Cada jogador recebe **3 Digimons iniciais** de nível 1 (Rookies)
- Cada jogador escolhe um **Tamer** (avatar)
- Cada Digimon possui:
  - **HP e DP Aleatórios**: Gerados dentro do intervalo do nível
  - **Ataque = DP** (modificado por dado D20 durante combate)
  - **Tipo Elemental**: Data, Vaccine, Virus, Free, Variable ou Unknown
- **Tabuleiro Hexagonal** (a ser implementado) com bases nos cantos

#### Sistema de Stats Aleatórios:

Ao iniciar o jogo ou evoluir, HP e DP são gerados aleatoriamente:

- **Nível 1**: 1,600 ~ 2,400
- **Nível 2**: 4,000 ~ 6,000
- **Nível 3**: 6,400 ~ 9,600
- **Nível 4**: 10,000 ~ 14,000
- **Nível 5**: 15,000 ~ 18,000
- **Nível 6**: 19,000 ~ 24,000

**Benefícios:**

- ✅ Cada partida é única
- ✅ Variedade no poder dos Digimons
- ✅ Estratégia baseada nos stats recebidos
- ✅ Valores limpos (múltiplos de 100)

### 📊 Sistema de Atributos

#### Sistema de Stats Dinâmico:

```
HP = DP = Valor aleatório no intervalo do nível (múltiplo de 100)
Dano Real = DP × (D20 × 5%) × Modificador de Tipo
```

**Importante:**

- HP = DP (sempre 100% de vida)
- Stats são **gerados aleatoriamente** ao iniciar o jogo
- Stats são **re-gerados** ao evoluir (novo valor, HP 100%)
- Valores sempre são **múltiplos de 100**
- Bônus de DP são **resetados** na evolução

#### Tipos e Vantagens:

- **Data** > **Virus** (+35% de dano)
- **Virus** > **Vaccine** (+35% de dano)
- **Vaccine** > **Data** (+35% de dano)
- **Tipo desvantajoso**: -35% de dano
- **Mesmo tipo ou Free/Variable**: sem modificador

#### Escala de Poder por Nível (Intervalos):

| Nível | Nome          | HP/DP Mínimo | HP/DP Máximo | Qtd. Digimons | Qtd. Bosses |
| ----- | ------------- | ------------ | ------------ | ------------- | ----------- |
| **0** | 🛡️ Armor      | -            | -            | 5             | 0           |
| **1** | 🥚 Rookie     | 1.600        | 2.400        | 64            | 1 (1.6%)    |
| **2** | 💪 Champion   | 4.000        | 6.000        | 108           | 5 (4.6%)    |
| **3** | ⚡ Ultimate   | 6.400        | 9.600        | 122           | 35 (28.7%)  |
| **4** | 👑 Mega       | 10.000       | 14.000       | 132           | 37 (28.0%)  |
| **5** | 🌟 Ultra      | 15.000       | 18.000       | 30            | 12 (40.0%)  |
| **6** | 💎 Super Mega | 19.000       | 24.000       | 5             | 3 (60.0%)   |

**Total: 466 Digimons | 93 Bosses (19.96%)**

### ⚔️ Sistema de Combate

#### Mecânica de Combate 1v1:

1. **Seleção**: Atacante escolhe um defensor
2. **Rolagem**: Ambos rolam 2×D20 (maior = ataque, menor = defesa)
3. **Cálculo de Dano**:
   ```
   Dano Bruto = DP × (D20_Ataque × 5%)
   Defesa = DP × (D20_Defesa × 5%)
   Dano Líquido = (Dano Bruto - Defesa) × Modificador de Tipo
   Dano Final = Arredondado para múltiplo de 100
   ```
4. **Aplicação**: Danos são aplicados simultaneamente
5. **Contra-ataque**: Defensor sempre contra-ataca automaticamente
6. **Evolução**: Após combate, sistema verifica chance de evolução

**Importante:**

- ✅ Todos os valores de dano são **múltiplos de 100**
- ✅ Dano mínimo possível: 0 (após defesa)
- ✅ Sistema de 2 dados torna combate mais estratégico

#### Exemplo de Combate:

```
Agumon (Data, 6,400 DP) vs Gabumon (Vaccine, 6,400 DP)

Agumon rola [18, 8]:
  - Ataque: 18 → 6,400 × (18 × 5%) = 5,760 → arredonda = 5,800
  - Defesa: 8 → 6,400 × (8 × 5%) = 2,560 → arredonda = 2,600

Gabumon rola [14, 6]:
  - Ataque: 14 → 6,400 × (14 × 5%) = 4,480 → arredonda = 4,500
  - Defesa: 6 → 6,400 × (6 × 5%) = 1,920 → arredonda = 1,900

Dano Líquido:
  - Agumon causa: (5,800 - 1,900) × 0.65 (desv.) = 2,535 → 2,500
  - Gabumon causa: (4,500 - 2,600) × 1.35 (vant.) = 2,565 → 2,600

Resultado:
  - Agumon: 6,400 - 2,600 = 3,800 HP (59% HP)
  - Gabumon: 6,400 - 2,500 = 3,900 HP (61% HP)
```

#### Sistema de Ataque em Equipe (a implementar):

- Múltiplos Digimons podem atacar o mesmo alvo
- **Dano total** = soma do dano de todos os atacantes
- **Contra-ataque**: Defensor escolhe **UM** atacante para contra-atacar

### 🎲 Sistema de Stats Aleatórios (NOVO!)

#### Como Funciona:

Este jogo utiliza **stats aleatórios dinâmicos** onde HP = DP, mas os valores variam a cada jogo:

1. **Início do Jogo**:

   - Cada Digimon Level 1 recebe HP/DP aleatório entre 1,600 e 2,400
   - HP = DP (sempre 100% de HP)
   - Valores são sempre **múltiplos de 100**
   - Exemplo: Agumon pode ter 2,000 HP e 2,000 DP

2. **Durante Evoluções**:
   - Ao evoluir, **novo valor** é gerado
   - Baseado no intervalo do novo nível
   - HP resetado para 100% do novo DP
   - **Bônus de DP são resetados**
   - Exemplo: Greymon Level 2 pode receber 5,200 HP/DP

#### Intervalos Completos:

| Nível | Nome       | HP Mínimo | HP Máximo | DP Mínimo | DP Máximo |
| ----- | ---------- | --------- | --------- | --------- | --------- |
| 0     | Armor      | -         | -         | -         | -         |
| 1     | Rookie     | 1,600     | 2,400     | 1,600     | 2,400     |
| 2     | Champion   | 4,000     | 6,000     | 4,000     | 6,000     |
| 3     | Ultimate   | 6,400     | 9,600     | 6,400     | 9,600     |
| 4     | Mega       | 10,000    | 14,000    | 10,000    | 14,000    |
| 5     | Ultra      | 15,000    | 18,000    | 15,000    | 18,000    |
| 6     | Super Mega | 19,000    | 24,000    | 19,000    | 24,000    |

#### Vantagens do Sistema:

- ✅ **Variedade**: Nenhuma partida é igual
- ✅ **Imprevisibilidade**: Estratégia adapta-se aos stats recebidos
- ✅ **Balanceamento**: Intervalos impedem extremos muito desbalanceados
- ✅ **Rejogabilidade**: Incentiva múltiplas partidas
- ✅ **Valores Limpos**: Sempre múltiplos de 100 (ex: 2,000 / 4,500 / 8,300)

#### Impacto Estratégico:

- Digimons com stats altos têm mais resistência e poder de ataque
- Decisões de evolução baseiam-se nos valores recebidos
- Itens de buff tornam-se mais valiosos
- Sorte inicial pode definir estratégias (tanque vs ofensivo)

### 🟢 Sistema de Status Ativo/Inativo

#### Distribuição de Imagens por Nível:

| Nível | Nome       | Com Imagem | Total | Cobertura |
| ----- | ---------- | ---------- | ----- | --------- |
| **0** | Armor      | 5          | 5     | 100% ✅   |
| **1** | Rookie     | 64         | 64    | 100% ✅   |
| **2** | Champion   | 108        | 108   | 100% ✅   |
| **3** | Ultimate   | 121        | 122   | 99.2% ✨  |
| **4** | Mega       | 132        | 132   | 100% ✅   |
| **5** | Ultra      | 30         | 30    | 100% ✅   |
| **6** | Super Mega | 5          | 5     | 100% ✅   |

**Total: 465/466 com imagem (99.79%)** 🎉

#### Único Digimon Sem Imagem:

- ❌ **Aegiochusmon: Holy** (ID: 289, Level 3)

#### Digimons Ativos:

- ✅ **465 Digimons** com imagens (99.79%!) 🎉
- ✅ Disponíveis para novos jogos
- ✅ Aparecem nas opções de evolução
- ✅ Exibidos normalmente na biblioteca

#### Digimons Inativos:

- ⚠️ **1 Digimon** sem imagem (0.21%)
- ❌ **Não aparece** em novos jogos
- ❌ **Não é opção** de evolução
- 🎨 Exibido em **cinza** na biblioteca
- 🔧 Badge "⚠️ INATIVO" para identificação

#### Gerenciamento (Modo Dev):

No painel administrativo em desenvolvimento:

- **Switch Ativo/Inativo** em modais de criação/edição
- Estados visuais claros (verde = ativo, cinza = inativo)
- Permite ativar Digimons ao adicionar imagens
- Previne uso acidental de Digimons sem arte
- **Badge 👑 BOSS** identifica Digimons que podem ser bosses

### 🧬 Sistema de Evolução (Refatorado - XP Oculto)

#### Sistema de XP de Evolução:

- **Mecânica**: Sistema de experiência oculto (0-100%)
- **Ganho de XP**: 0.5% para cada 1% de HP perdido em batalha
- **Acumulação**: XP acumula até 100% (trava no máximo)
- **Surpresa**: Jogador não vê a barra de XP, tornando a evolução uma surpresa!

#### Exemplos de Ganho de XP:

- Perde 10% HP → Ganha 5% XP
- Perde 20% HP → Ganha 10% XP
- Perde 50% HP → Ganha 25% XP
- Perde 100% HP (morte) → Não ganha XP

#### Como Funciona:

1. **Batalha**: Digimon participa de combate (atacando OU sendo atacado)
2. **Ganho de XP**: Ganha XP proporcional ao HP perdido (0.5% XP por 1% HP)
3. **100% XP**: Badge de evolução ✨ aparece no card
4. **Evolução**: Jogador clica no botão para evoluir
5. **Escolha**: Sistema oferece 2 opções aleatórias do próximo nível
6. **Reset**: Após evoluir, XP volta para 0% e HP para 100%

#### Características:

- ✅ **XP Oculto**: Jogador não sabe quanto XP tem (suspense!)
- ✅ **Cura não reduz XP**: Usar poções não diminui progresso
- ✅ **Múltiplas batalhas**: Quanto mais luta, mais XP acumula
- ✅ **Consistente**: Sempre 0.5% XP por 1% HP perdido

#### Limites de Evolução:

- Evolução natural até **Nível 6 (Mega)**
- Nível 7+ requer **item especial** (Instant Evolution)

#### Evolução Instantânea por Item:

- Item "Instant Evolution" permite evoluir imediatamente
- Segue o mesmo processo de escolha entre 2 cartas
- Ignora restrições de XP

### 💎 Sistema de Itens e Efeitos

#### Tipos de Efeitos:

- **Heal**: Restaura HP (1000, 2000, ou 100%)
- **Damage**: Causa dano direto
- **Buff**: Aumenta DP permanentemente
- **Debuff**: Reduz DP
- **Special**: Efeitos únicos (evolução, revive, etc)
- **Boss**: Efeitos especiais de bosses

#### Itens Disponíveis (7 itens):

- 💚 **Potion**: Cura 1000 HP
- 💙 **Mega Potion**: Cura 2000 HP
- ✨ **Full Restore**: Cura 100% do HP
- 🔄 **Revive**: Revive com 50% do HP
- ⬆️ **Power Boost**: +500 DP permanente
- 🧬 **Instant Evolution**: Evolui imediatamente
- 🛡️ **Shield Turn**: Proteção temporária (a implementar)

#### Sistema de Inventário (Bag Compartilhada):

- **Bag Compartilhada** entre toda a equipe do jogador
- Itens são **stackable** (mesmos itens acumulam quantidade)
- **Acesso**: Clique no Digimon → Botão 🎒 **Bag**
- Qualquer Digimon da equipe pode usar qualquer item

#### Ações com Itens:

1. **✓ Usar Item:**

   - Aplica o efeito no Digimon que abriu a bag
   - Remove 1 unidade do item da bag compartilhada
   - **Gasta a ação do turno**
   - Efeitos disponíveis: cura de HP, buffs, etc

2. **🗑️ Descartar Item:**
   - Remove o item completamente da bag compartilhada
   - **NÃO gasta ação**
   - Útil para liberar espaço

#### Regras de Itens:

- ✅ Só pode usar itens no **seu turno**
- ✅ Só pode usar se o Digimon **ainda não agiu**
- ✅ Usar poção **não reduz XP de evolução**
- ✅ Itens podem ser obtidos via exploração (💰 Explorar) ou drops de bosses
- ✅ Todos os Digimons da equipe compartilham a mesma bag

### 🛡️ Sistema de Defesa

#### Mecânica de Defender:

- **Ação**: Digimon escolhe um aliado para proteger
- **Restrição**: Só pode defender aliados de **nível igual ou inferior**
- **Duração**: Defesa dura **1 turno** (resetada ao passar turno)
- **Custo**: **Gasta a ação do turno**

#### Como Funciona:

1. **Defender**: Jogador seleciona um Digimon e clica em 🛡️ **Defender**
2. **Escolha**: Seleciona um aliado vivo de nível igual ou inferior
3. **Proteção**: Badge aparece no aliado: "🛡️ [Nome do Defensor]"
4. **Interceptação**: Se o aliado for atacado, o defensor intercepta
5. **Batalha**: Ataque é totalmente redirecionado para o defensor
6. **Contra-ataque**: Defensor revida normalmente

#### Regras de Defesa:

- ✅ Apenas **um defensor** por Digimon
- ✅ Não pode defender quem **já está sendo defendido**
- ✅ Defensor recebe **todo o dano** do ataque
- ✅ Cálculo de tipo usa **defensor vs atacante**
- ✅ Defesa é removida após **interceptar um ataque**
- ✅ Defesa é removida se o **defendido evoluir**
- ✅ Defesa expira ao **passar o turno** do defensor

#### Estratégia:

- Use para proteger Digimons fracos ou de alto valor
- Digimons fortes podem defender múltiplos aliados em turnos consecutivos
- Cuidado: defender gasta sua ação, impedindo ataque/exploração

### 💢 Sistema de Provocar

#### Mecânica de Provocar:

- **Ação**: Digimon provoca um inimigo, forçando-o a atacar apenas o provocador
- **Requisito**: Apenas **Level 2+** pode provocar
- **Cooldown**: **3 turnos** entre provocações do mesmo Digimon
- **Custo**: **Gasta a ação do turno**

#### Como Funciona:

1. **Provocar**: Jogador seleciona um Digimon Level 2+ e clica em 💢 **Provocar**
2. **Escolha**: Seleciona um inimigo vivo
3. **Efeito**: Inimigo provocado só pode atacar o provocador no **próximo turno dele**
4. **Marcação**: Badge aparece indicando quem foi provocado
5. **Duração**: Efeito dura apenas o próximo turno do inimigo provocado
6. **Cooldown**: Provocador não pode provocar novamente por 3 turnos

#### Regras de Provocação:

- ✅ Apenas **Level 2+** pode provocar
- ✅ Cooldown de **3 turnos globais** por Digimon
- ✅ Badge indica turnos restantes no botão (ex: "2T")
- ✅ Botão desabilitado durante cooldown
- ✅ Inimigo provocado **deve atacar** o provocador no próximo turno
- ✅ Se provocador morrer, efeito é cancelado

#### Estratégia:

- Use para controlar o foco de inimigos poderosos
- Proteja aliados fracos forçando inimigos a atacar seu tanque
- Coordene com o sistema de defesa para máxima proteção
- Cuidado: provocar gasta ação e tem cooldown longo

### 👹 Sistema de Bosses

#### Distribuição de Bosses por Nível:

| Nível | Nome       | Bosses | Total | Percentual |
| ----- | ---------- | ------ | ----- | ---------- |
| 1     | Rookie     | 1      | 65    | 1.5%       |
| 2     | Champion   | 5      | 110   | 4.6%       |
| 3     | Ultimate   | 35     | 125   | 28.7%      |
| 4     | Mega       | 37     | 145   | 28.0%      |
| 5     | Ultra      | 12     | 31    | 40.0%      |
| 6     | Super Mega | 3      | 4     | 60.0%      |

**Total: 93 Bosses (19.96% dos Digimons)**

#### Antagonistas das Séries:

Bosses incluem antagonistas principais de todas as séries de Digimon:

- **Adventure**: Devimon, Etemon, Vamdemon, Dark Masters, Apocalymon
- **Adventure 02**: Archnemon, Mummymon, Kimeramon, Daemon, Belial Vamdemon
- **Tamers**: Beelzemon, Megidramon, Vikaralamon (Deva)
- **Frontier**: Cherubimon, Mercurymon, Lucemon
- **Data Squad**: Belphemon, Craniummon, Sleipmon

#### Sistema de Drops:

- Cada boss pode ter múltiplos drops configurados
- Cada drop tem **chance individual** (1-100%)
- Drops são itens especiais ou raros
- Sistema é gerenciado pelo painel admin (/biblioteca → Boss Drops)
- Ao derrotar um boss, sistema rola chance para cada drop configurado

### ⏱️ Fluxo de Turno (Implementado)

1. **Início do Turno**: Sistema destaca jogador atual e reseta ações
2. **Seleção de Digimon**: Jogador clica em um Digimon para ver opções
3. **Ações Disponíveis** (cada Digimon age 1x por turno):

   **Ações que GASTAM o turno:**

   - ⚔️ **Atacar**: Escolhe alvo inimigo e realiza combate (sem volta!)
   - 🛡️ **Defender**: Protege um aliado de nível igual ou inferior
   - 💢 **Provocar**: Força inimigo a atacar apenas você (Level 2+, cooldown 3 turnos)
   - 💰 **Explorar**: Rola D20 para ganhar itens/loot
   - 😴 **Descansar**: Recupera 20% do HP máximo
   - 🎒 **Usar Item**: Aplica efeito de item da bag compartilhada

   **Ações que NÃO gastam o turno:**

   - ✨ **Evoluir**: Se tiver XP 100% (badge dourado aparece)
   - 🎒 **Bag**: Abrir inventário compartilhado (pode descartar itens)
   - 🗑️ **Descartar Item**: Remove item da bag compartilhada

4. **Múltiplas Ações**: Jogador age com cada Digimon (1 ação cada)
5. **Fim do Turno**: Clica em "Finalizar Turno"
6. **Reset**: Defesas expiram, ações resetam, cooldowns reduzem
7. **Próximo Jogador**: Sistema passa automaticamente

#### Regras de Ação:

- ✅ Cada Digimon age **1 vez por turno**
- ✅ Badge ⏸️ indica que Digimon já agiu
- ✅ Não pode usar itens, defender ou provocar após agir
- ✅ **Atacar não tem volta** - pense bem antes de selecionar o alvo!
- ✅ Provocar tem **cooldown de 3 turnos** e só funciona Level 2+
- ✅ Bag é **compartilhada** entre todos os Digimons da equipe

### 🗺️ Tabuleiro (Planejado)

```
🏠 = Base do Jogador
🎯 = Casa de Captura (50% chance de item)
💀 = Área Central (80% chance + eventos)
▫️ = Casa Normal (20% chance)

Grid Hexagonal 12x12:
- 6 bases nos cantos (jogadores 1-6)
- 8 casas de captura espalhadas
- 1 área central de alto risco/recompensa
- Sistema de movimento baseado em adjacência
```

#### Sistema de Movimento (a implementar):

- **Movimento Base**: Nível do Digimon + 1 casas por turno
- **Custo**: 1 movimento por casa hexagonal
- **Limite**: Não pode atravessar outros Digimons

#### Mecânica de Casas Especiais (a implementar):

- Ao terminar movimento em casa especial, rolar D100
- Comparar com chance da casa
- Se sucesso, sacar carta do Deck do Mundo

### 🔄 Sistema de Cura Passiva (a implementar)

- Digimon que **não se move nem ataca** no turno cura
- **Cura**: 20% do HP máximo
- **Cálculo**: `Cura = HP Máximo × 0.2` (arredondado para cima)

#### Exemplos:

- Agumon (3000 HP): 600 HP/turno
- Greymon (5000 HP): 1000 HP/turno
- WarGreymon (12000 HP): 2400 HP/turno

### 🏠 Sistema de Controle de Base (a implementar)

#### Ocupação de Base Inimiga:

- Digimon move-se para base inimiga
- Enquanto ocupada:
  - Dono **não pode eclodir** novos Digimons
  - Digimons eliminados são **removidos permanentemente**

#### Liberação de Base:

- Dono move Digimon próprio para sua base
- Derrota o ocupante em combate
- Base é liberada imediatamente

### 🥚 Sistema de Eclosão (a implementar)

#### Para Chocar Novo Digimon:

1. Escolher espaço vazio **adjacente à sua base**
2. Rolar **D10**
3. **8, 9 ou 10** = Sucesso (30% de chance)
4. Novo Digimon entra como **Nível 3 (Rookie)** aleatório

---

## 🛠️ Tecnologias

### Frontend

- **Next.js 15.5.4** - Framework React com App Router
- **React 19.1.0** - Biblioteca UI
- **TailwindCSS 4** - Estilização
- **TypeScript 5** - Tipagem estática
- **Material-UI** - Componentes UI
- **Notistack** - Notificações toast

### Backend/Database

- **Better-SQLite3** - Banco de dados local (desenvolvimento)
- **JSON Files** - Fallback para produção (Vercel)

### Ferramentas

- **Sharp** - Processamento de imagens
- **React Easy Crop** - Crop de imagens
- **ESLint** - Linting

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**

### Instalação

```bash
# Clone o repositório
git clone https://github.com/felipesantosdd/Digimon-Board-Clash-Assistant.git

# Entre na pasta
cd Digimon-Board-Clash-Assistant

# Instale as dependências
npm install
```

### Configuração do Banco de Dados (Opcional - Desenvolvimento Local)

```bash
# Popular banco de dados com Digimons
npm run seed

# Popular Tamers (avatares)
npm run seed:tamers

# Popular Itens
npm run seed:items

# Popular Bosses
npm run seed:bosses

# Popular Efeitos
npm run seed:effects

# Exportar DB para JSON (para deploy)
npm run export
```

### Executar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📜 Scripts Disponíveis

### Desenvolvimento

- `npm run dev` - Inicia servidor de desenvolvimento (Turbopack)
- `npm run build` - Build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint

### Database

- `npm run seed` - Popula Digimons
- `npm run seed:tamers` - Popula Tamers
- `npm run seed:items` - Popula Itens
- `npm run seed:bosses` - Popula Bosses
- `npm run seed:effects` - Popula Efeitos
- `npm run export` - Exporta DB SQLite para JSON

### Utilitários

- `npm run convert-images` - Converte imagens para WebP
- `npm run cleanup-images` - Remove imagens antigas (PNG/JPG)
- `npm run cleanup-unused` - Remove imagens não referenciadas no banco
- `npm run update-dp` - Atualiza DP por nível
- `npm run lowercase-names` - Normaliza nomes dos Digimons

---

## 📁 Estrutura do Projeto

```
digimon-board-clash/
├── public/
│   └── images/
│       ├── digimons/      # 465 imagens de Digimons (99.79% - WebP otimizado)
│       ├── tamers/        # Avatares dos jogadores
│       ├── items/         # Ícones de itens
│       ├── bosses/        # Imagens de bosses
│       └── icons/         # Ícones de tipos (Data, Vaccine, Virus, etc)
├── src/
│   ├── app/
│   │   ├── api/           # API Routes (REST)
│   │   │   ├── digimons/  # CRUD Digimons + evoluções
│   │   │   ├── items/     # CRUD Itens
│   │   │   ├── tamers/    # CRUD Tamers
│   │   │   ├── bosses/    # CRUD Bosses + drops
│   │   │   └── effects/   # CRUD Efeitos
│   │   ├── components/    # Componentes React
│   │   │   ├── admin/     # Painel administrativo
│   │   │   └── battle/    # Sistema de combate
│   │   ├── game/          # Página principal do jogo
│   │   ├── admin/         # Página admin
│   │   └── digimons/      # Galeria de Digimons
│   ├── lib/
│   │   ├── db.ts              # Conexão SQLite
│   │   ├── json-db.ts         # Fallback JSON
│   │   ├── battle-manager.ts  # Lógica de combate
│   │   ├── effects-manager.ts # Gerenciador de efeitos
│   │   ├── digimon-db.ts      # Queries Digimons
│   │   ├── item-db.ts         # Queries Itens
│   │   ├── boss-db.ts         # Queries Bosses
│   │   └── tamer-db.ts        # Queries Tamers
│   ├── types/
│   │   ├── game.ts        # Tipos do estado do jogo
│   │   ├── item.ts        # Tipos de itens
│   │   ├── effect.ts      # Tipos de efeitos
│   │   └── boss.ts        # Tipos de bosses
│   ├── hooks/
│   │   └── useGameState.ts    # Hook de gerenciamento de estado
│   └── data/              # JSON exportados do DB
│       ├── digimons.json
│       ├── items.json
│       ├── tamers.json
│       ├── bosses.json
│       └── effects.json
├── scripts/               # Scripts de manutenção
│   ├── seed-*.ts         # Scripts de população do banco
│   ├── export-db-to-json.ts        # Exporta SQLite → JSON
│   ├── convert-images-to-webp.ts   # Converte PNG/JPG → WebP
│   ├── cleanup-unused-images.ts    # Remove imagens não referenciadas
│   ├── mark-antagonists-as-bosses.ts  # Marca antagonistas como bosses
│   └── migrate-add-digimon-columns.ts # Migração de schema
├── database.sqlite        # DB local (gitignored)
└── package.json
```

---

## 🛠️ Recursos Administrativos

### Biblioteca (`/biblioteca`)

Acesse a biblioteca completa para visualizar e gerenciar (em dev):

**Nota:** Em produção, apenas visualização está disponível. Em desenvolvimento, todas as funcionalidades de edição estão ativas.

#### 🐉 Digimons Tab

- **Visualizar todos os Digimons** (466 total)
  - 465 ativos (com imagem = 99.79%!) 🎉
  - Apenas 1 inativo (Aegiochusmon: Holy, exibido em cinza)
  - 93 marcados como **Bosses** (badge 👑 BOSS)
- **Adicionar novos Digimons** (apenas dev)
  - Switch Ativo/Inativo
  - Switch Boss/Normal
  - Configuração de evoluções
- **Editar Digimons existentes** (apenas dev)
  - Nome, tipo, nível
  - Status ativo/inativo
  - Status boss
  - Upload e crop de imagem (512x512, WebP 92%)
- **Deletar Digimons** (apenas em dev)
- **Visualizar linha evolutiva completa**
  - Linhas coloridas conectando evoluções
  - Ícones de tipo personalizados
  - Sistema de árvore evolutiva visual
- **Filtros**: Por nome, por nível
- **Organização**: Agrupados automaticamente por nível
- **Badges visuais**: INATIVO, BOSS
- **Modo Produção**: Apenas visualização (botões de edição ocultos)

#### 💎 Items Tab

- Gerenciar itens do jogo
- Criar novos itens com efeitos
- Editar descrições e valores
- Upload de ícones
- Associar efeitos aos itens

#### 👹 Bosses Tab

- Criar e editar bosses
- Configurar DP e tipo do boss
- Associar efeitos especiais
- Upload de imagem
- Gerenciar sistema de drops

#### 🎁 Boss Drops Tab

- Configurar drops por boss
- Definir chance de drop (1-100%)
- Associar itens aos bosses
- Visualizar drops configurados

#### ✨ Effects Tab

- Criar efeitos personalizados
- Tipos: heal, damage, buff, debuff, special, boss
- Configurar valores e descrições
- Sistema de códigos únicos

---

## 📱 Deploy

### Vercel (Recomendado)

O projeto está configurado para deploy automático na Vercel:

1. **Build Process**:

   - Script `export-db-to-json.ts` roda automaticamente antes do build
   - Se `database.sqlite` não existir, usa arquivos JSON versionados
   - Build Next.js com Turbopack

2. **Configurações**:

   - O sistema usa JSON files em produção (sem SQLite)
   - Arquivos JSON são versionados no git (`src/data/*.json`)
   - Imagens são servidas via `public/images/`

3. **Variáveis de Ambiente**:
   - Nenhuma variável necessária (sistema standalone)

### Deploy Manual

```bash
# Build local
npm run build

# Start produção
npm start
```

---

## 🎮 Como Jogar

### Iniciar Partida

1. Acesse a página inicial (`/`)
2. Clique em **"Novo Jogo"**
3. Adicione jogadores (2-6):
   - Digite o nome
   - Escolha um Tamer (avatar)
   - Sistema atribui automaticamente 3 Digimons Rookies
4. Clique em **"Iniciar Jogo"**

### Durante o Jogo

1. **Seu Turno**:

   - Seus cards Digimon ficam destacados
   - Clique em **"⚔️ Atacar"** para iniciar combate
   - Escolha o alvo entre Digimons inimigos
   - Sistema executa combate automaticamente
   - Após combate, verifica chance de evolução

2. **Usar Itens**:

   - Clique no ícone da **mochila** no card do Digimon
   - Selecione o item
   - Clique em **"Usar Item"**
   - Efeito é aplicado imediatamente

3. **Evoluir**:

   - Se Digimon ganhou direito de evolução em combate
   - Ícone de evolução aparece no card
   - Clique para ver 2 opções de evolução
   - Escolha uma evolução
   - HP é restaurado para novo máximo

4. **Finalizar Turno**:
   - Após agir com todos seus Digimons
   - Clique em **"Finalizar Turno"**
   - Próximo jogador recebe o controle

### Vitória

- Jogo termina quando apenas 1 jogador tem Digimons vivos
- Sistema exibe tela de vitória automaticamente

---

## 📊 Valores de Referência

### Probabilidades Implementadas:

- **Evolução Base**: 20%
- **Evolução com 50% HP**: 45%
- **Evolução com 10% HP**: 65%

### Dano por Rolagem (D20):

- **Rolar 1**: 5% do DP (mínimo)
- **Rolar 10**: 50% do DP
- **Rolar 20**: 100% do DP (crítico máximo)
- **Média (rolar 10-11)**: ~52.5% do DP

### Modificadores de Tipo:

- **Vantagem**: ×1.35 (+35%)
- **Desvantagem**: ×0.65 (-35%)
- **Neutro**: ×1.00

---

## 🔮 Roadmap

### Próximas Funcionalidades

- [ ] **Tabuleiro Hexagonal Interativo**

  - Sistema de movimento por casas
  - Regras de adjacência
  - Posicionamento estratégico

- [ ] **Sistema de Eclosão**

  - Criação de novos Digimons durante jogo
  - Rolagem D10 (30% chance)
  - Limite de Digimons por jogador

- [ ] **Controle de Bases**

  - Ocupação de base inimiga
  - Bloqueio de eclosão
  - Eliminação permanente

- [ ] **Cura Passiva**

  - Opção de "Descansar" no turno
  - Recuperação de 20% HP
  - Marcador visual

- [ ] **Deck do Mundo**

  - Casas especiais no tabuleiro
  - Sistema de saque de cartas
  - Eventos globais
  - Catástrofes e Brasões

- [ ] **Combate em Equipe**

  - Múltiplos atacantes
  - Escolha de contra-ataque
  - Coordenação estratégica

- [ ] **Sistema de Ruínas**

  - Eventos de catástrofe
  - Brasões de evolução especial
  - Mecânica de risco/recompensa

- [ ] **Multiplayer Online**
  - Partidas online via WebSockets
  - Matchmaking
  - Chat entre jogadores

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é um fan-game não oficial baseado no universo Digimon. Todos os direitos de Digimon pertencem a Bandai/Toei Animation.

---

## 👥 Autores

- **Felipe Santos** - [GitHub](https://github.com/felipesantosdd)

---

> 🧠 _"A vitória não é apenas sobre força, mas sobre estratégia, timing e adaptação ao caos do mundo digital."_

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão? Abra uma [issue](https://github.com/felipesantosdd/Digimon-Board-Clash-Assistant/issues)!
