/**
 * ===========================================
 * CHARACTER DATA DEFINITIONS
 * ===========================================
 * All character archetypes, stats, and unlock conditions
 */

const CHARACTERS_DATA = {
    guardian: {
        name: 'Guardian',
        archetype: 'Tank',
        description: 'Stalwart defender who protects allies from harm',
        lore: 'Once a knight of the Silver Order, now stands as the last bastion against darkness.',
        aptitudes: { 
            might: 5, 
            agility: 2, 
            mind: 1, 
            spirit: 3, 
            endurance: 5 
        },
        baseStats: { 
            hp: 120, 
            mp: 30 
        },
        skills: ['shield_bash', 'taunt', 'guard_stance'],
        unlocked: true,
        unlockCondition: 'starter',
        startingEquipment: ['iron_sword', 'tower_shield', 'chain_mail'],
        preferredWeapons: ['sword', 'mace', 'shield'],
        growthRates: {
            might: 1.2,
            agility: 0.8,
            mind: 0.6,
            spirit: 1.0,
            endurance: 1.3
        }
    },
    
    cleric: {
        name: 'Cleric',
        archetype: 'Healer',
        description: 'Divine spellcaster focused on healing and support magic',
        lore: 'A devoted servant of the Light, wielding holy magic to mend wounds and purify evil.',
        aptitudes: { 
            might: 2, 
            agility: 2, 
            mind: 4, 
            spirit: 5, 
            endurance: 3 
        },
        baseStats: { 
            hp: 80, 
            mp: 100 
        },
        skills: ['healing_word', 'blessing', 'turn_undead'],
        unlocked: true,
        unlockCondition: 'starter',
        startingEquipment: ['holy_symbol', 'healing_robes', 'prayer_beads'],
        preferredWeapons: ['staff', 'mace', 'holy_symbol'],
        growthRates: {
            might: 0.7,
            agility: 0.8,
            mind: 1.2,
            spirit: 1.3,
            endurance: 1.0
        }
    },
    
    rogue: {
        name: 'Rogue',
        archetype: 'DPS',
        description: 'Swift striker who excels at precision attacks and stealth',
        lore: 'A shadow-walker from the thieves guild, master of blade and lockpick alike.',
        aptitudes: { 
            might: 3, 
            agility: 5, 
            mind: 3, 
            spirit: 2, 
            endurance: 2 
        },
        baseStats: { 
            hp: 70, 
            mp: 50 
        },
        skills: ['backstab', 'lockpicking', 'dodge_roll'],
        unlocked: true,
        unlockCondition: 'starter',
        startingEquipment: ['twin_daggers', 'leather_armor', 'lockpicks'],
        preferredWeapons: ['dagger', 'short_sword', 'bow'],
        growthRates: {
            might: 1.1,
            agility: 1.3,
            mind: 1.0,
            spirit: 0.7,
            endurance: 0.8
        }
    },
    
    mage: {
        name: 'Mage',
        archetype: 'Caster',
        description: 'Master of arcane arts and devastating elemental spells',
        lore: 'A scholar of the mystical arts, wielding the raw forces of magic itself.',
        aptitudes: { 
            might: 1, 
            agility: 2, 
            mind: 5, 
            spirit: 3, 
            endurance: 2 
        },
        baseStats: { 
            hp: 60, 
            mp: 120 
        },
        skills: ['fireball', 'magic_missile', 'arcane_shield'],
        unlocked: true,
        unlockCondition: 'starter',
        startingEquipment: ['wizard_staff', 'spell_tome', 'mana_crystal'],
        preferredWeapons: ['staff', 'wand', 'orb'],
        growthRates: {
            might: 0.6,
            agility: 0.8,
            mind: 1.3,
            spirit: 1.1,
            endurance: 0.7
        }
    },
    
    ranger: {
        name: 'Ranger',
        archetype: 'Hybrid',
        description: 'Versatile warrior with nature magic and ranged expertise',
        lore: 'A guardian of the wild places, equally at home with bow and spell.',
        aptitudes: { 
            might: 3, 
            agility: 4, 
            mind: 2, 
            spirit: 4, 
            endurance: 3 
        },
        baseStats: { 
            hp: 90, 
            mp: 70 
        },
        skills: ['precise_shot', 'animal_companion', 'nature_sense'],
        unlocked: false,
        unlockCondition: 'complete_3_dungeons',
        unlockDescription: 'Complete 3 successful dungeon expeditions',
        startingEquipment: ['longbow', 'leather_armor', 'nature_talisman'],
        preferredWeapons: ['bow', 'spear', 'staff'],
        growthRates: {
            might: 1.0,
            agility: 1.2,
            mind: 0.9,
            spirit: 1.2,
            endurance: 1.0
        }
    },
    
    berserker: {
        name: 'Berserker',
        archetype: 'Glass Cannon',
        description: 'Ferocious warrior who trades defense for overwhelming offense',
        lore: 'A wild fighter from the northern clans, channeling primal rage into devastating attacks.',
        aptitudes: { 
            might: 5, 
            agility: 3, 
            mind: 1, 
            spirit: 2, 
            endurance: 2 
        },
        baseStats: { 
            hp: 100, 
            mp: 20 
        },
        skills: ['berserker_rage', 'reckless_attack', 'intimidate'],
        unlocked: false,
        unlockCondition: 'defeat_boss_low_hp',
        unlockDescription: 'Defeat a boss while a party member has less than 10% HP',
        startingEquipment: ['great_axe', 'fur_armor', 'war_paint'],
        preferredWeapons: ['axe', 'great_sword', 'hammer'],
        growthRates: {
            might: 1.4,
            agility: 1.1,
            mind: 0.5,
            spirit: 0.8,
            endurance: 0.9
        }
    },
    
    paladin: {
        name: 'Paladin',
        archetype: 'Holy Warrior',
        description: 'Righteous champion combining martial prowess with divine magic',
        lore: 'A holy knight sworn to vanquish evil, blessed with both sword and spell.',
        aptitudes: { 
            might: 4, 
            agility: 2, 
            mind: 3, 
            spirit: 5, 
            endurance: 4 
        },
        baseStats: { 
            hp: 110, 
            mp: 80 
        },
        skills: ['holy_strike', 'divine_protection', 'consecrate'],
        unlocked: false,
        unlockCondition: 'max_spirit_might',
        unlockDescription: 'Have a character with maximum Spirit and Might stats',
        startingEquipment: ['blessed_sword', 'holy_armor', 'sacred_shield'],
        preferredWeapons: ['sword', 'hammer', 'shield'],
        growthRates: {
            might: 1.2,
            agility: 0.8,
            mind: 1.0,
            spirit: 1.3,
            endurance: 1.2
        }
    },
    
    assassin: {
        name: 'Assassin',
        archetype: 'Shadow Striker',
        description: 'Master of stealth and poison, striking from the shadows',
        lore: 'A deadly operative trained in the art of silent elimination.',
        aptitudes: { 
            might: 2, 
            agility: 5, 
            mind: 4, 
            spirit: 1, 
            endurance: 1 
        },
        baseStats: { 
            hp: 50, 
            mp: 60 
        },
        skills: ['poison_blade', 'shadow_step', 'stealth'],
        unlocked: false,
        unlockCondition: 'complete_dungeon_no_damage',
        unlockDescription: 'Complete a dungeon expedition without taking damage',
        startingEquipment: ['poisoned_blade', 'shadow_cloak', 'throwing_knives'],
        preferredWeapons: ['dagger', 'dart', 'poison'],
        growthRates: {
            might: 0.8,
            agility: 1.4,
            mind: 1.2,
            spirit: 0.6,
            endurance: 0.5
        }
    },
    
    battlemage: {
        name: 'Battlemage',
        archetype: 'Spellsword',
        description: 'Warrior-mage who blends martial combat with destructive magic',
        lore: 'A rare breed who mastered both blade and spell, weaving magic into combat.',
        aptitudes: { 
            might: 4, 
            agility: 3, 
            mind: 4, 
            spirit: 2, 
            endurance: 3 
        },
        baseStats: { 
            hp: 85, 
            mp: 90 
        },
        skills: ['flame_weapon', 'spell_strike', 'mana_burn'],
        unlocked: false,
        unlockCondition: 'defeat_demon_lieutenant_magic',
        unlockDescription: 'Defeat a Demon Lord lieutenant using primarily magical damage',
        startingEquipment: ['enchanted_blade', 'battle_robes', 'focus_crystal'],
        preferredWeapons: ['sword', 'staff', 'wand'],
        growthRates: {
            might: 1.1,
            agility: 1.0,
            mind: 1.2,
            spirit: 0.9,
            endurance: 1.0
        }
    },
    
    necromancer: {
        name: 'Necromancer',
        archetype: 'Death Mage',
        description: 'Dark spellcaster who commands the forces of death and decay',
        lore: 'One who has gazed into the abyss and returned changed, wielding forbidden arts.',
        aptitudes: { 
            might: 1, 
            agility: 2, 
            mind: 5, 
            spirit: 1, 
            endurance: 2 
        },
        baseStats: { 
            hp: 70, 
            mp: 110 
        },
        skills: ['raise_skeleton', 'drain_life', 'death_magic'],
        unlocked: false,
        unlockCondition: 'survive_party_wipe',
        unlockDescription: 'Survive a party wipe and return as undead (special condition)',
        startingEquipment: ['bone_staff', 'death_shroud', 'soul_gem'],
        preferredWeapons: ['staff', 'dagger', 'orb'],
        growthRates: {
            might: 0.6,
            agility: 0.8,
            mind: 1.3,
            spirit: 0.5,
            endurance: 0.8
        }
    }
};

