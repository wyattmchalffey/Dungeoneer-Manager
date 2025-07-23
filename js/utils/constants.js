/**
 * ===========================================
 * GAME CONSTANTS - SINGLE CHARACTER MODE
 * ===========================================
 * All game constants, configuration values, and magic numbers for single character gameplay
 */

// Application Information
const APP_INFO = {
    NAME: 'Dungeon Lords Manager - Solo Edition',
    VERSION: '2.0.0-SOLO',
    AUTHOR: 'Game Development Team',
    DESCRIPTION: 'Train and manage a single adventurer in auto-battle dungeons',
    BUILD_DATE: '2024-01-01',
    MODE: 'SINGLE_CHARACTER',
    MIN_BROWSER_VERSION: {
        chrome: 80,
        firefox: 75,
        safari: 13,
        edge: 80
    }
};

// Game Balance Constants - Single Character Mode
const GAME_BALANCE = {
    // Core game parameters - MODIFIED FOR SINGLE CHARACTER
    MAX_PARTY_SIZE: 1,        // Changed from 4 to 1
    MIN_PARTY_SIZE: 1,        // Stays the same
    DEFAULT_TURNS_PER_SEASON: 20,
    MAX_SEASONS: 999,
    
    // Character limits - ENHANCED FOR SOLO PLAY
    MAX_CHARACTER_LEVEL: 100,
    MAX_STAT_VALUE: 999,
    BASE_STAT_MULTIPLIER: 20,
    EXPERIENCE_CURVE_FACTOR: 80,    // Reduced for faster solo progression
    SOLO_EXP_MULTIPLIER: 1.5,      // NEW: Bonus experience for solo play
    
    // Combat parameters - ADJUSTED FOR SOLO COMBAT
    MIN_DAMAGE: 1,
    MAX_SKILL_ACTIVATION_CHANCE: 95,
    MIN_SKILL_ACTIVATION_CHANCE: 5,
    CRITICAL_HIT_MULTIPLIER: 2.5,   // Increased for solo combat excitement
    BASE_DODGE_CHANCE: 10,          // Increased for survival
    SOLO_COMBAT_BONUS: 1.2,        // NEW: Damage bonus for solo adventurers
    
    // Resource limits - ADJUSTED FOR SINGLE CHARACTER ECONOMY
    MAX_GOLD: 999999,
    MAX_MATERIALS: 99999,
    MAX_REPUTATION: 100,
    STARTING_GOLD: 1500,            // Increased starting resources
    STARTING_MATERIALS: 75,         // Increased starting materials
    STARTING_REPUTATION: 15,        // Slightly higher starting reputation
    
    // Training costs and effectiveness - OPTIMIZED FOR SOLO PROGRESSION
    BASE_TRAINING_COST: 100,
    FOCUSED_TRAINING_COST: 150,     // NEW: Cost for focused stat training
    BASE_TRAINING_EFFECTIVENESS: 1.2, // Increased base effectiveness
    FOCUSED_TRAINING_EFFECTIVENESS: 1.8, // NEW: Higher effectiveness for focused training
    APTITUDE_TRAINING_MULTIPLIER: 1.5,
    SOLO_TRAINING_BONUS: 1.3,       // NEW: Training bonus for solo characters
    
    // Equipment costs - ADJUSTED FOR SINGLE CHARACTER
    BASE_EQUIPMENT_COST: 200,
    EQUIPMENT_MATERIAL_COST: 10,
    SOLO_EQUIPMENT_BONUS: 1.4,      // NEW: Equipment is more effective for solo chars
    
    // Status effects - ENHANCED FOR SOLO SURVIVABILITY
    MAX_STATUS_EFFECT_DURATION: 8,  // Reduced duration
    STATUS_EFFECT_RESIST_CHANCE: 30, // Increased resistance
    POISON_DAMAGE_PERCENT: 4,       // Reduced damage
    BURN_DAMAGE_PERCENT: 6,         // Reduced damage
    REGEN_HEAL_PERCENT: 15,         // Increased healing
    SOLO_STATUS_RESISTANCE: 1.5,    // NEW: Status effect resistance bonus
    
    // Rest and recovery - ENHANCED FOR SOLO PLAY
    BASE_REST_HEALING: 0.4,         // Increased from 0.3
    BASE_MANA_RECOVERY: 0.6,        // Increased from 0.5
    SOLO_RECOVERY_BONUS: 1.2,      // NEW: Faster recovery for solo characters
    
    // Skill learning - ACCELERATED FOR SOLO PROGRESSION
    BASE_SKILL_LEARN_CHANCE: 20,    // Increased from 15
    FOCUSED_TRAINING_SKILL_CHANCE: 30, // NEW: Higher chance with focused training
    SOLO_SKILL_BONUS: 1.4,          // NEW: Skill learning bonus for solo play
    
    // Dungeon rewards - INCREASED FOR SOLO RISK
    SOLO_REWARD_MULTIPLIER: 1.8,    // NEW: Higher rewards for solo dungeon runs
    SOLO_RISK_BONUS: 2.0,           // NEW: Risk/reward bonus for challenging content
    
    // Character unlock system - MODIFIED FOR SOLO PROGRESSION
    UNLOCK_THRESHOLD_MULTIPLIER: 0.7, // Easier unlocks for solo players
    SOLO_ACHIEVEMENT_BONUS: 1.5      // NEW: Achievement progress bonus
};

