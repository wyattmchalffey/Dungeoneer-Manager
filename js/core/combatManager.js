/**
 * ===========================================
 * COMBAT MANAGER
 * ===========================================
 * Auto-battle system with skill activation and tactical combat
 */

class CombatManager {
    static instance = null;
    static currentCombat = null;
    static combatLog = [];
    static isProcessing = false;

    constructor() {
        if (CombatManager.instance) {
            return CombatManager.instance;
        }
        CombatManager.instance = this;
        
        this.combatSpeed = 1.0;
        this.autoAdvance = true;
        this.detailedLogs = true;
        this.combatCallbacks = {};
    }

    /**
     * Initialize Combat Manager
     */
    static initialize() {
        console.log('⚔️ Initializing Combat Manager...');
        if (!this.instance) {
            this.instance = new CombatManager();
        }
        console.log('✅ Combat Manager initialized');
    }

    /**
     * Start a new combat encounter
     */
    static startCombat(enemy, dungeonType = 'training_grounds', options = {}) {
        if (this.isProcessing) {
            console.warn('Combat already in progress');
            return false;
        }

        // Validate party
        if (!gameState.party || gameState.party.length === 0) {
            console.error('No party available for combat');
            return false;
        }

        const aliveParty = gameState.party.filter(char => char.isAlive());
        if (aliveParty.length === 0) {
            console.error('All party members are unconscious');
            return false;
        }

        // Initialize combat state
        this.currentCombat = {
            id: Helpers.String.randomString(8),
            enemy: this.prepareEnemy(enemy),
            party: aliveParty.map(char => this.prepareCharacterForCombat(char)),
            round: 0,
            dungeonType: dungeonType,
            isActive: true,
            startTime: Date.now(),
            combatLog: [],
            totalDamageDealt: 0,
            totalDamageReceived: 0,
            skillsUsed: [],
            environmentalEffects: options.environmentalEffects || [],
            difficulty: options.difficulty || 1,
            paused: false
        };

        this.combatLog = [];
        this.isProcessing = true;
        
        // Initialize combat UI
        this.logMessage(`=== Combat begins: ${enemy.name} ===`, 'log-skill');
        this.logMessage(`Party: ${aliveParty.map(c => c.name).join(', ')}`, 'log-info');
        
        // Show combat section
        if (typeof UIManager !== 'undefined') {
            UIManager.showSection('combatSection');
        }
        
        // Apply pre-combat effects
        this.applyCombatStartEffects();
        
        // Start combat loop with delay for visual setup
        setTimeout(() => this.runCombatRound(), 500);
        
        return true;
    }

    /**
     * Prepare enemy for combat
     */
    static prepareEnemy(enemy) {
        const combatEnemy = Helpers.Object.deepClone(enemy);
        combatEnemy.currentHP = combatEnemy.hp;
        combatEnemy.statusEffects = [];
        combatEnemy.abilityCooldowns = {};
        combatEnemy.position = 'front';
        combatEnemy.threatLevel = this.calculateThreatLevel(combatEnemy);
        return combatEnemy;
    }

    /**
     * Prepare character for combat
     */
    static prepareCharacterForCombat(character) {
        // Reset turn-based states
        character.actionThisTurn = false;
        if (character.combatStats) {
            character.combatStats.turnsSurvived++;
        }
        
        // Apply any pre-combat buffs or positioning
        if (character.archetype === 'Tank' || character.archetype === 'Guardian') {
            character.position = 'front';
        } else if (character.archetype === 'Healer' || character.archetype === 'Caster') {
            character.position = 'back';
        }
        
        return character;
    }

    /**
     * Calculate enemy threat level for AI targeting
     */
    static calculateThreatLevel(enemy) {
        const baseLevel = enemy.difficulty || 1;
        const hpFactor = enemy.hp / 100;
        const attackFactor = enemy.attackPower / 20;
        return Math.floor(baseLevel + hpFactor + attackFactor);
    }

    /**
     * Apply combat start effects (blessings, auras, etc.)
     */
    static applyCombatStartEffects() {
        this.currentCombat.party.forEach(character => {
            // Check for combat start skills
            if (character.learnedSkills) {
                character.learnedSkills.forEach(skillId => {
                    if (typeof SKILLS_DATA !== 'undefined' && SKILLS_DATA[skillId]) {
                        const skill = SKILLS_DATA[skillId];
                        if (skill.trigger === 'combat_start' && character.canUseSkill && character.canUseSkill(skillId)) {
                            this.attemptSkillActivation(character, skillId, 'combat_start');
                        }
                    }
                });
            }
        });
    }

    /**
     * Add message to combat log
     */
    static logMessage(message, className = '') {
        const logEntry = {
            message,
            className,
            timestamp: Date.now(),
            round: this.currentCombat?.round || 0
        };
        
        this.combatLog.push(logEntry);
        
        // Keep log size manageable
        if (this.combatLog.length > (UI_CONFIG?.MAX_COMBAT_LOG_ENTRIES || 100)) {
            this.combatLog.shift();
        }
        
        // Update UI
        if (typeof UIManager !== 'undefined') {
            UIManager.updateCombatLog(message, className);
        }
        
        // Store in current combat for analysis
        if (this.currentCombat) {
            this.currentCombat.combatLog.push(logEntry);
        }
    }

