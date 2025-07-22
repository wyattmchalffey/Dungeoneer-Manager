/**
 * ===========================================
 * GAME CONSTANTS
 * ===========================================
 * All game constants, configuration values, and magic numbers
 */

// Application Information
const APP_INFO = {
    NAME: 'Dungeon Lords Manager',
    VERSION: '1.0.0-MVP',
    AUTHOR: 'Game Development Team',
    DESCRIPTION: 'Manage parties of adventurers in auto-battle dungeons',
    BUILD_DATE: '2024-01-01', // Would be set during build process
    MIN_BROWSER_VERSION: {
        chrome: 80,
        firefox: 75,
        safari: 13,
        edge: 80
    }
};

// Game Balance Constants
const GAME_BALANCE = {
    // Core game parameters
    MAX_PARTY_SIZE: 4,
    MIN_PARTY_SIZE: 1,
    DEFAULT_TURNS_PER_SEASON: 20,
    MAX_SEASONS: 999,
    
    // Character limits
    MAX_CHARACTER_LEVEL: 100,
    MAX_STAT_VALUE: 999,
    BASE_STAT_MULTIPLIER: 20,
    EXPERIENCE_CURVE_FACTOR: 100,
    
    // Combat parameters
    MIN_DAMAGE: 1,
    MAX_SKILL_ACTIVATION_CHANCE: 95,
    MIN_SKILL_ACTIVATION_CHANCE: 5,
    CRITICAL_HIT_MULTIPLIER: 2.0,
    BASE_DODGE_CHANCE: 5,
    
    // Resource limits
    MAX_GOLD: 999999,
    MAX_MATERIALS: 99999,
    MAX_REPUTATION: 100,
    STARTING_GOLD: 1000,
    STARTING_MATERIALS: 50,
    STARTING_REPUTATION: 10,
    
    // Training costs and effectiveness
    BASE_TRAINING_COST: 100,
    BASE_TRAINING_EFFECTIVENESS: 1.0,
    APTITUDE_TRAINING_MULTIPLIER: 1.5,
    
    // Equipment costs
    BASE_EQUIPMENT_COST: 200,
    EQUIPMENT_MATERIAL_COST: 10,
    
    // Status effects
    MAX_STATUS_EFFECT_DURATION: 10,
    STATUS_EFFECT_RESIST_CHANCE: 20,
    POISON_DAMAGE_PERCENT: 5,
    BURN_DAMAGE_PERCENT: 8,
    REGEN_HEAL_PERCENT: 10,
    
    // Mentor system (for future implementation)
    MAX_MENTORS_PER_CHARACTER: 3,
    MENTOR_BONUS_MULTIPLIER: 0.5,
    MENTOR_UNLOCK_THRESHOLD: 5
};

// User Interface Constants
const UI_CONFIG = {
    // Animation timings (milliseconds)
    FAST_ANIMATION: 150,
    NORMAL_ANIMATION: 300,
    SLOW_ANIMATION: 500,
    COMBAT_LOG_DELAY: 800,
    
    // Touch/click settings
    TOUCH_FEEDBACK_DURATION: 150,
    DOUBLE_TAP_PREVENTION_TIME: 300,
    LONG_PRESS_DURATION: 500,
    
    // Display limits
    MAX_COMBAT_LOG_ENTRIES: 100,
    MAX_SAVE_SLOTS: 5,
    MAX_RECENTLY_VIEWED: 10,
    
    // Responsive breakpoints (pixels)
    BREAKPOINT_MOBILE: 767,
    BREAKPOINT_TABLET: 1023,
    BREAKPOINT_DESKTOP: 1200,
    
    // Color scheme
    PRIMARY_COLOR: '#3282b8',
    SECONDARY_COLOR: '#bbe1fa',
    DANGER_COLOR: '#d32f2f',
    SUCCESS_COLOR: '#4caf50',
    WARNING_COLOR: '#f57c00',
    
    // Message toast settings
    MESSAGE_DURATION_SHORT: 2000,
    MESSAGE_DURATION_NORMAL: 3000,
    MESSAGE_DURATION_LONG: 5000
};

// Combat System Constants
const COMBAT_CONFIG = {
    // Turn timing
    COMBAT_ROUND_DELAY: 1000,
    SKILL_ACTIVATION_DELAY: 500,
    DAMAGE_CALCULATION_DELAY: 200,
    
    // Damage types
    DAMAGE_TYPES: {
        PHYSICAL: 'physical',
        MAGICAL: 'magical',
        FIRE: 'fire',
        ICE: 'ice',
        LIGHTNING: 'lightning',
        POISON: 'poison',
        HOLY: 'holy',
        DARK: 'dark'
    },
    
    // Position modifiers
    FRONT_LINE_DAMAGE_MODIFIER: 1.0,
    BACK_LINE_DAMAGE_MODIFIER: 0.8,
    FRONT_LINE_PROTECTION_BONUS: 0.1,
    BACK_LINE_SPELL_BONUS: 0.2,
    
    // AI behavior weights
    AI_AGGRESSION_WEIGHT: 0.7,
    AI_SURVIVAL_WEIGHT: 0.3,
    AI_TARGET_PRIORITY: {
        LOWEST_HP: 0.4,
        HIGHEST_THREAT: 0.3,
        RANDOM: 0.2,
        SUPPORT_FIRST: 0.1
    }
};

