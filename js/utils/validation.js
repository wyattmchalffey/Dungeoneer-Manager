/**
 * ===========================================
 * VALIDATION UTILITIES
 * ===========================================
 * Comprehensive data validation for game integrity
 */

/**
 * ===========================================
 * VALIDATION UTILITIES
 * ===========================================
 * Comprehensive data validation for game integrity
 */

class ValidationManager {
    static instance = null;
    static validationRules = {};
    static validationErrors = [];

    constructor() {
        if (ValidationManager.instance) {
            return ValidationManager.instance;
        }
        ValidationManager.instance = this;
        
        this.initializeValidationRules();
    }

    /**
     * Initialize all validation rules
     */
    initializeValidationRules() {
        this.validationRules = {
            // Character validation
            character: {
                id: { type: 'string', required: true, minLength: 1, maxLength: 50 },
                name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
                level: { type: 'number', required: true, min: 1, max: 100 },
                currentHP: { type: 'number', required: true, min: 0 },
                maxHP: { type: 'number', required: true, min: 1, max: 9999 },
                currentMP: { type: 'number', required: true, min: 0 },
                maxMP: { type: 'number', required: true, min: 0, max: 9999 },
                stats: {
                    type: 'object',
                    required: true,
                    properties: {
                        might: { type: 'number', min: 0, max: 999 },
                        agility: { type: 'number', min: 0, max: 999 },
                        mind: { type: 'number', min: 0, max: 999 },
                        spirit: { type: 'number', min: 0, max: 999 },
                        endurance: { type: 'number', min: 0, max: 999 }
                    }
                }
            },

            // Game state validation
            gameState: {
                resources: {
                    type: 'object',
                    required: true,
                    properties: {
                        gold: { type: 'number', min: 0, max: 999999 },
                        materials: { type: 'number', min: 0, max: 99999 },
                        reputation: { type: 'number', min: 0, max: 100 }
                    }
                },
                turnsLeft: { type: 'number', required: true, min: 0, max: 50 },
                currentSeason: { type: 'number', required: true, min: 1, max: 999 },
                party: { 
                    type: 'array', 
                    required: true, 
                    maxLength: 4,
                    itemValidation: 'character'
                }
            },

            // Skill validation
            skill: {
                name: { type: 'string', required: true, minLength: 1, maxLength: 50 },
                trigger: { type: 'string', required: true, minLength: 1, maxLength: 50 },
                baseChance: { type: 'number', required: true, min: 0, max: 100 },
                statModifier: { 
                    type: 'string', 
                    required: true, 
                    enum: ['might', 'agility', 'mind', 'spirit', 'endurance']
                },
                cooldown: { type: 'number', required: true, min: 0, max: 20 },
                manaCost: { type: 'number', required: true, min: 0, max: 200 }
            },

            // Combat validation
            combat: {
                enemy: {
                    type: 'object',
                    required: true,
                    properties: {
                        name: { type: 'string', required: true, minLength: 1 },
                        currentHP: { type: 'number', required: true, min: 0 },
                        maxHP: { type: 'number', required: true, min: 1 },
                        attackPower: { type: 'number', required: true, min: 0 },
                        difficulty: { type: 'number', required: true, min: 1, max: 10 }
                    }
                },
                round: { type: 'number', required: true, min: 0, max: 100 },
                isActive: { type: 'boolean', required: true }
            },

            // Save data validation
            saveData: {
                version: { type: 'string', required: true, minLength: 1 },
                timestamp: { type: 'number', required: true, min: 0 },
                gameData: { type: 'object', required: true, validation: 'gameState' }
            }
        };
    }

    /**
     * Validate any data against specified rules
     */
    static validate(data, ruleName, context = '') {
        const instance = new ValidationManager();
        const rule = instance.validationRules[ruleName];
        
        if (!rule) {
            return {
                valid: false,
                errors: [`Unknown validation rule: ${ruleName}`],
                warnings: []
            };
        }

        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            instance.validateObject(data, rule, result, context);
        } catch (error) {
            result.valid = false;
            result.errors.push(`Validation error: ${error.message}`);
        }

