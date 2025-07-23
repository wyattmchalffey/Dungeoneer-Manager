/**
 * ===========================================
 * COMBAT MANAGER
 * ===========================================
 * Manages combat encounters and interactions
 */

class CombatManager {
    static currentCombat = null;
    static combatCallbacks = {};
    static combatLog = [];
    static maxCombatRounds = 50; // NEW: Prevent infinite combat
    static combatTimeout = 60000; // NEW: 60 second timeout

    /**
     * Start a combat encounter
     */
    static startCombat(party, enemies, context = {}) {
        console.log('⚔️ Starting combat encounter');
        
        try {
            // Validate inputs
            if (!party || party.length === 0) {
                throw new Error('No party members available for combat');
            }
            
            if (!enemies || enemies.length === 0) {
                throw new Error('No enemies to fight');
            }
            
            // Filter to only alive party members
            const aliveParty = party.filter(char => char.isAlive());
            if (aliveParty.length === 0) {
                throw new Error('All party members are unconscious');
            }
            
            // Clean up any existing combat
            this.endCombat();
            
            // Initialize combat state
            this.currentCombat = {
                party: aliveParty,
                enemies: Array.isArray(enemies) ? enemies : [enemies],
                round: 1,
                turn: 1,
                phase: 'player_turn', // player_turn, enemy_turn, resolution
                context: context,
                startTime: Date.now(),
                maxRounds: this.maxCombatRounds,
                timeoutId: null
            };
            
            // Set combat timeout
            this.currentCombat.timeoutId = setTimeout(() => {
                console.warn('Combat timeout - forcing resolution');
                this.forceEndCombat('timeout');
            }, this.combatTimeout);
            
            // Clear previous combat log
            this.combatLog = [];
            
            // Log combat start
            this.logCombatAction(`⚔️ Combat begins! ${this.currentCombat.party.length} vs ${this.currentCombat.enemies.length}`);
            
            // Trigger combat start event
            this.triggerCombatEvent('combat_start', {
                party: this.currentCombat.party,
                enemies: this.currentCombat.enemies,
                context: context
            });
            
            return this.currentCombat;
            
        } catch (error) {
            console.error('Failed to start combat:', error);
            this.endCombat();
            throw error;
        }
    }

    /**
     * Execute player turn
     */
    static executePlayerTurn(actions = []) {
        if (!this.currentCombat || this.currentCombat.phase !== 'player_turn') {
            throw new Error('Cannot execute player turn - invalid combat state');
        }

        try {
            // Validate combat state before proceeding
            const validation = this.validateCombatState();
            if (!validation.valid) {
                this.forceEndCombat('invalid_state', validation.issues);
                return { success: false, reason: 'invalid_combat_state' };
            }

            this.logCombatAction(`--- Round ${this.currentCombat.round}: Player Turn ---`);
            
            const results = [];
            
            // Execute actions for each alive party member
            this.currentCombat.party.forEach((character, index) => {
                if (!character.isAlive()) {
                    this.logCombatAction(`${character.name} is unconscious and cannot act`);
                    return;
                }
                
                const action = actions[index] || { type: 'attack', target: 0 };
                const result = this.executeAction(character, action, 'player');
                results.push(result);
            });
            
            // Check for combat end after player actions
            const combatEndCheck = this.checkCombatEnd();
            if (combatEndCheck.ended) {
                this.endCombat(combatEndCheck.result);
                return combatEndCheck.result;
            }
            
            // Move to enemy turn
            this.currentCombat.phase = 'enemy_turn';
            
            return {
                success: true,
                phase: 'enemy_turn',
                results: results,
                round: this.currentCombat.round
            };
            
        } catch (error) {
            console.error('Error during player turn:', error);
            this.forceEndCombat('error', [error.message]);
            return { success: false, reason: 'execution_error', error: error.message };
        }
    }

