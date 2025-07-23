/**
 * ===========================================
 * ENHANCED VALIDATION UTILITIES
 * ===========================================
 * Enhanced validation system with memory management and bug fixes
 */

// Extend the existing ValidationUtils from helpers.js instead of creating a new class
if (typeof ValidationUtils !== 'undefined') {
    // Enhance existing ValidationUtils with new methods
    ValidationUtils.validationCache = new Map();
    ValidationUtils.maxCacheSize = 100;
    ValidationUtils.lastCleanup = Date.now();
    ValidationUtils.cleanupInterval = 300000; // 5 minutes

    /**
     * Enhanced game state validation with caching
     */
    ValidationUtils.validateGameStateEnhanced = function(gameState) {
        if (!gameState) {
            return {
                valid: false,
                errors: ['Game state is null or undefined'],
                warnings: []
            };
        }

        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // Check required properties
            const requiredProps = ['adventurer', 'resources', 'gameVersion'];
            requiredProps.forEach(prop => {
                if (!gameState.hasOwnProperty(prop)) {
                    result.errors.push(`Missing required property: ${prop}`);
                    result.valid = false;
                }
            });

            // Validate adventurer
            if (gameState.adventurer) {
                const adventurerValidation = this.validateCharacterEnhanced(gameState.adventurer);
                if (!adventurerValidation.valid) {
                    result.errors.push(...adventurerValidation.errors.map(e => `Adventurer: ${e}`));
                    result.valid = false;
                }
                result.warnings.push(...adventurerValidation.warnings.map(w => `Adventurer: ${w}`));
            }

            // Validate resources
            if (gameState.resources) {
                const resourceValidation = this.validateResourcesEnhanced(gameState.resources);
                if (!resourceValidation.valid) {
                    result.errors.push(...resourceValidation.errors);
                    result.valid = false;
                }
                result.warnings.push(...resourceValidation.warnings);
            }

            // Check for data corruption
            const corruptionCheck = this.checkDataCorruption(gameState);
            if (corruptionCheck.length > 0) {
                result.warnings.push(...corruptionCheck);
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Validation error: ${error.message}`);
        }

        return result;
    };

    /**
     * Enhanced character validation
     */
    ValidationUtils.validateCharacterEnhanced = function(character) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!character) {
            return {
                valid: false,
                errors: ['Character is null or undefined'],
                warnings: []
            };
        }

        try {
            // Check required properties
            const requiredProps = ['name', 'level', 'currentHP', 'maxHP', 'stats'];
            requiredProps.forEach(prop => {
                if (!character.hasOwnProperty(prop)) {
                    result.errors.push(`Missing required property: ${prop}`);
                    result.valid = false;
                }
            });

            // Validate numeric properties
            const numericProps = ['level', 'currentHP', 'maxHP', 'currentMP', 'maxMP'];
            numericProps.forEach(prop => {
                if (character.hasOwnProperty(prop)) {
                    if (typeof character[prop] !== 'number' || isNaN(character[prop])) {
                        result.errors.push(`${prop} must be a valid number`);
                        result.valid = false;
                    } else if (character[prop] < 0) {
                        result.errors.push(`${prop} cannot be negative`);
                        result.valid = false;
                    }
                }
            });

            // Validate stats object
            if (character.stats) {
                const statValidation = this.validateStatsEnhanced(character.stats);
                if (!statValidation.valid) {
                    result.errors.push(...statValidation.errors);
                    result.valid = false;
                }
                result.warnings.push(...statValidation.warnings);
            }

            // Logical validations
            if (character.currentHP > character.maxHP) {
                result.warnings.push('Current HP exceeds max HP');
            }

            if (character.currentMP && character.maxMP && character.currentMP > character.maxMP) {
                result.warnings.push('Current MP exceeds max MP');
            }

            if (character.level < 1) {
                result.errors.push('Level cannot be less than 1');
                result.valid = false;
            }

            if (character.level > 100) {
                result.warnings.push('Level is unusually high (>100)');
            }

            // Validate arrays
            if (character.learnedSkills && !Array.isArray(character.learnedSkills)) {
                result.errors.push('learnedSkills must be an array');
                result.valid = false;
            }

            if (character.masteredSkills && !Array.isArray(character.masteredSkills)) {
                result.errors.push('masteredSkills must be an array');
                result.valid = false;
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Character validation error: ${error.message}`);
        }

        return result;
    };

    /**
     * Enhanced stats validation
     */
    ValidationUtils.validateStatsEnhanced = function(stats) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!stats || typeof stats !== 'object') {
            return {
                valid: false,
                errors: ['Stats must be an object'],
                warnings: []
            };
        }

        const expectedStats = ['might', 'agility', 'mind', 'spirit', 'endurance'];
        
        expectedStats.forEach(stat => {
            if (!stats.hasOwnProperty(stat)) {
                result.errors.push(`Missing stat: ${stat}`);
                result.valid = false;
            } else if (typeof stats[stat] !== 'number' || isNaN(stats[stat])) {
                result.errors.push(`${stat} must be a valid number`);
                result.valid = false;
            } else if (stats[stat] < 0) {
                result.errors.push(`${stat} cannot be negative`);
                result.valid = false;
            } else if (stats[stat] > 1000) {
                result.warnings.push(`${stat} is unusually high (${stats[stat]})`);
            }
        });

        return result;
    };

    /**
     * Enhanced resources validation
     */
    ValidationUtils.validateResourcesEnhanced = function(resources) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!resources || typeof resources !== 'object') {
            return {
                valid: false,
                errors: ['Resources must be an object'],
                warnings: []
            };
        }

        const expectedResources = ['gold', 'materials', 'experience'];
        
        expectedResources.forEach(resource => {
            if (!resources.hasOwnProperty(resource)) {
                result.errors.push(`Missing resource: ${resource}`);
                result.valid = false;
            } else if (typeof resources[resource] !== 'number' || isNaN(resources[resource])) {
                result.errors.push(`${resource} must be a valid number`);
                result.valid = false;
            } else if (resources[resource] < 0) {
                result.errors.push(`${resource} cannot be negative`);
                result.valid = false;
            } else if (resources[resource] > 999999) {
                result.warnings.push(`${resource} is unusually high (${resources[resource]})`);
            }
        });

        return result;
    };

    /**
     * Check for data corruption indicators
     */
    ValidationUtils.checkDataCorruption = function(data) {
        const issues = [];

        try {
            // Check for circular references
            try {
                JSON.stringify(data);
            } catch (error) {
                if (error.message.includes('circular')) {
                    issues.push('Circular reference detected in game data');
                }
            }

            // Check for unusually large data structures
            const dataString = JSON.stringify(data);
            if (dataString.length > 1000000) { // 1MB threshold
                issues.push(`Game data is unusually large: ${Math.round(dataString.length / 1024)}KB`);
            }

            // Check for null/undefined properties in critical objects
            if (data.adventurer) {
                Object.entries(data.adventurer).forEach(([key, value]) => {
                    if (value === null && key !== 'equipment') {
                        issues.push(`Null value in adventurer.${key}`);
                    }
                });
            }

            // Check timestamp validity
            if (data.lastSaved) {
                const lastSaved = new Date(data.lastSaved);
                const now = new Date();
                if (lastSaved > now) {
                    issues.push('Last saved timestamp is in the future');
                } else if (now - lastSaved > 365 * 24 * 60 * 60 * 1000) {
                    issues.push('Save data is over a year old');
                }
            }

        } catch (error) {
            issues.push(`Corruption check failed: ${error.message}`);
        }

        return issues;
    };

    /**
     * Enhanced performance checking
     */
    ValidationUtils.checkPerformanceEnhanced = function() {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // Check memory usage if available
            if (performance.memory) {
                const memoryInfo = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };

                if (memoryInfo.used > memoryInfo.limit * 0.8) {
                    result.warnings.push(`High memory usage: ${memoryInfo.used}MB of ${memoryInfo.limit}MB`);
                }

                if (memoryInfo.used > 100) { // 100MB threshold
                    result.warnings.push(`Memory usage is high: ${memoryInfo.used}MB`);
                }
            }

            // Check for large objects in global scope
            const largeObjects = [];
            if (typeof window !== 'undefined') {
                Object.keys(window).forEach(key => {
                    try {
                        const obj = window[key];
                        if (obj && typeof obj === 'object' && obj !== window) {
                            const jsonSize = JSON.stringify(obj).length;
                            if (jsonSize > 100000) { // 100KB threshold
                                largeObjects.push(`${key}: ~${Math.round(jsonSize / 1024)}KB`);
                            }
                        }
                    } catch (e) {
                        // Skip objects that can't be stringified
                    }
                });
            }

            if (largeObjects.length > 0) {
                result.warnings.push(`Large objects detected: ${largeObjects.join(', ')}`);
            }

            // Check for excessive DOM elements
            if (typeof document !== 'undefined') {
                const elementCount = document.querySelectorAll('*').length;
                if (elementCount > 5000) {
                    result.warnings.push(`High DOM element count: ${elementCount}`);
                }
            }

            // Check for memory leaks in validation cache
            this.cleanupValidationCache();

        } catch (error) {
            result.warnings.push(`Performance check failed: ${error.message}`);
        }

        return result;
    };

    /**
     * Clean up validation cache to prevent memory leaks
     */
    ValidationUtils.cleanupValidationCache = function() {
        const now = Date.now();
        
        // Only cleanup if enough time has passed
        if (now - this.lastCleanup < this.cleanupInterval) {
            return;
        }

        if (this.validationCache.size > this.maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(this.validationCache.entries());
            const toRemove = entries.slice(0, Math.floor(this.maxCacheSize / 2));
            
            toRemove.forEach(([key]) => {
                this.validationCache.delete(key);
            });
            
            console.log(`🧹 Cleaned up ${toRemove.length} validation cache entries`);
        }
        
        this.lastCleanup = now;
    };

    /**
     * Validate dungeon exploration state
     */
    ValidationUtils.validateDungeonState = function(exploration) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!exploration) {
            return {
                valid: false,
                errors: ['Exploration state is null or undefined'],
                warnings: []
            };
        }

        try {
            // Check required properties
            const requiredProps = ['party', 'dungeonType', 'state', 'dungeon'];
            requiredProps.forEach(prop => {
                if (!exploration.hasOwnProperty(prop)) {
                    result.errors.push(`Missing required property: ${prop}`);
                    result.valid = false;
                }
            });

            // Validate party
            if (exploration.party) {
                if (!Array.isArray(exploration.party)) {
                    result.errors.push('Party must be an array');
                    result.valid = false;
                } else if (exploration.party.length === 0) {
                    result.errors.push('Party cannot be empty');
                    result.valid = false;
                } else {
                    // Validate each party member
                    exploration.party.forEach((member, index) => {
                        const memberValidation = this.validateCharacterEnhanced(member);
                        if (!memberValidation.valid) {
                            result.errors.push(`Party member ${index}: ${memberValidation.errors.join(', ')}`);
                            result.valid = false;
                        }
                    });
                }
            }

            // Validate state
            const validStates = ['exploring', 'combat', 'paused', 'completed', 'retreated'];
            if (exploration.state && !validStates.includes(exploration.state)) {
                result.errors.push(`Invalid exploration state: ${exploration.state}`);
                result.valid = false;
            }

            // Check for stuck states
            if (exploration.explorationLog && exploration.explorationLog.length > 1000) {
                result.warnings.push('Exploration log is very large, may indicate stuck state');
            }

            // Validate dungeon type
            if (exploration.dungeonType && typeof DUNGEONS_DATA !== 'undefined') {
                if (!DUNGEONS_DATA[exploration.dungeonType]) {
                    result.errors.push(`Unknown dungeon type: ${exploration.dungeonType}`);
                    result.valid = false;
                }
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Dungeon state validation error: ${error.message}`);
        }

        return result;
    };

    /**
     * Validate combat state
     */
    ValidationUtils.validateCombatStateEnhanced = function(combat) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!combat) {
            return { valid: true }; // No combat is valid
        }

        try {
            // Check required properties
            const requiredProps = ['party', 'enemies', 'round', 'phase'];
            requiredProps.forEach(prop => {
                if (!combat.hasOwnProperty(prop)) {
                    result.errors.push(`Missing required property: ${prop}`);
                    result.valid = false;
                }
            });

            // Validate party
            if (combat.party) {
                if (!Array.isArray(combat.party) || combat.party.length === 0) {
                    result.errors.push('Combat party must be a non-empty array');
                    result.valid = false;
                }
            }

            // Validate enemies
            if (combat.enemies) {
                if (!Array.isArray(combat.enemies) || combat.enemies.length === 0) {
                    result.errors.push('Combat enemies must be a non-empty array');
                    result.valid = false;
                }
            }

            // Check for excessive rounds
            if (combat.round > 50) {
                result.warnings.push(`Combat has many rounds: ${combat.round}`);
            }

            if (combat.round > 100) {
                result.errors.push('Combat has exceeded maximum rounds');
                result.valid = false;
            }

            // Validate phase
            const validPhases = ['player_turn', 'enemy_turn', 'resolution'];
            if (combat.phase && !validPhases.includes(combat.phase)) {
                result.errors.push(`Invalid combat phase: ${combat.phase}`);
                result.valid = false;
            }

            // Check combat duration
            if (combat.startTime) {
                const duration = Date.now() - combat.startTime;
                if (duration > 300000) { // 5 minutes
                    result.warnings.push(`Combat has been running for ${Math.round(duration / 60000)} minutes`);
                }
                if (duration > 600000) { // 10 minutes
                    result.errors.push('Combat has exceeded maximum duration');
                    result.valid = false;
                }
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Combat state validation error: ${error.message}`);
        }

        return result;
    };

    /**
     * Emergency cleanup for memory issues
     */
    ValidationUtils.emergencyCleanup = function() {
        console.warn('🚨 Performing emergency cleanup...');
        
        try {
            // Clear validation cache
            this.validationCache.clear();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            // Clear any large global arrays
            if (window.CombatManager?.combatLog) {
                window.CombatManager.combatLog = window.CombatManager.combatLog.slice(-10);
            }
            
            // Remove orphaned modal elements
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach((modal, index) => {
                if (index > 0) { // Keep only the first modal
                    modal.remove();
                }
            });
            
            console.log('✅ Emergency cleanup completed');
            
        } catch (error) {
            console.error('Emergency cleanup failed:', error);
        }
    };

    /**
     * Get system health report
     */
    ValidationUtils.getSystemHealth = function() {
        const health = {
            status: 'healthy',
            issues: [],
            metrics: {}
        };

        try {
            // Memory metrics
            if (performance.memory) {
                health.metrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                if (health.metrics.memory.used > health.metrics.memory.limit * 0.8) {
                    health.status = 'warning';
                    health.issues.push('High memory usage');
                }
            }

            // Cache metrics
            health.metrics.cache = {
                size: this.validationCache.size,
                maxSize: this.maxCacheSize
            };

            // DOM metrics
            if (typeof document !== 'undefined') {
                health.metrics.dom = {
                    elements: document.querySelectorAll('*').length,
                    modals: document.querySelectorAll('.modal-overlay').length
                };
                
                if (health.metrics.dom.elements > 5000) {
                    health.status = 'warning';
                    health.issues.push('High DOM element count');
                }
                
                if (health.metrics.dom.modals > 2) {
                    health.status = 'warning';
                    health.issues.push('Multiple modals open');
                }
            }

        } catch (error) {
            health.status = 'error';
            health.issues.push(`Health check failed: ${error.message}`);
        }

        return health;
    };

    /**
     * Auto-fix common validation issues
     */
    ValidationUtils.autoFixValidationIssues = function(data, validationType) {
        const fixes = [];

        try {
            switch (validationType) {
                case 'character':
                    if (data.currentHP > data.maxHP) {
                        data.currentHP = data.maxHP;
                        fixes.push('Fixed current HP exceeding max HP');
                    }
                    
                    if (data.currentMP && data.maxMP && data.currentMP > data.maxMP) {
                        data.currentMP = data.maxMP;
                        fixes.push('Fixed current MP exceeding max MP');
                    }
                    
                    if (data.level < 1) {
                        data.level = 1;
                        fixes.push('Fixed level below minimum');
                    }
                    
                    // Ensure required arrays exist
                    if (!data.learnedSkills) {
                        data.learnedSkills = [];
                        fixes.push('Added missing learnedSkills array');
                    }
                    
                    if (!data.masteredSkills) {
                        data.masteredSkills = [];
                        fixes.push('Added missing masteredSkills array');
                    }
                    
                    // Fix negative stats
                    if (data.stats) {
                        Object.keys(data.stats).forEach(stat => {
                            if (data.stats[stat] < 0) {
                                data.stats[stat] = 0;
                                fixes.push(`Fixed negative ${stat} stat`);
                            }
                        });
                    }
                    break;
                    
                case 'resources':
                    Object.keys(data).forEach(resource => {
                        if (data[resource] < 0) {
                            data[resource] = 0;
                            fixes.push(`Fixed negative ${resource}`);
                        }
                    });
                    break;
                    
                case 'gameState':
                    if (!data.resources) {
                        data.resources = { gold: 0, materials: 0, experience: 0 };
                        fixes.push('Added missing resources object');
                    }
                    
                    if (!data.gameVersion) {
                        data.gameVersion = '1.0.0';
                        fixes.push('Added missing game version');
                    }
                    break;
            }
        } catch (error) {
            console.error('Auto-fix failed:', error);
            fixes.push(`Auto-fix error: ${error.message}`);
        }

        return fixes;
    };

    /**
     * Comprehensive game integrity check
     */
    ValidationUtils.performIntegrityCheck = function(gameData) {
        console.log('🔍 Starting enhanced game integrity check...');
        
        const results = {
            overall: true,
            checks: [],
            errors: [],
            warnings: []
        };

        // Check game state
        if (gameData) {
            const gameStateCheck = this.validateGameStateEnhanced(gameData);
            results.checks.push({
                name: 'Game State',
                valid: gameStateCheck.valid,
                errors: gameStateCheck.errors,
                warnings: gameStateCheck.warnings
            });

            if (!gameStateCheck.valid) {
                results.overall = false;
                results.errors.push(...gameStateCheck.errors);
            }
            results.warnings.push(...gameStateCheck.warnings);
        }

        // Check data consistency
        if (typeof CHARACTERS_DATA !== 'undefined') {
            const dataConsistency = this.checkDataConsistency();
            results.checks.push({
                name: 'Data Consistency',
                valid: dataConsistency.valid,
                errors: dataConsistency.errors,
                warnings: dataConsistency.warnings
            });

            if (!dataConsistency.valid) {
                results.overall = false;
                results.errors.push(...dataConsistency.errors);
            }
            results.warnings.push(...dataConsistency.warnings);
        }

        // Performance check
        const performanceCheck = this.checkPerformanceEnhanced();
        results.checks.push({
            name: 'Performance',
            valid: performanceCheck.valid,
            errors: performanceCheck.errors,
            warnings: performanceCheck.warnings
        });

        results.warnings.push(...performanceCheck.warnings);

        console.log(`✅ Enhanced integrity check complete: ${results.overall ? 'PASSED' : 'FAILED'}`);
        console.log(`Errors: ${results.errors.length}, Warnings: ${results.warnings.length}`);

        return results;
    };

    /**
     * Check data consistency between game data files
     */
    ValidationUtils.checkDataConsistency = function() {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // Check character skills exist
            if (typeof CHARACTERS_DATA !== 'undefined' && typeof SKILLS_DATA !== 'undefined') {
                Object.entries(CHARACTERS_DATA).forEach(([charId, charData]) => {
                    if (charData.skills) {
                        charData.skills.forEach(skillId => {
                            if (!SKILLS_DATA[skillId]) {
                                result.errors.push(`Character ${charId} references missing skill: ${skillId}`);
                                result.valid = false;
                            }
                        });
                    }
                });
            }

            // Check skill stat modifiers are valid
            if (typeof SKILLS_DATA !== 'undefined') {
                const validStats = ['might', 'agility', 'mind', 'spirit', 'endurance'];
                Object.entries(SKILLS_DATA).forEach(([skillId, skillData]) => {
                    if (skillData.statModifier && !validStats.includes(skillData.statModifier)) {
                        result.errors.push(`Skill ${skillId} has invalid stat modifier: ${skillData.statModifier}`);
                        result.valid = false;
                    }
                });
            }

            // Check dungeon enemies exist
            if (typeof DUNGEONS_DATA !== 'undefined' && typeof ENEMIES_DATA !== 'undefined') {
                Object.entries(DUNGEONS_DATA).forEach(([dungeonId, dungeonData]) => {
                    if (dungeonData.possibleEnemies) {
                        dungeonData.possibleEnemies.forEach(enemyId => {
                            if (!ENEMIES_DATA[enemyId]) {
                                result.warnings.push(`Dungeon ${dungeonId} references missing enemy: ${enemyId}`);
                            }
                        });
                    }
                });
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Data consistency check failed: ${error.message}`);
        }

        return result;
    };

} else {
    console.error('❌ ValidationUtils not found - cannot enhance validation system');
}

        return result;
    }

    /**
     * Check data consistency between game data files
     */
    static checkDataConsistency() {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // Check character skills exist
            if (typeof CHARACTERS_DATA !== 'undefined' && typeof SKILLS_DATA !== 'undefined') {
                Object.entries(CHARACTERS_DATA).forEach(([charId, charData]) => {
                    if (charData.skills) {
                        charData.skills.forEach(skillId => {
                            if (!SKILLS_DATA[skillId]) {
                                result.errors.push(`Character ${charId} references missing skill: ${skillId}`);
                                result.valid = false;
                            }
                        });
                    }
                });
            }

            // Check skill stat modifiers are valid
            if (typeof SKILLS_DATA !== 'undefined') {
                const validStats = ['might', 'agility', 'mind', 'spirit', 'endurance'];
                Object.entries(SKILLS_DATA).forEach(([skillId, skillData]) => {
                    if (skillData.statModifier && !validStats.includes(skillData.statModifier)) {
                        result.errors.push(`Skill ${skillId} has invalid stat modifier: ${skillData.statModifier}`);
                        result.valid = false;
                    }
                });
            }

            // Check dungeon enemies exist
            if (typeof DUNGEONS_DATA !== 'undefined' && typeof ENEMIES_DATA !== 'undefined') {
                Object.entries(DUNGEONS_DATA).forEach(([dungeonId, dungeonData]) => {
                    if (dungeonData.possibleEnemies) {
                        dungeonData.possibleEnemies.forEach(enemyId => {
                            if (!ENEMIES_DATA[enemyId]) {
                                result.warnings.push(`Dungeon ${dungeonId} references missing enemy: ${enemyId}`);
                            }
                        });
                    }
                });
            }

            // Check for duplicate IDs
            this.checkDuplicateIds(result);

        } catch (error) {
            result.valid = false;
            result.errors.push(`Data consistency check failed: ${error.message}`);
        }

        return result;
    }

    /**
     * Check for duplicate IDs across data sets
     */
    static checkDuplicateIds(result) {
        const allIds = new Set();
        const duplicates = [];

        // Collect all IDs from different data sources
        const dataSources = [
            { name: 'CHARACTERS_DATA', data: typeof CHARACTERS_DATA !== 'undefined' ? CHARACTERS_DATA : {} },
            { name: 'SKILLS_DATA', data: typeof SKILLS_DATA !== 'undefined' ? SKILLS_DATA : {} },
            { name: 'ENEMIES_DATA', data: typeof ENEMIES_DATA !== 'undefined' ? ENEMIES_DATA : {} },
            { name: 'DUNGEONS_DATA', data: typeof DUNGEONS_DATA !== 'undefined' ? DUNGEONS_DATA : {} }
        ];

        dataSources.forEach(source => {
            Object.keys(source.data).forEach(id => {
                if (allIds.has(id)) {
                    duplicates.push(`Duplicate ID '${id}' found in ${source.name}`);
                } else {
                    allIds.add(id);
                }
            });
        });

        if (duplicates.length > 0) {
            result.warnings.push(...duplicates);
        }
    }

    /**
     * Check performance metrics and memory usage
     */
    static checkPerformance() {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // Check memory usage if available
            if (performance.memory) {
                const memoryInfo = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };

                if (memoryInfo.used > memoryInfo.limit * 0.8) {
                    result.warnings.push(`High memory usage: ${memoryInfo.used}MB of ${memoryInfo.limit}MB`);
                }

                if (memoryInfo.used > 100) { // 100MB threshold
                    result.warnings.push(`Memory usage is high: ${memoryInfo.used}MB`);
                }
            }

            // Check for large objects in global scope
            const largeObjects = [];
            if (typeof window !== 'undefined') {
                Object.keys(window).forEach(key => {
                    try {
                        const obj = window[key];
                        if (obj && typeof obj === 'object' && obj !== window) {
                            const jsonSize = JSON.stringify(obj).length;
                            if (jsonSize > 100000) { // 100KB threshold
                                largeObjects.push(`${key}: ~${Math.round(jsonSize / 1024)}KB`);
                            }
                        }
                    } catch (e) {
                        // Skip objects that can't be stringified
                    }
                });
            }

            if (largeObjects.length > 0) {
                result.warnings.push(`Large objects detected: ${largeObjects.join(', ')}`);
            }

            // Check for excessive DOM elements
            if (typeof document !== 'undefined') {
                const elementCount = document.querySelectorAll('*').length;
                if (elementCount > 5000) {
                    result.warnings.push(`High DOM element count: ${elementCount}`);
                }
            }

            // Check for memory leaks in validation cache
            this.cleanupCache();

        } catch (error) {
            result.warnings.push(`Performance check failed: ${error.message}`);
        }

        return result;
    }

    /**
     * Auto-fix common validation issues
     */
    static autoFix(data, validationType) {
        const fixes = [];

        try {
            switch (validationType) {
                case 'character':
                    if (data.currentHP > data.maxHP) {
                        data.currentHP = data.maxHP;
                        fixes.push('Fixed current HP exceeding max HP');
                    }
                    
                    if (data.currentMP && data.maxMP && data.currentMP > data.maxMP) {
                        data.currentMP = data.maxMP;
                        fixes.push('Fixed current MP exceeding max MP');
                    }
                    
                    if (data.level < 1) {
                        data.level = 1;
                        fixes.push('Fixed level below minimum');
                    }
                    
                    // Ensure required arrays exist
                    if (!data.learnedSkills) {
                        data.learnedSkills = [];
                        fixes.push('Added missing learnedSkills array');
                    }
                    
                    if (!data.masteredSkills) {
                        data.masteredSkills = [];
                        fixes.push('Added missing masteredSkills array');
                    }
                    
                    // Fix negative stats
                    if (data.stats) {
                        Object.keys(data.stats).forEach(stat => {
                            if (data.stats[stat] < 0) {
                                data.stats[stat] = 0;
                                fixes.push(`Fixed negative ${stat} stat`);
                            }
                        });
                    }
                    break;
                    
                case 'resources':
                    Object.keys(data).forEach(resource => {
                        if (data[resource] < 0) {
                            data[resource] = 0;
                            fixes.push(`Fixed negative ${resource}`);
                        }
                    });
                    break;
                    
                case 'gameState':
                    if (!data.resources) {
                        data.resources = { gold: 0, materials: 0, experience: 0 };
                        fixes.push('Added missing resources object');
                    }
                    
                    if (!data.gameVersion) {
                        data.gameVersion = '1.0.0';
                        fixes.push('Added missing game version');
                    }
                    break;
            }
        } catch (error) {
            console.error('Auto-fix failed:', error);
            fixes.push(`Auto-fix error: ${error.message}`);
        }

        return fixes;
    }

    /**
     * Comprehensive game integrity check
     */
    static performIntegrityCheck(gameData) {
        console.log('🔍 Starting game integrity check...');
        
        const results = {
            overall: true,
            checks: [],
            errors: [],
            warnings: []
        };

        // Check game state
        if (gameData) {
            const gameStateCheck = this.validateGameState(gameData);
            results.checks.push({
                name: 'Game State',
                valid: gameStateCheck.valid,
                errors: gameStateCheck.errors,
                warnings: gameStateCheck.warnings
            });

            if (!gameStateCheck.valid) {
                results.overall = false;
                results.errors.push(...gameStateCheck.errors);
            }
            results.warnings.push(...gameStateCheck.warnings);
        }

        // Check data consistency
        if (typeof CHARACTERS_DATA !== 'undefined') {
            const dataConsistency = this.checkDataConsistency();
            results.checks.push({
                name: 'Data Consistency',
                valid: dataConsistency.valid,
                errors: dataConsistency.errors,
                warnings: dataConsistency.warnings
            });

            if (!dataConsistency.valid) {
                results.overall = false;
                results.errors.push(...dataConsistency.errors);
            }
            results.warnings.push(...dataConsistency.warnings);
        }

        // Performance check
        const performanceCheck = this.checkPerformance();
        results.checks.push({
            name: 'Performance',
            valid: performanceCheck.valid,
            errors: performanceCheck.errors,
            warnings: performanceCheck.warnings
        });

        results.warnings.push(...performanceCheck.warnings);

        console.log(`✅ Integrity check complete: ${results.overall ? 'PASSED' : 'FAILED'}`);
        console.log(`Errors: ${results.errors.length}, Warnings: ${results.warnings.length}`);

        return results;
    }

    /**
     * Clean up validation cache to prevent memory leaks
     */
    static cleanupCache() {
        const now = Date.now();
        
        // Only cleanup if enough time has passed
        if (now - this.lastCleanup < this.cleanupInterval) {
            return;
        }

        if (this.validationCache.size > this.maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(this.validationCache.entries());
            const toRemove = entries.slice(0, Math.floor(this.maxCacheSize / 2));
            
            toRemove.forEach(([key]) => {
                this.validationCache.delete(key);
            });
            
            console.log(`🧹 Cleaned up ${toRemove.length} validation cache entries`);
        }
        
        this.lastCleanup = now;
    }

    /**
     * Get cached validation result
     */
    static getCachedValidation(key) {
        this.cleanupCache();
        return this.validationCache.get(key);
    }

    /**
     * Set cached validation result
     */
    static setCachedValidation(key, result) {
        this.cleanupCache();
        
        // Add timestamp to track entry age
        this.validationCache.set(key, {
            ...result,
            timestamp: Date.now()
        });
    }

    /**
     * Validate with caching
     */
    static validateWithCache(data, validationType, cacheKey = null) {
        // Generate cache key if not provided
        if (!cacheKey) {
            try {
                cacheKey = `${validationType}_${JSON.stringify(data).substring(0, 100)}`;
            } catch (error) {
                cacheKey = `${validationType}_${Date.now()}_${Math.random()}`;
            }
        }

        // Check cache first
        const cached = this.getCachedValidation(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < 60000) { // 1 minute cache
            return cached;
        }

        // Perform validation
        let result;
        switch (validationType) {
            case 'character':
                result = this.validateCharacter(data);
                break;
            case 'gameState':
                result = this.validateGameState(data);
                break;
            case 'resources':
                result = this.validateResources(data);
                break;
            case 'stats':
                result = this.validateStats(data);
                break;
            default:
                result = { valid: false, errors: ['Unknown validation type'], warnings: [] };
        }

        // Cache result
        this.setCachedValidation(cacheKey, result);
        
        return result;
    }

    /**
     * Validate dungeon exploration state
     */
    static validateDungeonState(exploration) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!exploration) {
            return {
                valid: false,
                errors: ['Exploration state is null or undefined'],
                warnings: []
            };
        }

        try {
            // Check required properties
            const requiredProps = ['party', 'dungeonType', 'state', 'dungeon'];
            requiredProps.forEach(prop => {
                if (!exploration.hasOwnProperty(prop)) {
                    result.errors.push(`Missing required property: ${prop}`);
                    result.valid = false;
                }
            });

            // Validate party
            if (exploration.party) {
                if (!Array.isArray(exploration.party)) {
                    result.errors.push('Party must be an array');
                    result.valid = false;
                } else if (exploration.party.length === 0) {
                    result.errors.push('Party cannot be empty');
                    result.valid = false;
                } else {
                    // Validate each party member
                    exploration.party.forEach((member, index) => {
                        const memberValidation = this.validateCharacter(member);
                        if (!memberValidation.valid) {
                            result.errors.push(`Party member ${index}: ${memberValidation.errors.join(', ')}`);
                            result.valid = false;
                        }
                    });
                }
            }

            // Validate state
            const validStates = ['exploring', 'combat', 'paused', 'completed', 'retreated'];
            if (exploration.state && !validStates.includes(exploration.state)) {
                result.errors.push(`Invalid exploration state: ${exploration.state}`);
                result.valid = false;
            }

            // Check for stuck states
            if (exploration.explorationLog && exploration.explorationLog.length > 1000) {
                result.warnings.push('Exploration log is very large, may indicate stuck state');
            }

            // Validate dungeon type
            if (exploration.dungeonType && typeof DUNGEONS_DATA !== 'undefined') {
                if (!DUNGEONS_DATA[exploration.dungeonType]) {
                    result.errors.push(`Unknown dungeon type: ${exploration.dungeonType}`);
                    result.valid = false;
                }
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Dungeon state validation error: ${error.message}`);
        }

        return result;
    }

    /**
     * Validate combat state
     */
    static validateCombatState(combat) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!combat) {
            return { valid: true }; // No combat is valid
        }

        try {
            // Check required properties
            const requiredProps = ['party', 'enemies', 'round', 'phase'];
            requiredProps.forEach(prop => {
                if (!combat.hasOwnProperty(prop)) {
                    result.errors.push(`Missing required property: ${prop}`);
                    result.valid = false;
                }
            });

            // Validate party
            if (combat.party) {
                if (!Array.isArray(combat.party) || combat.party.length === 0) {
                    result.errors.push('Combat party must be a non-empty array');
                    result.valid = false;
                }
            }

            // Validate enemies
            if (combat.enemies) {
                if (!Array.isArray(combat.enemies) || combat.enemies.length === 0) {
                    result.errors.push('Combat enemies must be a non-empty array');
                    result.valid = false;
                }
            }

            // Check for excessive rounds
            if (combat.round > 50) {
                result.warnings.push(`Combat has many rounds: ${combat.round}`);
            }

            if (combat.round > 100) {
                result.errors.push('Combat has exceeded maximum rounds');
                result.valid = false;
            }

            // Validate phase
            const validPhases = ['player_turn', 'enemy_turn', 'resolution'];
            if (combat.phase && !validPhases.includes(combat.phase)) {
                result.errors.push(`Invalid combat phase: ${combat.phase}`);
                result.valid = false;
            }

            // Check combat duration
            if (combat.startTime) {
                const duration = Date.now() - combat.startTime;
                if (duration > 300000) { // 5 minutes
                    result.warnings.push(`Combat has been running for ${Math.round(duration / 60000)} minutes`);
                }
                if (duration > 600000) { // 10 minutes
                    result.errors.push('Combat has exceeded maximum duration');
                    result.valid = false;
                }
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Combat state validation error: ${error.message}`);
        }

        return result;
    }

    /**
     * Check for memory leaks in game objects
     */
    static checkMemoryLeaks() {
        const result = {
            leaks: [],
            warnings: [],
            totalSize: 0
        };

        try {
            // Check for large arrays that might indicate leaks
            const globalObjects = [
                { name: 'CombatManager.combatLog', obj: window.CombatManager?.combatLog },
                { name: 'UIManager.messageQueue', obj: window.UIManager?.messageQueue },
                { name: 'ValidationUtils.validationCache', obj: this.validationCache }
            ];

            globalObjects.forEach(({ name, obj }) => {
                if (obj && Array.isArray(obj)) {
                    if (obj.length > 1000) {
                        result.leaks.push(`${name} has ${obj.length} entries (possible memory leak)`);
                    } else if (obj.length > 500) {
                        result.warnings.push(`${name} has ${obj.length} entries (monitor for growth)`);
                    }
                }
            });

            // Check for event listeners that might not be cleaned up
            if (typeof window !== 'undefined') {
                const eventTypes = ['click', 'keydown', 'resize', 'beforeunload'];
                eventTypes.forEach(eventType => {
                    const listeners = window.getEventListeners?.(document)?.[eventType];
                    if (listeners && listeners.length > 10) {
                        result.warnings.push(`Many ${eventType} listeners: ${listeners.length}`);
                    }
                });
            }

            // Check DOM for orphaned elements
            if (typeof document !== 'undefined') {
                const modals = document.querySelectorAll('.modal-overlay');
                if (modals.length > 3) {
                    result.leaks.push(`Multiple modal overlays detected: ${modals.length}`);
                }

                const intervals = setInterval(() => {}, 1000);
                clearInterval(intervals);
                if (intervals > 1000) {
                    result.warnings.push(`High interval ID suggests many timers: ${intervals}`);
                }
            }

        } catch (error) {
            result.warnings.push(`Memory leak check failed: ${error.message}`);
        }

        return result;
    }

    /**
     * Emergency cleanup for memory issues
     */
    static emergencyCleanup() {
        console.warn('🚨 Performing emergency cleanup...');
        
        try {
            // Clear validation cache
            this.validationCache.clear();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            // Clear any large global arrays
            if (window.CombatManager?.combatLog) {
                window.CombatManager.combatLog = window.CombatManager.combatLog.slice(-10);
            }
            
            // Remove orphaned modal elements
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach((modal, index) => {
                if (index > 0) { // Keep only the first modal
                    modal.remove();
                }
            });
            
            console.log('✅ Emergency cleanup completed');
            
        } catch (error) {
            console.error('Emergency cleanup failed:', error);
        }
    }

    /**
     * Get system health report
     */
    static getSystemHealth() {
        const health = {
            status: 'healthy',
            issues: [],
            metrics: {}
        };

        try {
            // Memory metrics
            if (performance.memory) {
                health.metrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                if (health.metrics.memory.used > health.metrics.memory.limit * 0.8) {
                    health.status = 'warning';
                    health.issues.push('High memory usage');
                }
            }

            // Cache metrics
            health.metrics.cache = {
                size: this.validationCache.size,
                maxSize: this.maxCacheSize
            };

            // DOM metrics
            if (typeof document !== 'undefined') {
                health.metrics.dom = {
                    elements: document.querySelectorAll('*').length,
                    modals: document.querySelectorAll('.modal-overlay').length
                };
                
                if (health.metrics.dom.elements > 5000) {
                    health.status = 'warning';
                    health.issues.push('High DOM element count');
                }
                
                if (health.metrics.dom.modals > 2) {
                    health.status = 'warning';
                    health.issues.push('Multiple modals open');
                }
            }

            // Check for memory leaks
            const leakCheck = this.checkMemoryLeaks();
            if (leakCheck.leaks.length > 0) {
                health.status = 'critical';
                health.issues.push(...leakCheck.leaks);
            } else if (leakCheck.warnings.length > 0) {
                if (health.status === 'healthy') {
                    health.status = 'warning';
                }
                health.issues.push(...leakCheck.warnings);
            }

        } catch (error) {
            health.status = 'error';
            health.issues.push(`Health check failed: ${error.message}`);
        }

        return health;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ValidationUtils = ValidationUtils;
    console.log('✅ Validation utilities loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationUtils;
}