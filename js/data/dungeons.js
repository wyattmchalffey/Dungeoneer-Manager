/**
 * ===========================================
 * DUNGEONS & ENEMIES DATA
 * ===========================================
 * All dungeon types, enemy definitions, and encounter data
 */

const DUNGEONS_DATA = {
    training_grounds: {
        name: 'Training Grounds',
        description: 'Safe practice areas for novice adventurers',
        difficulty: 1,
        minLevel: 0,
        maxLevel: 20,
        goldReward: [30, 80],
        materialReward: [5, 15],
        experienceMultiplier: 1.0,
        turnCost: 1,
        environments: ['courtyard', 'practice_hall', 'dummy_room'],
        possibleEnemies: ['training_dummy', 'wooden_golem', 'practice_skeleton'],
        specialRooms: ['equipment_cache', 'training_master'],
        hazards: ['falling_weights', 'training_traps'],
        theme: 'military',
        unlockCondition: 'always_available',
        completionRewards: {
            firstTime: { gold: 50, materials: 10, experience: 100 },
            subsequent: { gold: 25, materials: 5, experience: 50 }
        }
    },

    crystal_caverns: {
        name: 'Crystal Caverns',
        description: 'Glowing caves filled with magical crystals and their guardians',
        difficulty: 2,
        minLevel: 10,
        maxLevel: 40,
        goldReward: [60, 120],
        materialReward: [15, 35],
        experienceMultiplier: 1.2,
        turnCost: 1,
        environments: ['crystal_chamber', 'underground_lake', 'glowing_tunnel'],
        possibleEnemies: ['crystal_spider', 'cave_troll', 'crystal_golem'],
        specialRooms: ['crystal_garden', 'mana_pool', 'geode_chamber'],
        hazards: ['unstable_crystals', 'cave_ins', 'toxic_gas'],
        theme: 'magical',
        unlockCondition: 'complete_training_grounds',
        completionRewards: {
            firstTime: { gold: 100, materials: 25, experience: 200 },
            subsequent: { gold: 50, materials: 15, experience: 100 }
        }
    },

    ancient_library: {
        name: 'Ancient Library',
        description: 'Forgotten repository of knowledge guarded by spectral librarians',
        difficulty: 3,
        minLevel: 20,
        maxLevel: 60,
        goldReward: [40, 90],
        materialReward: [10, 25],
        experienceMultiplier: 1.5,
        turnCost: 1,
        environments: ['reading_room', 'scroll_vault', 'forbidden_section'],
        possibleEnemies: ['spectral_librarian', 'animated_book', 'ink_elemental'],
        specialRooms: ['spell_research', 'skill_tome_vault', 'scribes_chamber'],
        hazards: ['cursed_tomes', 'magical_wards', 'knowledge_overload'],
        theme: 'scholarly',
        unlockCondition: 'complete_crystal_caverns',
        completionRewards: {
            firstTime: { gold: 75, materials: 20, experience: 300, skillBook: true },
            subsequent: { gold: 40, materials: 12, experience: 150 }
        }
    },

    shadow_fortress: {
        name: 'Shadow Fortress',
        description: 'Dark citadel where shadow creatures plot in eternal twilight',
        difficulty: 4,
        minLevel: 35,
        maxLevel: 80,
        goldReward: [80, 160],
        materialReward: [25, 50],
        experienceMultiplier: 1.8,
        turnCost: 2,
        environments: ['shadow_courtyard', 'dark_throne_room', 'nightmare_corridor'],
        possibleEnemies: ['shadow_knight', 'wraith', 'nightmare_spawn'],
        specialRooms: ['shadow_armory', 'void_chamber', 'dark_ritual_site'],
        hazards: ['shadow_traps', 'life_drain_zones', 'madness_inducing_whispers'],
        theme: 'dark',
        unlockCondition: 'complete_ancient_library',
        completionRewards: {
            firstTime: { gold: 150, materials: 40, experience: 500, darkArtifact: true },
            subsequent: { gold: 80, materials: 25, experience: 250 }
        }
    },

    elemental_planes: {
        name: 'Elemental Planes',
        description: 'Chaotic realm where pure elemental forces clash eternally',
        difficulty: 5,
        minLevel: 50,
        maxLevel: 100,
        goldReward: [100, 200],
        materialReward: [30, 60],
        experienceMultiplier: 2.0,
        turnCost: 2,
        environments: ['fire_realm', 'ice_domain', 'storm_nexus', 'earth_core'],
        possibleEnemies: ['fire_elemental', 'frost_giant', 'storm_lord', 'earth_titan'],
        specialRooms: ['elemental_forge', 'primal_energy_core', 'planar_gateway'],
        hazards: ['elemental_storms', 'reality_tears', 'primal_chaos'],
        theme: 'elemental',
        unlockCondition: 'complete_shadow_fortress',
        completionRewards: {
            firstTime: { gold: 200, materials: 60, experience: 800, elementalCore: true },
            subsequent: { gold: 120, materials: 35, experience: 400 }
        }
    },

    demon_lords_dungeon: {
        name: "Demon Lord's Dungeon",
        description: 'The ultimate challenge - face the Demon Lord in his stronghold',
        difficulty: 10,
        minLevel: 80,
        maxLevel: 999,
        goldReward: [500, 1000],
        materialReward: [100, 200],
        experienceMultiplier: 5.0,
        turnCost: 3,
        environments: ['hellish_gateway', 'torture_chambers', 'throne_of_darkness'],
        possibleEnemies: ['demon_lieutenant', 'pit_fiend', 'demon_lord_malphas'],
        specialRooms: ['artifact_vault', 'soul_prison', 'chaos_altar'],
        hazards: ['hellfire_traps', 'soul_draining_aura', 'reality_corruption'],
        theme: 'infernal',
        unlockCondition: 'always_available_final',
        completionRewards: {
            firstTime: { gold: 1000, materials: 200, experience: 2000, legendaryArtifact: true, victory: true },
            subsequent: { gold: 500, materials: 100, experience: 1000 }
        }
    }
};

