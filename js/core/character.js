/**
 * ===========================================
 * CHARACTER CLASS DEFINITION
 * ===========================================
 * Complete character management with stats, skills, equipment, and progression
 */

class Character {
    constructor(characterData, characterId) {
        // Basic identity
        this.id = characterId;
        this.name = characterData.name;
        this.archetype = characterData.archetype;
        this.description = characterData.description;
        this.lore = characterData.lore || '';

        // Base character data
        this.aptitudes = { ...characterData.aptitudes };
        this.baseStats = { ...characterData.baseStats };
        this.skills = [...characterData.skills];
        this.preferredWeapons = characterData.preferredWeapons || [];
        this.growthRates = characterData.growthRates || {};

        // Current state
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = this.calculateExperienceNeeded(2);
        
        // Health and mana
        this.currentHP = this.baseStats.hp;
        this.currentMP = this.baseStats.mp;
        this.maxHP = this.baseStats.hp;
        this.maxMP = this.baseStats.mp;

        // Core stats (trained/improved values)
        this.stats = {};
        Object.keys(this.aptitudes).forEach(stat => {
            this.stats[stat] = this.aptitudes[stat] * 20; // Base conversion
        });

        // Combat state
        this.skillCooldowns = {};
        this.statusEffects = [];
        this.actionThisTurn = false;
        this.position = 'front'; // front, back

        // Equipment system (placeholder for expansion)
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null,
            consumables: []
        };

        // Performance tracking
        this.combatStats = {
            damageDealt: 0,
            damageReceived: 0,
            healingDone: 0,
            skillsActivated: 0,
            combatsWon: 0,
            combatsLost: 0,
            enemiesKilled: 0,
            deathsSuffered: 0,
            turnsSurvived: 0,
            criticalHits: 0,
            dodgedAttacks: 0
        };

        // Character progression
        this.trainingHistory = [];
        this.learnedSkills = [...this.skills]; // Skills known beyond base
        this.masteredSkills = []; // Skills with bonus effects
        this.relationships = {}; // With other party members

