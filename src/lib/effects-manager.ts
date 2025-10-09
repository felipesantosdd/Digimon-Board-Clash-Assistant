import { Effect } from "./effects-db";
import { GameDigimon } from "@/types/game";

export class EffectsManager {
  /**
   * Aplica um efeito a um Digimon
   */
  static applyEffect(
    effect: Effect,
    digimon: GameDigimon
  ): {
    digimon: GameDigimon;
    message: string;
  } {
    const updatedDigimon = { ...digimon };
    let message = "";

    switch (effect.type) {
      case "heal":
        // Curar HP
        const healAmount = effect.value;
        const newHp = Math.min(digimon.dp, digimon.currentHp + healAmount);
        const actualHeal = newHp - digimon.currentHp;
        updatedDigimon.currentHp = newHp;
        message = `${
          digimon.name
        } recuperou ${actualHeal.toLocaleString()} HP!`;
        break;

      case "damage":
        // Causar dano
        const damageAmount = effect.value;
        updatedDigimon.currentHp = Math.max(
          0,
          digimon.currentHp - damageAmount
        );
        message = `${
          digimon.name
        } recebeu ${damageAmount.toLocaleString()} de dano!`;
        break;

      case "buff":
        // Aumentar DP permanentemente
        updatedDigimon.dp += effect.value;
        message = `${
          digimon.name
        } teve seu DP aumentado em ${effect.value.toLocaleString()}!`;
        break;

      case "debuff":
        // Reduzir DP
        updatedDigimon.dp = Math.max(1000, digimon.dp - effect.value);
        message = `${
          digimon.name
        } teve seu DP reduzido em ${effect.value.toLocaleString()}!`;
        break;

      case "special":
        // Efeitos especiais (implementar conforme necessário)
        switch (effect.code) {
          case "instant_evolution":
            updatedDigimon.canEvolve = true;
            message = `${digimon.name} pode evoluir imediatamente!`;
            break;

          case "heal_full":
            updatedDigimon.currentHp = digimon.dp;
            message = `${digimon.name} teve seu HP totalmente restaurado!`;
            break;

          case "revive_half":
            if (digimon.currentHp <= 0) {
              updatedDigimon.currentHp = Math.floor(digimon.dp / 2);
              message = `${digimon.name} foi revivido com metade do HP!`;
            } else {
              message = `${digimon.name} já está vivo!`;
            }
            break;

          default:
            message = `Efeito especial ${effect.name} aplicado!`;
        }
        break;

      case "boss":
        // Efeitos de bosses (implementar conforme necessário)
        message = `Efeito de boss ${effect.name} ativado!`;
        break;

      default:
        message = `Efeito ${effect.name} aplicado!`;
    }

    return { digimon: updatedDigimon, message };
  }

  /**
   * Valida se um efeito pode ser aplicado
   */
  static canApplyEffect(effect: Effect, digimon: GameDigimon): boolean {
    // Verificar por tipo
    if (effect.type === "heal") {
      // Só pode curar se não estiver com HP cheio
      return digimon.currentHp < digimon.dp;
    }

    // Verificar por código (efeitos especiais)
    switch (effect.code) {
      case "revive_half":
        // Só pode reviver se estiver morto
        return digimon.currentHp <= 0;

      case "instant_evolution":
        // Só pode evoluir se já não puder evoluir
        return !digimon.canEvolve;

      default:
        return true;
    }
  }

  /**
   * Obtém descrição amigável do efeito
   */
  static getEffectDescription(effect: Effect): string {
    switch (effect.type) {
      case "heal":
        return `Restaura ${effect.value.toLocaleString()} HP`;

      case "damage":
        return `Causa ${effect.value.toLocaleString()} de dano`;

      case "buff":
        return `Aumenta DP em ${effect.value.toLocaleString()}`;

      case "debuff":
        return `Reduz DP em ${effect.value.toLocaleString()}`;

      case "special":
        return effect.description;

      case "boss":
        return `Efeito de boss: ${effect.description}`;

      default:
        return effect.description;
    }
  }

  /**
   * Obtém ícone do tipo de efeito
   */
  static getEffectIcon(type: EffectType): string {
    switch (type) {
      case "heal":
        return "💚";
      case "damage":
        return "💥";
      case "buff":
        return "⬆️";
      case "debuff":
        return "⬇️";
      case "special":
        return "✨";
      case "boss":
        return "👹";
      default:
        return "❓";
    }
  }

  /**
   * Obtém cor do tipo de efeito
   */
  static getEffectColor(type: EffectType): string {
    switch (type) {
      case "heal":
        return "text-green-400";
      case "damage":
        return "text-red-400";
      case "buff":
        return "text-blue-400";
      case "debuff":
        return "text-orange-400";
      case "special":
        return "text-purple-400";
      case "boss":
        return "text-pink-400";
      default:
        return "text-gray-400";
    }
  }
}
