# 🎮 Digimon Board Clash

**Um jogo de tabuleiro estratégico digital inspirado no universo Digimon**

Sistema de gerenciamento e assistente para partidas de Digimon Board Clash, um jogo estratégico para **2 a 6 jogadores** onde cada jogador controla Digimons, evolui durante o jogo, coleta itens e enfrenta bosses e eventos globais, enquanto tenta **aniquilar** todos os Digimons adversários.

---

## 📋 Índice

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

4. **Sistema de Inventário (Bag)**

   - Cada Digimon possui uma mochila (bag) individual
   - **Usar Item**: Aplica efeitos de cura (gasta ação)
   - **Dar Item**: Transfere para aliado (gasta ação)
   - **Descartar Item**: Remove do inventário (não gasta ação)
   - Sistema de stackable items (quantidade)
   - Modal visual mostrando todos os itens

5. **Sistema de Defesa**

   - Digimon pode defender aliados de nível igual ou inferior
   - Defesa dura 1 turno (expira ao passar turno)
   - Ao atacar defendido, ataque é redirecionado para defensor
   - Badge visual mostra quem está protegendo quem
   - Apenas um defensor por Digimon

6. **Painel Administrativo**

   - Gerenciamento de Digimons (CRUD completo)
   - Gerenciamento de Itens com efeitos
   - Gerenciamento de Bosses e seus drops
   - Gerenciamento de Efeitos do jogo
   - Upload e crop de imagens

7. **Banco de Dados**
   - 145+ Digimons cadastrados (níveis 3 a 7)
   - Sistema de tipos e evoluções
   - Itens com efeitos variados
   - Bosses com sistema de drops

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

- Cada jogador recebe **3 Digimons iniciais** de nível 3 (Rookies)
- Cada jogador escolhe um **Tamer** (avatar)
- Cada Digimon possui:
  - **HP = DP** (Digimon Power da carta original)
  - **Ataque = DP** (modificado por dado D20 durante combate)
  - **Tipo Elemental**: Data, Vaccine ou Virus
- **Tabuleiro Hexagonal** (a ser implementado) com bases nos cantos

### 📊 Sistema de Atributos

#### Conversão de Cards para o Jogo:

```
HP Máximo = DP da Carta
Ataque Base = DP da Carta
Dano Real = DP × (D20 × 5%) × Modificador de Tipo
```

#### Tipos e Vantagens:

- **Data** > **Virus** (+35% de dano)
- **Virus** > **Vaccine** (+35% de dano)
- **Vaccine** > **Data** (+35% de dano)
- **Tipo desvantajoso**: -35% de dano
- **Mesmo tipo ou Free/Variable**: sem modificador

#### Escala de Poder por Nível:

- **Nível 3 (Rookie)**: ~3.000 DP
- **Nível 4 (Champion)**: ~5.000 DP
- **Nível 5 (Ultimate)**: ~9.000 DP
- **Nível 6 (Mega)**: ~12.000 DP
- **Nível 7 (Ultra/Super Mega)**: ~15.000+ DP

### ⚔️ Sistema de Combate

#### Mecânica de Combate 1v1:

1. **Seleção**: Atacante escolhe um defensor
2. **Rolagem**: Ambos rolam D20 simultaneamente
3. **Cálculo de Dano**:
   ```
   Dano Base = DP do Atacante × (Dado × 5%)
   Dano Final = Dano Base × Modificador de Tipo
   ```
4. **Aplicação**: Danos são aplicados simultaneamente
5. **Contra-ataque**: Defensor sempre contra-ataca automaticamente
6. **Evolução**: Após combate, sistema verifica chance de evolução

#### Exemplo de Combate:

```
Agumon (Data, 3000 DP) vs Gabumon (Vaccine, 3000 DP)

Agumon rola 15 → 3000 × (15 × 5%) = 2250 dano base
  → 2250 × 0.65 (desvantagem) = 1462 dano final

Gabumon rola 12 → 3000 × (12 × 5%) = 1800 dano base
  → 1800 × 1.35 (vantagem) = 2430 dano final

Resultado:
  Agumon: 3000 - 2430 = 570 HP (19% HP, alta chance de evolução)
  Gabumon: 3000 - 1462 = 1538 HP (51% HP)
```

#### Sistema de Ataque em Equipe (a implementar):

- Múltiplos Digimons podem atacar o mesmo alvo
- **Dano total** = soma do dano de todos os atacantes
- **Contra-ataque**: Defensor escolhe **UM** atacante para contra-atacar

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