// Character unlock validation functions
const CHARACTER_UNLOCK_VALIDATORS = {
    complete_3_dungeons: (gameState) => {
        return gameState.combatHistory.filter(combat => combat.victory).length >= 3;
    },
    
    defeat_boss_low_hp: (gameState) => {
        return gameState.combatHistory.some(combat => 
            combat.victory && 
            combat.isBoss && 
            combat.minPartyHealth < 10
        );
    },
    
    max_spirit_might: (gameState) => {
        return gameState.party.some(char => 
            char.stats.spirit >= 100 && char.stats.might >= 100
        );
    },
    
    complete_dungeon_no_damage: (gameState) => {
        return gameState.combatHistory.some(combat => 
            combat.victory && combat.totalDamageTaken === 0
        );
    },
    
    defeat_demon_lieutenant_magic: (gameState) => {
        return gameState.combatHistory.some(combat => 
            combat.victory && 
            combat.enemyType === 'demon_lieutenant' && 
            combat.magicDamagePercent > 70
        );
    },
    
    survive_party_wipe: (gameState) => {
        return gameState.achievements.includes('PARTY_WIPE_SURVIVOR');
    }
};

// Export data
if (typeof window !== 'undefined') {
    window.CHARACTERS_DATA = CHARACTERS_DATA;
    window.CHARACTER_UNLOCK_VALIDATORS = CHARACTER_UNLOCK_VALIDATORS;
    console.log('✅ Characters data loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHARACTERS_DATA, CHARACTER_UNLOCK_VALIDATORS };
}