// Skill System Constants
const SKILL_CONFIG = {
    // Learning requirements
    MIN_LEVEL_FOR_ADVANCED_SKILLS: 10,
    MIN_STAT_FOR_SKILL_LEARNING: 30,
    SKILL_MASTERY_USES: 50,
    
    // Cooldown and mana
    DEFAULT_COOLDOWN: 3,
    DEFAULT_MANA_COST: 20,
    MASTERY_COOLDOWN_REDUCTION: 1,
    
    // Trigger conditions
    ALLY_LOW_HP_THRESHOLD: 40,
    ALLY_CRITICAL_HP_THRESHOLD: 25,
    ENEMY_HIGH_HP_THRESHOLD: 70,
    PARTY_HEALTH_LOW_THRESHOLD: 50,
    
    // Skill categories
    CATEGORIES: {
        COMBAT_OFFENSIVE: 'combat_offensive',
        COMBAT_DEFENSIVE: 'combat_defensive',
        COMBAT_CONTROL: 'combat_control',
        SUPPORT_HEALING: 'support_healing',
        SUPPORT_BUFF: 'support_buff',
        EXPLORATION: 'exploration_utility',
        PASSIVE: 'passive'
    }
};

// Dungeon System Constants
const DUNGEON_CONFIG = {
    // Difficulty scaling
    DIFFICULTY_MULTIPLIER: 1.2,
    BOSS_HEALTH_MULTIPLIER: 3.0,
    ELITE_HEALTH_MULTIPLIER: 1.5,
    
    // Rewards
    BASE_GOLD_REWARD: 50,
    BASE_MATERIAL_REWARD: 10,
    BASE_EXPERIENCE_REWARD: 100,
    DIFFICULTY_REWARD_MULTIPLIER: 1.5,
    
    // Generation parameters
    MIN_ROOMS_PER_DUNGEON: 3,
    MAX_ROOMS_PER_DUNGEON: 8,
    BOSS_ROOM_CHANCE: 1.0, // Always have boss room
    TREASURE_ROOM_CHANCE: 0.3,
    TRAP_ROOM_CHANCE: 0.2,
    
    // Environmental hazards
    HAZARD_DAMAGE_PERCENT: 10,
    HAZARD_ACTIVATION_CHANCE: 30,
    ENVIRONMENTAL_EFFECT_DURATION: 3
};

// Save System Constants
const SAVE_CONFIG = {
    // Storage keys
    SAVE_KEY_PREFIX: 'dungeonLordsManager_',
    MAIN_SAVE_KEY: 'main_save',
    SETTINGS_KEY: 'user_settings',
    ACHIEVEMENTS_KEY: 'achievements',
    STATISTICS_KEY: 'global_stats',
    
    // File format
    SAVE_VERSION: '1.0.0',
    COMPRESSION_ENABLED: false,
    ENCRYPTION_ENABLED: false,
    
    // Auto-save
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    MAX_AUTO_SAVES: 3,
    SAVE_ON_ACTION: true,
    SAVE_ON_EXIT: true,
    
    // Backup
    MAX_BACKUP_FILES: 10,
    BACKUP_INTERVAL: 300000, // 5 minutes
    CLOUD_SYNC_ENABLED: false
};

// Audio Constants (for future implementation)
const AUDIO_CONFIG = {
    // Volume levels (0.0 to 1.0)
    DEFAULT_MASTER_VOLUME: 0.7,
    DEFAULT_SFX_VOLUME: 0.8,
    DEFAULT_MUSIC_VOLUME: 0.6,
    DEFAULT_UI_VOLUME: 0.5,
    
    // Audio file formats (preference order)
    SUPPORTED_FORMATS: ['ogg', 'mp3', 'wav'],
    
    // Sound categories
    CATEGORIES: {
        UI: 'ui',
        COMBAT: 'combat',
        AMBIENT: 'ambient',
        VOICE: 'voice',
        MUSIC: 'music'
    }
};

// Performance Constants
const PERFORMANCE_CONFIG = {
    // Frame rate targets
    TARGET_FPS: 60,
    MIN_FPS: 30,
    
    // Memory limits (rough estimates)
    MAX_COMBAT_HISTORY_ENTRIES: 1000,
    MAX_LOG_ENTRIES: 500,
    MAX_CACHED_IMAGES: 100,
    
    // Optimization thresholds
    PARTICLE_REDUCTION_THRESHOLD: 40, // FPS
    ANIMATION_REDUCTION_THRESHOLD: 35,
    DISABLE_EFFECTS_THRESHOLD: 25,
    
    // Update intervals
    STATS_UPDATE_INTERVAL: 100,
    UI_REFRESH_INTERVAL: 16, // ~60 FPS
    BACKGROUND_TASK_INTERVAL: 1000
};