const ENEMIES_DATA = {
    // === TRAINING GROUND ENEMIES ===
    training_dummy: {
        name: 'Training Dummy',
        type: 'construct',
        difficulty: 1,
        hp: 40,
        maxHP: 40,
        attackPower: 5,
        defense: 2,
        speed: 1,
        abilities: [],
        resistances: ['physical'],
        weaknesses: ['fire'],
        loot: { gold: [5, 15], materials: [1, 3] },
        experienceReward: 20,
        description: 'A sturdy practice target that barely fights back'
    },

    wooden_golem: {
        name: 'Wooden Golem',
        type: 'construct',
        difficulty: 1,
        hp: 60,
        maxHP: 60,
        attackPower: 8,
        defense: 5,
        speed: 2,
        abilities: ['slam'],
        resistances: ['poison'],
        weaknesses: ['fire', 'axe'],
        loot: { gold: [8, 20], materials: [2, 5] },
        experienceReward: 35,
        description: 'Animated training equipment that moves with creaking joints'
    },

    practice_skeleton: {
        name: 'Practice Skeleton',
        type: 'undead',
        difficulty: 1,
        hp: 35,
        maxHP: 35,
        attackPower: 10,
        defense: 1,
        speed: 4,
        abilities: ['bone_throw'],
        resistances: ['poison', 'fear'],
        weaknesses: ['holy', 'blunt'],
        loot: { gold: [6, 18], materials: [1, 4] },
        experienceReward: 30,
        description: 'Reanimated bones used for combat practice'
    },

    // === CRYSTAL CAVERN ENEMIES ===
    crystal_spider: {
        name: 'Crystal Spider',
        type: 'beast',
        difficulty: 2,
        hp: 45,
        maxHP: 45,
        attackPower: 12,
        defense: 3,
        speed: 8,
        abilities: ['web_shot', 'crystal_bite'],
        resistances: ['ice'],
        weaknesses: ['fire', 'sonic'],
        loot: { gold: [12, 25], materials: [3, 8] },
        experienceReward: 50,
        description: 'Arachnid that has adapted to the magical crystal environment'
    },

    cave_troll: {
        name: 'Cave Troll',
        type: 'giant',
        difficulty: 2,
        hp: 120,
        maxHP: 120,
        attackPower: 18,
        defense: 8,
        speed: 3,
        abilities: ['boulder_throw', 'regeneration'],
        resistances: ['physical'],
        weaknesses: ['fire', 'light'],
        loot: { gold: [20, 40], materials: [5, 12] },
        experienceReward: 80,
        description: 'Massive humanoid that dwells in the deepest caverns'
    },

    crystal_golem: {
        name: 'Crystal Golem',
        type: 'construct',
        difficulty: 2,
        hp: 100,
        maxHP: 100,
        attackPower: 15,
        defense: 12,
        speed: 2,
        abilities: ['crystal_slam', 'reflect_spell'],
        resistances: ['magic', 'physical'],
        weaknesses: ['sonic', 'earth'],
        loot: { gold: [25, 50], materials: [8, 15] },
        experienceReward: 90,
        description: 'Living crystal formation that guards the cavern treasures'
    },

    // === ANCIENT LIBRARY ENEMIES ===
    spectral_librarian: {
        name: 'Spectral Librarian',
        type: 'undead',
        difficulty: 3,
        hp: 80,
        maxHP: 80,
        attackPower: 20,
        defense: 5,
        speed: 6,
        abilities: ['silence', 'knowledge_drain', 'spectral_touch'],
        resistances: ['physical', 'poison'],
        weaknesses: ['holy', 'fire'],
        loot: { gold: [15, 35], materials: [4, 10] },
        experienceReward: 120,
        description: 'Ghost of a scholar who continues to guard forbidden knowledge'
    },

    animated_book: {
        name: 'Animated Book',
        type: 'construct',
        difficulty: 3,
        hp: 50,
        maxHP: 50,
        attackPower: 16,
        defense: 3,
        speed: 7,
        abilities: ['paper_cut', 'spell_cast', 'ink_spray'],
        resistances: ['physical'],
        weaknesses: ['fire', 'water'],
        loot: { gold: [10, 30], materials: [3, 8] },
        experienceReward: 100,
        description: 'Tome animated by residual magical energy'
    },

    ink_elemental: {
        name: 'Ink Elemental',
        type: 'elemental',
        difficulty: 3,
        hp: 70,
        maxHP: 70,
        attackPower: 18,
        defense: 4,
        speed: 8,
        abilities: ['ink_splash', 'blind', 'engulf'],
        resistances: ['physical', 'poison'],
        weaknesses: ['fire', 'light'],
        loot: { gold: [18, 40], materials: [5, 12] },
        experienceReward: 110,
        description: 'Living ink that seeps from ancient texts'
    },

    // === SHADOW FORTRESS ENEMIES ===
    shadow_knight: {
        name: 'Shadow Knight',
        type: 'undead',
        difficulty: 4,
        hp: 150,
        maxHP: 150,
        attackPower: 25,
        defense: 15,
        speed: 6,
        abilities: ['shadow_strike', 'dark_aura', 'life_drain'],
        resistances: ['physical', 'dark'],
        weaknesses: ['holy', 'light'],
        loot: { gold: [30, 60], materials: [8, 18] },
        experienceReward: 200,
        description: 'Fallen paladin corrupted by shadow magic'
    },

    wraith: {
        name: 'Wraith',
        type: 'undead',
        difficulty: 4,
        hp: 90,
        maxHP: 90,
        attackPower: 30,
        defense: 2,
        speed: 10,
        abilities: ['phase', 'wail', 'touch_of_death'],
        resistances: ['physical', 'poison', 'fear'],
        weaknesses: ['holy', 'silver'],
        loot: { gold: [25, 55], materials: [6, 15] },
        experienceReward: 180,
        description: 'Tortured soul bound to the fortress by dark magic'
    },

    nightmare_spawn: {
        name: 'Nightmare Spawn',
        type: 'fiend',
        difficulty: 4,
        hp: 110,
        maxHP: 110,
        attackPower: 28,
        defense: 8,
        speed: 9,
        abilities: ['fear_aura', 'nightmare_vision', 'shadow_teleport'],
        resistances: ['dark', 'fear'],
        weaknesses: ['holy', 'courage'],
        loot: { gold: [35, 70], materials: [10, 20] },
        experienceReward: 220,
        description: 'Manifestation of pure terror and darkness'
    },

    // === ELEMENTAL PLANE ENEMIES ===
    fire_elemental: {
        name: 'Fire Elemental',
        type: 'elemental',
        difficulty: 5,
        hp: 180,
        maxHP: 180,
        attackPower: 35,
        defense: 10,
        speed: 8,
        abilities: ['flame_burst', 'ignite', 'fire_shield'],
        resistances: ['fire', 'physical'],
        weaknesses: ['water', 'ice'],
        loot: { gold: [40, 80], materials: [12, 25] },
        experienceReward: 300,
        description: 'Living flame from the elemental plane of fire'
    },

    frost_giant: {
        name: 'Frost Giant',
        type: 'giant',
        difficulty: 5,
        hp: 250,
        maxHP: 250,
        attackPower: 40,
        defense: 20,
        speed: 4,
        abilities: ['ice_slam', 'frost_breath', 'avalanche'],
        resistances: ['ice', 'physical'],
        weaknesses: ['fire', 'lightning'],
        loot: { gold: [50, 100], materials: [15, 30] },
        experienceReward: 350,
        description: 'Massive humanoid from the frozen reaches'
    },

    storm_lord: {
        name: 'Storm Lord',
        type: 'elemental',
        difficulty: 5,
        hp: 200,
        maxHP: 200,
        attackPower: 45,
        defense: 8,
        speed: 12,
        abilities: ['lightning_bolt', 'thunder_clap', 'wind_barrier'],
        resistances: ['lightning', 'wind'],
        weaknesses: ['earth', 'grounding'],
        loot: { gold: [45, 90], materials: [14, 28] },
        experienceReward: 320,
        description: 'Avatar of storms and lightning'
    },

    earth_titan: {
        name: 'Earth Titan',
        type: 'elemental',
        difficulty: 5,
        hp: 300,
        maxHP: 300,
        attackPower: 30,
        defense: 25,
        speed: 2,
        abilities: ['earthquake', 'stone_throw', 'earth_shield'],
        resistances: ['earth', 'physical'],
        weaknesses: ['air', 'erosion'],
        loot: { gold: [55, 110], materials: [18, 35] },
        experienceReward: 380,
        description: 'Colossal being of living stone and earth'
    },

    // === DEMON LORD'S DUNGEON ENEMIES ===
    demon_lieutenant: {
        name: 'Demon Lieutenant',
        type: 'fiend',
        difficulty: 8,
        hp: 400,
        maxHP: 400,
        attackPower: 50,
        defense: 20,
        speed: 8,
        abilities: ['hellfire', 'summon_imps', 'dark_command'],
        resistances: ['fire', 'dark', 'fear'],
        weaknesses: ['holy', 'silver'],
        loot: { gold: [80, 160], materials: [25, 50] },
        experienceReward: 600,
        description: 'High-ranking demon serving the Demon Lord directly'
    },

    pit_fiend: {
        name: 'Pit Fiend',
        type: 'fiend',
        difficulty: 9,
        hp: 500,
        maxHP: 500,
        attackPower: 60,
        defense: 25,
        speed: 7,
        abilities: ['meteor_swarm', 'fear_aura', 'regeneration'],
        resistances: ['fire', 'dark', 'physical'],
        weaknesses: ['holy', 'cold_iron'],
        loot: { gold: [100, 200], materials: [30, 60] },
        experienceReward: 800,
        description: 'Ancient and powerful demon from the deepest hells'
    },

    demon_lord_malphas: {
        name: 'Demon Lord Malphas',
        type: 'fiend_lord',
        difficulty: 10,
        hp: 800,
        maxHP: 800,
        attackPower: 80,
        defense: 30,
        speed: 10,
        abilities: ['apocalypse', 'reality_rend', 'soul_steal', 'demon_transformation'],
        resistances: ['fire', 'dark', 'physical', 'magic'],
        weaknesses: ['holy', 'pure_light'],
        loot: { gold: [500, 1000], materials: [100, 200] },
        experienceReward: 2000,
        description: 'The ultimate evil - a demon lord seeking to consume all reality',
        phases: [
            { name: 'Mortal Form', hpThreshold: 100, abilities: ['hellfire', 'dark_command'] },
            { name: 'True Form', hpThreshold: 50, abilities: ['apocalypse', 'reality_rend'] },
            { name: 'Final Desperation', hpThreshold: 10, abilities: ['soul_steal', 'demon_transformation'] }
        ]
    }
};