// User Interface Constants - UPDATED FOR SINGLE CHARACTER
const UI_CONFIG = {
    // Animation timings (milliseconds)
    FAST_ANIMATION: 150,
    NORMAL_ANIMATION: 300,
    SLOW_ANIMATION: 500,
    COMBAT_LOG_DELAY: 600,          // Faster for solo combat
    TRAINING_DISPLAY_DELAY: 800,    // NEW: Training result display timing
    
    // Message display settings
    MESSAGE_DURATION: 3000,
    SUCCESS_MESSAGE_DURATION: 2000,
    ERROR_MESSAGE_DURATION: 4000,
    
    // Character display settings - NEW SECTION
    HEALTH_BAR_ANIMATION: 800,
    STAT_UPDATE_ANIMATION: 600,
    LEVEL_UP_ANIMATION: 1200,
    SKILL_LEARN_ANIMATION: 1000,
    
    // Training interface settings - NEW SECTION
    STAT_BUTTON_COOLDOWN: 1000,     // Prevent spam clicking
    TRAINING_PROGRESS_SPEED: 1500,
    
    // Layout constants for single character focus
    CHARACTER_CARD_WIDTH: '100%',   // Full width for single character
    STAT_GRID_COLUMNS: 3,           // Optimal grid for stat display
    SKILL_DISPLAY_LIMIT: 12,        // Max skills to show at once
    
    // Color schemes for single character mode
    COLORS: {
        PRIMARY: '#3282b8',
        SUCCESS: '#2ecc71',
        WARNING: '#f39c12',
        DANGER: '#e74c3c',
        INFO: '#3498db',
        // Character-specific colors
        HEALTH: '#e74c3c',
        MANA: '#3498db',
        EXPERIENCE: '#f39c12',
        STAT_GROWTH: '#2ecc71'
    }
};

// Single Character Specific Constants - NEW SECTION
const SOLO_CONFIG = {
    // Character selection
    SELECTION_MODE: 'SINGLE',
    ALLOW_CHARACTER_SWITCHING: true,
    SWITCHING_COOLDOWN: 0,          // No cooldown for character switching
    
    // Training system
    TRAINING_TYPES: {
        GENERAL: 'general',
        FOCUSED: 'focused',
        INTENSIVE: 'intensive'       // Future expansion
    },
    
    // Stat training effectiveness by type
    TRAINING_EFFECTIVENESS: {
        GENERAL: 1.0,
        FOCUSED: 1.5,
        INTENSIVE: 2.0               // Future expansion
    },
    
    // Individual progression bonuses
    PROGRESSION_BONUSES: {
        FAST_LEARNER: 1.2,           // Quick skill acquisition
        HARDY: 1.3,                  // Better health/mana growth
        VERSATILE: 1.1,              // Balanced stat growth
        SPECIALIST: 1.4              // Focused stat growth
    },
    
    // Solo dungeon modifiers
    DUNGEON_MODIFIERS: {
        ENEMY_COUNT_REDUCTION: 0.6,  // Fewer enemies for solo runs
        ENEMY_HEALTH_REDUCTION: 0.8, // Weaker individual enemies
        TREASURE_BONUS: 1.5,         // More treasure for solo risk
        EXPERIENCE_BONUS: 1.3        // Bonus experience for solo clears
    },
    
    // Character relationship system (future expansion)
    MENTOR_SYSTEM: {
        ENABLED: false,              // Not yet implemented
        MAX_MENTORS: 2,
        MENTOR_BONUS: 1.25
    }
};