#### Itens Disponíveis:

- 💚 **Potion**: Cura 1000 HP
- 💙 **Mega Potion**: Cura 2000 HP
- ✨ **Full Restore**: Cura 100% do HP
- 🔄 **Revive**: Revive com 50% do HP
- ⬆️ **Power Boost**: +500 DP permanente
- 🧬 **Instant Evolution**: Evolui imediatamente

#### Sistema de Inventário (Bag):

- Cada Digimon possui uma **mochila (bag)** individual
- Itens são **stackable** (mesmos itens acumulam quantidade)
- **Acesso**: Clique no Digimon → Botão 🎒 **Bag**

#### Ações com Itens:

1. **✓ Usar Item:**

   - Aplica o efeito no próprio Digimon
   - Remove 1 unidade do item
   - **Gasta a ação do turno**
   - Efeitos disponíveis: cura de HP

2. **🎁 Dar Item:**

   - Transfere 1 unidade para outro Digimon aliado vivo
   - Se o aliado já tem o item, incrementa a quantidade
   - **Gasta a ação do turno**

3. **🗑️ Descartar Item:**
   - Remove o item completamente do inventário
   - **NÃO gasta ação**
   - Útil para liberar espaço

#### Regras de Itens:

- ✅ Só pode usar/dar itens no **seu turno**
- ✅ Só pode usar/dar se o Digimon **ainda não agiu**
- ✅ Usar poção **não reduz XP de evolução**
- ✅ Itens podem ser obtidos via exploração ou drops de bosses

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

### 👹 Sistema de Bosses

#### Características dos Bosses:

- **DP Alto**: Geralmente 2-3x maior que Digimons do mesmo nível
- **Efeito Especial**: Cada boss possui um efeito único
- **Sistema de Drops**: Ao derrotar, chance de dropar itens

#### Sistema de Drops:

- Cada boss pode ter múltiplos drops configurados
- Cada drop tem **chance individual** (1-100%)
- Drops são itens especiais ou raros
- Sistema é gerenciado pelo painel admin

### ⏱️ Fluxo de Turno (Implementado)

1. **Início do Turno**: Sistema destaca jogador atual e reseta ações
2. **Seleção de Digimon**: Jogador clica em um Digimon para ver opções
3. **Ações Disponíveis** (cada Digimon age 1x por turno):

   **Ações que GASTAM o turno:**

   - ⚔️ **Atacar**: Escolhe alvo inimigo e realiza combate (sem volta!)
   - 🛡️ **Defender**: Protege um aliado de nível igual ou inferior
   - 💰 **Explorar**: Rola D20 para ganhar itens/loot (a implementar)
   - 😴 **Descansar**: Recupera 20% do HP máximo
   - ✓ **Usar Item**: Aplica efeito de item do inventário
   - 🎁 **Dar Item**: Transfere item para outro Digimon aliado

   **Ações que NÃO gastam o turno:**

   - ✨ **Evoluir**: Se tiver XP 100% (badge dourado aparece)
   - 🎒 **Bag**: Abrir inventário (pode descartar itens)
   - 🗑️ **Descartar Item**: Remove item do inventário

4. **Múltiplas Ações**: Jogador age com cada Digimon (1 ação cada)
5. **Fim do Turno**: Clica em "Finalizar Turno"
6. **Reset**: Defesas expiram, ações resetam
7. **Próximo Jogador**: Sistema passa automaticamente

#### Regras de Ação:

- ✅ Cada Digimon age **1 vez por turno**
- ✅ Badge ⏸️ indica que Digimon já agiu
- ✅ Não pode usar/dar itens ou defender após agir
- ✅ **Atacar não tem volta** - pense bem antes de selecionar o alvo!

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
│       ├── digimons/      # 145+ imagens de Digimons
│       ├── tamers/        # Avatares dos jogadores
│       ├── items/         # Ícones de itens
│       └── bosses/        # Imagens de bosses
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
│   ├── seed-*.ts         # Scripts de população
│   ├── export-db-to-json.ts
│   └── convert-images-to-webp.ts
├── database.sqlite        # DB local (gitignored)
└── package.json
```

---

## 🛠️ Recursos Administrativos

### Painel Admin (`/admin`)

Acesse o painel administrativo completo para gerenciar:

#### 🐉 Digimons Tab

- Visualizar todos os Digimons (145+)
- Adicionar novos Digimons
- Editar Digimons existentes (nome, DP, tipo, nível)
- Deletar Digimons
- Upload e crop de imagem
- Visualizar linha evolutiva

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
