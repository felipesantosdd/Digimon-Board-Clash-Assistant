# 🐉 Sistema de Boss - Digimon Board Clash

## 📋 Visão Geral

O sistema de Boss foi **refatorado** para ser **desafiador mas não letal**, separando o HP (resistência) do DP de combate (dano).

---

## ⚖️ Sistema de Balanceamento Atualizado

### **Fórmulas Principais:**

```typescript
HP do Boss = HP original do Digimon (banco de dados)
ATK do Boss = ATK original do Digimon (banco de dados)
DP de Combate = ATK original
```

### **Exemplo: Devimon (Level 2)**

```json
{
  "name": "Devimon",
  "level": 2,
  "hp": 695,
  "atk": 375,
  "def": 200
}
```

**Quando spawna:**

- ✅ **HP Máximo:** **695 HP** (valor original do banco)
- ✅ **ATK de Combate:** **375** (valor original do banco)
- ✅ **DEF:** **200** (valor original do banco)

---

## 🎯 Como Funciona

### **1. Seleção do Boss (Novo Sistema)**

```typescript
// Boss é escolhido pelo DP MAIS PRÓXIMO da média
const averageDp = calculateAverageDp(players);

// Calcula diferença absoluta de cada boss
const difference = Math.abs(boss.dp - averageDp);

// Pega o(s) boss(es) com menor diferença
// Se empate, sorteia aleatoriamente
```

**Exemplo 1: Sem empate**

- **DP médio:** 2.000
- **Bosses disponíveis:** Devimon (5k), Myotismon (8k), MetalSeadramon (12k)
- **Diferenças:** [3k, 6k, 10k]
- **Selecionado:** ✅ **Devimon (5k)** - menor diferença (3k)

**Exemplo 2: Com empate**

- **DP médio:** 5.000
- **Bosses disponíveis:** Boss A (3k), Boss B (7k), Boss C (2k), Boss D (8k)
- **Diferenças:** [2k, 2k, 3k, 3k]
- **Candidatos:** Boss A (3k) e Boss B (7k) - ambos com 2k de diferença
- **Selecionado:** 🎲 **Sorteio aleatório** entre A e B

### **2. Criação do Boss**

```typescript
const maxHp = bossDigimon.hp; // HP = valor original do banco
const atk = bossDigimon.atk; // ATK = valor original do banco
const calculatedDp = atk; // DP de combate = ATK
```

**Devimon spawna com:**

- HP: 695 (valor original)
- ATK/DP de Combate: 375 (valor original)
- DEF: 200 (valor original)

### **3. Combate (Sistema D20)**

#### **Jogador Ataca Boss:**

**Exemplo: Agumon (2.000 DP, Level 2) vs Devimon (375 ATK, 200 DEF)**

**Cenário:**

- Agumon rola: **16** (ataque), **8** (defesa)
- Devimon rola: **10** (ataque), **5** (defesa)

**Cálculo:**

```
AGUMON ATACA:
- Dano Bruto = 2.000 × (16 × 0.05) = 2.000 × 0.80 = 1.600
- Defesa Devimon = 375 × (5 × 0.05) + 200 = ~293
- Dano Líquido = max(0, 1.600 - 293) = 1.307
- Com vantagem de tipo (+35%): 1.307 × 1.35 = 1.764 dano
✅ Devimon perde 1.764 HP (ainda forte!)

DEVIMON CONTRA-ATACA:
- Dano Bruto = 375 × (10 × 0.05) = 375 × 0.50 = 187.5
- Defesa Agumon = 2.000 × (8 × 0.05) = 2.000 × 0.40 = 800
- Dano Líquido = max(0, 187.5 - 800) = 0 (bloqueado!)
✅ Agumon bloqueou completamente o ataque (defesa alta!)
```

### **4. Turno do Mundo (Boss AoE)**

```typescript
const totalDamage = boss.atk * 0.5;
const damagePerDigimon = totalDamage / aliveDigimonsCount;
```

**Devimon (375 ATK) vs 6 Digimons:**

```
Dano Total = 375 × 0.5 = 187.5
Por Digimon = 187.5 / 6 = 31 dano cada
```

✅ **Todos recebem ~31 de dano** (dano controlado, não letal)

---

## 📊 Comparação: Antes vs Depois

### **Sistema Antigo (LETAL):**

| Boss    | DP Calculado | HP     | Dano Médio | Resultado   |
| ------- | ------------ | ------ | ---------- | ----------- |
| Devimon | 18.000       | 54.000 | ~12.000    | ☠️ One-shot |

### **Sistema Novo (BALANCEADO):**

| Boss    | ATK/DP Combate | HP  | Dano Médio | Resultado     |
| ------- | -------------- | --- | ---------- | ------------- |
| Devimon | 375            | 695 | ~150-300   | ✅ Balanceado |

---

## 🎮 Estratégias de Combate

### **Para Derrotar um Boss:**

1. **Múltiplos Ataques Coordenados**

   - Boss tem **HP triplicado** (15.000)
   - Precisa de **~10-15 ataques** bem sucedidos

2. **Vantagem de Tipo**

   - **+35% de dano** com vantagem
   - **-35% de dano** com desvantagem

