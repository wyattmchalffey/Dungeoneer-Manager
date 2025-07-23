/**
 * ===========================================
 * GAME STATE MANAGEMENT
 * ===========================================
 * Centralized state management with save/load functionality
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

        // Party and character management
        this.selectedCharacters = [];
        this.party = [];
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
            victoriesAgainstDemonLord: 0
        };

        // Combat history for unlocks and mentors
        this.combatHistory = [];
        
        // Game settings
        this.settings = {
            autoSave: true,
            combatSpeed: 1.0,
            showDetailedLogs: true,
            soundEnabled: true,
            musicEnabled: true
        };

        // Meta progression (carries between runs)
        this.metaProgression = {
            totalRuns: 0,
            bestTurnCount: null,
            highestLevel: 0,
            lifetimeGold: 0,
            permanentUpgrades: []
        };

        // Internal state
        this._saveVersion = '1.0.0';
        this._lastSaveTime = Date.now();
        this._isDirty = false; // Track if state needs saving
    }

    /**
     * Save game state to localStorage (ready for real storage)
     */
    save() {
        try {
            const saveData = this.createSaveData();
            
            // In a real implementation, this would use localStorage
            // localStorage.setItem('dungeonLordsManager_save', JSON.stringify(saveData));
            
            this._lastSaveTime = Date.now();
            this._isDirty = false;
            
            console.log('💾 Game state saved successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save game state:', error);
            return false;
        }
    }

    /**
     * Load game state from localStorage (ready for real storage)
     */
    load() {
        try {
            // In a real implementation, this would use localStorage
            // const saveData = localStorage.getItem('dungeonLordsManager_save');
            
            console.log('📂 Game state loaded (placeholder - no persistent storage in artifacts)');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to load game state:', error);
            return false;
        }
    }

    /**
     * Create save data object
     */
    createSaveData() {
        return {
            version: this._saveVersion,
            timestamp: Date.now(),
            gameData: {
                resources: { ...this.resources },
                turnsLeft: this.turnsLeft,
                maxTurns: this.maxTurns,
                currentSeason: this.currentSeason,
                totalGameTime: this.totalGameTime + (Date.now() - this.lastPlayTime),
                selectedCharacters: [...this.selectedCharacters],
                party: this.party.map(char => this.serializeCharacter(char)),
                unlockedCharacters: [...this.unlockedCharacters],
                completedDungeons: { ...this.completedDungeons },
                unlockedDungeons: [...this.unlockedDungeons],
                achievements: [...this.achievements],
                statistics: { ...this.statistics },
                combatHistory: [...this.combatHistory],
                settings: { ...this.settings },
                metaProgression: { ...this.metaProgression }
            }
        };
    }

    /**
     * Load from save data object
     */
    loadFromSaveData(saveData) {
        if (!saveData || !saveData.gameData) {
            throw new Error('Invalid save data format');
        }

        const data = saveData.gameData;
        
        // Load core data
        this.resources = data.resources || this.resources;
        this.turnsLeft = data.turnsLeft ?? this.turnsLeft;
        this.maxTurns = data.maxTurns ?? this.maxTurns;
        this.currentSeason = data.currentSeason ?? this.currentSeason;
        this.totalGameTime = data.totalGameTime ?? this.totalGameTime;
        
        // Load party and character data
        this.selectedCharacters = data.selectedCharacters || [];
        this.unlockedCharacters = data.unlockedCharacters || this.unlockedCharacters;
        this.party = (data.party || []).map(charData => this.deserializeCharacter(charData));
        
        // Load progress data
        this.completedDungeons = data.completedDungeons || {};
        this.unlockedDungeons = data.unlockedDungeons || this.unlockedDungeons;
        this.achievements = data.achievements || [];
        this.statistics = { ...this.statistics, ...data.statistics };
        this.combatHistory = data.combatHistory || [];
        
        // Load settings
        this.settings = { ...this.settings, ...data.settings };
        this.metaProgression = { ...this.metaProgression, ...data.metaProgression };
        
        this.lastPlayTime = Date.now();
        this._isDirty = false;
        
        console.log('📈 Save data loaded successfully');
    }

    /**
     * Serialize character for saving
     */
    serializeCharacter(character) {
        return {
            id: character.id,
            name: character.name,
            archetype: character.archetype,
            currentHP: character.currentHP,
            currentMP: character.currentMP,
            maxHP: character.maxHP,
            maxMP: character.maxMP,
            stats: { ...character.stats },
            skills: [...character.skills],
            combatStats: { ...character.combatStats },
            statusEffects: [...character.statusEffects],
            equipment: character.equipment ? { ...character.equipment } : null
        };
    }

    /**
     * Deserialize character from save data
     */
    deserializeCharacter(charData) {
        // This would create a proper Character instance
        // For now, return the data as-is since Character class is in another file
        return {
            ...charData,
            statusEffects: charData.statusEffects || [],
            equipment: charData.equipment || null
        };
    }

    /**
     * Reset game state for new run
     */
    reset() {
        // Update meta progression before reset
        this.metaProgression.totalRuns++;
        if (this.turnsLeft > 0) {
            const turnsTaken = this.maxTurns - this.turnsLeft;
            if (!this.metaProgression.bestTurnCount || turnsTaken < this.metaProgression.bestTurnCount) {
                this.metaProgression.bestTurnCount = turnsTaken;
            }
        }
        
        // Calculate highest level achieved
        if (this.party.length > 0) {
            const maxLevel = Math.max(...this.party.map(char => 
                Math.max(...Object.values(char.stats || {}))
            ));
            if (maxLevel > this.metaProgression.highestLevel) {
                this.metaProgression.highestLevel = maxLevel;
            }
        }
        
        this.metaProgression.lifetimeGold += this.statistics.totalGoldEarned;

        // Reset current run data
        this.resources = { gold: 1000, materials: 50, reputation: 10, experience: 0 };
        this.turnsLeft = this.maxTurns;
        this.currentSeason++;
        this.selectedCharacters = [];
        this.party = [];
        this.combatHistory = [];
        
        // Reset statistics for new run
        const newStats = {};
        Object.keys(this.statistics).forEach(key => {
            newStats[key] = 0;
        });
        this.statistics = newStats;
        
        // Keep unlocked content and achievements
        // Keep settings and meta progression
        
        this.markDirty();
        console.log(`🔄 New run started - Season ${this.currentSeason}`);
    }

    /**
     * Add resource with validation
     */
    addResource(type, amount) {
        if (!this.resources.hasOwnProperty(type)) {
            console.warn(`Unknown resource type: ${type}`);
            return false;
        }

        const oldValue = this.resources[type];
        this.resources[type] = Math.max(0, oldValue + amount);
        
        // Update statistics
        if (amount > 0) {
            if (type === 'gold') {
                this.statistics.totalGoldEarned += amount;
            } else if (type === 'materials') {
                this.statistics.totalMaterialsGathered += amount;
            }
        }
        
        this.markDirty();
        return true;
    }

    /**
     * Check if player can afford something
     */
    canAfford(costs) {
        if (!costs || typeof costs !== 'object') {
            return true;
        }

        // Only check actual resource costs (numeric values)
        for (const [resource, amount] of Object.entries(costs)) {
            // Skip non-resource properties
            if (typeof amount !== 'number') {
                continue;
            }
            
            // Check if this is a valid resource and we have enough
            if (this.resources.hasOwnProperty(resource)) {
                if ((this.resources[resource] || 0) < amount) {
                    console.log(`Cannot afford: need ${amount} ${resource}, have ${this.resources[resource] || 0}`);
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Spend resources with validation
     */
    spendResources(costs) {
        if (!this.canAfford(costs)) {
            return false;
        }

        // Only spend actual resource costs (numeric values)
        Object.entries(costs).forEach(([resource, amount]) => {
            if (typeof amount === 'number' && this.resources.hasOwnProperty(resource)) {
                this.addResource(resource, -amount);
            }
        });

        return true;
    }

    /**
     * Add character to unlocked list
     */
    unlockCharacter(characterId) {
        if (!this.unlockedCharacters.includes(characterId)) {
            this.unlockedCharacters.push(characterId);
            console.log(`🔓 Character unlocked: ${characterId}`);
            this.markDirty();
            return true;
        }
        return false;
    }

    /**
     * Check character unlock conditions
     */
    checkCharacterUnlocks() {
        if (typeof CHARACTER_UNLOCK_VALIDATORS === 'undefined') {
            return [];
        }

        const newUnlocks = [];
        
        Object.entries(CHARACTER_UNLOCK_VALIDATORS).forEach(([condition, validator]) => {
            // Find characters with this unlock condition
            if (typeof CHARACTERS_DATA !== 'undefined') {
                Object.entries(CHARACTERS_DATA).forEach(([charId, charData]) => {
                    if (charData.unlockCondition === condition && 
                        !this.unlockedCharacters.includes(charId) &&
                        validator(this)) {
                        
                        if (this.unlockCharacter(charId)) {
                            newUnlocks.push({
                                id: charId,
                                name: charData.name,
                                condition: condition
                            });
                        }
                    }
                });
            }
        });

        return newUnlocks;
    }

    /**
     * Add dungeon to unlocked list
     */
    unlockDungeon(dungeonId) {
        if (!this.unlockedDungeons.includes(dungeonId)) {
            this.unlockedDungeons.push(dungeonId);
            console.log(`🏰 Dungeon unlocked: ${dungeonId}`);
            this.markDirty();
            return true;
        }
        return false;
    }

    /**
     * Mark dungeon as completed
     */
    completeDungeon(dungeonId, turnsTaken = 1, victory = true) {
        if (!this.completedDungeons[dungeonId]) {
            this.completedDungeons[dungeonId] = {
                completions: 0,
                bestTime: null,
                victories: 0,
                defeats: 0,
                firstCompletionDate: Date.now()
            };
        }

        const dungeonRecord = this.completedDungeons[dungeonId];
        dungeonRecord.completions++;
        
        if (victory) {
            dungeonRecord.victories++;
            this.statistics.dungeonsCompleted++;
            
            if (!dungeonRecord.bestTime || turnsTaken < dungeonRecord.bestTime) {
                dungeonRecord.bestTime = turnsTaken;
            }
        } else {
            dungeonRecord.defeats++;
        }

        dungeonRecord.lastCompletionDate = Date.now();
        this.markDirty();
        
        // Check for new dungeon unlocks
        this.checkDungeonUnlocks();
    }

    /**
     * Check dungeon unlock conditions
     */
    checkDungeonUnlocks() {
        const unlockConditions = {
            'crystal_caverns': () => this.completedDungeons['training_grounds']?.victories > 0,
            'ancient_library': () => this.completedDungeons['crystal_caverns']?.victories > 0,
            'shadow_fortress': () => this.completedDungeons['ancient_library']?.victories > 0,
            'elemental_planes': () => this.completedDungeons['shadow_fortress']?.victories > 0
        };

        Object.entries(unlockConditions).forEach(([dungeonId, condition]) => {
            if (!this.unlockedDungeons.includes(dungeonId) && condition()) {
                this.unlockDungeon(dungeonId);
            }
        });
    }

    /**
     * Add achievement
     */
    addAchievement(achievementId) {
        if (!this.achievements.includes(achievementId)) {
            this.achievements.push(achievementId);
            console.log(`🏆 Achievement unlocked: ${achievementId}`);
            this.markDirty();
            
            // Apply achievement rewards if defined
            if (typeof ACHIEVEMENTS_DATA !== 'undefined' && ACHIEVEMENTS_DATA[achievementId]) {
                const reward = ACHIEVEMENTS_DATA[achievementId].reward;
                this.applyReward(reward);
            }
            
            return true;
        }
        return false;
    }

    /**
     * Apply reward object to game state
     */
    applyReward(reward) {
        if (!reward) return;

        Object.entries(reward).forEach(([rewardType, value]) => {
            switch (rewardType) {
                case 'gold':
                case 'materials':
                case 'experience':
                case 'reputation':
                    this.addResource(rewardType, value);
                    break;
                case 'skillBook':
                    // Handle skill book rewards
                    break;
                case 'darkArtifact':
                case 'elementalCore':
                case 'legendaryArtifact':
                    // Handle special item rewards
                    break;
                case 'specialUnlock':
                    if (typeof value === 'string') {
                        this.unlockCharacter(value);
                    }
                    break;
                case 'legendaryTitle':
                    // Handle title rewards
                    break;
            }
        });
    }

    /**
     * Record combat encounter for history and unlocks
     */
    recordCombat(combatData) {
        const record = {
            timestamp: Date.now(),
            dungeon: combatData.dungeon || 'unknown',
            enemy: combatData.enemy || 'unknown',
            victory: combatData.victory || false,
            turnsTaken: combatData.turnsTaken || 1,
            damageDealt: combatData.damageDealt || 0,
            damageReceived: combatData.damageReceived || 0,
            skillsUsed: combatData.skillsUsed || [],
            partyComposition: combatData.partyComposition || [],
            minPartyHealth: combatData.minPartyHealth || 100,
            magicDamagePercent: combatData.magicDamagePercent || 0,
            isBoss: combatData.isBoss || false,
            enemyType: combatData.enemyType || 'normal'
        };

        this.combatHistory.push(record);
        
        // Keep history manageable (last 100 combats)
        if (this.combatHistory.length > 100) {
            this.combatHistory = this.combatHistory.slice(-100);
        }

        // Update statistics
        if (record.victory) {
            this.statistics.enemiesDefeated++;
        }
        if (record.enemy === 'demon_lord_malphas' && record.victory) {
            this.statistics.victoriesAgainstDemonLord++;
        }
        this.statistics.totalDamageDealt += record.damageDealt;
        this.statistics.totalDamageTaken += record.damageReceived;
        this.statistics.skillsLearned += record.skillsUsed.length;

        this.markDirty();
        
        // Check for achievement unlocks
        this.checkAchievementUnlocks();
        this.checkCharacterUnlocks();
    }

    /**
     * Check achievement unlock conditions
     */
    checkAchievementUnlocks() {
        const conditions = {
            'FIRST_STEPS': () => this.statistics.dungeonsCompleted >= 1,
            'CRYSTAL_EXPLORER': () => this.completedDungeons['crystal_caverns']?.completions >= 3,
            'SCHOLAR': () => this.statistics.skillsLearned >= 10,
            'SHADOW_WALKER': () => this.combatHistory.some(c => 
                c.dungeon === 'shadow_fortress' && c.victory && c.damageReceived === 0
            ),
            'ELEMENTAL_MASTER': () => {
                const elementalVictories = this.combatHistory.filter(c => 
                    c.victory && ['fire_elemental', 'frost_giant', 'storm_lord', 'earth_titan'].includes(c.enemy)
                );
                return new Set(elementalVictories.map(c => c.enemy)).size >= 4;
            },
            'DEMON_SLAYER': () => this.statistics.victoriesAgainstDemonLord >= 1
        };

        Object.entries(conditions).forEach(([achievementId, condition]) => {
            if (!this.achievements.includes(achievementId) && condition()) {
                this.addAchievement(achievementId);
            }
        });
    }

    /**
     * Advance turn with validation
     */
    advanceTurn(turns = 1) {
        this.turnsLeft = Math.max(0, this.turnsLeft - turns);
        this.markDirty();
        
        if (this.turnsLeft <= 0) {
            console.log('⏰ Final turn reached!');
            return { finalTurn: true };
        }
        
        return { turnsLeft: this.turnsLeft };
    }

    /**
     * Get game progress summary
     */
    getProgressSummary() {
        return {
            season: this.currentSeason,
            turnsLeft: this.turnsLeft,
            resources: { ...this.resources },
            partySize: this.party.length,
            unlockedCharacters: this.unlockedCharacters.length,
            unlockedDungeons: this.unlockedDungeons.length,
            achievements: this.achievements.length,
            dungeonsCompleted: this.statistics.dungeonsCompleted,
            enemiesDefeated: this.statistics.enemiesDefeated,
            demonLordVictories: this.statistics.victoriesAgainstDemonLord
        };
    }

    /**
     * Mark state as dirty (needs saving)
     */
    markDirty() {
        this._isDirty = true;
    }

    /**
     * Check if state needs saving
     */
    isDirty() {
        return this._isDirty;
    }

    /**
     * Update play time tracking
     */
    updatePlayTime() {
        const now = Date.now();
        const sessionTime = now - this.lastPlayTime;
        this.totalGameTime += sessionTime;
        this.lastPlayTime = now;
    }

    /**
     * Get formatted play time
     */
    getFormattedPlayTime() {
        this.updatePlayTime();
        const totalMinutes = Math.floor(this.totalGameTime / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    /**
     * Export state for debugging
     */
    exportState() {
        return JSON.stringify(this.createSaveData(), null, 2);
    }

    /**
     * Import state from string
     */
    importState(stateString) {
        try {
            const saveData = JSON.parse(stateString);
            this.loadFromSaveData(saveData);
            return true;
        } catch (error) {
            console.error('❌ Failed to import state:', error);
            return false;
        }
    }

    /**
     * Validate state integrity
     */
    validateState() {
        const issues = [];
        
        // Check resources are non-negative
        Object.entries(this.resources).forEach(([resource, value]) => {
            if (typeof value !== 'number' || value < 0) {
                issues.push(`Invalid ${resource} value: ${value}`);
            }
        });
        
        // Check turns are valid
        if (this.turnsLeft < 0 || this.turnsLeft > this.maxTurns) {
            issues.push(`Invalid turns left: ${this.turnsLeft}`);
        }
        
        // Check party size
        if (this.party.length > 4) {
            issues.push(`Invalid party size: ${this.party.length}`);
        }
        
        // Check unlocked characters exist
        if (typeof CHARACTERS_DATA !== 'undefined') {
            this.unlockedCharacters.forEach(charId => {
                if (!CHARACTERS_DATA[charId]) {
                    issues.push(`Unknown character: ${charId}`);
                }
            });
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.GameState = GameState;
    console.log('✅ GameState class loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}