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
   - Verificação automática de chance de evolução pós-combate

3. **Sistema de Evolução**

   - Evolução baseada em dano recebido (chance aumenta conforme HP baixa)
   - Seleção entre 2 opções de evolução aleatórias
   - Visualização de linha evolutiva completa
   - Evolução instantânea via itens especiais

4. **Sistema de Inventário**

   - Cada Digimon possui uma mochila (bag) de itens
   - Aplicação de efeitos (cura, buff, dano, revive, etc)
   - Sistema de stackable items

5. **Painel Administrativo**

   - Gerenciamento de Digimons (CRUD completo)
   - Gerenciamento de Itens com efeitos
   - Gerenciamento de Bosses e seus drops
   - Gerenciamento de Efeitos do jogo
   - Upload e crop de imagens

6. **Banco de Dados**
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
- **Cura Passiva**: Recuperação automática ao pular turno

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

### 🧬 Sistema de Evolução

#### Chance de Evolução Automática:

- **Ativação**: Após receber dano em combate
- **Chance Base**: 20%
- **Bônus por Dano**: +5% a cada 10% de HP perdido (do HP máximo)
- **Cálculo**: `Chance = 20% + (% de HP perdido ÷ 10) × 5%`

#### Exemplos de Chance:

- 100% HP → 20% de chance
- 50% HP → 45% de chance (20 + 25)
- 10% HP → 65% de chance (20 + 45)

#### Processo de Evolução:

1. Sistema rola D100 e compara com a chance
2. Se sucesso, jogador **puxa 2 cartas** do deck do próximo nível
3. Jogador **escolhe 1** para evoluir
4. Carta não escolhida volta para o **fundo do deck**
5. HP é restaurado para o novo DP máximo

#### Limites de Evolução:

- Evolução natural até **Nível 6 (Mega)**
- Nível 7+ requer **item especial** (Instant Evolution)

#### Evolução Instantânea por Item:

- Item "Instant Evolution" permite evoluir imediatamente
- Segue o mesmo processo de escolha entre 2 cartas
- Ignora restrições de chance

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

#### Sistema de Inventário:

- Cada Digimon possui uma **mochila (bag)**
- Itens são stackable (mesmos itens acumulam quantidade)
- Aplicação de item durante o turno do jogador
- Efeitos são aplicados imediatamente

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

1. **Início do Turno**: Sistema destaca jogador atual
2. **Seleção de Digimon**: Jogador escolhe qual Digimon vai agir
3. **Ação do Digimon**:
   - **Atacar**: Escolhe alvo e realiza combate
   - **Usar Item**: Aplica item da bag
   - **Evoluir**: Se tiver direito a evolução
   - **Passar**: Aguarda próximo turno
4. **Múltiplas Ações**: Jogador pode agir com todos seus Digimons
5. **Fim do Turno**: Clica em "Finalizar Turno"
6. **Próximo Jogador**: Sistema passa para o próximo

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
- `npm run cleanup-images` - Remove imagens antigas
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
