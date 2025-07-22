/**
 * ===========================================
 * SKILLS DATA DEFINITIONS
 * ===========================================
 * All skill definitions, triggers, and effects
 */

const SKILLS_DATA = {
    // === GUARDIAN SKILLS ===
    shield_bash: {
        name: 'Shield Bash',
        description: 'Powerful strike that stuns enemies and reduces incoming damage',
        type: 'combat_defensive',
        trigger: 'ally_critical_damage',
        baseChance: 15,
        statModifier: 'might',
        cooldown: 3,
        manaCost: 10,
        effect: 'Stuns enemy for 1 turn and reduces damage by 30%',
        damageMultiplier: 1.5,
        statusEffects: ['stun'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['shield_slam', 'fortress_stance']
    },

    taunt: {
        name: 'Taunt',
        description: 'Forces enemies to target the Guardian, protecting allies',
        type: 'combat_control',
        trigger: 'ally_targeted',
        baseChance: 30,
        statModifier: 'spirit',
        cooldown: 3,
        manaCost: 5,
        effect: 'Forces all enemies to target caster for 2 rounds',
        damageMultiplier: 0,
        statusEffects: ['provoke'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['intimidating_presence', 'guardian_aura']
    },

    guard_stance: {
        name: 'Guard Stance',
        description: 'Defensive posture that significantly reduces party damage',
        type: 'combat_defensive',
        trigger: 'party_health_low',
        baseChance: 35,
        statModifier: 'endurance',
        cooldown: 5,
        manaCost: 15,
        effect: 'Reduces all party damage by 40% for 3 rounds',
        damageMultiplier: 0,
        statusEffects: ['damage_reduction'],
        schoolOfMagic: null,
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['fortress_wall', 'aegis_protection']
    },

    // === CLERIC SKILLS ===
    healing_word: {
        name: 'Healing Word',
        description: 'Swift healing magic that mends wounds instantly',
        type: 'support_healing',
        trigger: 'ally_low_hp',
        baseChance: 20,
        statModifier: 'spirit',
        cooldown: 2,
        manaCost: 20,
        effect: 'Heals ally for 30-50 HP based on Spirit stat',
        damageMultiplier: 0,
        statusEffects: ['healing'],
        schoolOfMagic: 'divine',
        rarity: 'common',
        prerequisites: [],
        upgrades: ['greater_heal', 'mass_healing']
    },

    blessing: {
        name: 'Blessing',
        description: 'Divine magic that enhances party capabilities',
        type: 'support_buff',
        trigger: 'combat_start',
        baseChance: 40,
        statModifier: 'spirit',
        cooldown: 0,
        manaCost: 25,
        effect: 'Increases all party stats by 15% for entire combat',
        damageMultiplier: 0,
        statusEffects: ['blessed'],
        schoolOfMagic: 'divine',
        rarity: 'common',
        prerequisites: [],
        upgrades: ['greater_blessing', 'divine_favor']
    },

    turn_undead: {
        name: 'Turn Undead',
        description: 'Holy power that repels undead creatures',
        type: 'combat_control',
        trigger: 'undead_enemy',
        baseChance: 30,
        statModifier: 'spirit',
        cooldown: 3,
        manaCost: 30,
        effect: 'Forces undead enemies to flee or take massive damage',
        damageMultiplier: 3.0,
        statusEffects: ['fear', 'holy_damage'],
        schoolOfMagic: 'divine',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['consecration', 'holy_wrath']
    },

    // === ROGUE SKILLS ===
    backstab: {
        name: 'Backstab',
        description: 'Devastating attack from advantageous position',
        type: 'combat_offensive',
        trigger: 'enemy_distracted',
        baseChance: 25,
        statModifier: 'agility',
        cooldown: 4,
        manaCost: 0,
        effect: 'Deal 2.5x damage from behind or when enemy is stunned',
        damageMultiplier: 2.5,
        statusEffects: ['bleeding'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['assassinate', 'shadow_strike']
    },

    lockpicking: {
        name: 'Lockpicking',
        description: 'Opens secured containers and passages',
        type: 'exploration_utility',
        trigger: 'locked_door',
        baseChance: 35,
        statModifier: 'agility',
        cooldown: 0,
        manaCost: 0,
        effect: 'Grants access to locked areas and hidden treasures',
        damageMultiplier: 0,
        statusEffects: [],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['master_thief', 'trap_expertise']
    },

    dodge_roll: {
        name: 'Dodge Roll',
        description: 'Agile maneuver to avoid incoming attacks',
        type: 'combat_defensive',
        trigger: 'incoming_attack',
        baseChance: 20,
        statModifier: 'agility',
        cooldown: 2,
        manaCost: 5,
        effect: 'Completely avoids damage from next attack',
        damageMultiplier: 0,
        statusEffects: ['evasion'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['shadow_step', 'acrobatic_defense']
    },

    // === MAGE SKILLS ===
    fireball: {
        name: 'Fireball',
        description: 'Explosive spell that damages multiple enemies',
        type: 'combat_offensive',
        trigger: 'enemies_clustered',
        baseChance: 10,
        statModifier: 'mind',
        cooldown: 5,
        manaCost: 40,
        effect: 'AoE fire damage to all enemies, chance to burn',
        damageMultiplier: 2.0,
        statusEffects: ['burning'],
        schoolOfMagic: 'evocation',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['meteor', 'inferno']
    },

    magic_missile: {
        name: 'Magic Missile',
        description: 'Reliable force projectile that never misses',
        type: 'combat_offensive',
        trigger: 'combat_round',
        baseChance: 50,
        statModifier: 'mind',
        cooldown: 1,
        manaCost: 15,
        effect: 'Guaranteed magical damage to single target',
        damageMultiplier: 1.2,
        statusEffects: [],
        schoolOfMagic: 'evocation',
        rarity: 'common',
        prerequisites: [],
        upgrades: ['arcane_orb', 'seeking_missile']
    },

    arcane_shield: {
        name: 'Arcane Shield',
        description: 'Magical barrier that absorbs incoming damage',
        type: 'combat_defensive',
        trigger: 'taking_damage',
        baseChance: 25,
        statModifier: 'mind',
        cooldown: 4,
        manaCost: 25,
        effect: 'Creates shield that absorbs 50% of next 3 attacks',
        damageMultiplier: 0,
        statusEffects: ['magic_shield'],
        schoolOfMagic: 'abjuration',
        rarity: 'common',
        prerequisites: [],
        upgrades: ['greater_shield', 'spell_turning']
    },

    // === RANGER SKILLS ===
    precise_shot: {
        name: 'Precise Shot',
        description: 'Carefully aimed attack with high accuracy and damage',
        type: 'combat_offensive',
        trigger: 'enemy_high_hp',
        baseChance: 35,
        statModifier: 'agility',
        cooldown: 3,
        manaCost: 10,
        effect: 'High accuracy attack with +50% critical hit chance',
        damageMultiplier: 1.8,
        statusEffects: ['marked'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['hunters_mark', 'explosive_shot']
    },

    animal_companion: {
        name: 'Animal Companion',
        description: 'Summon a creature ally to assist in battle',
        type: 'combat_summon',
        trigger: 'combat_start',
        baseChance: 25,
        statModifier: 'spirit',
        cooldown: 6,
        manaCost: 35,
        effect: 'Summons wolf companion that attacks each round',
        damageMultiplier: 1.0,
        statusEffects: ['companion'],
        schoolOfMagic: 'nature',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['dire_wolf', 'pack_leader']
    },

    nature_sense: {
        name: 'Nature Sense',
        description: 'Detect environmental hazards and hidden opportunities',
        type: 'exploration_utility',
        trigger: 'dungeon_exploration',
        baseChance: 45,
        statModifier: 'mind',
        cooldown: 0,
        manaCost: 0,
        effect: 'Reveals hidden paths, traps, and natural resources',
        damageMultiplier: 0,
        statusEffects: ['nature_awareness'],
        schoolOfMagic: 'nature',
        rarity: 'common',
        prerequisites: [],
        upgrades: ['forest_wisdom', 'elemental_sight']
    },

    // === BERSERKER SKILLS ===
    berserker_rage: {
        name: 'Berserker Rage',
        description: 'Enter a frenzy that increases damage but reduces defense',
        type: 'combat_buff',
        trigger: 'low_health',
        baseChance: 40,
        statModifier: 'might',
        cooldown: 5,
        manaCost: 0,
        effect: '+100% damage, -50% defense for 4 rounds',
        damageMultiplier: 2.0,
        statusEffects: ['rage', 'vulnerable'],
        schoolOfMagic: null,
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['blood_frenzy', 'unstoppable_force']
    },

    reckless_attack: {
        name: 'Reckless Attack',
        description: 'All-out assault with no regard for defense',
        type: 'combat_offensive',
        trigger: 'enemy_low_hp',
        baseChance: 30,
        statModifier: 'might',
        cooldown: 2,
        manaCost: 0,
        effect: 'Deal massive damage but take counter-attack damage',
        damageMultiplier: 2.5,
        statusEffects: ['reckless'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['berserker_slam', 'wild_swing']
    },

    intimidate: {
        name: 'Intimidate',
        description: 'Terrify enemies with fierce presence',
        type: 'combat_control',
        trigger: 'combat_start',
        baseChance: 35,
        statModifier: 'might',
        cooldown: 4,
        manaCost: 0,
        effect: 'Reduces enemy accuracy and damage for 3 rounds',
        damageMultiplier: 0,
        statusEffects: ['fear', 'demoralized'],
        schoolOfMagic: null,
        rarity: 'common',
        prerequisites: [],
        upgrades: ['terrifying_roar', 'battle_fury']
    },

    // === PALADIN SKILLS ===
    holy_strike: {
        name: 'Holy Strike',
        description: 'Weapon attack blessed with divine energy',
        type: 'combat_offensive',
        trigger: 'evil_enemy',
        baseChance: 30,
        statModifier: 'spirit',
        cooldown: 3,
        manaCost: 20,
        effect: 'Physical + holy damage, extra effective vs undead/demons',
        damageMultiplier: 2.0,
        statusEffects: ['holy_damage'],
        schoolOfMagic: 'divine',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['smite', 'divine_wrath']
    },

    divine_protection: {
        name: 'Divine Protection',
        description: 'Holy shield that protects the entire party',
        type: 'support_defensive',
        trigger: 'party_danger',
        baseChance: 25,
        statModifier: 'spirit',
        cooldown: 6,
        manaCost: 40,
        effect: 'Grants damage resistance and status immunity to party',
        damageMultiplier: 0,
        statusEffects: ['blessed', 'protected'],
        schoolOfMagic: 'divine',
        rarity: 'rare',
        prerequisites: ['blessing'],
        upgrades: ['sanctuary', 'divine_intervention']
    },

    consecrate: {
        name: 'Consecrate',
        description: 'Bless the battlefield with holy energy',
        type: 'environmental',
        trigger: 'unholy_ground',
        baseChance: 20,
        statModifier: 'spirit',
        cooldown: 8,
        manaCost: 50,
        effect: 'Creates holy ground that heals allies and harms undead',
        damageMultiplier: 1.5,
        statusEffects: ['consecrated'],
        schoolOfMagic: 'divine',
        rarity: 'rare',
        prerequisites: ['turn_undead'],
        upgrades: ['hallowed_ground', 'divine_domain']
    },

    // === ASSASSIN SKILLS ===
    poison_blade: {
        name: 'Poison Blade',
        description: 'Coat weapon with deadly toxins',
        type: 'combat_offensive',
        trigger: 'successful_hit',
        baseChance: 20,
        statModifier: 'mind',
        cooldown: 4,
        manaCost: 15,
        effect: 'Attacks inflict poison damage over time',
        damageMultiplier: 1.2,
        statusEffects: ['poisoned', 'weakened'],
        schoolOfMagic: 'alchemy',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['lethal_poison', 'paralytic_toxin']
    },

    shadow_step: {
        name: 'Shadow Step',
        description: 'Teleport through shadows to strike enemies',
        type: 'combat_mobility',
        trigger: 'positioning',
        baseChance: 25,
        statModifier: 'agility',
        cooldown: 3,
        manaCost: 20,
        effect: 'Teleport behind enemy for guaranteed backstab',
        damageMultiplier: 2.0,
        statusEffects: ['shadow'],
        schoolOfMagic: 'shadow',
        rarity: 'rare',
        prerequisites: ['dodge_roll'],
        upgrades: ['shadow_clone', 'umbral_form']
    },

    stealth: {
        name: 'Stealth',
        description: 'Become invisible to avoid detection',
        type: 'utility_stealth',
        trigger: 'exploration',
        baseChance: 40,
        statModifier: 'agility',
        cooldown: 5,
        manaCost: 25,
        effect: 'Invisible for 3 turns, next attack is critical',
        damageMultiplier: 0,
        statusEffects: ['invisible'],
        schoolOfMagic: 'shadow',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['greater_invisibility', 'shadow_mastery']
    },

    // === BATTLEMAGE SKILLS ===
    flame_weapon: {
        name: 'Flame Weapon',
        description: 'Enchant weapons with elemental fire',
        type: 'combat_enchantment',
        trigger: 'weapon_attack',
        baseChance: 35,
        statModifier: 'mind',
        cooldown: 4,
        manaCost: 30,
        effect: 'Weapon attacks deal additional fire damage',
        damageMultiplier: 1.5,
        statusEffects: ['flaming_weapon'],
        schoolOfMagic: 'enchantment',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['frost_weapon', 'shocking_weapon']
    },

    spell_strike: {
        name: 'Spell Strike',
        description: 'Channel spells through weapon attacks',
        type: 'combat_hybrid',
        trigger: 'melee_attack',
        baseChance: 25,
        statModifier: 'mind',
        cooldown: 3,
        manaCost: 25,
        effect: 'Melee attacks trigger random spell effects',
        damageMultiplier: 1.8,
        statusEffects: ['spell_charged'],
        schoolOfMagic: 'enchantment',
        rarity: 'rare',
        prerequisites: ['flame_weapon'],
        upgrades: ['spell_burst', 'arcane_warrior']
    },

    mana_burn: {
        name: 'Mana Burn',
        description: 'Destroy enemy magical energy',
        type: 'combat_control',
        trigger: 'enemy_casting',
        baseChance: 30,
        statModifier: 'mind',
        cooldown: 4,
        manaCost: 35,
        effect: 'Drains enemy mana and deals damage based on mana destroyed',
        damageMultiplier: 1.0,
        statusEffects: ['mana_drained'],
        schoolOfMagic: 'abjuration',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['spell_steal', 'arcane_disruption']
    },

    // === NECROMANCER SKILLS ===
    raise_skeleton: {
        name: 'Raise Skeleton',
        description: 'Animate bones to fight as undead minions',
        type: 'combat_summon',
        trigger: 'ally_death',
        baseChance: 30,
        statModifier: 'mind',
        cooldown: 5,
        manaCost: 40,
        effect: 'Summons skeleton warrior from corpses',
        damageMultiplier: 1.0,
        statusEffects: ['undead_minion'],
        schoolOfMagic: 'necromancy',
        rarity: 'rare',
        prerequisites: [],
        upgrades: ['skeleton_army', 'bone_lord']
    },

    drain_life: {
        name: 'Drain Life',
        description: 'Steal life force from enemies to heal self',
        type: 'combat_vampiric',
        trigger: 'low_health',
        baseChance: 25,
        statModifier: 'mind',
        cooldown: 3,
        manaCost: 30,
        effect: 'Damages enemy and heals caster for 50% of damage dealt',
        damageMultiplier: 1.5,
        statusEffects: ['life_drain'],
        schoolOfMagic: 'necromancy',
        rarity: 'uncommon',
        prerequisites: [],
        upgrades: ['soul_harvest', 'vampiric_aura']
    },

    death_magic: {
        name: 'Death Magic',
        description: 'Channel the raw power of death itself',
        type: 'combat_offensive',
        trigger: 'enemy_wounded',
        baseChance: 20,
        statModifier: 'mind',
        cooldown: 6,
        manaCost: 50,
        effect: 'Instant kill chance based on enemy missing health',
        damageMultiplier: 3.0,
        statusEffects: ['death_mark'],
        schoolOfMagic: 'necromancy',
        rarity: 'legendary',
        prerequisites: ['drain_life'],
        upgrades: ['finger_of_death', 'soul_reaper']
    }
};

// Skill categories for organization
const SKILL_CATEGORIES = {
    combat_offensive: 'Combat - Offensive',
    combat_defensive: 'Combat - Defensive', 
    combat_control: 'Combat - Control',
    combat_buff: 'Combat - Buff',
    combat_summon: 'Combat - Summon',
    combat_hybrid: 'Combat - Hybrid',
    support_healing: 'Support - Healing',
    support_buff: 'Support - Buff',
    support_defensive: 'Support - Defensive',
    exploration_utility: 'Exploration - Utility',
    utility_stealth: 'Utility - Stealth',
    environmental: 'Environmental'
};

// Schools of magic
const MAGIC_SCHOOLS = {
    divine: { name: 'Divine', color: '#ffd700', description: 'Holy magic of light and healing' },
    evocation: { name: 'Evocation', color: '#ff6b6b', description: 'Raw magical energy and destruction' },
    abjuration: { name: 'Abjuration', color: '#74c0fc', description: 'Protective and defensive magic' },
    nature: { name: 'Nature', color: '#51cf66', description: 'Magic of the natural world' },
    shadow: { name: 'Shadow', color: '#9775fa', description: 'Dark magic of stealth and deception' },
    enchantment: { name: 'Enchantment', color: '#ffd43b', description: 'Magic that enhances and modifies' },
    necromancy: { name: 'Necromancy', color: '#212529', description: 'Forbidden magic of death and undeath' },
    alchemy: { name: 'Alchemy', color: '#20c997', description: 'Chemical and toxin-based magic' }
};

// Rarity levels
const SKILL_RARITIES = {
    common: { name: 'Common', color: '#868e96', dropChance: 0.6 },
    uncommon: { name: 'Uncommon', color: '#51cf66', dropChance: 0.25 },
    rare: { name: 'Rare', color: '#339af0', dropChance: 0.12 },
    legendary: { name: 'Legendary', color: '#ff8cc8', dropChance: 0.03 }
};

// Export data
if (typeof window !== 'undefined') {
    window.SKILLS_DATA = SKILLS_DATA;
    window.SKILL_CATEGORIES = SKILL_CATEGORIES;
    window.MAGIC_SCHOOLS = MAGIC_SCHOOLS;
    window.SKILL_RARITIES = SKILL_RARITIES;
    console.log('✅ Skills data loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SKILLS_DATA, 
        SKILL_CATEGORIES, 
        MAGIC_SCHOOLS, 
        SKILL_RARITIES 
    };
};