// Dungeon System Constants - UPDATED FOR SOLO PLAY
const DUNGEON_CONFIG = {
    // Difficulty scaling - ADJUSTED FOR SOLO
    DIFFICULTY_MULTIPLIER: 1.1,     // Reduced from 1.2
    BOSS_HEALTH_MULTIPLIER: 2.5,    // Reduced from 3.0
    ELITE_HEALTH_MULTIPLIER: 1.3,   // Reduced from 1.5
    SOLO_DIFFICULTY_REDUCTION: 0.8, // NEW: Overall difficulty reduction for solo
    
    // Rewards - INCREASED FOR SOLO RISK
    BASE_GOLD_REWARD: 75,           // Increased from 50
    BASE_MATERIAL_REWARD: 15,       // Increased from 10
    BASE_EXPERIENCE_REWARD: 150,    // Increased from 100
    DIFFICULTY_REWARD_MULTIPLIER: 1.8, // Increased from 1.5
    SOLO_COMPLETION_BONUS: 1.6,     // NEW: Bonus for solo completion
    
    // Generation parameters - OPTIMIZED FOR SOLO
    MIN_ROOMS_PER_DUNGEON: 2,       // Reduced from 3
    MAX_ROOMS_PER_DUNGEON: 6,       // Reduced from 8
    BOSS_ROOM_CHANCE: 1.0,          // Always have boss room
    TREASURE_ROOM_CHANCE: 0.4,      // Increased treasure chance
    TRAP_ROOM_CHANCE: 0.15,         // Reduced trap chance
    REST_ROOM_CHANCE: 0.3,          // NEW: Rest areas for solo adventurers
    
    // Environmental hazards - REDUCED FOR SOLO SURVIVABILITY
    HAZARD_DAMAGE_PERCENT: 8,       // Reduced from 10
    HAZARD_ACTIVATION_CHANCE: 20,   // Reduced from 30
    ENVIRONMENTAL_EFFECT_DURATION: 2, // Reduced from 3
    SOLO_HAZARD_RESISTANCE: 1.3     // NEW: Hazard resistance for solo chars
};

// Save System Constants - UPDATED FOR SINGLE CHARACTER
const SAVE_CONFIG = {
    // Storage keys - UPDATED FOR SOLO MODE
    SAVE_KEY_PREFIX: 'dungeonLordsSolo_',
    MAIN_SAVE_KEY: 'solo_save',
    SETTINGS_KEY: 'solo_settings',
    ACHIEVEMENTS_KEY: 'solo_achievements',
    STATISTICS_KEY: 'solo_stats',
    CHARACTER_SAVE_KEY: 'character_data', // NEW: Dedicated character save
    
    // File format
    SAVE_VERSION: '2.0.0-SOLO',
    COMPRESSION_ENABLED: false,
    ENCRYPTION_ENABLED: false,
    
    // Auto-save - MORE FREQUENT FOR SINGLE CHARACTER
    AUTO_SAVE_INTERVAL: 20000,      // 20 seconds (reduced from 30)
    MAX_AUTO_SAVES: 5,              // Increased from 3
    SAVE_ON_ACTION: true,
    SAVE_ON_EXIT: true,
    SAVE_ON_TRAINING: true,         // NEW: Save after training
    SAVE_ON_LEVEL_UP: true,         // NEW: Save on level up
    
    // Backup
    MAX_BACKUP_FILES: 15,           // Increased from 10
    BACKUP_INTERVAL: 180000,        // 3 minutes (reduced from 5)
    CLOUD_SYNC_ENABLED: false,
    CHARACTER_BACKUP_ENABLED: true  // NEW: Separate character backups
};