// Platform-specific Constants
const PLATFORM_CONFIG = {
    // Desktop (Electron)
    DESKTOP: {
        MIN_WINDOW_WIDTH: 800,
        MIN_WINDOW_HEIGHT: 600,
        DEFAULT_WINDOW_WIDTH: 1200,
        DEFAULT_WINDOW_HEIGHT: 900,
        RESIZABLE: true,
        FULLSCREEN_SUPPORTED: true
    },
    
    // Mobile (Cordova/Web)
    MOBILE: {
        ORIENTATION_LOCK: false,
        STATUSBAR_HIDDEN: false,
        KEYBOARD_RESIZE: true,
        BACK_BUTTON_EXIT: false
    },
    
    // Web browser
    WEB: {
        OFFLINE_SUPPORT: true,
        PWA_ENABLED: true,
        SERVICE_WORKER_ENABLED: true,
        LOCAL_STORAGE_QUOTA: 10 * 1024 * 1024 // 10MB
    }
};

// Debug and Development Constants
const DEBUG_CONFIG = {
    // Debug modes
    ENABLED: false, // Set to true for development
    VERBOSE_LOGGING: false,
    SHOW_FPS: false,
    SHOW_MEMORY_USAGE: false,
    
    // Developer shortcuts
    ENABLE_CHEATS: false,
    SKIP_TUTORIALS: false,
    UNLOCK_ALL_CONTENT: false,
    INFINITE_RESOURCES: false,
    
    // Testing
    MOCK_SAVE_SYSTEM: true, // For artifact environment
    SIMULATE_SLOW_CONNECTION: false,
    FORCE_ERROR_CONDITIONS: false,
    
    // Logging levels
    LOG_LEVELS: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        VERBOSE: 4
    },
    DEFAULT_LOG_LEVEL: 2 // INFO
};

// Validation Constants
const VALIDATION_CONFIG = {
    // Input limits
    MAX_NAME_LENGTH: 50,
    MIN_NAME_LENGTH: 1,
    ALLOWED_NAME_CHARACTERS: /^[a-zA-Z0-9\s\-_.]+$/,
    
    // Save file validation
    MAX_SAVE_SIZE: 1024 * 1024, // 1MB
    MIN_SAVE_SIZE: 100, // bytes
    REQUIRED_SAVE_FIELDS: ['version', 'timestamp', 'gameData'],
    
    // Game state validation
    MAX_PARTY_MEMBERS: 4,
    MIN_STAT_VALUE: 0,
    MAX_STAT_VALUE: 999,
    MAX_LEVEL: 100,
    MIN_LEVEL: 1
};

// Achievement System Constants
const ACHIEVEMENT_CONFIG = {
    // Categories
    CATEGORIES: {
        PROGRESSION: 'progression',
        COMBAT: 'combat',
        EXPLORATION: 'exploration',
        COLLECTION: 'collection',
        CHALLENGE: 'challenge',
        HIDDEN: 'hidden'
    },
    
    // Rarity levels
    RARITIES: {
        COMMON: { name: 'Common', points: 10, color: '#868e96' },
        UNCOMMON: { name: 'Uncommon', points: 25, color: '#51cf66' },
        RARE: { name: 'Rare', points: 50, color: '#339af0' },
        EPIC: { name: 'Epic', points: 100, color: '#9775fa' },
        LEGENDARY: { name: 'Legendary', points: 250, color: '#ff8cc8' }
    },
    
    // Progression tracking
    TRACK_STATISTICS: true,
    RETROACTIVE_UNLOCK: true,
    NOTIFICATION_DURATION: 3000
};

// Export all constants
const CONSTANTS = {
    APP_INFO,
    GAME_BALANCE,
    UI_CONFIG,
    COMBAT_CONFIG,
    SKILL_CONFIG,
    DUNGEON_CONFIG,
    SAVE_CONFIG,
    AUDIO_CONFIG,
    PERFORMANCE_CONFIG,
    PLATFORM_CONFIG,
    DEBUG_CONFIG,
    VALIDATION_CONFIG,
    ACHIEVEMENT_CONFIG
};

// Make constants available globally
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
    
    // Also expose individual constant groups for convenience
    Object.entries(CONSTANTS).forEach(([key, value]) => {
        window[key] = value;
    });
    
    console.log('✅ Constants loaded successfully');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}

// Game version for compatibility checking
const GAME_VERSION = APP_INFO.VERSION;
if (typeof window !== 'undefined') {
    window.GAME_VERSION = GAME_VERSION;
}