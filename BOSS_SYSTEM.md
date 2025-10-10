# 🐉 Sistema de Boss - Digimon Board Clash

## 📋 Visão Geral

O sistema de Boss foi **refatorado** para ser **desafiador mas não letal**, separando o HP (resistência) do DP de combate (dano).

---

## ⚖️ Novo Sistema de Balanceamento

### **Fórmulas Principais:**

```typescript
HP do Boss = DP base × 3
DP de Combate = DP base (original)
```

### **Exemplo: Devimon (5.000 DP)**

```json
{
  "name": "Devimon",
  "dp": 5000
}
```

**Quando spawna:**

- ✅ **HP Máximo:** 5.000 × 3 = **15.000 HP** (tanque)
- ✅ **DP de Combate:** **5.000 DP** (para atacar/defender)

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
const maxHp = boss.dp * 3; // HP = triplicado
const calculatedDp = boss.dp; // DP = original
```

**Devimon spawna com:**

- HP: 15.000
- DP de Combate: 5.000

### **3. Combate (Sistema D20)**

#### **Jogador Ataca Boss:**

**Exemplo: Agumon (2.000 DP, Level 2) vs Devimon (5.000 DP)**

**Cenário:**

- Agumon rola: **16** (ataque), **8** (defesa)
- Devimon rola: **10** (ataque), **5** (defesa)

**Cálculo:**

```
AGUMON ATACA:
- Dano Bruto = 2.000 × (16 × 0.05) = 2.000 × 0.80 = 1.600
- Defesa Devimon = 5.000 × (5 × 0.05) = 5.000 × 0.25 = 1.250
- Dano Líquido = max(0, 1.600 - 1.250) = 350
- Com vantagem de tipo (+35%): 350 × 1.35 = 473 dano
✅ Devimon perde 473 HP (14.527 / 15.000)

DEVIMON CONTRA-ATACA:
- Dano Bruto = 5.000 × (10 × 0.05) = 5.000 × 0.50 = 2.500
- Defesa Agumon = 2.000 × (8 × 0.05) = 2.000 × 0.40 = 800
- Dano Líquido = max(0, 2.500 - 800) = 1.700
- Com desvantagem de tipo (-35%): 1.700 × 0.65 = 1.105 dano
💥 Agumon recebe 1.105 de dano (ainda vivo!)
```

### **4. Turno do Mundo (Boss AoE)**

```typescript
const totalDamage = boss.dp * 0.5;
const damagePerDigimon = totalDamage / aliveDigimonsCount;
```

**Devimon (5.000 DP) vs 6 Digimons:**

```
Dano Total = 5.000 × 0.5 = 2.500
Por Digimon = 2.500 / 6 = 417 dano cada
```

💀 **Todos recebem ~417 de dano** (recuperável, não letal)

---

## 📊 Comparação: Antes vs Depois

### **Sistema Antigo (LETAL):**

| Boss    | DP Calculado | HP     | Dano Médio | Resultado   |
| ------- | ------------ | ------ | ---------- | ----------- |
| Devimon | 18.000       | 54.000 | ~12.000    | ☠️ One-shot |

### **Sistema Novo (BALANCEADO):**

| Boss    | DP Combate | HP     | Dano Médio | Resultado     |
| ------- | ---------- | ------ | ---------- | ------------- |
| Devimon | 5.000      | 15.000 | ~1.500     | ✅ Desafiador |

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
   - Boss causa **~1.000-2.000 de dano** por ataque
   - Aguardar momento certo para evoluir

---

## 🔧 Balanceamento de Bosses

### **Recomendações de DP Base:**

| Nível do Grupo      | DP Médio | Boss Ideal (DP) | HP do Boss |
| ------------------- | -------- | --------------- | ---------- |
| Early Game (Lv 2-3) | 2.000    | 2.500           | 7.500      |
| Mid Game (Lv 4-5)   | 6.000    | 7.500           | 22.500     |
| Late Game (Lv 6-7)  | 15.000   | 20.000          | 60.000     |

### **Ajustes Sugeridos:**

```json
[
  {
    "name": "Devimon",
    "dp": 2500, // Ajustado de 5.000 para early game
    "typeId": 3
  },
  {
    "name": "Myotismon",
    "dp": 8000, // Mid game boss
    "typeId": 3
  },
  {
    "name": "MetalSeadramon",
    "dp": 20000, // Late game boss
    "typeId": 1
  }
]
```

---

## 🎯 Vantagens do Novo Sistema

### **1. Previsibilidade**

✅ Boss não mata instantaneamente
✅ Dano é consistente com o DP base

### **2. Escalabilidade**

✅ Boss cresce apenas 3x em HP
✅ Dano permanece proporcional ao DP

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

### **Time: 3 Digimons Level 2 (2.000 DP cada) vs Devimon (5.000 DP, 15.000 HP)**

**Turno 1:**

- Agumon ataca: **473 de dano** ✅
- Devimon HP: 14.527 / 15.000
- Agumon recebe: **1.105 de dano** (sobrevive)

**Turno 2:**

- Gabumon ataca: **520 de dano** ✅
- Devimon HP: 14.007 / 15.000
- Gabumon recebe: **1.200 de dano** (sobrevive)

**Turno 3:**

- Patamon ataca: **380 de dano** ✅
- Devimon HP: 13.627 / 15.000
- Patamon recebe: **900 de dano** (sobrevive)

**Turno 4 (Mundo):**

- Devimon ataca todos: **417 cada** 💥
- Todos sofrem, mas sobrevivem

**Resultado:** Combate longo e estratégico! ✅

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