// Training System Constants - NEW SECTION FOR SOLO MODE
const TRAINING_CONFIG = {
    // Training types and costs
    TRAINING_TYPES: {
        GENERAL: {
            cost: { gold: 100 },
            effectiveness: 1.0,
            statCount: [2, 3],
            skillChance: 15
        },
        FOCUSED: {
            cost: { gold: 150 },
            effectiveness: 1.5,
            statCount: 1,
            skillChance: 25
        },
        INTENSIVE: {
            cost: { gold: 300, materials: 5 },
            effectiveness: 2.0,
            statCount: 1,
            skillChance: 40
        }
    },
    
    // Stat growth ranges
    STAT_GROWTH: {
        MIN_GENERAL: 8,
        MAX_GENERAL: 15,
        MIN_FOCUSED: 20,
        MAX_FOCUSED: 35,
        MIN_INTENSIVE: 40,
        MAX_INTENSIVE: 60
    },
    
    // Training session limits
    MAX_SESSIONS_PER_TURN: 3,
    FATIGUE_PENALTY: 0.8,           // Effectiveness reduction after multiple sessions
    RECOVERY_TIME: 1,               // Turns to recover from fatigue
    
    // Special training events
    BREAKTHROUGH_CHANCE: 5,         // Chance for exceptional growth
    BREAKTHROUGH_MULTIPLIER: 2.0,   // Growth multiplier for breakthroughs
    MENTOR_ENCOUNTER_CHANCE: 3,     // Chance to meet a mentor during training
    
    // Aptitude bonuses for training
    APTITUDE_MULTIPLIERS: {
        1: 0.8,   // Below average aptitude
        2: 1.0,   // Average aptitude  
        3: 1.2,   // Good aptitude
        4: 1.4,   // Excellent aptitude
        5: 1.6    // Legendary aptitude
    }
};

// Character Progression Constants - NEW SECTION
const PROGRESSION_CONFIG = {
    // Experience and leveling
    EXPERIENCE_CURVE: 'exponential',
    BASE_EXPERIENCE_REQUIRED: 100,
    LEVEL_MULTIPLIER: 1.15,
    MAX_LEVEL: 100,
    
    // Stat caps and growth
    STAT_SOFT_CAP: 500,             // Diminishing returns above this
    STAT_HARD_CAP: 999,             // Absolute maximum
    SOFT_CAP_PENALTY: 0.5,          // Growth reduction above soft cap
    
    // Skill learning
    SKILL_UNLOCK_REQUIREMENTS: {
        STAT_THRESHOLD: 100,         // Minimum stat to unlock advanced skills
        LEVEL_THRESHOLD: 10,         // Minimum level for complex skills
        COMBAT_EXPERIENCE: 50        // Combat encounters needed for combat skills
    },
    
    // Archetype evolution (future feature)
    EVOLUTION_SYSTEM: {
        ENABLED: false,
        REQUIREMENTS: {
            LEVEL: 25,
            SPECIFIC_STATS: 200,
            ACHIEVEMENTS: 3
        }
    }
};

// Audio Constants - UPDATED FOR SINGLE CHARACTER EXPERIENCE
const AUDIO_CONFIG = {
    // Volume levels (0.0 to 1.0)
    DEFAULT_MASTER_VOLUME: 0.7,
    DEFAULT_SFX_VOLUME: 0.8,
    DEFAULT_MUSIC_VOLUME: 0.6,
    DEFAULT_UI_VOLUME: 0.5,
    
    // Audio file formats (preference order)
    SUPPORTED_FORMATS: ['ogg', 'mp3', 'wav'],
    
    // Sound categories - UPDATED FOR SOLO EXPERIENCE
    CATEGORIES: {
        UI: 'ui',
        COMBAT: 'combat',
        TRAINING: 'training',        // NEW: Training sounds
        LEVELUP: 'levelup',          // NEW: Level up sounds
        AMBIENT: 'ambient',
        VOICE: 'voice',
        MUSIC: 'music'
    },
    
    // Single character specific audio events
    SOLO_EVENTS: {
        STAT_INCREASE: 'stat_boost',
        SKILL_LEARNED: 'skill_unlock',
        BREAKTHROUGH: 'training_breakthrough',
        SOLO_VICTORY: 'solo_triumph',
        CHARACTER_DEFEATED: 'character_down'
    }
};

// Performance Constants - OPTIMIZED FOR SINGLE CHARACTER
const PERFORMANCE_CONFIG = {
    // Rendering optimization
    MAX_PARTICLES: 50,              // Reduced particle count
    ANIMATION_QUALITY: 'high',      // Can afford higher quality for single char
    UI_UPDATE_FREQUENCY: 16,        // 60 FPS for smooth single character updates
    
    // Memory management
    MAX_COMBAT_LOG_ENTRIES: 100,
    MAX_TRAINING_HISTORY: 500,      // Increased for detailed tracking
    GARBAGE_COLLECTION_INTERVAL: 30000,
    
    // Network (for future features)
    REQUEST_TIMEOUT: 5000,
    MAX_CONCURRENT_REQUESTS: 3,
    RETRY_ATTEMPTS: 2
};