    /**
     * Execute enemy turn
     */
    static executeEnemyTurn() {
        if (!this.currentCombat || this.currentCombat.phase !== 'enemy_turn') {
            throw new Error('Cannot execute enemy turn - invalid combat state');
        }

        try {
            // Validate combat state
            const validation = this.validateCombatState();
            if (!validation.valid) {
                this.forceEndCombat('invalid_state', validation.issues);
                return { success: false, reason: 'invalid_combat_state' };
            }

            this.logCombatAction(`--- Round ${this.currentCombat.round}: Enemy Turn ---`);
            
            const results = [];
            
            // Execute actions for each alive enemy
            this.currentCombat.enemies.forEach((enemy, index) => {
                if (!enemy.isAlive || !enemy.isAlive()) {
                    this.logCombatAction(`${enemy.name} is defeated and cannot act`);
                    return;
                }
                
                const action = this.generateEnemyAction(enemy);
                const result = this.executeAction(enemy, action, 'enemy');
                results.push(result);
            });
            
            // Check for combat end after enemy actions
            const combatEndCheck = this.checkCombatEnd();
            if (combatEndCheck.ended) {
                this.endCombat(combatEndCheck.result);
                return combatEndCheck.result;
            }
            
            // Move to next round
            this.currentCombat.round++;
            this.currentCombat.phase = 'player_turn';
            
            // Check for max rounds exceeded
            if (this.currentCombat.round > this.currentCombat.maxRounds) {
                this.logCombatAction('⏰ Combat has reached maximum rounds - forcing draw');
                this.forceEndCombat('max_rounds');
                return { success: false, reason: 'max_rounds_reached' };
            }
            
            return {
                success: true,
                phase: 'player_turn',
                results: results,
                round: this.currentCombat.round
            };
            
        } catch (error) {
            console.error('Error during enemy turn:', error);
            this.forceEndCombat('error', [error.message]);
            return { success: false, reason: 'execution_error', error: error.message };
        }
    }