3. **Dados Altos (D20)**

   - **D20 = 20** = Critical Success = dano máximo
   - **D20 = 1** = Critical Fail = dano mínimo

4. **Gerenciamento de HP**
   - Boss causa dano baseado em seu ATK original (varia por boss)
   - Aguardar momento certo para evoluir

---

## 🔧 Balanceamento de Bosses

### **Recomendações de Stats:**

| Nível do Grupo      | DP Médio | Boss Ideal (Level) | HP Boss | ATK Boss |
| ------------------- | -------- | ------------------ | ------- | -------- |
| Early Game (Lv 1-2) | 2.000    | Level 2            | 695-895 | 375-425  |
| Mid Game (Lv 3-4)   | 6.000    | Level 3-4          | 1k-2k   | 500-1k   |
| Late Game (Lv 5-6)  | 15.000   | Level 5-6          | 2k-3k   | 1k-2k    |

### **Exemplos de Bosses (valores do banco):**

```json
[
  {
    "name": "Devimon",
    "level": 2,
    "hp": 695,
    "atk": 375,
    "def": 200,
    "typeId": 3
  },
  {
    "name": "Greymon",
    "level": 2,
    "hp": 895,
    "atk": 425,
    "def": 300,
    "typeId": 2
  },
  {
    "name": "Metal Seadramon",
    "level": 4,
    "hp": 1650,
    "atk": 785,
    "def": 795,
    "typeId": 1
  }
]
```

---

## 🎯 Vantagens do Novo Sistema

### **1. Previsibilidade**

✅ Boss não mata instantaneamente
✅ Dano é consistente com ATK original do Digimon

### **2. Escalabilidade**

✅ Boss usa stats originais balanceados individualmente
✅ Valores de HP e ATK são definidos por level no banco de dados

### **3. Estratégia**

✅ Requer planejamento de equipe
✅ Vantagem de tipo importa
✅ Timing de evolução é crucial

### **4. Experiência de Jogo**

✅ Desafiador mas justo
✅ Múltiplos turnos de combate
✅ Sensação de progressão

---

## 💡 Exemplo de Combate Completo

### **Time: 3 Digimons Level 2 (2.000 DP cada) vs Devimon (375 ATK, 695 HP)**

**Turno 1:**

- Agumon ataca: **~300-500 de dano** ✅
- Devimon HP: ~195-395 / 695
- Agumon recebe: **~50-150 de dano** (sobrevive facilmente)

**Turno 2:**

- Gabumon ataca: **~250-450 de dano** ✅
- Devimon HP: derrotado! 💀
- Boss drops: Itens especiais

**Turno de Mundo (se ainda vivo):**

- Devimon ataca todos: **~31 cada** 💥
- Todos sofrem dano mínimo

**Resultado:** Boss balanceado, combate desafiador mas justo! ✅

---

## 📝 Algoritmo de Seleção (Passo a Passo)

```typescript
function selectBoss(averageDp: number) {
  // 1. Buscar todos os bosses
  const allBosses = await fetch("/api/bosses");

  // 2. Calcular diferença de cada um
  const differences = allBosses.map((boss) => ({
    boss,
    diff: Math.abs(boss.dp - averageDp),
  }));

  // 3. Encontrar menor diferença
  const minDiff = Math.min(...differences.map((d) => d.diff));

  // 4. Filtrar bosses com menor diferença
  const candidates = differences
    .filter((d) => d.diff === minDiff)
    .map((d) => d.boss);

  // 5. Sortear aleatoriamente entre candidatos
  return candidates[random(0, candidates.length - 1)];
}
```

### **Exemplos Práticos:**

#### **Cenário 1: Time Fraco**

```
DP Médio: 1.500
Bosses: [Devimon (5k), Myotismon (8k), MetalSeadramon (12k)]
Diferenças: [3.5k, 6.5k, 10.5k]
Resultado: Devimon (5k) ✅
```

#### **Cenário 2: Time Médio**

```
DP Médio: 6.000
Bosses: [Devimon (5k), Myotismon (8k), MetalSeadramon (12k)]
Diferenças: [1k, 2k, 6k]
Resultado: Devimon (5k) ✅
```

#### **Cenário 3: Time Forte**

```
DP Médio: 10.000
Bosses: [Devimon (5k), Myotismon (8k), MetalSeadramon (12k)]
Diferenças: [5k, 2k, 2k]
Candidatos: Myotismon (8k) e MetalSeadramon (12k)
Resultado: Sorteio entre os dois 🎲
```

#### **Cenário 4: Múltiplos Bosses com Mesmo DP**

```
DP Médio: 5.000
Bosses: [BossA (5k), BossB (5k), BossC (10k)]
Diferenças: [0, 0, 5k]
Candidatos: BossA e BossB
Resultado: Sorteio entre A e B 🎲
```

---

## 🚀 Próximos Passos

1. ✅ Testar o novo balanceamento
2. 📝 Ajustar DP dos bosses existentes
3. 🎨 Adicionar mais bosses de níveis variados
4. ⚡ Implementar mecânicas especiais de boss (efeitos únicos)
5. 🔍 Monitorar logs de seleção no console

---

**Última atualização:** 2025-01-10