    /**
     * Execute one round of combat
     */
    static runCombatRound() {
        if (!this.currentCombat || !this.currentCombat.isActive || this.currentCombat.paused) {
            return;
        }
        
        this.currentCombat.round++;
        this.logMessage(`--- Round ${this.currentCombat.round} ---`, 'log-skill');
        
        // Process status effects first
        this.processAllStatusEffects();
        
        // Check for combat end conditions after status effects
        if (this.checkCombatEndConditions()) {
            return;
        }
        
        // Determine turn order based on agility
        const combatants = this.determineTurnOrder();
        
        // Execute turns in order
        this.executeTurns(combatants).then(() => {
            // Check for combat end after all turns
            if (this.checkCombatEndConditions()) {
                return;
            }
            
            // Apply environmental effects
            this.applyEnvironmentalEffects();
            
            // Continue to next round if auto-advance is enabled
            if (this.autoAdvance) {
                const delay = Math.floor(COMBAT_CONFIG?.COMBAT_ROUND_DELAY || 1000) / (this.combatSpeed || 1);
                setTimeout(() => this.runCombatRound(), delay);
            } else {
                // Show continue button
                if (typeof UIManager !== 'undefined') {
                    const continueBtn = document.getElementById('continueBtn');
                    if (continueBtn) {
                        continueBtn.classList.remove('hidden');
                    }
                }
            }
        }).catch(error => {
            console.error('Error in combat round execution:', error);
            this.handleCombatError(error);
        });
    }

    /**
     * Process status effects for all combatants
     */
    static processAllStatusEffects() {
        // Process party status effects
        this.currentCombat.party.forEach(character => {
            if (character.processStatusEffects) {
                character.processStatusEffects();
            }
        });
        
        // Process enemy status effects
        this.processEnemyStatusEffects();
    }