// Achievement System Constants - NEW SECTION
const ACHIEVEMENT_CONFIG = {
    // Achievement categories for solo play
    CATEGORIES: {
        TRAINING: 'training_master',
        COMBAT: 'solo_warrior',
        EXPLORATION: 'dungeon_crawler',
        PROGRESSION: 'character_growth',
        SURVIVAL: 'survivalist',
        MASTERY: 'skill_master'
    },
    
    // Achievement thresholds
    THRESHOLDS: {
        TRAINING_SESSIONS: [10, 50, 100, 500],
        STAT_IMPROVEMENTS: [100, 500, 1000, 5000],
        DUNGEONS_COMPLETED: [5, 25, 50, 100],
        SKILLS_LEARNED: [5, 15, 30, 50],
        LEVELS_GAINED: [10, 25, 50, 75],
        SOLO_VICTORIES: [10, 50, 100, 500]
    },
    
    // Achievement rewards
    REWARDS: {
        GOLD_BONUS: [100, 250, 500, 1000],
        MATERIAL_BONUS: [10, 25, 50, 100],
        TRAINING_EFFICIENCY: [1.05, 1.1, 1.15, 1.2]
    }
};

// Character Unlocking System - UPDATED FOR SOLO PROGRESSION
const UNLOCK_CONFIG = {
    // Base character unlock conditions
    CHARACTER_UNLOCKS: {
        'berserker': {
            requirement: 'solo_victories',
            threshold: 5,
            description: 'Win 5 solo battles'
        },
        'paladin': {
            requirement: 'dungeons_as_guardian',
            threshold: 3,
            description: 'Complete 3 dungeons as Guardian'
        },
        'assassin': {
            requirement: 'enemies_defeated_as_rogue',
            threshold: 20,
            description: 'Defeat 20 enemies as Rogue'
        },
        'archmage': {
            requirement: 'skills_learned_as_mage',
            threshold: 10,
            description: 'Learn 10 skills as Mage'
        },
        'monk': {
            requirement: 'training_sessions',
            threshold: 50,
            description: 'Complete 50 training sessions'
        },
        'necromancer': {
            requirement: 'character_defeats',
            threshold: 3,
            description: 'Survive 3 character defeats'
        }
    },
    
    // Dungeon unlocks
    DUNGEON_UNLOCKS: {
        'ancient_ruins': {
            requirement: 'dungeons_completed',
            threshold: 3
        },
        'crystal_caverns': {
            requirement: 'character_level',
            threshold: 15
        },
        'shadow_realm': {
            requirement: 'solo_victories',
            threshold: 25
        },
        'demon_lords_domain': {
            requirement: 'all_dungeons_completed',
            threshold: 1
        }
    }
};

// Export all constants
if (typeof window !== 'undefined') {
    window.APP_INFO = APP_INFO;
    window.GAME_BALANCE = GAME_BALANCE;
    window.UI_CONFIG = UI_CONFIG;
    window.SOLO_CONFIG = SOLO_CONFIG;
    window.DUNGEON_CONFIG = DUNGEON_CONFIG;
    window.SAVE_CONFIG = SAVE_CONFIG;
    window.TRAINING_CONFIG = TRAINING_CONFIG;
    window.PROGRESSION_CONFIG = PROGRESSION_CONFIG;
    window.AUDIO_CONFIG = AUDIO_CONFIG;
    window.PERFORMANCE_CONFIG = PERFORMANCE_CONFIG;
    window.ACHIEVEMENT_CONFIG = ACHIEVEMENT_CONFIG;
    window.UNLOCK_CONFIG = UNLOCK_CONFIG;
    
    console.log('✅ Single Character Game Constants loaded successfully');
}

// Backward compatibility exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_INFO,
        GAME_BALANCE,
        UI_CONFIG,
        SOLO_CONFIG,
        DUNGEON_CONFIG,
        SAVE_CONFIG,
        TRAINING_CONFIG,
        PROGRESSION_CONFIG,
        AUDIO_CONFIG,
        PERFORMANCE_CONFIG,
        ACHIEVEMENT_CONFIG,
        UNLOCK_CONFIG
    };
}