// Enemy abilities definitions
const ENEMY_ABILITIES = {
    slam: { name: 'Slam', damage: 1.5, effect: 'High damage melee attack' },
    bone_throw: { name: 'Bone Throw', damage: 1.2, effect: 'Ranged attack with chance to stun' },
    web_shot: { name: 'Web Shot', damage: 0.8, effect: 'Reduces target speed for 3 turns' },
    crystal_bite: { name: 'Crystal Bite', damage: 1.3, effect: 'Poison damage over time' },
    boulder_throw: { name: 'Boulder Throw', damage: 2.0, effect: 'Massive ranged damage' },
    regeneration: { name: 'Regeneration', damage: 0, effect: 'Heals 10% HP per turn' },
    crystal_slam: { name: 'Crystal Slam', damage: 1.8, effect: 'AoE damage to entire party' },
    reflect_spell: { name: 'Reflect Spell', damage: 0, effect: 'Returns spell damage to caster' },
    silence: { name: 'Silence', damage: 0, effect: 'Prevents spell casting for 2 turns' },
    knowledge_drain: { name: 'Knowledge Drain', damage: 1.0, effect: 'Reduces Mind stat permanently' },
    spectral_touch: { name: 'Spectral Touch', damage: 1.4, effect: 'Bypasses physical armor' },
    paper_cut: { name: 'Paper Cut', damage: 0.6, effect: 'Multiple small attacks' },
    spell_cast: { name: 'Spell Cast', damage: 1.5, effect: 'Random spell effect' },
    ink_spray: { name: 'Ink Spray', damage: 0.8, effect: 'Blinds target for 2 turns' },
    ink_splash: { name: 'Ink Splash', damage: 1.0, effect: 'AoE blind effect' },
    blind: { name: 'Blind', damage: 0, effect: 'Reduces accuracy by 50%' },
    engulf: { name: 'Engulf', damage: 1.2, effect: 'Continuous damage over time' },
    shadow_strike: { name: 'Shadow Strike', damage: 2.0, effect: 'High damage with life steal' },
    dark_aura: { name: 'Dark Aura', damage: 0, effect: 'Reduces party morale' },
    life_drain: { name: 'Life Drain', damage: 1.3, effect: 'Heals attacker for damage dealt' },
    phase: { name: 'Phase', damage: 0, effect: 'Becomes immune to physical attacks' },
    wail: { name: 'Wail', damage: 0.8, effect: 'Fear effect on entire party' },
    touch_of_death: { name: 'Touch of Death', damage: 3.0, effect: '10% instant kill chance' },
    fear_aura: { name: 'Fear Aura', damage: 0, effect: 'Continuous fear effect' },
    nightmare_vision: { name: 'Nightmare Vision', damage: 1.2, effect: 'Confuses target' },
    shadow_teleport: { name: 'Shadow Teleport', damage: 0, effect: 'Repositions for advantage' },
    flame_burst: { name: 'Flame Burst', damage: 1.8, effect: 'Fire AoE with burn chance' },
    ignite: { name: 'Ignite', damage: 0.5, effect: 'Sets target on fire' },
    fire_shield: { name: 'Fire Shield', damage: 0, effect: 'Reflects damage as fire' },
    ice_slam: { name: 'Ice Slam', damage: 2.2, effect: 'High damage with freeze chance' },
    frost_breath: { name: 'Frost Breath', damage: 1.5, effect: 'Cone attack that slows' },
    avalanche: { name: 'Avalanche', damage: 2.5, effect: 'Devastating AoE attack' },
    lightning_bolt: { name: 'Lightning Bolt', damage: 2.0, effect: 'Fast, high damage attack' },
    thunder_clap: { name: 'Thunder Clap', damage: 1.0, effect: 'Stuns entire party' },
    wind_barrier: { name: 'Wind Barrier', damage: 0, effect: 'Deflects projectiles' },
    earthquake: { name: 'Earthquake', damage: 1.8, effect: 'Damages and knocks down party' },
    stone_throw: { name: 'Stone Throw', damage: 1.6, effect: 'Ranged attack with knockback' },
    earth_shield: { name: 'Earth Shield', damage: 0, effect: 'Greatly increases defense' },
    hellfire: { name: 'Hellfire', damage: 2.5, effect: 'Unholy fire damage' },
    summon_imps: { name: 'Summon Imps', damage: 0, effect: 'Calls lesser demon allies' },
    dark_command: { name: 'Dark Command', damage: 0, effect: 'Controls party member for 1 turn' },
    meteor_swarm: { name: 'Meteor Swarm', damage: 3.0, effect: 'Multiple devastating impacts' },
    apocalypse: { name: 'Apocalypse', damage: 4.0, effect: 'Ultimate destruction spell' },
    reality_rend: { name: 'Reality Rend', damage: 2.8, effect: 'Ignores all resistances' },
    soul_steal: { name: 'Soul Steal', damage: 2.0, effect: 'Steals levels from target' },
    demon_transformation: { name: 'Demon Transformation', damage: 0, effect: 'Enters final form' }
};

