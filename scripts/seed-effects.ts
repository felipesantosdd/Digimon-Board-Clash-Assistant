import db from "../src/lib/db";

try {
  console.log("✨ Iniciando seed de Efeitos...");

  // Limpar dados existentes
  db.prepare("DELETE FROM effects").run();

  console.log("✅ Dados antigos limpos");

  // Efeitos de Cura (Heal)
  const healEffects = [
    {
      name: "Cura Pequena",
      description: "Restaura 1000 HP",
      code: "heal_1000",
      type: "heal",
      value: 1000,
    },
    {
      name: "Cura Média",
      description: "Restaura 2000 HP",
      code: "heal_2000",
      type: "heal",
      value: 2000,
    },
    {
      name: "Cura Grande",
      description: "Restaura 5000 HP",
      code: "heal_5000",
      type: "heal",
      value: 5000,
    },
  ];

  // Efeitos de Dano (Damage)
  const damageEffects = [
    {
      name: "Dano Pequeno",
      description: "Causa 500 de dano",
      code: "damage_500",
      type: "damage",
      value: 500,
    },
    {
      name: "Dano Médio",
      description: "Causa 1000 de dano",
      code: "damage_1000",
      type: "damage",
      value: 1000,
    },
  ];

  // Efeitos de Buff
  const buffEffects = [
    {
      name: "Força Aumentada",
      description: "Aumenta DP em 500 permanentemente",
      code: "boost_dp_500",
      type: "buff",
      value: 500,
    },
    {
      name: "Poder Máximo",
      description: "Aumenta DP em 1000 permanentemente",
      code: "boost_dp_1000",
      type: "buff",
      value: 1000,
    },
  ];

  // Efeitos Especiais
  const specialEffects = [
    {
      name: "Cura Completa",
      description: "Restaura HP ao máximo",
      code: "heal_full",
      type: "special",
      value: 0,
    },
    {
      name: "Reviver",
      description: "Revive com metade do HP",
      code: "revive_half",
      type: "special",
      value: 0,
    },
    {
      name: "Evolução Instantânea",
      description: "Libera evolução imediatamente",
      code: "instant_evolution",
      type: "special",
      value: 0,
    },
    {
      name: "Escudo Digital",
      description: "Protege de um ataque neste turno",
      code: "shield_turn",
      type: "special",
      value: 0,
    },
    {
      name: "Limpeza",
      description: "Remove todos os debuffs",
      code: "heal_cleanse",
      type: "special",
      value: 0,
    },
  ];

  // Efeitos de Boss
  const bossEffects = [
    {
      name: "Aura Sombria",
      description: "Aumenta dano causado em 20%",
      code: "boss_dark_aura",
      type: "boss",
      value: 20,
    },
    {
      name: "Dreno Vampírico",
      description: "Absorve 30% do dano causado como HP",
      code: "boss_vampire_drain",
      type: "boss",
      value: 30,
    },
    {
      name: "Fúria Oceânica",
      description: "Causa dano em área a todos os inimigos",
      code: "boss_ocean_fury",
      type: "boss",
      value: 0,
    },
    {
      name: "Regeneração",
      description: "Recupera 5% do HP máximo a cada turno",
      code: "boss_regeneration",
      type: "boss",
      value: 5,
    },
  ];

  const allEffects = [
    ...healEffects,
    ...damageEffects,
    ...buffEffects,
    ...specialEffects,
    ...bossEffects,
  ];

  for (const effect of allEffects) {
    db.prepare(
      `
      INSERT INTO effects (name, description, code, type, value)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(
      effect.name,
      effect.description,
      effect.code,
      effect.type,
      effect.value
    );
  }

  console.log(`✅ ${allEffects.length} efeitos criados`);

  // Verificar resultado
  const totalEffects = db
    .prepare("SELECT COUNT(*) as count FROM effects")
    .get() as { count: number };

  const effectsByType = db
    .prepare("SELECT type, COUNT(*) as count FROM effects GROUP BY type")
    .all() as { type: string; count: number }[];

  console.log("📊 Resumo:");
  console.log(`   - ${totalEffects.count} efeitos totais`);
  effectsByType.forEach((row) => {
    console.log(`   - ${row.count} efeitos do tipo "${row.type}"`);
  });

  console.log("🎉 Seed de efeitos concluído com sucesso!");

  process.exit(0);
} catch (error) {
  console.error("❌ Erro ao fazer seed de efeitos:", error);
  process.exit(1);
}
