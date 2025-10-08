# 🎒 Sistema de Itens - Digimon Board Clash

## Visão Geral

O sistema de itens permite que cada Digimon carregue itens em seu inventário (bag) que podem ser usados durante as batalhas para obter vantagens estratégicas.

## Estrutura de Dados

### Item

```typescript
interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  effect: string;
}
```

### GameItem

```typescript
interface GameItem extends Item {
  quantity: number; // Quantidade do item na bag
}
```

### GameDigimon (Atualizado)

```typescript
interface GameDigimon {
  // ... campos existentes ...
  bag?: GameItem[]; // Inventário de itens do Digimon
}
```

## Itens Disponíveis

### 1. Poção de Vida

- **Efeito:** `heal_1000`
- **Descrição:** Restaura 1000 HP de um Digimon

### 2. Super Poção

- **Efeito:** `heal_2000`
- **Descrição:** Restaura 2000 HP de um Digimon

### 3. Poção Completa

- **Efeito:** `heal_full`
- **Descrição:** Restaura completamente o HP de um Digimon

### 4. Reviver

- **Efeito:** `revive_half`
- **Descrição:** Revive um Digimon derrotado com metade do HP

### 5. Chip de Força

- **Efeito:** `boost_dp_500`
- **Descrição:** Aumenta permanentemente o DP em 500

### 6. Escudo Digital

- **Efeito:** `shield_turn`
- **Descrição:** Protege de um ataque neste turno

### 7. Cristal de Evolução

- **Efeito:** `instant_evolution`
- **Descrição:** Permite evolução imediata se disponível

### 8. Elixir Mágico

- **Efeito:** `heal_cleanse`
- **Descrição:** Restaura HP e remove debuffs

## API Endpoints

### GET /api/items

Retorna todos os itens disponíveis.

**Resposta:**

```json
[
  {
    "id": 1,
    "name": "Poção de Vida",
    "description": "Restaura 1000 HP de um Digimon",
    "image": "/images/items/potion.png",
    "effect": "heal_1000"
  }
]
```

### GET /api/items/[id]

Retorna um item específico por ID.

**Resposta:**

```json
{
  "id": 1,
  "name": "Poção de Vida",
  "description": "Restaura 1000 HP de um Digimon",
  "image": "/images/items/potion.png",
  "effect": "heal_1000"
}
```

## Arquivos Criados/Modificados

### Novos Arquivos

- `src/types/item.ts` - Tipos TypeScript para itens
- `src/lib/item-db.ts` - Funções de manipulação de itens no banco
- `src/data/items.json` - Dados dos itens em JSON
- `src/app/api/items/route.ts` - API para listar itens
- `src/app/api/items/[id]/route.ts` - API para buscar item por ID
- `scripts/seed-items.ts` - Script para popular tabela de itens
- `public/images/items/fallback.svg` - Imagem fallback para itens

### Arquivos Modificados

- `src/types/game.ts` - Adicionado campo `bag` em GameDigimon
- `src/lib/json-db.ts` - Suporte para tabela de itens
- `src/app/components/GameSetupModal.tsx` - Inicialização de bag vazia
- `src/hooks/useGameState.ts` - Migração automática para adicionar bag
- `scripts/export-db-to-json.ts` - Exportação de itens para JSON
- `package.json` - Adicionado script `seed:items`

## Como Usar

### 1. Popular Tabela de Itens (Desenvolvimento Local)

```bash
npm run seed:items
```

### 2. Exportar para JSON (Build)

```bash
npm run export
```

### 3. Acessar Itens

```typescript
// Buscar todos os itens
const response = await fetch("/api/items");
const items = await response.json();

// Buscar item específico
const response = await fetch("/api/items/1");
const item = await response.json();
```

### 4. Gerenciar Bag do Digimon

```typescript
// Adicionar item à bag
digimon.bag = digimon.bag || [];
digimon.bag.push({
  id: 1,
  name: "Poção de Vida",
  description: "Restaura 1000 HP de um Digimon",
  image: "/images/items/potion.png",
  effect: "heal_1000",
  quantity: 1,
});

// Usar item (remover da bag)
const itemIndex = digimon.bag.findIndex((item) => item.id === itemId);
if (itemIndex !== -1) {
  // Aplicar efeito do item
  applyItemEffect(digimon, digimon.bag[itemIndex]);

  // Remover da bag
  digimon.bag.splice(itemIndex, 1);
}
```

## Implementação de Efeitos

Os efeitos dos itens podem ser implementados da seguinte forma:

```typescript
function applyItemEffect(digimon: GameDigimon, item: GameItem) {
  switch (item.effect) {
    case "heal_1000":
      digimon.currentHp = Math.min(digimon.currentHp + 1000, digimon.dp);
      break;
    case "heal_2000":
      digimon.currentHp = Math.min(digimon.currentHp + 2000, digimon.dp);
      break;
    case "heal_full":
      digimon.currentHp = digimon.dp;
      break;
    case "revive_half":
      if (digimon.currentHp === 0) {
        digimon.currentHp = Math.floor(digimon.dp / 2);
      }
      break;
    case "boost_dp_500":
      digimon.dp += 500;
      digimon.currentHp += 500;
      break;
    // ... outros efeitos
  }
}
```

## Próximos Passos

1. Criar UI para visualizar e usar itens da bag
2. Implementar sistema de drop/compra de itens
3. Adicionar animações ao usar itens
4. Criar sistema de raridade de itens
5. Adicionar mais tipos de itens (buffs, debuffs, etc.)