// Achievement data for dungeon completion
const ACHIEVEMENTS_DATA = {
    FIRST_STEPS: {
        name: 'First Steps',
        description: 'Complete your first dungeon',
        condition: 'complete_any_dungeon',
        reward: { gold: 100 }
    },
    CRYSTAL_EXPLORER: {
        name: 'Crystal Explorer',
        description: 'Discover all rooms in Crystal Caverns',
        condition: 'explore_all_crystal_rooms',
        reward: { materials: 50 }
    },
    SCHOLAR: {
        name: 'Scholar',
        description: 'Learn a skill from the Ancient Library',
        condition: 'learn_library_skill',
        reward: { experience: 500 }
    },
    SHADOW_WALKER: {
        name: 'Shadow Walker',
        description: 'Complete Shadow Fortress without taking light damage',
        condition: 'shadow_fortress_no_light',
        reward: { darkArtifact: true }
    },
    ELEMENTAL_MASTER: {
        name: 'Elemental Master',
        description: 'Defeat all four elemental bosses',
        condition: 'defeat_all_elementals',
        reward: { elementalCore: true }
    },
    DEMON_SLAYER: {
        name: 'Demon Slayer',
        description: 'Defeat the Demon Lord',
        condition: 'defeat_demon_lord',
        reward: { legendaryTitle: 'Savior of the Realm' }
    },
    PARTY_WIPE_SURVIVOR: {
        name: 'Against All Odds',
        description: 'Survive a party wipe through special circumstances',
        condition: 'survive_party_wipe',
        reward: { specialUnlock: 'necromancer' }
    }
};

// Export data
if (typeof window !== 'undefined') {
    window.DUNGEONS_DATA = DUNGEONS_DATA;
    window.ENEMIES_DATA = ENEMIES_DATA;
    window.ENEMY_ABILITIES = ENEMY_ABILITIES;
    window.ACHIEVEMENTS_DATA = ACHIEVEMENTS_DATA;
    console.log('✅ Dungeons and Enemies data loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        DUNGEONS_DATA, 
        ENEMIES_DATA, 
        ENEMY_ABILITIES, 
        ACHIEVEMENTS_DATA 
    };
}