    /**
     * Process enemy status effects
     */
    static processEnemyStatusEffects() {
        const enemy = this.currentCombat.enemy;
        if (!enemy.statusEffects) enemy.statusEffects = [];
        
        const expiredEffects = [];
        
        enemy.statusEffects.forEach((effect, index) => {
            switch (effect.type) {
                case 'poisoned':
                    const poisonDamage = Math.floor(enemy.maxHP * 0.05);
                    enemy.currentHP = Math.max(0, enemy.currentHP - poisonDamage);
                    this.logMessage(`${enemy.name} takes ${poisonDamage} poison damage`, 'log-damage');
                    break;
                    
                case 'burning':
                    const burnDamage = Math.floor(enemy.maxHP * 0.08);
                    enemy.currentHP = Math.max(0, enemy.currentHP - burnDamage);
                    this.logMessage(`${enemy.name} takes ${burnDamage} fire damage`, 'log-damage');
                    break;
                    
                case 'stunned':
                    this.logMessage(`${enemy.name} is stunned and cannot act`, 'log-skill');
                    break;
            }
            
            // Reduce duration
            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration <= 0) {
                    expiredEffects.push(index);
                }
            }
        });
        
        // Remove expired effects
        expiredEffects.reverse().forEach(index => {
            const effect = enemy.statusEffects[index];
            this.logMessage(`${enemy.name}'s ${effect.type} effect ends`, 'log-info');
            enemy.statusEffects.splice(index, 1);
        });
    }

    /**
     * Determine turn order based on agility and other factors
     */
    static determineTurnOrder() {
        const combatants = [
            ...this.currentCombat.party.filter(c => c.isAlive()).map(c => ({ type: 'party', character: c })),
            { type: 'enemy', character: this.currentCombat.enemy }
        ];
        
        return combatants.sort((a, b) => {
            const aSpeed = a.character.stats?.agility || a.character.speed || 5;
            const bSpeed = b.character.stats?.agility || b.character.speed || 5;
            
            // Add random factor for variety
            const aRoll = aSpeed + Helpers.Math.randomInt(-5, 5);
            const bRoll = bSpeed + Helpers.Math.randomInt(-5, 5);
            
            return bRoll - aRoll; // Higher speed goes first
        });
    }

    /**
     * Execute turns for all combatants
     */
    static async executeTurns(combatants) {
        for (const combatant of combatants) {
            if (!this.currentCombat.isActive) break;
            
            if (combatant.type === 'party') {
                await this.executePartyMemberTurn(combatant.character);
            } else {
                await this.executeEnemyTurn(combatant.character);
            }
            
            // Small delay between actions for visual clarity
            await Helpers.Time.delay(300 / (this.combatSpeed || 1));
        }
        
        // Reduce all cooldowns at end of round
        this.currentCombat.party.forEach(char => {
            if (char.reduceCooldowns) {
                char.reduceCooldowns();
            }
        });
    }

    /**
     * Execute party member's turn
     */
    static async executePartyMemberTurn(character) {
        if (!character.isAlive()) {
            return;
        }
        
        character.actionThisTurn = false;
        let actionTaken = false;
        
        // Try to activate skills first
        if (character.learnedSkills) {
            for (const skillId of character.learnedSkills) {
                if (actionTaken) break;
                
                const skill = SKILLS_DATA && SKILLS_DATA[skillId];
                if (!skill || !character.canUseSkill || !character.canUseSkill(skillId)) continue;
                
                // Check if trigger condition is met
                const triggerContext = this.evaluateSkillTrigger(skill.trigger, character);
                if (!triggerContext.triggered) continue;
                
                // Roll for activation
                const activationChance = character.getSkillActivationChance ? 
                    character.getSkillActivationChance(skillId) : 50;
                if (Helpers.Math.percentChance(activationChance)) {
                    actionTaken = await this.executeSkillAction(character, skill, skillId, triggerContext);
                }
            }
        }
        
        // If no skill was used, perform basic attack
        if (!actionTaken) {
            await this.executeBasicAttack(character);
        }
    }

    /**
     * Execute enemy's turn
     */
    static async executeEnemyTurn(enemy) {
        if (enemy.currentHP <= 0) return;
        
        // Check if enemy is stunned
        if (enemy.statusEffects && enemy.statusEffects.some(effect => effect.type === 'stunned')) {
            this.logMessage(`${enemy.name} is stunned and skips turn`, 'log-info');
            return;
        }
        
        // Try to use abilities
        let abilityUsed = false;
        if (enemy.abilities && enemy.abilities.length > 0) {
            const availableAbilities = enemy.abilities.filter(abilityName => {
                const cooldown = enemy.abilityCooldowns[abilityName] || 0;
                return cooldown <= 0;
            });
            
            if (availableAbilities.length > 0) {
                const chosenAbility = Helpers.Array.randomElement(availableAbilities);
                const abilityData = ENEMY_ABILITIES && ENEMY_ABILITIES[chosenAbility];
                
                if (abilityData && Helpers.Math.percentChance(60)) { // 60% chance to use ability
                    await this.executeEnemyAbility(enemy, chosenAbility, abilityData);
                    abilityUsed = true;
                }
            }
        }
        
        // Basic attack if no ability used
        if (!abilityUsed) {
            await this.executeEnemyBasicAttack(enemy);
        }
        
        // Reduce ability cooldowns
        Object.keys(enemy.abilityCooldowns).forEach(ability => {
            if (enemy.abilityCooldowns[ability] > 0) {
                enemy.abilityCooldowns[ability]--;
            }
        });
    }

    /**
     * Evaluate skill trigger condition
     */
    static evaluateSkillTrigger(trigger, character) {
        const party = this.currentCombat.party;
        const enemy = this.currentCombat.enemy;
        
        switch (trigger) {
            case 'ally_critical_damage':
                const criticalAllies = party.filter(c => c.getHealthPercentage && c.getHealthPercentage() < 25);
                return { triggered: criticalAllies.length > 0, targets: criticalAllies };
                
            case 'ally_low_hp':
                const lowHpAllies = party.filter(c => c.getHealthPercentage && c.getHealthPercentage() < 40);
                return { triggered: lowHpAllies.length > 0, targets: lowHpAllies };
                
            case 'enemy_high_hp':
                const enemyHealthy = (enemy.currentHP / enemy.maxHP) > 0.7;
                return { triggered: enemyHealthy, targets: [enemy] };
                
            case 'enemy_distracted':
                const distracted = this.currentCombat.round > 2 && Helpers.Math.percentChance(30);
                return { triggered: distracted, targets: [enemy] };
                
            case 'enemies_clustered':
                return { triggered: true, targets: [enemy] }; // Single enemy for now
                
            case 'ally_targeted':
                return { triggered: Helpers.Math.percentChance(30), targets: party };
                
            case 'combat_round':
                return { triggered: true, targets: [enemy] };
                
            case 'taking_damage':
                const takingDamage = character.getHealthPercentage && character.getHealthPercentage() < 80;
                return { triggered: takingDamage, targets: [character] };
                
            case 'party_health_low':
                const avgHealth = party.reduce((sum, c) => sum + (c.getHealthPercentage ? c.getHealthPercentage() : 100), 0) / party.length;
                return { triggered: avgHealth < 50, targets: party };
                
            case 'undead_enemy':
                const isUndead = enemy.type === 'undead';
                return { triggered: isUndead, targets: [enemy] };
                
            case 'combat_start':
                return { triggered: this.currentCombat.round === 1, targets: party };
                
            default:
                return { triggered: Helpers.Math.percentChance(20), targets: [enemy] };
        }
    }

    /**
     * Execute skill action
     */
    static async executeSkillAction(character, skill, skillId, triggerContext) {
        if (!character.useSkill || !character.useSkill(skillId)) {
            return false;
        }
        
        const damage = this.calculateSkillDamage(skill, character);
        const targets = this.selectSkillTargets(skill, triggerContext.targets);
        
        this.logMessage(`${character.name} uses ${skill.name}!`, 'log-skill');
        
        // Apply skill effects
        switch (skill.type) {
            case 'combat_offensive':
                await this.applyOffensiveSkill(character, skill, targets, damage);
                break;
                
            case 'combat_defensive':
                await this.applyDefensiveSkill(character, skill, targets);
                break;
                
            case 'support_healing':
                await this.applyHealingSkill(character, skill, targets);
                break;
                
            case 'support_buff':
                await this.applyBuffSkill(character, skill, targets);
                break;
                
            case 'combat_control':
                await this.applyControlSkill(character, skill, targets);
                break;
                
            default:
                await this.applyGenericSkill(character, skill, targets, damage);
        }
        
        // Track skill usage
        this.currentCombat.skillsUsed.push({
            character: character.name,
            skill: skill.name,
            round: this.currentCombat.round
        });
        
        character.actionThisTurn = true;
        return true;
    }

    /**
     * Apply offensive skill effects
     */
    static async applyOffensiveSkill(character, skill, targets, damage) {
        const enemy = this.currentCombat.enemy;
        const actualDamage = Math.floor(damage * (skill.damageMultiplier || 1.0));
        
        enemy.currentHP = Math.max(0, enemy.currentHP - actualDamage);
        this.currentCombat.totalDamageDealt += actualDamage;
        if (character.combatStats) {
            character.combatStats.damageDealt += actualDamage;
        }
        
        this.logMessage(`${enemy.name} takes ${actualDamage} damage!`, 'log-damage');
        
        // Apply status effects
        if (skill.statusEffects) {
            skill.statusEffects.forEach(effectType => {
                this.applyStatusEffect(enemy, effectType, 3, character.name);
            });
        }
        
        // Critical hit chance
        if (Helpers.Math.percentChance(character.stats?.agility / 10 || 5)) {
            const critDamage = Math.floor(actualDamage * 0.5);
            enemy.currentHP = Math.max(0, enemy.currentHP - critDamage);
            this.logMessage(`Critical hit! Additional ${critDamage} damage!`, 'log-damage');
            if (character.combatStats) {
                character.combatStats.criticalHits++;
            }
        }
    }

    /**
     * Apply defensive skill effects
     */
    static async applyDefensiveSkill(character, skill, targets) {
        switch (skill.name) {
            case 'Guard Stance':
                this.currentCombat.party.forEach(ally => {
                    this.applyStatusEffect(ally, 'damage_reduction', 3, skill.name, 40);
                });
                this.logMessage(`${character.name} protects the party!`, 'log-skill');
                break;
                
            case 'Arcane Shield':
                this.applyStatusEffect(character, 'magic_shield', 3, skill.name, 50);
                this.logMessage(`${character.name} creates a magical barrier!`, 'log-skill');
                break;
                
            case 'Dodge Roll':
                this.applyStatusEffect(character, 'evasion', 1, skill.name, 100);
                this.logMessage(`${character.name} prepares to dodge the next attack!`, 'log-skill');
                break;
        }
    }

    /**
     * Apply healing skill effects
     */
    static async applyHealingSkill(character, skill, targets) {
        const healingPower = Math.floor((character.stats?.spirit || 50) / 4) + 20;
        
        targets.forEach(target => {
            if (target.heal) {
                const actualHealing = target.heal(healingPower);
                this.logMessage(`${character.name} heals ${target.name} for ${actualHealing} HP`, 'log-heal');
                if (character.combatStats) {
                    character.combatStats.healingDone += actualHealing;
                }
            }
        });
    }

    /**
     * Apply buff skill effects
     */
    static async applyBuffSkill(character, skill, targets) {
        switch (skill.name) {
            case 'Blessing':
                this.currentCombat.party.forEach(ally => {
                    ['might', 'agility', 'mind', 'spirit', 'endurance'].forEach(stat => {
                        this.applyStatusEffect(ally, `${stat}_bonus`, -1, skill.name, 
                            Math.floor((ally.stats[stat] || 50) * 0.15));
                    });
                });
                this.logMessage(`${character.name} blesses the entire party!`, 'log-skill');
                break;
                
            case 'Flame Weapon':
                this.applyStatusEffect(character, 'flaming_weapon', 5, skill.name, 
                    Math.floor(character.stats.mind / 4));
                this.logMessage(`${character.name}'s weapon ignites with magical flame!`, 'log-skill');
                break;
        }
    }

    /**
     * Apply control skill effects
     */
    static async applyControlSkill(character, skill, targets) {
        const enemy = this.currentCombat.enemy;
        
        switch (skill.name) {
            case 'Taunt':
                this.applyStatusEffect(enemy, 'taunted', 2, skill.name, character.name);
                this.logMessage(`${enemy.name} is forced to focus on ${character.name}!`, 'log-skill');
                break;
                
            case 'Turn Undead':
                if (enemy.type === 'undead') {
                    const damage = Math.floor(character.stats.spirit * 2);
                    enemy.currentHP = Math.max(0, enemy.currentHP - damage);
                    this.logMessage(`${enemy.name} takes ${damage} holy damage and flees in terror!`, 'log-damage');
                    
                    if (enemy.currentHP > 0) {
                        this.applyStatusEffect(enemy, 'fear', 3, skill.name);
                    }
                } else {
                    this.logMessage(`${skill.name} has no effect on ${enemy.name}`, 'log-info');
                }
                break;
                
            case 'Intimidate':
                this.applyStatusEffect(enemy, 'intimidated', 3, skill.name, 25);
                this.logMessage(`${enemy.name} is intimidated and fights less effectively!`, 'log-skill');
                break;
        }
    }

    /**
     * Apply generic skill effects
     */
    static async applyGenericSkill(character, skill, targets, damage) {
        // Handle special skills that don't fit standard categories
        switch (skill.name) {
            case 'Animal Companion':
                this.applyStatusEffect(character, 'companion', 5, 'skill', damage);
                this.logMessage(`${character.name} summons an animal companion!`, 'log-skill');
                break;
                
            case 'Berserker Rage':
                this.applyStatusEffect(character, 'might_bonus', 4, 'skill', 
                    Math.floor(character.stats.might * 0.5));
                this.applyStatusEffect(character, 'vulnerable', 4, 'skill', 50);
                this.logMessage(`${character.name} enters a berserker rage!`, 'log-skill');
                break;
                
            case 'Shadow Step':
                this.applyStatusEffect(character, 'guaranteed_hit', 1, 'skill');
                await this.applyOffensiveSkill(character, skill, [this.currentCombat.enemy], damage * 2);
                this.logMessage(`${character.name} strikes from the shadows!`, 'log-skill');
                break;
                
            default:
                // Generic damage skill
                await this.applyOffensiveSkill(character, skill, targets, damage);
        }
    }

    /**
     * Execute basic attack
     */
    static async executeBasicAttack(character) {
        const baseDamage = 15;
        const statBonus = (character.stats?.might || 50) / 6;
        const damage = Math.floor(baseDamage + statBonus + Helpers.Math.randomFloat(-5, 10));
        
        const enemy = this.currentCombat.enemy;
        enemy.currentHP = Math.max(0, enemy.currentHP - damage);
        this.currentCombat.totalDamageDealt += damage;
        if (character.combatStats) {
            character.combatStats.damageDealt += damage;
        }
        
        this.logMessage(`${character.name} attacks for ${damage} damage`, '');
        character.actionThisTurn = true;
    }

    /**
     * Execute enemy basic attack
     */
    static async executeEnemyBasicAttack(enemy) {
        const aliveParty = this.currentCombat.party.filter(c => c.isAlive());
        if (aliveParty.length === 0) return;
        
        // Target selection - prefer front-line or low health targets
        let target;
        const frontLineTargets = aliveParty.filter(c => c.position === 'front');
        const lowHealthTargets = aliveParty.filter(c => c.getHealthPercentage && c.getHealthPercentage() < 30);
        
        if (lowHealthTargets.length > 0 && Helpers.Math.percentChance(40)) {
            target = Helpers.Array.randomElement(lowHealthTargets);
        } else if (frontLineTargets.length > 0) {
            target = Helpers.Array.randomElement(frontLineTargets);
        } else {
            target = Helpers.Array.randomElement(aliveParty);
        }
        
        // Calculate damage
        const baseDamage = enemy.attackPower || 20;
        const roundBonus = Math.floor(this.currentCombat.round * 1.5);
        const randomFactor = Helpers.Math.randomFloat(0.8, 1.2);
        const totalDamage = Math.floor((baseDamage + roundBonus) * randomFactor);
        
        // Apply damage
        const damageResult = target.takeDamage(totalDamage, 'physical', 'enemy');
        this.currentCombat.totalDamageReceived += damageResult.damageDealt;
        
        this.logMessage(`${enemy.name} attacks ${target.name} for ${damageResult.damageDealt} damage`, 'log-damage');
        
        if (damageResult.died) {
            this.logMessage(`${target.name} has fallen!`, 'log-death');
            this.handleCharacterDeath(target);
        }
    }

    /**
     * Execute enemy ability
     */
    static async executeEnemyAbility(enemy, abilityName, abilityData) {
        const aliveParty = this.currentCombat.party.filter(c => c.isAlive());
        if (aliveParty.length === 0) return;
        
        this.logMessage(`${enemy.name} uses ${abilityData.name}!`, 'log-skill');
        
        // Set cooldown
        enemy.abilityCooldowns[abilityName] = 3; // Default cooldown
        
        // Apply ability effects
        switch (abilityName) {
            case 'regeneration':
                const healAmount = Math.floor(enemy.maxHP * 0.1);
                enemy.currentHP = Math.min(enemy.maxHP, enemy.currentHP + healAmount);
                this.logMessage(`${enemy.name} regenerates ${healAmount} HP`, 'log-heal');
                break;
                
            case 'fear_aura':
                aliveParty.forEach(char => {
                    if (Helpers.Math.percentChance(60)) {
                        this.applyStatusEffect(char, 'fear', 2, abilityName, 20);
                    }
                });
                this.logMessage(`${enemy.name} emanates an aura of terror!`, 'log-skill');
                break;
                
            case 'meteor_swarm':
                // Powerful AoE attack
                aliveParty.forEach(char => {
                    const damage = Math.floor(enemy.attackPower * 1.5 * Helpers.Math.randomFloat(0.7, 1.3));
                    const result = char.takeDamage(damage, 'fire', 'ability');
                    this.logMessage(`${char.name} is struck by a meteor for ${result.damageDealt} damage!`, 'log-damage');
                    
                    if (result.died) {
                        this.logMessage(`${char.name} is obliterated by the meteor!`, 'log-death');
                        this.handleCharacterDeath(char);
                    }
                });
                break;
                
            default:
                // Generic ability - enhanced attack
                const target = Helpers.Array.randomElement(aliveParty);
                const damage = Math.floor(enemy.attackPower * (abilityData.damage || 1.5));
                const result = target.takeDamage(damage, 'physical', 'ability');
                this.logMessage(`${target.name} takes ${result.damageDealt} damage from ${abilityData.name}!`, 'log-damage');
                
                if (result.died) {
                    this.logMessage(`${target.name} has been slain!`, 'log-death');
                    this.handleCharacterDeath(target);
                }
        }
    }

    /**
     * Handle character death in combat
     */
    static handleCharacterDeath(character) {
        if (character.combatStats) {
            character.combatStats.deathsSuffered++;
        }
        
        // Check for death-triggered skills or abilities
        this.currentCombat.party.forEach(ally => {
            if (ally.isAlive() && ally.learnedSkills) {
                // Look for skills that trigger on ally death
                ally.learnedSkills.forEach(skillId => {
                    const skill = SKILLS_DATA?.[skillId];
                    if (skill?.trigger === 'ally_death' && ally.canUseSkill && ally.canUseSkill(skillId)) {
                        if (Helpers.Math.percentChance(ally.getSkillActivationChance ? ally.getSkillActivationChance(skillId) : 50)) {
                            this.logMessage(`${ally.name} activates ${skill.name} in response to ${character.name}'s death!`, 'log-skill');
                            // Apply skill effect immediately
                        }
                    }
                });
            }
        });
    }

    /**
     * Apply status effect to target
     */
    static applyStatusEffect(target, effectType, duration, source, value = 0) {
        if (target.addStatusEffect) {
            target.addStatusEffect({
                type: effectType,
                duration: duration,
                source: source,
                intensity: 1,
                value: value
            });
            this.logMessage(`${target.name} is affected by ${effectType}`, 'log-skill');
        } else {
            // Enemy status effects
            target.statusEffects = target.statusEffects || [];
            target.statusEffects.push({
                type: effectType,
                duration: duration,
                source: source,
                intensity: 1,
                value: value
            });
            this.logMessage(`${target.name} is affected by ${effectType}`, 'log-skill');
        }
    }

    /**
     * Calculate skill damage
     */
    static calculateSkillDamage(skill, character) {
        const baseDamage = 25;
        const statBonus = (character.stats?.[skill.statModifier] || 50) / 8;
        const levelBonus = (character.level || 1) * 2;
        const randomFactor = Helpers.Math.randomFloat(0.8, 1.3);
        
        return Math.floor((baseDamage + statBonus + levelBonus) * randomFactor);
    }

    /**
     * Select appropriate targets for skill
     */
    static selectSkillTargets(skill, availableTargets) {
        // For now, simple target selection
        // Could be expanded for multi-target skills, smart targeting, etc.
        return availableTargets.slice(0, 1); // Single target for most skills
    }

    /**
     * Check if combat should end
     */
    static checkCombatEndConditions() {
        const enemy = this.currentCombat.enemy;
        const aliveParty = this.currentCombat.party.filter(c => c.isAlive());
        
        // Enemy defeated
        if (enemy.currentHP <= 0) {
            this.endCombat(true, 'enemy_defeated');
            return true;
        }
        
        // Party defeated
        if (aliveParty.length === 0) {
            this.endCombat(false, 'party_defeated');
            return true;
        }
        
        // Timeout (very long combat)
        if (this.currentCombat.round > 50) {
            this.endCombat(false, 'timeout');
            return true;
        }
        
        return false;
    }

    /**
     * End combat with results
     */
    static endCombat(victory, reason) {
        if (!this.currentCombat) return;
        
        this.currentCombat.isActive = false;
        this.isProcessing = false;
        
        const duration = Date.now() - this.currentCombat.startTime;
        
        if (victory) {
            this.logMessage('🎉 Victory! Enemy defeated!', 'log-heal');
            this.handleCombatVictory(reason, duration);
        } else {
            this.logMessage('💀 Defeat! Party has been defeated!', 'log-death');
            this.handleCombatDefeat(reason, duration);
        }
        
        // Record combat in game state
        this.recordCombatResult(victory, reason, duration);
        
        // Trigger combat ended callbacks
        this.triggerCombatEvent('combatEnded', { 
            victory, 
            reason, 
            duration,
            combat: this.currentCombat
        });
        
        // Clean up
        setTimeout(() => {
            this.currentCombat = null;
        }, 1000);
    }

    /**
     * Handle combat victory
     */
    static handleCombatVictory(reason, duration) {
        const dungeonData = DUNGEONS_DATA?.[this.currentCombat.dungeonType];
        if (!dungeonData) return;
        
        // Calculate rewards
        const goldReward = Helpers.Math.randomInt(...dungeonData.goldReward);
        const materialReward = Helpers.Math.randomInt(...dungeonData.materialReward);
        const experienceReward = Math.floor(dungeonData.experienceMultiplier * 100);
        
        // Apply rewards
        gameState.addResource('gold', goldReward);
        gameState.addResource('materials', materialReward);
        
        // Award experience to surviving party members
        const survivors = this.currentCombat.party.filter(c => c.isAlive());
        survivors.forEach(character => {
            if (character.addExperience) {
                const levelUps = character.addExperience(experienceReward);
                if (levelUps.length > 0) {
                    this.logMessage(`${character.name} gained a level! Now level ${character.level}`, 'log-heal');
                }
            }
        });
        
        // Update combat stats
        survivors.forEach(char => {
            if (char.combatStats) {
                char.combatStats.combatsWon++;
            }
        });
        
        // Mark dungeon as completed
        gameState.completeDungeon(this.currentCombat.dungeonType, 1, true);
        
        // Show results
        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(
                `Victory! Gained ${goldReward} gold, ${materialReward} materials, and ${experienceReward} experience!`,
                'victory'
            );
        }
    }

    /**
     * Handle combat defeat
     */
    static handleCombatDefeat(reason, duration) {
        // Update defeat stats
        this.currentCombat.party.forEach(char => {
            if (char.combatStats) {
                char.combatStats.combatsLost++;
            }
        });
        
        // Show results
        if (typeof UIManager !== 'undefined') {
            let message = 'Defeat! ';
            switch (reason) {
                case 'party_defeated':
                    message += 'All party members have fallen.';
                    break;
                case 'timeout':
                    message += 'Combat lasted too long and ended in exhaustion.';
                    break;
                default:
                    message += 'The party was defeated.';
            }
            message += ' Consider training and better equipment before the next attempt.';
            
            UIManager.showResults(message, 'defeat');
        }
    }

    /**
     * Record combat result in game state
     */
    static recordCombatResult(victory, reason, duration) {
        const combatData = {
            dungeon: this.currentCombat.dungeonType,
            enemy: this.currentCombat.enemy.name,
            victory: victory,
            turnsTaken: this.currentCombat.round,
            damageDealt: this.currentCombat.totalDamageDealt,
            damageReceived: this.currentCombat.totalDamageReceived,
            skillsUsed: this.currentCombat.skillsUsed,
            partyComposition: this.currentCombat.party.map(c => c.name),
            minPartyHealth: Math.min(...this.currentCombat.party.map(c => 
                c.getHealthPercentage ? c.getHealthPercentage() : 100)),
            magicDamagePercent: this.calculateMagicDamagePercent(),
            isBoss: this.currentCombat.enemy.difficulty >= 8,
            enemyType: this.currentCombat.enemy.type,
            duration: duration,
            reason: reason
        };
        
        gameState.recordCombat(combatData);
    }

    /**
     * Calculate percentage of damage that was magical
     */
    static calculateMagicDamagePercent() {
        // Simple calculation based on skills used
        const magicSkills = this.currentCombat.skillsUsed.filter(skillUse => {
            const skill = SKILLS_DATA?.[skillUse.skill];
            return skill && skill.schoolOfMagic;
        });
        
        return this.currentCombat.skillsUsed.length > 0 ? 
            (magicSkills.length / this.currentCombat.skillsUsed.length) * 100 : 0;
    }

    /**
     * Apply environmental effects
     */
    static applyEnvironmentalEffects() {
        if (!this.currentCombat.environmentalEffects.length) return;
        
        this.currentCombat.environmentalEffects.forEach(effect => {
            if (Helpers.Math.percentChance(effect.chance || 30)) {
                switch (effect.type) {
                    case 'falling_rocks':
                        const rockDamage = Helpers.Math.randomInt(5, 15);
                        const target = Helpers.Array.randomElement(this.currentCombat.party.filter(c => c.isAlive()));
                        if (target) {
                            target.takeDamage(rockDamage, 'physical', 'environment');
                            this.logMessage(`${target.name} is hit by falling rocks for ${rockDamage} damage`, 'log-damage');
                        }
                        break;
                        
                    case 'toxic_gas':
                        this.currentCombat.party.forEach(char => {
                            if (char.isAlive() && !char.hasStatusEffect('poison_resist')) {
                                this.applyStatusEffect(char, 'poisoned', 3, 'environment');
                            }
                        });
                        this.logMessage('Toxic gas fills the area!', 'log-damage');
                        break;
                        
                    case 'healing_spring':
                        this.currentCombat.party.forEach(char => {
                            if (char.isAlive() && char.heal) {
                                const healing = char.heal(10);
                                if (healing > 0) {
                                    this.logMessage(`${char.name} is healed by the spring for ${healing} HP`, 'log-heal');
                                }
                            }
                        });
                        break;
                        
                    case 'unstable_crystals':
                        if (Helpers.Math.percentChance(20)) {
                            const magicDamage = Helpers.Math.randomInt(8, 20);
                            this.currentCombat.party.forEach(char => {
                                if (char.isAlive()) {
                                    char.takeDamage(magicDamage, 'magical', 'environment');
                                }
                            });
                            this.logMessage(`Crystals explode with magical energy! Party takes ${magicDamage} damage`, 'log-damage');
                        }
                        break;
                        
                    case 'shadow_drain':
                        this.currentCombat.party.forEach(char => {
                            if (char.isAlive() && char.restoreMana) {
                                const manaDrain = Math.floor(char.maxMP * 0.1);
                                char.currentMP = Math.max(0, char.currentMP - manaDrain);
                                this.logMessage(`${char.name} loses ${manaDrain} MP to shadow energy`, 'log-damage');
                            }
                        });
                        break;
                }
            }
        });
    }

    /**
     * Attempt skill activation
     */
    static attemptSkillActivation(character, skillId, trigger) {
        const skill = SKILLS_DATA?.[skillId];
        if (!skill || skill.trigger !== trigger) return false;
        
        if (!character.canUseSkill || !character.canUseSkill(skillId)) return false;
        
        const activationChance = character.getSkillActivationChance ? 
            character.getSkillActivationChance(skillId) : 50;
            
        if (Helpers.Math.percentChance(activationChance)) {
            const triggerContext = this.evaluateSkillTrigger(trigger, character);
            return this.executeSkillAction(character, skill, skillId, triggerContext);
        }
        
        return false;
    }

    /**
     * Get combat statistics for analysis
     */
    static getCombatStats() {
        if (!this.currentCombat) return null;
        
        return {
            round: this.currentCombat.round,
            duration: Date.now() - this.currentCombat.startTime,
            totalDamageDealt: this.currentCombat.totalDamageDealt,
            totalDamageReceived: this.currentCombat.totalDamageReceived,
            skillsUsed: this.currentCombat.skillsUsed.length,
            partyStatus: this.currentCombat.party.map(char => ({
                name: char.name,
                hp: char.currentHP,
                maxHP: char.maxHP,
                isAlive: char.isAlive(),
                statusEffects: char.statusEffects?.length || 0
            })),
            enemyStatus: {
                name: this.currentCombat.enemy.name,
                hp: this.currentCombat.enemy.currentHP,
                maxHP: this.currentCombat.enemy.maxHP,
                statusEffects: this.currentCombat.enemy.statusEffects?.length || 0
            }
        };
    }

    /**
     * Pause/resume combat
     */
    static pauseCombat() {
        if (this.currentCombat) {
            this.currentCombat.paused = true;
        }
    }

    static resumeCombat() {
        if (this.currentCombat && this.currentCombat.paused) {
            this.currentCombat.paused = false;
            this.runCombatRound();
        }
    }

    /**
     * Continue combat manually (if auto-advance is disabled)
     */
    static continue() {
        if (this.currentCombat && !this.autoAdvance) {
            // Hide continue button
            const continueBtn = document.getElementById('continueBtn');
            if (continueBtn) {
                continueBtn.classList.add('hidden');
            }
            this.runCombatRound();
        }
    }

    /**
     * Set combat speed multiplier
     */
    static setCombatSpeed(speed) {
        this.combatSpeed = Helpers.Math.clamp(speed, 0.1, 5.0);
    }

    /**
     * Toggle auto-advance combat
     */
    static setAutoAdvance(enabled) {
        this.autoAdvance = enabled;
    }

    /**
     * Skip to combat end (for testing/debugging)
     */
    static skipCombat(forceVictory = null) {
        if (!this.currentCombat || !DEBUG_CONFIG?.ENABLED) return;
        
        if (forceVictory === null) {
            forceVictory = Helpers.Math.percentChance(70); // 70% chance of victory
        }
        
        if (forceVictory) {
            this.currentCombat.enemy.currentHP = 0;
            this.endCombat(true, 'debug_skip');
        } else {
            this.currentCombat.party.forEach(char => {
                char.currentHP = 0;
            });
            this.endCombat(false, 'debug_skip');
        }
    }

    /**
     * Get detailed combat log
     */
    static getCombatLog() {
        return [...this.combatLog];
    }

    /**
     * Clear combat log
     */
    static clearCombatLog() {
        this.combatLog = [];
        if (typeof UIManager !== 'undefined') {
            UIManager.clearCombatLog();
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
        if (!this.currentCombat.enemy) {
            issues.push('No enemy in combat');
        }
        
        // Check for infinite combat
        if (this.currentCombat.round > 100) {
            issues.push('Combat has exceeded maximum rounds');
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
        console.warn('Emergency combat reset triggered');
        
        if (this.currentCombat) {
            this.endCombat(false, 'emergency_reset');
        }
        
        this.currentCombat = null;
        this.isProcessing = false;
        this.combatLog = [];
        
        if (typeof UIManager !== 'undefined') {
            UIManager.showSection('actionsSection');
            UIManager.showMessage('Combat was reset due to an error', 'warning');
        }
    }

    /**
     * Handle combat errors
     */
    static handleCombatError(error) {
        console.error('Combat error occurred:', error);
        
        // Try to end combat gracefully
        try {
            this.endCombat(false, 'error');
        } catch (endError) {
            console.error('Failed to end combat after error:', endError);
            this.emergencyReset();
        }
        
        // Show user message
        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage('Combat encountered an error and was ended', 'error');
        }
    }

    /**
     * Update method for game loop integration
     */
    static update(deltaTime) {
        // Process any pending animations or effects
        // This method is called by the main game loop
        if (this.currentCombat && this.currentCombat.isActive) {
            // Update combat timing if needed
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CombatManager = CombatManager;
    console.log('✅ CombatManager loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatManager;
}