        result.valid = result.errors.length === 0;
        return result;
    }

    /**
     * Validate object against rule set
     */
    validateObject(data, rules, result, context) {
        if (data === null || data === undefined) {
            if (rules.required) {
                result.errors.push(`${context} is required but missing`);
            }
            return;
        }

        Object.keys(rules).forEach(key => {
            if (key === 'type' || key === 'required') return;
            
            const rule = rules[key];
            const value = data[key];
            const fieldContext = context ? `${context}.${key}` : key;

            this.validateField(value, rule, result, fieldContext);
        });
    }

    /**
     * Validate individual field
     */
    validateField(value, rule, result, context) {
        // Check if field is required
        if (rule.required && (value === null || value === undefined)) {
            result.errors.push(`${context} is required`);
            return;
        }

        // Skip validation if value is not provided and not required
        if (value === null || value === undefined) {
            return;
        }

        // Type validation
        if (rule.type) {
            if (!this.validateType(value, rule.type)) {
                result.errors.push(`${context} must be of type ${rule.type}`);
                return;
            }
        }

        // Specific type validations
        switch (rule.type) {
            case 'string':
                this.validateString(value, rule, result, context);
                break;
            case 'number':
                this.validateNumber(value, rule, result, context);
                break;
            case 'array':
                this.validateArray(value, rule, result, context);
                break;
            case 'object':
                this.validateObjectType(value, rule, result, context);
                break;
            case 'boolean':
                // Boolean validation is covered by type check
                break;
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
            result.errors.push(`${context} must be one of: ${rule.enum.join(', ')}`);
        }

        // Custom validation function
        if (rule.validator && typeof rule.validator === 'function') {
            const customResult = rule.validator(value, context);
            if (customResult !== true) {
                result.errors.push(customResult || `${context} failed custom validation`);
            }
        }
    }

    /**
     * Validate data type
     */
    validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return true;
        }
    }

    /**
     * Validate string field
     */
    validateString(value, rule, result, context) {
        if (rule.minLength && value.length < rule.minLength) {
            result.errors.push(`${context} must be at least ${rule.minLength} characters long`);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            result.errors.push(`${context} must be no more than ${rule.maxLength} characters long`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            result.errors.push(`${context} does not match required pattern`);
        }

        // Check for valid characters (prevent XSS)
        if (/<script|javascript:|on\w+=/i.test(value)) {
            result.errors.push(`${context} contains invalid characters`);
        }
    }

    /**
     * Validate number field
     */
    validateNumber(value, rule, result, context) {
        if (rule.min !== undefined && value < rule.min) {
            result.errors.push(`${context} must be at least ${rule.min}`);
        }

        if (rule.max !== undefined && value > rule.max) {
            result.errors.push(`${context} must be no more than ${rule.max}`);
        }

        if (rule.integer && !Number.isInteger(value)) {
            result.errors.push(`${context} must be an integer`);
        }

        if (!isFinite(value)) {
            result.errors.push(`${context} must be a finite number`);
        }
    }

    /**
     * Validate array field
     */
    validateArray(value, rule, result, context) {
        if (rule.minLength && value.length < rule.minLength) {
            result.errors.push(`${context} must have at least ${rule.minLength} items`);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            result.errors.push(`${context} must have no more than ${rule.maxLength} items`);
        }

        // Validate array items
        if (rule.itemValidation) {
            value.forEach((item, index) => {
                const itemContext = `${context}[${index}]`;
                const itemRule = this.validationRules[rule.itemValidation];
                if (itemRule) {
                    this.validateObject(item, itemRule, result, itemContext);
                }
            });
        }
    }

    /**
     * Validate object field
     */
    validateObjectType(value, rule, result, context) {
        if (rule.properties) {
            this.validateObject(value, rule.properties, result, context);
        }

        if (rule.validation && this.validationRules[rule.validation]) {
            this.validateObject(value, this.validationRules[rule.validation], result, context);
        }
    }

    /**
     * Validate character data
     */
    static validateCharacter(character) {
        const result = this.validate(character, 'character', 'character');
        
        // Additional character-specific validations
        if (character && result.valid) {
            // HP should not exceed max HP
            if (character.currentHP > character.maxHP) {
                result.errors.push('Current HP cannot exceed maximum HP');
                result.valid = false;
            }

            // MP should not exceed max MP
            if (character.currentMP > character.maxMP) {
                result.errors.push('Current MP cannot exceed maximum MP');
                result.valid = false;
            }

            // Level should be consistent with stats
            const expectedStatTotal = character.level * 50; // Rough estimate
            const actualStatTotal = Object.values(character.stats || {}).reduce((sum, stat) => sum + stat, 0);
            
            if (actualStatTotal > expectedStatTotal * 3) {
                result.warnings.push('Character stats seem unusually high for level');
            }
        }

        return result;
    }

    /**
     * Validate game state
     */
    static validateGameState(gameState) {
        const result = this.validate(gameState, 'gameState', 'gameState');

        // Additional game state validations
        if (gameState && result.valid) {
            // Party validation
            if (gameState.party && gameState.party.length > 0) {
                gameState.party.forEach((character, index) => {
                    const charResult = this.validateCharacter(character);
                    if (!charResult.valid) {
                        result.errors.push(...charResult.errors.map(err => `party[${index}]: ${err}`));
                        result.valid = false;
                    }
                    result.warnings.push(...charResult.warnings.map(warn => `party[${index}]: ${warn}`));
                });
            }

            // Turn validation
            if (gameState.turnsLeft > gameState.maxTurns) {
                result.errors.push('Turns left cannot exceed maximum turns');
                result.valid = false;
            }

            // Resource validation
            if (gameState.resources) {
                Object.entries(gameState.resources).forEach(([resource, amount]) => {
                    if (amount < 0) {
                        result.errors.push(`${resource} cannot be negative`);
                        result.valid = false;
                    }
                });
            }
        }

        return result;
    }

    /**
     * Validate combat state
     */
    static validateCombat(combat) {
        const result = this.validate(combat, 'combat', 'combat');

        // Additional combat validations
        if (combat && result.valid) {
            // Party should have at least one alive member
            if (combat.party && !combat.party.some(char => char.isAlive && char.isAlive())) {
                result.warnings.push('No party members are alive in combat');
            }

            // Combat round should not be excessive
            if (combat.round > 50) {
                result.warnings.push('Combat has been running for an unusually long time');
            }
        }

        return result;
    }

    /**
     * Validate save data
     */
    static validateSaveData(saveData) {
        const result = this.validate(saveData, 'saveData', 'saveData');

        // Additional save data validations
        if (saveData && result.valid) {
            // Version compatibility check
            if (saveData.version && typeof GAME_VERSION !== 'undefined') {
                if (saveData.version !== GAME_VERSION) {
                    result.warnings.push(`Save version ${saveData.version} differs from game version ${GAME_VERSION}`);
                }
            }

            // Timestamp should be reasonable
            const now = Date.now();
            const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
            const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);
            
            if (saveData.timestamp < oneYearAgo || saveData.timestamp > oneYearFromNow) {
                result.warnings.push('Save timestamp appears to be invalid');
            }

            // Validate game data
            if (saveData.gameData) {
                const gameStateResult = this.validateGameState(saveData.gameData);
                if (!gameStateResult.valid) {
                    result.errors.push(...gameStateResult.errors.map(err => `gameData: ${err}`));
                    result.valid = false;
                }
                result.warnings.push(...gameStateResult.warnings.map(warn => `gameData: ${warn}`));
            }
        }

        return result;
    }

    /**
     * Validate skill data
     */
    static validateSkill(skill) {
        return this.validate(skill, 'skill', 'skill');
    }

    /**
     * Sanitize user input
     */
    static sanitizeInput(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }

        return input
            .trim()
            .substring(0, maxLength)
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/[<>]/g, '');
    }

    /**
     * Validate and sanitize character name
     */
    static validateCharacterName(name) {
        const result = {
            valid: true,
            sanitized: '',
            errors: []
        };

        if (typeof name !== 'string') {
            result.valid = false;
            result.errors.push('Name must be a string');
            return result;
        }

        // Sanitize
        result.sanitized = this.sanitizeInput(name, 50);

        // Validate length
        if (result.sanitized.length < 1) {
            result.valid = false;
            result.errors.push('Name must be at least 1 character long');
        }

        if (result.sanitized.length > 50) {
            result.valid = false;
            result.errors.push('Name must be no more than 50 characters long');
        }

        // Validate characters
        if (!/^[a-zA-Z0-9\s\-_.]+$/.test(result.sanitized)) {
            result.valid = false;
            result.errors.push('Name contains invalid characters');
        }

        // Check for profanity (basic check)
        const profanityWords = ['damn', 'hell']; // Minimal list for example
        const lowerName = result.sanitized.toLowerCase();
        if (profanityWords.some(word => lowerName.includes(word))) {
            result.valid = false;
            result.errors.push('Name contains inappropriate content');
        }

        return result;
    }

    /**
     * Validate numeric range
     */
    static validateRange(value, min, max, fieldName = 'value') {
        const result = {
            valid: true,
            errors: []
        };

        if (typeof value !== 'number' || isNaN(value)) {
            result.valid = false;
            result.errors.push(`${fieldName} must be a valid number`);
            return result;
        }

        if (value < min) {
            result.valid = false;
            result.errors.push(`${fieldName} must be at least ${min}`);
        }

        if (value > max) {
            result.valid = false;
            result.errors.push(`${fieldName} must be no more than ${max}`);
        }

        return result;
    }

    /**
     * Validate email format (if needed for future features)
     */
    static validateEmail(email) {
        const result = {
            valid: true,
            errors: []
        };

        if (typeof email !== 'string') {
            result.valid = false;
            result.errors.push('Email must be a string');
            return result;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            result.valid = false;
            result.errors.push('Invalid email format');
        }

        return result;
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
                    charData.skills.forEach(skillId => {
                        if (!SKILLS_DATA[skillId]) {
                            result.errors.push(`Character ${charId} references missing skill: ${skillId}`);
                            result.valid = false;
                        }
                    });
                });
            }

            // Check skill stat modifiers are valid
            if (typeof SKILLS_DATA !== 'undefined') {
                const validStats = ['might', 'agility', 'mind', 'spirit', 'endurance'];
                Object.entries(SKILLS_DATA).forEach(([skillId, skillData]) => {
                    if (!validStats.includes(skillData.statModifier)) {
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
    }

    /**
     * Check performance metrics
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
                        if (obj && typeof obj === 'object') {
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
                        fixes.push('Fixed currentHP exceeding maxHP');
                    }
                    if (data.currentMP > data.maxMP) {
                        data.currentMP = data.maxMP;
                        fixes.push('Fixed currentMP exceeding maxMP');
                    }
                    if (data.level < 1) {
                        data.level = 1;
                        fixes.push('Fixed invalid level');
                    }
                    break;

                case 'gameState':
                    if (data.turnsLeft < 0) {
                        data.turnsLeft = 0;
                        fixes.push('Fixed negative turns');
                    }
                    if (data.resources) {
                        Object.keys(data.resources).forEach(resource => {
                            if (data.resources[resource] < 0) {
                                data.resources[resource] = 0;
                                fixes.push(`Fixed negative ${resource}`);
                            }
                        });
                    }
                    break;
            }
        } catch (error) {
            fixes.push(`Auto-fix failed: ${error.message}`);
        }

        return {
            data: data,
            fixes: fixes
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ValidationManager = ValidationManager;
    window.Validator = ValidationManager; // Shorter alias
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationManager;
}
    