    /**
     * Execute a single combat action
     */
    static executeAction(actor, action, actorType) {
        try {
            const result = {
                actor: actor.name,
                action: action.type,
                success: false,
                damage: 0,
                effects: []
            };

            switch (action.type) {
                case 'attack':
                    result = this.executeAttack(actor, action, actorType);
                    break;
                    
                case 'skill':
                    result = this.executeSkill(actor, action, actorType);
                    break;
                    
                case 'defend':
                    result = this.executeDefend(actor, action, actorType);
                    break;
                    
                case 'item':
                    result = this.executeItem(actor, action, actorType);
                    break;
                    
                default:
                    this.logCombatAction(`${actor.name} performs unknown action: ${action.type}`);
                    result.success = false;
            }

            // Trigger action event
            this.triggerCombatEvent('action_executed', {
                actor: actor,
                action: action,
                result: result,
                actorType: actorType
            });

            return result;
            
        } catch (error) {
            console.error('Error executing action:', error);
            this.logCombatAction(`❌ ${actor.name}'s action failed: ${error.message}`);
            return {
                actor: actor.name,
                action: action.type,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute attack action
     */
    static executeAttack(actor, action, actorType) {
        const targets = this.getValidTargets(actor, action, actorType);
        if (targets.length === 0) {
            this.logCombatAction(`${actor.name} has no valid targets to attack`);
            return { actor: actor.name, action: 'attack', success: false, reason: 'no_targets' };
        }

        const target = targets[action.target] || targets[0];
        
        // Calculate damage
        let damage = this.calculateAttackDamage(actor, target);
        
        // Apply damage
        const actualDamage = target.takeDamage ? target.takeDamage(damage, 'physical', 'attack') : damage;
        target.currentHP = Math.max(0, (target.currentHP || target.hp) - actualDamage);
        
        // Log the attack
        this.logCombatAction(`⚔️ ${actor.name} attacks ${target.name} for ${actualDamage} damage`);
        
        // Check for critical hit
        const isCritical = Math.random() < 0.1; // 10% crit chance
        if (isCritical) {
            this.logCombatAction(`💥 Critical hit!`);
        }
        
        // Check if target is defeated
        if ((target.currentHP || target.hp) <= 0) {
            this.logCombatAction(`💀 ${target.name} is defeated!`);
        }

        return {
            actor: actor.name,
            action: 'attack',
            target: target.name,
            damage: actualDamage,
            critical: isCritical,
            success: true
        };
    }

    /**
     * Execute skill action
     */
    static executeSkill(actor, action, actorType) {
        if (!action.skill) {
            this.logCombatAction(`${actor.name} attempts to use skill but no skill specified`);
            return { actor: actor.name, action: 'skill', success: false, reason: 'no_skill' };
        }

        // Check if actor has the skill
        const hasSkill = actor.learnedSkills && actor.learnedSkills.includes(action.skill.id);
        if (!hasSkill) {
            this.logCombatAction(`${actor.name} doesn't know skill: ${action.skill.name}`);
            return { actor: actor.name, action: 'skill', success: false, reason: 'skill_unknown' };
        }

        // Check mana cost
        const manaCost = action.skill.manaCost || 0;
        if (actor.currentMP < manaCost) {
            this.logCombatAction(`${actor.name} doesn't have enough mana for ${action.skill.name}`);
            return { actor: actor.name, action: 'skill', success: false, reason: 'insufficient_mana' };
        }

        // Consume mana
        actor.currentMP -= manaCost;

        const targets = this.getValidTargets(actor, action, actorType);
        const target = targets[action.target] || targets[0];

        // Execute skill effect
        let result = { actor: actor.name, action: 'skill', skill: action.skill.name, success: true };

        if (action.skill.type === 'damage') {
            const damage = this.calculateSkillDamage(actor, action.skill, target);
            const actualDamage = target.takeDamage ? target.takeDamage(damage, action.skill.damageType || 'magical', 'skill') : damage;
            target.currentHP = Math.max(0, (target.currentHP || target.hp) - actualDamage);
            
            this.logCombatAction(`✨ ${actor.name} uses ${action.skill.name} on ${target.name} for ${actualDamage} damage`);
            result.target = target.name;
            result.damage = actualDamage;
            
        } else if (action.skill.type === 'heal') {
            const healing = this.calculateSkillHealing(actor, action.skill);
            const actualHealing = Math.min(healing, target.maxHP - target.currentHP);
            target.currentHP += actualHealing;
            
            this.logCombatAction(`💚 ${actor.name} uses ${action.skill.name} to heal ${target.name} for ${actualHealing} HP`);
            result.target = target.name;
            result.healing = actualHealing;
        }

        return result;
    }

    /**
     * Execute defend action
     */
    static executeDefend(actor, action, actorType) {
        // Apply defense buff for this round
        actor.defendBonus = 0.5; // 50% damage reduction
        
        this.logCombatAction(`🛡️ ${actor.name} takes a defensive stance`);
        
        return {
            actor: actor.name,
            action: 'defend',
            success: true,
            effect: 'defense_boost'
        };
    }

    /**
     * Execute item action
     */
    static executeItem(actor, action, actorType) {
        if (!action.item) {
            this.logCombatAction(`${actor.name} attempts to use item but no item specified`);
            return { actor: actor.name, action: 'item', success: false, reason: 'no_item' };
        }

        // For now, simplified item usage (healing potion example)
        if (action.item.type === 'healing') {
            const healing = action.item.value || 50;
            const actualHealing = Math.min(healing, actor.maxHP - actor.currentHP);
            actor.currentHP += actualHealing;
            
            this.logCombatAction(`🧪 ${actor.name} uses ${action.item.name} to heal ${actualHealing} HP`);
            
            return {
                actor: actor.name,
                action: 'item',
                item: action.item.name,
                healing: actualHealing,
                success: true
            };
        }

        return { actor: actor.name, action: 'item', success: false, reason: 'unknown_item_type' };
    }

    /**
     * Generate AI action for enemy
     */
    static generateEnemyAction(enemy) {
        // Simple AI: prefer attacks, occasionally use skills
        const useSkill = Math.random() < 0.3 && enemy.skills && enemy.skills.length > 0;
        
        if (useSkill) {
            const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
            return {
                type: 'skill',
                skill: skill,
                target: Math.floor(Math.random() * this.currentCombat.party.filter(char => char.isAlive()).length)
            };
        } else {
            return {
                type: 'attack',
                target: Math.floor(Math.random() * this.currentCombat.party.filter(char => char.isAlive()).length)
            };
        }
    }

    /**
     * Get valid targets for an action
     */
    static getValidTargets(actor, action, actorType) {
        if (actorType === 'player') {
            // Players target enemies
            return this.currentCombat.enemies.filter(enemy => enemy.isAlive ? enemy.isAlive() : enemy.hp > 0);
        } else {
            // Enemies target players
            return this.currentCombat.party.filter(char => char.isAlive());
        }
    }

    /**
     * Calculate attack damage
     */
    static calculateAttackDamage(actor, target) {
        let baseDamage = actor.stats?.might || actor.attack || 10;
        
        // Add random variation
        const variation = baseDamage * 0.2; // ±20%
        baseDamage += Math.random() * variation * 2 - variation;
        
        // Apply target defense
        const defense = target.stats?.endurance || target.defense || 0;
        const damageReduction = defense * 0.1; // 10% reduction per defense point
        
        // Apply defend bonus if target is defending
        const defendMultiplier = target.defendBonus ? (1 - target.defendBonus) : 1;
        
        const finalDamage = Math.max(1, Math.floor(baseDamage - damageReduction) * defendMultiplier);
        
        // Clear defend bonus after use
        if (target.defendBonus) {
            delete target.defendBonus;
        }
        
        return finalDamage;
    }

    /**
     * Calculate skill damage
     */
    static calculateSkillDamage(actor, skill, target) {
        const baseDamage = skill.baseDamage || 20;
        const statModifier = actor.stats?.[skill.statModifier] || 10;
        const skillMultiplier = skill.damageMultiplier || 1.0;
        
        return Math.floor(baseDamage + (statModifier * skillMultiplier));
    }

    /**
     * Calculate skill healing
     */
    static calculateSkillHealing(actor, skill) {
        const baseHealing = skill.baseHealing || 30;
        const statModifier = actor.stats?.[skill.statModifier] || 10;
        const skillMultiplier = skill.healingMultiplier || 1.0;
        
        return Math.floor(baseHealing + (statModifier * skillMultiplier));
    }

    /**
     * Check if combat should end
     */
    static checkCombatEnd() {
        if (!this.currentCombat) {
            return { ended: true, result: { success: false, reason: 'no_combat' } };
        }

        const aliveParty = this.currentCombat.party.filter(char => char.isAlive());
        const aliveEnemies = this.currentCombat.enemies.filter(enemy => 
            enemy.isAlive ? enemy.isAlive() : (enemy.currentHP || enemy.hp) > 0
        );

        if (aliveParty.length === 0) {
            // All party members defeated
            return {
                ended: true,
                result: {
                    success: false,
                    outcome: 'defeat',
                    reason: 'party_defeated',
                    survivors: aliveEnemies.length
                }
            };
        }

        if (aliveEnemies.length === 0) {
            // All enemies defeated
            return {
                ended: true,
                result: {
                    success: true,
                    outcome: 'victory',
                    reason: 'enemies_defeated',
                    survivors: aliveParty.length
                }
            };
        }

        return { ended: false };
    }

    /**
     * End combat encounter
     */
    static endCombat(result = null) {
        if (!this.currentCombat) return null;

        try {
            // Clear timeout
            if (this.currentCombat.timeoutId) {
                clearTimeout(this.currentCombat.timeoutId);
            }

            const finalResult = result || {
                success: false,
                outcome: 'aborted',
                reason: 'manual_end'
            };

            // Calculate combat duration
            const duration = Math.floor((Date.now() - this.currentCombat.startTime) / 1000);
            finalResult.duration = duration;
            finalResult.rounds = this.currentCombat.round;

            // Log combat end
            this.logCombatAction(`⚔️ Combat ended: ${finalResult.outcome} (${duration}s, ${this.currentCombat.round} rounds)`);

            // Trigger combat end event
            this.triggerCombatEvent('combat_end', {
                result: finalResult,
                party: this.currentCombat.party,
                enemies: this.currentCombat.enemies,
                log: this.combatLog.slice()
            });

            // Clean up combat state
            const combat = this.currentCombat;
            this.currentCombat = null;

            return finalResult;

        } catch (error) {
            console.error('Error ending combat:', error);
            this.currentCombat = null;
            return {
                success: false,
                outcome: 'error',
                reason: 'end_error',
                error: error.message
            };
        }
    }

    /**
     * Force end combat (emergency cleanup)
     */
    static forceEndCombat(reason = 'forced', issues = []) {
        console.warn(`⚠️ Force ending combat: ${reason}`, issues);
        
        if (this.currentCombat?.timeoutId) {
            clearTimeout(this.currentCombat.timeoutId);
        }
        
        this.logCombatAction(`⚠️ Combat force ended: ${reason}`);
        issues.forEach(issue => this.logCombatAction(`  - ${issue}`));
        
        const result = {
            success: false,
            outcome: 'aborted',
            reason: reason,
            issues: issues,
            forced: true
        };
        
        this.triggerCombatEvent('combat_forced_end', result);
        this.currentCombat = null;
        
        return result;
    }

    /**
     * Get current combat status
     */
    static getCombatStatus() {
        if (!this.currentCombat) {
            return { active: false };
        }

        return {
            active: true,
            round: this.currentCombat.round,
            phase: this.currentCombat.phase,
            party: this.currentCombat.party.map(char => ({
                name: char.name,
                hp: char.currentHP,
                maxHP: char.maxHP,
                alive: char.isAlive()
            })),
            enemies: this.currentCombat.enemies.map(enemy => ({
                name: enemy.name,
                hp: enemy.currentHP || enemy.hp,
                maxHP: enemy.maxHP || enemy.hp,
                alive: enemy.isAlive ? enemy.isAlive() : (enemy.currentHP || enemy.hp) > 0
            })),
            duration: Math.floor((Date.now() - this.currentCombat.startTime) / 1000)
        };
    }

    /**
     * Log combat action
     */
    static logCombatAction(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        
        console.log(logEntry);
        this.combatLog.push({
            timestamp: timestamp,
            message: message,
            time: Date.now()
        });

        // Limit log size to prevent memory issues
        if (this.combatLog.length > 100) {
            this.combatLog = this.combatLog.slice(-50); // Keep last 50 entries
        }

        // Update UI if available
        if (typeof UIManager !== 'undefined') {
            UIManager.addCombatLogEntry?.(logEntry);
        }
    }

    /**
     * Get combat log
     */
    static getCombatLog() {
        return this.combatLog.slice(); // Return copy
    }

    /**
     * Clear combat log
     */
    static clearCombatLog() {
        this.combatLog = [];
        if (typeof UIManager !== 'undefined') {
            UIManager.clearCombatLog?.();
        }
    }

    /**
     * Register combat event callback
     */
    static onCombatEvent(event, callback) {
        if (!this.combatCallbacks[event]) {
            this.combatCallbacks[event] = [];
        }
        this.combatCallbacks[event].push(callback);
    }

    /**
     * Trigger combat event callbacks
     */
    static triggerCombatEvent(event, data) {
        if (this.combatCallbacks[event]) {
            this.combatCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in combat event callback for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Validate combat state
     */
    static validateCombatState() {
        if (!this.currentCombat) return { valid: true };
        
        const issues = [];
        
        // Check party state
        if (!this.currentCombat.party || this.currentCombat.party.length === 0) {
            issues.push('No party members in combat');
        }
        
        // Check enemy state
        if (!this.currentCombat.enemies || this.currentCombat.enemies.length === 0) {
            issues.push('No enemies in combat');
        }
        
        // Check for infinite combat
        if (this.currentCombat.round > this.maxCombatRounds) {
            issues.push('Combat has exceeded maximum rounds');
        }
        
        // Check for stuck combat (same phase for too long)
        const currentTime = Date.now();
        const combatDuration = currentTime - this.currentCombat.startTime;
        if (combatDuration > this.combatTimeout) {
            issues.push('Combat has exceeded maximum duration');
        }
        
        // Check for invalid party members
        const invalidParty = this.currentCombat.party.filter(char => 
            !char || typeof char.isAlive !== 'function' || 
            typeof char.currentHP === 'undefined' || typeof char.maxHP === 'undefined'
        );
        if (invalidParty.length > 0) {
            issues.push(`${invalidParty.length} invalid party members detected`);
        }
        
        // Check for invalid enemies
        const invalidEnemies = this.currentCombat.enemies.filter(enemy => 
            !enemy || (!enemy.isAlive && (typeof enemy.hp === 'undefined' && typeof enemy.currentHP === 'undefined'))
        );
        if (invalidEnemies.length > 0) {
            issues.push(`${invalidEnemies.length} invalid enemies detected`);
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Emergency combat reset
     */
    static emergencyReset() {
        console.warn('🚨 Emergency combat reset triggered');
        
        // Clear any timeouts
        if (this.currentCombat?.timeoutId) {
            clearTimeout(this.currentCombat.timeoutId);
        }
        
        // Force end current combat
        if (this.currentCombat) {
            this.forceEndCombat('emergency_reset');
        }
        
        // Clear all state
        this.currentCombat = null;
        this.combatLog = [];
        this.combatCallbacks = {};
        
        // Update UI
        if (typeof UIManager !== 'undefined') {
            UIManager.clearCombatLog?.();
            UIManager.hideCombatUI?.();
        }
        
        console.log('✅ Emergency combat reset completed');
    }

    /**
     * Auto-resolve combat (for testing/debugging)
     */
    static autoResolveCombat() {
        if (!this.currentCombat) {
            return { success: false, reason: 'no_active_combat' };
        }

        console.log('🤖 Auto-resolving combat...');
        
        const maxIterations = 20; // Prevent infinite loops
        let iterations = 0;
        
        while (this.currentCombat && iterations < maxIterations) {
            iterations++;
            
            // Execute a simplified combat round
            if (this.currentCombat.phase === 'player_turn') {
                // Auto-generate player actions
                const actions = this.currentCombat.party.map((char, index) => ({
                    type: 'attack',
                    target: 0 // Always target first enemy
                }));
                
                const result = this.executePlayerTurn(actions);
                if (!result.success || !this.currentCombat) break;
                
            } else if (this.currentCombat.phase === 'enemy_turn') {
                const result = this.executeEnemyTurn();
                if (!result.success || !this.currentCombat) break;
            }
            
            // Safety check
            const validation = this.validateCombatState();
            if (!validation.valid) {
                this.forceEndCombat('auto_resolve_failed', validation.issues);
                break;
            }
        }
        
        if (iterations >= maxIterations) {
            console.warn('Auto-resolve hit iteration limit');
            this.forceEndCombat('auto_resolve_timeout');
        }
        
        return {
            success: !this.currentCombat,
            iterations: iterations,
            reason: this.currentCombat ? 'timeout' : 'completed'
        };
    }

    /**
     * Get combat statistics
     */
    static getCombatStats() {
        if (!this.currentCombat) {
            return null;
        }
        
        const stats = {
            round: this.currentCombat.round,
            duration: Math.floor((Date.now() - this.currentCombat.startTime) / 1000),
            phase: this.currentCombat.phase,
            logEntries: this.combatLog.length,
            validation: this.validateCombatState()
        };
        
        // Calculate party stats
        stats.party = {
            total: this.currentCombat.party.length,
            alive: this.currentCombat.party.filter(char => char.isAlive()).length,
            totalHP: this.currentCombat.party.reduce((sum, char) => sum + char.currentHP, 0),
            maxHP: this.currentCombat.party.reduce((sum, char) => sum + char.maxHP, 0)
        };
        
        // Calculate enemy stats
        stats.enemies = {
            total: this.currentCombat.enemies.length,
            alive: this.currentCombat.enemies.filter(enemy => 
                enemy.isAlive ? enemy.isAlive() : (enemy.currentHP || enemy.hp) > 0
            ).length,
            totalHP: this.currentCombat.enemies.reduce((sum, enemy) => 
                sum + (enemy.currentHP || enemy.hp || 0), 0
            )
        };
        
        return stats;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CombatManager = CombatManager;
    console.log('✅ Combat Manager loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatManager;
}