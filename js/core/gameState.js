/**
 * ===========================================
 * GAME STATE MANAGEMENT - SINGLE CHARACTER
 * ===========================================
 * Centralized state management with save/load functionality for single character
 */

class GameState {
    constructor() {
        // Core game resources
        this.resources = {
            gold: 1000,
            materials: 50,
            reputation: 10,
            experience: 0
        };

        // Turn and time management
        this.turnsLeft = 20;
        this.maxTurns = 20;
        this.currentSeason = 1;
        this.totalGameTime = 0; // in milliseconds
        this.lastPlayTime = Date.now();

        // Single character management (changed from party)
        this.selectedCharacter = null; // Single character ID
        this.adventurer = null; // Single character instance
        this.unlockedCharacters = ['guardian', 'cleric', 'rogue', 'mage'];
        this.availableMentors = []; // For future mentor system

        // Progress tracking
        this.completedDungeons = {};
        this.unlockedDungeons = ['training_grounds'];
        this.achievements = [];
        this.statistics = {
            dungeonsCompleted: 0,
            enemiesDefeated: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            totalGoldEarned: 0,
            totalMaterialsGathered: 0,
            charactersLost: 0,
            skillsLearned: 0,
            victoriesAgainstDemonLord: 0,
            // New single character stats
            totalTrainingSessions: 0,
            statImprovements: {},
            soloVictories: 0
        };

        // Combat history for unlocks and mentors
        this.combatHistory = [];
        
        // Character training history
        this.trainingHistory = [];
        
        // Game settings
        this.settings = {
            autoSave: true,
            combatSpeed: 1.0,
            showDetailedLogs: true,
            singleCharacterMode: true // New flag
        };

        // Save system
        this.saveKey = 'dungeonLordsManager_singleChar';
        this.isDirty = false;
        this.lastSaveTime = 0;
        
        console.log('🎮 Game State initialized for single character mode');
    }

    /**
     * Set selected character
     */
    setSelectedCharacter(characterId) {
        if (!this.unlockedCharacters.includes(characterId)) {
            console.warn(`Character ${characterId} is not unlocked`);
            return false;
        }
        
        this.selectedCharacter = characterId;
        this.markDirty();
        return true;
    }

    /**
     * Get current adventurer
     */
    getAdventurer() {
        return this.adventurer;
    }

    /**
     * Set current adventurer
     */
    setAdventurer(character) {
        this.adventurer = character;
        this.markDirty();
    }

    /**
     * Check if character is selected and ready
     */
    isCharacterReady() {
        return this.selectedCharacter && this.adventurer;
    }

    /**
     * Add resources
     */
    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
            this.markDirty();
            
            // Update statistics
            if (type === 'gold') {
                this.statistics.totalGoldEarned += amount;
            } else if (type === 'materials') {
                this.statistics.totalMaterialsGathered += amount;
            }
            
