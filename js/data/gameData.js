/**
 * ===========================================
 * GAME DATA MANAGER
 * ===========================================
 * Centralized data management for all game content
 * This file combines and exports all game data from separate modules
 */

class GameDataManager {
    constructor() {
        this.characters = CHARACTERS_DATA;
        this.skills = SKILLS_DATA;
        this.dungeons = DUNGEONS_DATA;
        this.enemies = ENEMIES_DATA;
        this.achievements = ACHIEVEMENTS_DATA;
        
        // Validate data integrity on initialization
        this.validateData();
    }

    /**
     * Validate that all referenced data exists
     */
    validateData() {
        console.log('🔍 Validating game data integrity...');
        
        let errors = [];
        
        // Validate character skills exist
        Object.entries(this.characters).forEach(([charId, charData]) => {
            charData.skills.forEach(skillId => {
                if (!this.skills[skillId]) {
                    errors.push(`Character ${charId} references missing skill: ${skillId}`);
                }
            });
        });
        
        // Validate skill stat modifiers
        Object.entries(this.skills).forEach(([skillId, skillData]) => {
            const validStats = ['might', 'agility', 'mind', 'spirit', 'endurance'];
            if (!validStats.includes(skillData.statModifier)) {
                errors.push(`Skill ${skillId} has invalid stat modifier: ${skillData.statModifier}`);
            }
        });
        
        if (errors.length > 0) {
            console.error('❌ Data validation errors found:');
            errors.forEach(error => console.error(`  - ${error}`));
        } else {
            console.log('✅ All game data validated successfully');
        }
    }

    /**
     * Get character data by ID
     */
    getCharacter(characterId) {
        return this.characters[characterId] || null;
    }

    /**
     * Get skill data by ID
     */
    getSkill(skillId) {
        return this.skills[skillId] || null;
    }

    /**
     * Get dungeon data by type
     */
    getDungeon(dungeonType) {
        return this.dungeons[dungeonType] || null;
    }

    /**
     * Get enemy data by type
     */
    getEnemy(enemyType) {
        return this.enemies[enemyType] || null;
    }

    /**
     * Get all unlockable characters
     */
    getUnlockableCharacters() {
        return Object.entries(this.characters)
            .filter(([id, data]) => !data.unlocked)
            .map(([id, data]) => ({ id, ...data }));
    }

    /**
     * Get skills by trigger type
     */
    getSkillsByTrigger(triggerType) {
        return Object.entries(this.skills)
            .filter(([id, skill]) => skill.trigger === triggerType)
            .map(([id, skill]) => ({ id, ...skill }));
    }

    /**
     * Get character's available skills with full data
     */
    getCharacterSkills(characterId) {
        const character = this.getCharacter(characterId);
        if (!character) return [];
        
        return character.skills.map(skillId => ({
            id: skillId,
            ...this.getSkill(skillId)
        })).filter(skill => skill.name); // Filter out invalid skills
    }

    /**
     * Calculate recommended party composition
     */
    getRecommendedParty(availableCharacters) {
        // Simple algorithm to suggest balanced party
        const roles = ['Tank', 'Healer', 'DPS', 'Caster'];
        const recommended = [];
        
        roles.forEach(role => {
            const candidates = availableCharacters.filter(charId => {
                const char = this.getCharacter(charId);
                return char && char.archetype === role;
            });
            
            if (candidates.length > 0) {
                recommended.push(candidates[0]);
            }
        });
        
        return recommended;
    }

    /**
     * Export data for save games
     */
    exportForSave() {
        return {
            characters: this.characters,
            skills: this.skills,
            dungeons: this.dungeons,
            version: GAME_VERSION
        };
    }
}

// Global game data instance
let GameData = null;

// Initialize GameData when all data modules are loaded
function initializeGameData() {
    try {
        GameData = new GameDataManager();
        console.log('🎯 GameData initialized successfully');
        
        // Dispatch event for other systems to know data is ready
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gameDataReady', { 
                detail: { gameData: GameData } 
            }));
        }
    } catch (error) {
        console.error('❌ Failed to initialize GameData:', error);
        throw error;
    }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
    // Wait for all data modules to load
    let loadedModules = 0;
    const requiredModules = ['CHARACTERS_DATA', 'SKILLS_DATA', 'DUNGEONS_DATA', 'ENEMIES_DATA'];
    
    function checkDataReady() {
        const allLoaded = requiredModules.every(module => typeof window[module] !== 'undefined');
        if (allLoaded) {
            console.log('🎯 All game data modules loaded, initializing GameData...');
            initializeGameData();
        } else {
            const missing = requiredModules.filter(module => typeof window[module] === 'undefined');
            console.log(`⏳ Waiting for game data modules: ${missing.join(', ')}`);
            // Check again in 100ms
            setTimeout(checkDataReady, 100);
        }
    }
    
    // Start checking when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkDataReady);
    } else {
        checkDataReady();
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameDataManager, initializeGameData };
}