        // Mentor potential (for future runs)
        this.mentorQualities = {
            leadership: 0,
            teaching: 0,
            specialization: this.archetype,
            achievements: [],
            personalityTraits: []
        };
    }

    /**
     * Calculate experience needed for a given level
     */
    calculateExperienceNeeded(targetLevel) {
        // Exponential growth: level^2 * 100
        return Math.floor(Math.pow(targetLevel, 2) * 100);
    }

    /**
     * Add experience and handle level ups
     */
    addExperience(amount) {
        this.experience += amount;
        const levelUps = [];

        // Check for level ups
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
            levelUps.push(this.level);
        }

        return levelUps;
    }

    /**
     * Handle level up progression
     */
    levelUp() {
        this.level++;
        this.experienceToNext = this.calculateExperienceNeeded(this.level + 1);

        // Increase base stats based on archetype
        const hpGain = Math.floor(this.aptitudes.endurance * 3 + Math.random() * 10);
        const mpGain = Math.floor((this.aptitudes.mind + this.aptitudes.spirit) * 2 + Math.random() * 8);

        this.maxHP += hpGain;
        this.maxMP += mpGain;
        this.currentHP = this.maxHP; // Full heal on level up
        this.currentMP = this.maxMP;

        // Increase trained stats
        Object.keys(this.stats).forEach(stat => {
            const growth = this.growthRates[stat] || 1.0;
            const increase = Math.floor(growth * 5 + Math.random() * 5);
            this.stats[stat] += increase;
        });

        console.log(`🆙 ${this.name} reached level ${this.level}!`);
        
        // Check for skill learning opportunities
        this.checkSkillLearning();
    }

    /**
     * Train a specific stat
     */
    trainStat(statName, baseAmount, efficiency = 1.0) {
        if (!this.stats.hasOwnProperty(statName)) {
            console.warn(`Unknown stat: ${statName}`);
            return false;
        }

        const aptitudeBonus = this.aptitudes[statName] || 1;
        const growthBonus = this.growthRates[statName] || 1.0;
        const trainedAmount = Math.floor(baseAmount * aptitudeBonus * growthBonus * efficiency);
        
        const oldValue = this.stats[statName];
        this.stats[statName] += trainedAmount;

        // Update derived stats
        this.updateDerivedStats(statName, trainedAmount);

        // Record training history
        this.trainingHistory.push({
            timestamp: Date.now(),
            stat: statName,
            amount: trainedAmount,
            method: 'training'
        });

        console.log(`📈 ${this.name}'s ${statName}: ${oldValue} → ${this.stats[statName]} (+${trainedAmount})`);
        return trainedAmount;
    }

    /**
     * Update derived stats when core stats change
     */
    updateDerivedStats(statName, amount) {
        switch (statName) {
            case 'endurance':
                const hpIncrease = Math.floor(amount * 2);
                this.maxHP += hpIncrease;
                this.currentHP += hpIncrease;
                break;
                
            case 'mind':
            case 'spirit':
                const mpIncrease = Math.floor(amount * 1.5);
                this.maxMP += mpIncrease;
                this.currentMP += mpIncrease;
                break;
        }
    }

    /**
     * Learn a new skill
     */
    learnSkill(skillId) {
        if (this.learnedSkills.includes(skillId)) {
            return false;
        }

        if (typeof SKILLS_DATA === 'undefined' || !SKILLS_DATA[skillId]) {
            console.warn(`Unknown skill: ${skillId}`);
            return false;
        }

        const skill = SKILLS_DATA[skillId];
        
        // Check prerequisites
        if (skill.prerequisites && skill.prerequisites.length > 0) {
            const missingPrereqs = skill.prerequisites.filter(req => 
                !this.learnedSkills.includes(req)
            );
            if (missingPrereqs.length > 0) {
                console.log(`Cannot learn ${skill.name}: missing prerequisites ${missingPrereqs.join(', ')}`);
                return false;
            }
        }

        this.learnedSkills.push(skillId);
        console.log(`📚 ${this.name} learned ${skill.name}!`);
        
        return true;
    }

    /**
     * Check for available skill learning opportunities
     */
    checkSkillLearning() {
        if (typeof SKILLS_DATA === 'undefined') return [];

        const availableSkills = [];
        
        Object.keys(SKILLS_DATA).forEach(skillId => {
            const skill = SKILLS_DATA[skillId];
            
            // Skip if already known
            if (this.learnedSkills.includes(skillId)) return;
            
            // Check if character can learn this skill (based on stats or archetype)
            if (this.canLearnSkill(skill)) {
                availableSkills.push(skillId);
            }
        });

        return availableSkills;
    }

    /**
     * Check if character can learn a specific skill
     */
    canLearnSkill(skill) {
        // Check stat requirements (example: need minimum stat levels)
        const requiredStat = skill.statModifier;
        if (requiredStat && this.stats[requiredStat] < 50) {
            return false;
        }

        // Check prerequisites
        if (skill.prerequisites) {
            return skill.prerequisites.every(prereq => this.learnedSkills.includes(prereq));
        }

        return true;
    }

    /**
     * Calculate skill activation chance
     */
    getSkillActivationChance(skillId) {
        if (typeof SKILLS_DATA === 'undefined' || !SKILLS_DATA[skillId]) {
            return 0;
        }

        const skill = SKILLS_DATA[skillId];
        const statValue = this.stats[skill.statModifier] || 0;
        let baseChance = skill.baseChance + (statValue / 10);

        // Mastery bonus
        if (this.masteredSkills.includes(skillId)) {
            baseChance += 15;
        }

        // Equipment bonuses (placeholder)
        // baseChance += this.getEquipmentSkillBonus(skillId);

        // Cap between 5-95%
        return Math.min(95, Math.max(5, Math.floor(baseChance)));
    }

    /**
     * Check if character can use skill (not on cooldown)
     */
    canUseSkill(skillId) {
        // Check if skill is known
        if (!this.learnedSkills.includes(skillId)) {
            return false;
        }

        // Check cooldown
        if (this.skillCooldowns[skillId] && this.skillCooldowns[skillId] > 0) {
            return false;
        }

        // Check mana cost
        if (typeof SKILLS_DATA !== 'undefined' && SKILLS_DATA[skillId]) {
            const manaCost = SKILLS_DATA[skillId].manaCost || 0;
            if (this.currentMP < manaCost) {
                return false;
            }
        }

        return true;
    }

    /**
     * Use skill and apply costs/cooldowns
     */
    useSkill(skillId) {
        if (!this.canUseSkill(skillId)) {
            return false;
        }

        const skill = SKILLS_DATA[skillId];
        if (!skill) return false;

        // Apply mana cost
        this.currentMP = Math.max(0, this.currentMP - (skill.manaCost || 0));

        // Apply cooldown
        this.skillCooldowns[skillId] = skill.cooldown || 0;

        // Update stats
        this.combatStats.skillsActivated++;

        // Check for skill mastery progress
        this.progressSkillMastery(skillId);

        return true;
    }

    /**
     * Progress towards skill mastery
     */
    progressSkillMastery(skillId) {
        // Simple mastery system: use skill 50 times to master it
        if (!this.skillMasteryProgress) {
            this.skillMasteryProgress = {};
        }

        if (!this.skillMasteryProgress[skillId]) {
            this.skillMasteryProgress[skillId] = 0;
        }

        this.skillMasteryProgress[skillId]++;

        if (this.skillMasteryProgress[skillId] >= 50 && !this.masteredSkills.includes(skillId)) {
            this.masteredSkills.push(skillId);
            console.log(`⭐ ${this.name} mastered ${SKILLS_DATA[skillId]?.name || skillId}!`);
        }
    }

    /**
     * Reduce all skill cooldowns
     */
    reduceCooldowns() {
        Object.keys(this.skillCooldowns).forEach(skillId => {
            if (this.skillCooldowns[skillId] > 0) {
                this.skillCooldowns[skillId]--;
            }
        });
    }

    /**
     * Heal character
     */
    heal(amount, source = 'unknown') {
        const actualHealing = Math.min(amount, this.maxHP - this.currentHP);
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
        
        if (source === 'self' || source === 'skill') {
            this.combatStats.healingDone += actualHealing;
        }

        return actualHealing;
    }

    /**
     * Restore mana
     */
    restoreMana(amount) {
        const actualRestore = Math.min(amount, this.maxMP - this.currentMP);
        this.currentMP = Math.min(this.maxMP, this.currentMP + amount);
        return actualRestore;
    }

    /**
     * Take damage with resistance calculations
     */
    takeDamage(amount, type = 'physical', source = 'enemy') {
        let finalDamage = amount;

        // Apply resistances/weaknesses (placeholder for equipment system)
        // finalDamage = this.applyResistances(finalDamage, type);

        // Apply status effect modifications
        finalDamage = this.applyStatusEffectModifiers(finalDamage, type);

        // Ensure minimum damage
        finalDamage = Math.max(1, Math.floor(finalDamage));

        const oldHP = this.currentHP;
        this.currentHP = Math.max(0, this.currentHP - finalDamage);
        
        this.combatStats.damageReceived += finalDamage;
        
        // Check for death
        const died = this.currentHP <= 0;
        if (died) {
            this.onDeath();
        }

        return {
            damageDealt: finalDamage,
            died: died,
            overkill: died ? Math.abs(this.currentHP) : 0
        };
    }

    /**
     * Apply status effect modifiers to incoming damage
     */
    applyStatusEffectModifiers(damage, type) {
        let modifiedDamage = damage;

        this.statusEffects.forEach(effect => {
            switch (effect.type) {
                case 'damage_reduction':
                    modifiedDamage *= (1 - (effect.value / 100));
                    break;
                case 'vulnerability':
                    modifiedDamage *= (1 + (effect.value / 100));
                    break;
                case 'magic_shield':
                    if (type === 'magical') {
                        modifiedDamage *= 0.5;
                    }
                    break;
            }
        });

        return modifiedDamage;
    }

    /**
     * Handle character death
     */
    onDeath() {
        this.combatStats.deathsSuffered++;
        
        // Add death-related status effects
        this.statusEffects.push({
            type: 'unconscious',
            duration: -1, // Permanent until revived
            source: 'death'
        });

        // Update mentor qualities based on death circumstances
        this.updateMentorQualitiesOnDeath();
        
        console.log(`💀 ${this.name} has fallen!`);
    }

    /**
     * Revive character (for future resurrection mechanics)
     */
    revive(hpPercent = 0.5) {
        if (this.isAlive()) return false;

        this.currentHP = Math.floor(this.maxHP * hpPercent);
        this.statusEffects = this.statusEffects.filter(effect => effect.type !== 'unconscious');
        
        console.log(`✨ ${this.name} has been revived!`);
        return true;
    }

    /**
     * Check if character is alive
     */
    isAlive() {
        return this.currentHP > 0 && !this.statusEffects.some(effect => effect.type === 'unconscious');
    }

    /**
     * Get character's current health percentage
     */
    getHealthPercentage() {
        return (this.currentHP / this.maxHP) * 100;
    }

    /**
     * Get character's current mana percentage
     */
    getManaPercentage() {
        return (this.currentMP / this.maxMP) * 100;
    }

    /**
     * Add status effect
     */
    addStatusEffect(effect) {
        if (existing !== -1) {
            // Refresh duration or stack intensity
            if (effect.stacks) {
                this.statusEffects[existing].intensity = (this.statusEffects[existing].intensity || 1) + 1;
            } else {
                this.statusEffects[existing].duration = effect.duration;
            }
        } else {
            this.statusEffects.push({
                type: effect.type,
                duration: effect.duration,
                intensity: effect.intensity || 1,
                source: effect.source || 'unknown',
                value: effect.value || 0
            });
        }
    }

    /**
     * Remove status effect
     */
    removeStatusEffect(type, source = null) {
        this.statusEffects = this.statusEffects.filter(effect => 
            effect.type !== type || (source && effect.source !== source)
        );
    }

    /**
     * Process status effects (called each turn)
     */
    processStatusEffects() {
        const expiredEffects = [];
        
        this.statusEffects.forEach((effect, index) => {
            // Apply ongoing effects
            switch (effect.type) {
                case 'poisoned':
                    const poisonDamage = Math.floor(this.maxHP * 0.05 * effect.intensity);
                    this.takeDamage(poisonDamage, 'poison', 'status');
                    break;
                    
                case 'burning':
                    const burnDamage = Math.floor(this.maxHP * 0.08 * effect.intensity);
                    this.takeDamage(burnDamage, 'fire', 'status');
                    break;
                    
                case 'regeneration':
                    const healAmount = Math.floor(this.maxHP * 0.1 * effect.intensity);
                    this.heal(healAmount, 'status');
                    break;
                    
                case 'mana_drain':
                    const manaDrain = Math.floor(this.maxMP * 0.1 * effect.intensity);
                    this.currentMP = Math.max(0, this.currentMP - manaDrain);
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
        
        // Remove expired effects (in reverse order to maintain indices)
        expiredEffects.reverse().forEach(index => {
            const effect = this.statusEffects[index];
            console.log(`⏰ ${this.name}'s ${effect.type} effect expired`);
            this.statusEffects.splice(index, 1);
        });
    }

    /**
     * Check if character has specific status effect
     */
    hasStatusEffect(type) {
        return this.statusEffects.some(effect => effect.type === type);
    }

    /**
     * Get total stat value including equipment bonuses
     */
    getTotalStat(statName) {
        let total = this.stats[statName] || 0;
        
        // Add equipment bonuses (placeholder)
        // total += this.getEquipmentStatBonus(statName);
        
        // Add status effect bonuses/penalties
        this.statusEffects.forEach(effect => {
            if (effect.type === `${statName}_bonus`) {
                total += effect.value;
            } else if (effect.type === `${statName}_penalty`) {
                total -= effect.value;
            }
        });
        
        return Math.max(0, total);
    }

    /**
     * Update mentor qualities based on character performance
     */
    updateMentorQualities() {
        // Leadership: based on party support actions and victories
        if (this.combatStats.combatsWon > this.combatStats.combatsLost) {
            this.mentorQualities.leadership += 1;
        }

        // Teaching: based on skill usage diversity and mastery
        const skillsDiversityBonus = this.masteredSkills.length * 2;
        this.mentorQualities.teaching += skillsDiversityBonus;

        // Achievements: track notable accomplishments
        if (this.combatStats.enemiesKilled >= 50) {
            this.addMentorAchievement('veteran_warrior');
        }
        if (this.combatStats.healingDone >= 1000) {
            this.addMentorAchievement('master_healer');
        }
        if (this.masteredSkills.length >= 5) {
            this.addMentorAchievement('skill_master');
        }
    }

    /**
     * Update mentor qualities when character dies
     */
    updateMentorQualitiesOnDeath() {
        // Heroic death bonuses
        if (this.combatStats.damageDealt > this.combatStats.damageReceived * 2) {
            this.addMentorAchievement('heroic_sacrifice');
            this.mentorQualities.leadership += 5;
        }

        // Add personality traits based on death circumstances
        if (this.getHealthPercentage() === 0 && this.combatStats.turnsSurvived > 10) {
            this.mentorQualities.personalityTraits.push('determined');
        }
    }

    /**
     * Add mentor achievement
     */
    addMentorAchievement(achievement) {
        if (!this.mentorQualities.achievements.includes(achievement)) {
            this.mentorQualities.achievements.push(achievement);
        }
    }

    /**
     * Get mentor potential rating
     */
    getMentorRating() {
        const base = this.mentorQualities.leadership + this.mentorQualities.teaching;
        const achievementBonus = this.mentorQualities.achievements.length * 10;
        const masteryBonus = this.masteredSkills.length * 5;
        const experienceBonus = Math.floor(this.level / 10) * 3;
        
        return base + achievementBonus + masteryBonus + experienceBonus;
    }

    /**
     * Build relationship with another character
     */
    buildRelationship(otherCharacterId, amount = 1) {
        if (!this.relationships[otherCharacterId]) {
            this.relationships[otherCharacterId] = 0;
        }
        
        this.relationships[otherCharacterId] = Math.min(100, 
            this.relationships[otherCharacterId] + amount
        );
    }

    /**
     * Get relationship level with another character
     */
    getRelationshipLevel(otherCharacterId) {
        const value = this.relationships[otherCharacterId] || 0;
        if (value >= 80) return 'best_friends';
        if (value >= 60) return 'close_friends';
        if (value >= 40) return 'friends';
        if (value >= 20) return 'acquaintances';
        return 'strangers';
    }

    /**
     * Get combat effectiveness rating
     */
    getCombatRating() {
        const statTotal = Object.values(this.stats).reduce((sum, stat) => sum + stat, 0);
        const experienceBonus = this.level * 10;
        const skillBonus = this.learnedSkills.length * 5;
        const masteryBonus = this.masteredSkills.length * 15;
        
        return Math.floor(statTotal + experienceBonus + skillBonus + masteryBonus);
    }

    /**
     * Get character summary for display
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            archetype: this.archetype,
            level: this.level,
            hp: { current: this.currentHP, max: this.maxHP },
            mp: { current: this.currentMP, max: this.maxMP },
            stats: { ...this.stats },
            isAlive: this.isAlive(),
            combatRating: this.getCombatRating(),
            experience: this.experience,
            skillsKnown: this.learnedSkills.length,
            skillsMastered: this.masteredSkills.length,
            statusEffects: this.statusEffects.map(e => e.type)
        };
    }

    /**
     * Serialize character for saving
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            archetype: this.archetype,
            level: this.level,
            experience: this.experience,
            currentHP: this.currentHP,
            currentMP: this.currentMP,
            maxHP: this.maxHP,
            maxMP: this.maxMP,
            stats: { ...this.stats },
            skills: [...this.skills],
            learnedSkills: [...this.learnedSkills],
            masteredSkills: [...this.masteredSkills],
            combatStats: { ...this.combatStats },
            statusEffects: [...this.statusEffects],
            equipment: this.equipment ? { ...this.equipment } : null,
            relationships: { ...this.relationships },
            mentorQualities: { ...this.mentorQualities },
            trainingHistory: [...this.trainingHistory],
            skillCooldowns: { ...this.skillCooldowns },
            position: this.position
        };
    }

    /**
     * Deserialize character from save data
     */
    static deserialize(data) {
        // Get character template data
        const characterData = CHARACTERS_DATA?.[data.id];
        if (!characterData) {
            throw new Error(`Unknown character: ${data.id}`);
        }

        // Create character instance
        const character = new Character(characterData, data.id);
        
        // Restore saved state
        character.level = data.level || 1;
        character.experience = data.experience || 0;
        character.currentHP = data.currentHP || character.maxHP;
        character.currentMP = data.currentMP || character.maxMP;
        character.maxHP = data.maxHP || character.maxHP;
        character.maxMP = data.maxMP || character.maxMP;
        character.stats = { ...character.stats, ...data.stats };
        character.learnedSkills = data.learnedSkills || [...character.skills];
        character.masteredSkills = data.masteredSkills || [];
        character.combatStats = { ...character.combatStats, ...data.combatStats };
        character.statusEffects = data.statusEffects || [];
        character.equipment = data.equipment || character.equipment;
        character.relationships = data.relationships || {};
        character.mentorQualities = { ...character.mentorQualities, ...data.mentorQualities };
        character.trainingHistory = data.trainingHistory || [];
        character.skillCooldowns = data.skillCooldowns || {};
        character.position = data.position || 'front';
        
        // Recalculate derived values
        character.experienceToNext = character.calculateExperienceNeeded(character.level + 1);
        
        return character;
    }

    /**
     * Create a copy of this character (for mentor system)
     */
    createMentorCopy() {
        const mentorData = {
            originalId: this.id,
            name: this.name,
            archetype: this.archetype,
            level: this.level,
            finalStats: { ...this.stats },
            masteredSkills: [...this.masteredSkills],
            achievements: [...this.mentorQualities.achievements],
            combatRecord: {
                wins: this.combatStats.combatsWon,
                losses: this.combatStats.combatsLost,
                enemiesKilled: this.combatStats.enemiesKilled,
                damageDealt: this.combatStats.damageDealt,
                healingDone: this.combatStats.healingDone
            },
            mentorRating: this.getMentorRating(),
            specialization: this.archetype,
            personalityTraits: [...this.mentorQualities.personalityTraits],
            deathCircumstances: this.isAlive() ? null : 'fallen_in_battle'
        };

        return mentorData;
    }

    /**
     * Rest and recover (called during rest actions)
     */
    rest(effectiveness = 1.0) {
        // Heal HP and MP
        const hpRestore = Math.floor(this.maxHP * 0.5 * effectiveness);
        const mpRestore = Math.floor(this.maxMP * 0.7 * effectiveness);
        
        const actualHPHealed = this.heal(hpRestore, 'rest');
        const actualMPRestored = this.restoreMana(mpRestore);
        
        // Clear some negative status effects
        const clearableEffects = ['poisoned', 'burning', 'fear', 'confused'];
        this.statusEffects = this.statusEffects.filter(effect => {
            if (clearableEffects.includes(effect.type)) {
                if (Math.random() < 0.7 * effectiveness) {
                    return false; // Remove effect
                }
            }
            return true; // Keep effect
        });
        
        // Reset skill cooldowns
        Object.keys(this.skillCooldowns).forEach(skillId => {
            this.skillCooldowns[skillId] = Math.max(0, 
                this.skillCooldowns[skillId] - Math.floor(2 * effectiveness)
            );
        });
        
        return {
            hpHealed: actualHPHealed,
            mpRestored: actualMPRestored,
            effectsCleared: clearableEffects.filter(effect => !this.hasStatusEffect(effect))
        };
    }

    /**
     * Get available actions this character can take
     */
    getAvailableActions() {
        const actions = [];
        
        if (this.isAlive()) {
            // Basic attack always available
            actions.push({ type: 'attack', name: 'Basic Attack' });
            
            // Available skills
            this.learnedSkills.forEach(skillId => {
                if (this.canUseSkill(skillId) && SKILLS_DATA[skillId]) {
                    actions.push({
                        type: 'skill',
                        skillId: skillId,
                        name: SKILLS_DATA[skillId].name,
                        manaCost: SKILLS_DATA[skillId].manaCost || 0,
                        cooldown: this.skillCooldowns[skillId] || 0
                    });
                }
            });
            
            // Defensive actions
            actions.push({ type: 'defend', name: 'Defend' });
            
            // Items (placeholder)
            // this.equipment.consumables.forEach(item => { ... });
        }
        
        return actions;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Character = Character;
    console.log('✅ Character class loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character;
}