            return true;
        }
        return false;
    }

    /**
     * Spend resources
     */
    spendResource(type, amount) {
        if (this.resources.hasOwnProperty(type) && this.resources[type] >= amount) {
            this.resources[type] -= amount;
            this.markDirty();
            return true;
        }
        return false;
    }

    /**
     * Check if can afford cost
     */
    canAfford(costs) {
        return Object.entries(costs).every(([resource, amount]) => {
            return this.resources[resource] >= amount;
        });
    }

    /**
     * Record training session
     */
    recordTraining(stat, improvement, method = 'manual') {
        this.statistics.totalTrainingSessions++;
        
        if (!this.statistics.statImprovements[stat]) {
            this.statistics.statImprovements[stat] = 0;
        }
        this.statistics.statImprovements[stat] += improvement;
        
        this.trainingHistory.push({
            timestamp: Date.now(),
            character: this.adventurer?.name || 'Unknown',
            stat,
            improvement,
            method
        });
        
        this.markDirty();
    }

    /**
     * Complete dungeon
     */
    completeDungeon(dungeonId, success, stats = {}) {
        if (!this.completedDungeons[dungeonId]) {
            this.completedDungeons[dungeonId] = {
                attempts: 0,
                victories: 0,
                firstClearTime: null
            };
        }
        
        this.completedDungeons[dungeonId].attempts++;
        
        if (success) {
            this.completedDungeons[dungeonId].victories++;
            this.statistics.dungeonsCompleted++;
            this.statistics.soloVictories++;
            
            if (!this.completedDungeons[dungeonId].firstClearTime) {
                this.completedDungeons[dungeonId].firstClearTime = Date.now();
            }
        }
        
        // Update statistics
        if (stats.damageDealt) this.statistics.totalDamageDealt += stats.damageDealt;
        if (stats.damageTaken) this.statistics.totalDamageTaken += stats.damageTaken;
        if (stats.enemiesKilled) this.statistics.enemiesDefeated += stats.enemiesKilled;
        
        this.markDirty();
    }

    /**
     * Unlock new character
     */
    unlockCharacter(characterId) {
        if (!this.unlockedCharacters.includes(characterId)) {
            this.unlockedCharacters.push(characterId);
            this.markDirty();
            console.log(`🔓 Unlocked character: ${characterId}`);
            return true;
        }
        return false;
    }

    /**
     * Next turn
     */
    nextTurn() {
        this.turnsLeft--;
        
        if (this.turnsLeft <= 0) {
            this.currentSeason++;
            this.turnsLeft = this.maxTurns;
            console.log(`🍂 Season ${this.currentSeason} begins!`);
        }
        
        // Auto-save every few turns
        if ((this.maxTurns - this.turnsLeft) % 5 === 0) {
            this.save();
        }
        
        this.markDirty();
    }

    /**
     * Mark state as dirty (needs saving)
     */
    markDirty() {
        this.isDirty = true;
        
        if (this.settings.autoSave) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                this.save();
            }, 5000); // Auto-save after 5 seconds of inactivity
        }
    }

    /**
     * Save game state
     */
    save() {
        try {
            const saveData = {
                version: '1.0.0-single',
                timestamp: Date.now(),
                resources: this.resources,
                turnsLeft: this.turnsLeft,
                maxTurns: this.maxTurns,
                currentSeason: this.currentSeason,
                totalGameTime: this.totalGameTime,
                selectedCharacter: this.selectedCharacter,
                adventurer: this.adventurer ? {
                    id: this.adventurer.id,
                    name: this.adventurer.name,
                    level: this.adventurer.level,
                    experience: this.adventurer.experience,
                    stats: this.adventurer.stats,
                    currentHP: this.adventurer.currentHP,
                    currentMP: this.adventurer.currentMP,
                    maxHP: this.adventurer.maxHP,
                    maxMP: this.adventurer.maxMP,
                    learnedSkills: this.adventurer.learnedSkills,
                    equipment: this.adventurer.equipment,
                    combatStats: this.adventurer.combatStats,
                    trainingHistory: this.adventurer.trainingHistory
                } : null,
                unlockedCharacters: this.unlockedCharacters,
                completedDungeons: this.completedDungeons,
                unlockedDungeons: this.unlockedDungeons,
                achievements: this.achievements,
                statistics: this.statistics,
                trainingHistory: this.trainingHistory,
                settings: this.settings
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.isDirty = false;
            this.lastSaveTime = Date.now();
            
            console.log('💾 Game saved successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load game state
     */
    load() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                console.log('No save data found');
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Load basic state
            this.resources = data.resources || this.resources;
            this.turnsLeft = data.turnsLeft || this.turnsLeft;
            this.maxTurns = data.maxTurns || this.maxTurns;
            this.currentSeason = data.currentSeason || this.currentSeason;
            this.totalGameTime = data.totalGameTime || this.totalGameTime;
            this.selectedCharacter = data.selectedCharacter || null;
            this.unlockedCharacters = data.unlockedCharacters || this.unlockedCharacters;
            this.completedDungeons = data.completedDungeons || this.completedDungeons;
            this.unlockedDungeons = data.unlockedDungeons || this.unlockedDungeons;
            this.achievements = data.achievements || this.achievements;
            this.statistics = { ...this.statistics, ...data.statistics };
            this.trainingHistory = data.trainingHistory || this.trainingHistory;
            this.settings = { ...this.settings, ...data.settings };
            
            // Recreate adventurer if saved
            if (data.adventurer && this.selectedCharacter) {
                const charData = CHARACTERS_DATA[this.selectedCharacter];
                if (charData) {
                    this.adventurer = new Character(charData, this.selectedCharacter);
                    
                    // Restore saved character state
                    Object.assign(this.adventurer, data.adventurer);
                }
            }
            
            this.lastSaveTime = data.timestamp || Date.now();
            this.isDirty = false;
            
            console.log('📁 Game loaded successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    /**
     * Reset game state
     */
    reset() {
        const confirmation = confirm('Are you sure you want to reset all progress? This cannot be undone.');
        if (!confirmation) return false;
        
        localStorage.removeItem(this.saveKey);
        
        // Reset to initial state
        this.resources = { gold: 1000, materials: 50, reputation: 10, experience: 0 };
        this.turnsLeft = 20;
        this.maxTurns = 20;
        this.currentSeason = 1;
        this.totalGameTime = 0;
        this.selectedCharacter = null;
        this.adventurer = null;
        this.unlockedCharacters = ['guardian', 'cleric', 'rogue', 'mage'];
        this.completedDungeons = {};
        this.unlockedDungeons = ['training_grounds'];
        this.achievements = [];
        this.statistics = {
            dungeonsCompleted: 0,
            enemiesDefeated: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            totalGoldEarned: 0,
            totalMaterialsGathered: 0,
            charactersLost: 0,
            skillsLearned: 0,
            victoriesAgainstDemonLord: 0,
            totalTrainingSessions: 0,
            statImprovements: {},
            soloVictories: 0
        };
        this.trainingHistory = [];
        
        this.isDirty = false;
        this.lastSaveTime = 0;
        
        console.log('🔄 Game state reset');
        return true;
    }

    /**
     * Get game statistics for display
     */
    getStatistics() {
        return {
            ...this.statistics,
            currentSeason: this.currentSeason,
            turnsLeft: this.turnsLeft,
            totalPlaytime: this.totalGameTime,
            characterName: this.adventurer?.name || 'None',
            characterLevel: this.adventurer?.level || 0,
            lastSaved: new Date(this.lastSaveTime).toLocaleDateString()
        };
    }
}

// Global game state instance
if (typeof window !== 'undefined') {
    window.GameState = GameState;
    console.log('✅ Single Character GameState loaded successfully');
}