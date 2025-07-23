/**
 * ===========================================
 * ACTION MANAGER - SINGLE CHARACTER
 * ===========================================
 * Handle all character actions and training for single character mode
 */

class ActionManager {
    static instance = null;
    static isProcessingAction = false;
    static actionCallbacks = {};

    static actionCosts = {
        trainGeneral: { gold: 100 },
        trainSpecific: { gold: 150 },
        rest: { gold: 50 },
        buyEquipment: { gold: 200, materials: 10 },
        exploreDungeon: { gold: 25 }
    };

    /**
     * Initialize action manager
     */
    static initialize() {
        this.instance = this;
        console.log('⚡ Action Manager initialized for single character mode');
        return true;
    }

    /**
     * General training for the character
     */
    static async trainGeneral() {
        return await this.executeAction('trainGeneral', {
            effectiveness: 1.0
        });
    }

    /**
     * Train specific stat
     */
    static async trainSpecificStat(statName, options = {}) {
        return await this.executeAction('trainSpecific', {
            stat: statName,
            effectiveness: 1.5, // More effective than general training
            ...options
        });
    }

    /**
     * Rest and recover
     */
    static async rest(restType = 'inn') {
        return await this.executeAction('rest', {
            restType,
            effectiveness: this.getRestEffectiveness(restType)
        });
    }

    /**
     * Buy equipment for character
     */
    static async buyEquipment() {
        return await this.executeAction('buyEquipment', {});
    }

    /**
     * Explore dungeon solo
     */
    static async exploreDungeon() {
        return await this.executeAction('exploreDungeon', {});
    }

    /**
     * Show dungeon selection
     */
    static showDungeonSelection() {
        if (!gameState.adventurer) {
            UIManager.showMessage('You need a character to explore dungeons!', 'error');
            return;
        }

        const dungeonSelectionContent = this.createDungeonSelectionContent();
        
        const modal = UIManager.createModal(
            '🗡️ Select Dungeon to Explore', 
            dungeonSelectionContent,
            '<button class="btn btn-secondary" onclick="this.closest(\'.modal-overlay\').remove()">Cancel</button>'
        );
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Create dungeon selection content
     */
    static createDungeonSelectionContent() {
        const character = gameState.adventurer;
        const combatRating = character.getCombatRating ? character.getCombatRating() : 100;
        
        let content = `
            <div class="dungeon-selection">
                <div class="character-info" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <h4>${character.name} - Solo Adventure</h4>
                    <p><strong>Combat Rating:</strong> ${combatRating}</p>
                    <p><strong>Health:</strong> ${character.currentHP}/${character.maxHP} (${Math.round((character.currentHP / character.maxHP) * 100)}%)</p>
                    <p><strong>Status:</strong> ${character.isAlive() ? '⚔️ Ready for Combat' : '💀 Needs Rest'}</p>
                </div>
                
                <div style="background: rgba(50, 130, 184, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3282b8;">
                    <h4 style="margin-top: 0; color: #bbe1fa;">🦸 Solo Adventuring</h4>
                    <p style="margin-bottom: 0;">Brave the dungeons alone and prove your worth:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>🎯 Focused combat encounters designed for solo play</li>
                        <li>💰 Higher individual rewards</li>
                        <li>⚔️ Skill-based tactical combat</li>
                        <li>🏃 Strategic retreat options</li>
                        <li>📈 Accelerated character progression</li>
                    </ul>
                </div>
                
                <div class="dungeons-grid" style="display: grid; gap: 15px;">
        `;

        // Add available dungeons
        Object.entries(DUNGEONS_DATA).forEach(([dungeonId, dungeonData]) => {
            if (!gameState.unlockedDungeons.includes(dungeonId)) return;

            const recommendedRating = dungeonData.recommendedLevel * 50;
            const difficulty = combatRating >= recommendedRating ? 'Easy' : 
                             combatRating >= recommendedRating * 0.8 ? 'Normal' : 
                             combatRating >= recommendedRating * 0.6 ? 'Hard' : 'Very Hard';
            
            const difficultyClass = difficulty.toLowerCase().replace(' ', '-');

            content += `
                <div class="dungeon-option" style="padding: 15px; border: 1px solid #555; border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0;">${dungeonData.name}</h4>
                        <span class="difficulty-badge ${difficultyClass}">${difficulty}</span>
                    </div>
                    <p style="margin: 10px 0; color: #ccc;">${dungeonData.description}</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; font-size: 14px;">
                        <div>Recommended Level: ${dungeonData.recommendedLevel}</div>
                        <div>Estimated Combat Rating: ${recommendedRating}</div>
                        <div>Rewards: ${dungeonData.baseRewards?.gold || 50} gold</div>
                        <div>Materials: ${dungeonData.baseRewards?.materials || 10}</div>
                    </div>
                    <button class="btn btn-primary" onclick="ActionManager.exploreSpecificDungeon('${dungeonId}'); this.closest('.modal-overlay').remove();" 
                            ${!character.isAlive() ? 'disabled title="Character must be conscious to explore"' : ''}>
                        ${character.isAlive() ? '🗡️ Explore Solo' : '💀 Cannot Explore'}
                    </button>
                </div>
            `;
        });

        content += `
                </div>
            </div>
        `;

        return content;
    }

    /**
     * Explore specific dungeon
     */
    static async exploreSpecificDungeon(dungeonId) {
        return await this.executeAction('exploreSpecificDungeon', { dungeonId });
    }

    /**
     * Execute action with validation and cost checking
     */
    static async executeAction(actionType, options = {}) {
        if (this.isProcessingAction) {
            UIManager.showMessage('Another action is in progress!', 'warning');
            return false;
        }

        // Check if character exists for character-dependent actions
        const characterActions = ['trainGeneral', 'trainSpecific', 'exploreDungeon', 'exploreSpecificDungeon'];
        if (characterActions.includes(actionType) && !gameState.adventurer) {
            UIManager.showMessage('You need to select a character first!', 'error');
            return false;
        }

        // Check action costs
        const costs = this.actionCosts[actionType] || {};
        if (!gameState.canAfford(costs)) {
            const costStr = Object.entries(costs).map(([resource, amount]) => `${amount} ${resource}`).join(', ');
            UIManager.showMessage(`Cannot afford: ${costStr}`, 'error');
            return false;
        }

        this.isProcessingAction = true;
        const startTime = Date.now();

        try {
            // Spend resources
            Object.entries(costs).forEach(([resource, amount]) => {
                gameState.spendResource(resource, amount);
            });

            // Update displays
            UIManager.updateResourceDisplay();

            // Execute specific action
            let result;
            switch (actionType) {
                case 'trainGeneral':
                    result = await this.executeTrainGeneral(options);
                    break;
                case 'trainSpecific':
                    result = await this.executeTrainSpecific(options);
                    break;
                case 'rest':
                    result = await this.executeRest(options);
                    break;
                case 'buyEquipment':
                    result = await this.executeBuyEquipment(options);
                    break;
                case 'exploreDungeon':
                    result = await this.executeExploreDungeon(options);
                    break;
                case 'exploreSpecificDungeon':
                    result = await this.executeExploreSpecificDungeon(options);
                    break;
                default:
                    throw new Error(`Unknown action type: ${actionType}`);
            }

            // Update character display
            UIManager.renderCharacterDisplay();

            console.log(`✅ Action ${actionType} completed successfully`, result, Date.now() - startTime);

            // Trigger callbacks
            this.triggerActionEvent('actionCompleted', { 
                action: actionType, 
                options, 
                result,
                duration: Date.now() - startTime
            });

            return result;

        } catch (error) {
            console.error(`Action ${actionType} failed:`, error);
            
            UIManager.showMessage(`Action failed: ${error.message}`, 'error');

            // Refund resources on failure
            Object.entries(costs).forEach(([resource, amount]) => {
                gameState.addResource(resource, amount);
            });

            return false;

        } finally {
            this.isProcessingAction = false;
        }
    }

    /**
     * Execute general training
     */
    static async executeTrainGeneral(options = {}) {
        const character = gameState.adventurer;
        const effectiveness = options.effectiveness || 1.0;
        
        const trainingResult = { 
            character: character.name, 
            improvements: {} 
        };

        // General training - improve 2-3 random stats
        const statsToTrain = Helpers.Math.randomInt(2, 3);
        const statNames = Object.keys(character.stats);
        
        for (let i = 0; i < statsToTrain; i++) {
            const randomStat = Helpers.Array.randomElement(statNames);
            const improvement = character.trainStat(
                randomStat, 
                Helpers.Math.randomInt(8, 15), 
                effectiveness
            );
            trainingResult.improvements[randomStat] = 
                (trainingResult.improvements[randomStat] || 0) + improvement;
                
            // Record in game state
            gameState.recordTraining(randomStat, improvement, 'general');
        }

        // Small chance for skill learning during training
        let skillLearned = null;
        if (Helpers.Math.percentChance(15)) {
            const availableSkills = character.checkSkillLearning();
            if (availableSkills.length > 0) {
                const learnedSkill = Helpers.Array.randomElement(availableSkills);
                if (character.learnSkill(learnedSkill)) {
                    skillLearned = SKILLS_DATA[learnedSkill]?.name || learnedSkill;
                    gameState.statistics.skillsLearned++;
                }
            }
        }

        // Show results
        let message = `${character.name} completed general training!\n`;
        message += Object.entries(trainingResult.improvements)
            .map(([stat, improvement]) => `${Helpers.String.camelToTitle(stat)}: +${improvement}`)
            .join(', ');
        
        if (skillLearned) {
            message += `\n🎉 Also learned ${skillLearned}!`;
        }

        UIManager.showResults(message, 'success');

        return { 
            success: true, 
            improvements: trainingResult.improvements, 
            skillLearned 
        };
    }

    /**
     * Execute specific stat training
     */
    static async executeTrainSpecific(options = {}) {
        const character = gameState.adventurer;
        const stat = options.stat;
        const effectiveness = options.effectiveness || 1.5;
        
        if (!character.stats.hasOwnProperty(stat)) {
            throw new Error(`Invalid stat: ${stat}`);
        }

        const baseAmount = Helpers.Math.randomInt(20, 35);
        const improvement = character.trainStat(stat, baseAmount, effectiveness);
        
        // Record in game state
        gameState.recordTraining(stat, improvement, 'focused');

        // Higher chance for skill learning with focused training
        let skillLearned = null;
        if (Helpers.Math.percentChance(25)) {
            const availableSkills = character.checkSkillLearning();
            if (availableSkills.length > 0) {
                const learnedSkill = Helpers.Array.randomElement(availableSkills);
                if (character.learnSkill(learnedSkill)) {
                    skillLearned = SKILLS_DATA[learnedSkill]?.name || learnedSkill;
                    gameState.statistics.skillsLearned++;
                }
            }
        }

        let message = `${character.name} focused on ${Helpers.String.camelToTitle(stat)} training!\n`;
        message += `${Helpers.String.camelToTitle(stat)}: +${improvement}`;
        
        if (skillLearned) {
            message += `\n🎉 Also learned ${skillLearned}!`;
        }

        UIManager.showResults(message, 'success');

        return { 
            success: true, 
            stat, 
            improvement, 
            skillLearned 
        };
    }

    /**
     * Execute rest action
     */
    static async executeRest(options = {}) {
        const character = gameState.adventurer;
        const effectiveness = options.effectiveness || 1.0;
        const restType = options.restType || 'inn';
        
        // Calculate healing amounts
        const hpHeal = Math.floor(character.maxHP * 0.3 * effectiveness);
        const mpRestore = Math.floor(character.maxMP * 0.5 * effectiveness);
        
        // Apply healing
        const oldHP = character.currentHP;
        const oldMP = character.currentMP;
        
        character.currentHP = Math.min(character.maxHP, character.currentHP + hpHeal);
        character.currentMP = Math.min(character.maxMP, character.currentMP + mpRestore);
        
        // Clear some status effects
        if (character.statusEffects) {
            character.statusEffects = character.statusEffects.filter(effect => 
                effect.persistent || Helpers.Math.percentChance(30)
            );
        }

        const actualHpGain = character.currentHP - oldHP;
        const actualMpGain = character.currentMP - oldMP;

        let message = `${character.name} rested at the ${restType}.\n`;
        message += `Health restored: +${actualHpGain} (${character.currentHP}/${character.maxHP})\n`;
        message += `Mana restored: +${actualMpGain} (${character.currentMP}/${character.maxMP})`;

        if (character.statusEffects && character.statusEffects.length < (oldHP > 0 ? 1 : 0)) {
            message += `\nSome ailments were cured!`;
        }

        UIManager.showResults(message, 'success');

        return { 
            success: true, 
            hpRestored: actualHpGain, 
            mpRestored: actualMpGain,
            restType 
        };
    }

    /**
     * Execute buy equipment
     */
    static async executeBuyEquipment(options = {}) {
        const character = gameState.adventurer;
        
        // Select random equipment type
        const equipmentType = this.selectRandomEquipment();
        const equipmentStats = this.generateEquipmentStats(equipmentType);
        
        // Apply equipment (simplified - just stat bonuses for now)
        const statBonus = Helpers.Math.randomInt(5, 15);
        const randomStat = Helpers.Array.randomElement(Object.keys(character.stats));
        
        character.stats[randomStat] += statBonus;
        character.updateDerivedStats(randomStat, statBonus);

        let message = `${character.name} purchased new ${equipmentType}!\n`;
        message += `${Helpers.String.camelToTitle(randomStat)}: +${statBonus}`;

        UIManager.showResults(message, 'success');

        return { 
            success: true, 
            equipmentType, 
            statBonus: { [randomStat]: statBonus }
        };
    }

    /**
     * Execute dungeon exploration (general)
     */
    static async executeExploreDungeon(options = {}) {
        // Show dungeon selection instead of random
        this.showDungeonSelection();
        return { success: true, action: 'selection_shown' };
    }

    /**
     * Execute specific dungeon exploration
     */
    static async executeExploreSpecificDungeon(options = {}) {
        const character = gameState.adventurer;
        const dungeonId = options.dungeonId;
        
        if (!DUNGEONS_DATA[dungeonId]) {
            throw new Error(`Unknown dungeon: ${dungeonId}`);
        }

        const dungeon = DUNGEONS_DATA[dungeonId];
        
        // Check if character is ready
        if (!character.isAlive()) {
            throw new Error('Character must be conscious to explore dungeons');
        }

        // Simulate dungeon exploration
        const result = await this.simulateSoloDungeonRun(character, dungeon);
        
        // Update game state based on results
        if (result.success) {
            gameState.completeDungeon(dungeonId, true, {
                damageDealt: result.damageDealt,
                damageTaken: result.damageTaken,
                enemiesKilled: result.enemiesKilled
            });
            
            // Add rewards
            gameState.addResource('gold', result.rewards.gold);
            gameState.addResource('materials', result.rewards.materials);
            
            // Give character experience
            if (character.gainExperience) {
                character.gainExperience(result.rewards.experience);
            }
        } else {
            gameState.completeDungeon(dungeonId, false);
        }

        // Show results
        this.showDungeonResults(result, dungeon);
        
        return result;
    }

    /**
     * Simulate solo dungeon run
     */
    static async simulateSoloDungeonRun(character, dungeon) {
        const combatRating = character.getCombatRating ? character.getCombatRating() : 100;
        const dungeonDifficulty = dungeon.recommendedLevel * 50;
        
        // Calculate success chance based on character strength vs dungeon difficulty
        const strengthRatio = combatRating / dungeonDifficulty;
        const baseSuccessChance = Math.min(95, Math.max(5, strengthRatio * 60));
        
        // Add randomness
        const randomFactor = Helpers.Math.randomFloat(0.8, 1.2);
        const finalSuccessChance = Math.min(95, baseSuccessChance * randomFactor);
        
        const success = Helpers.Math.percentChance(finalSuccessChance);
        
        // Calculate combat results
        const enemiesKilled = success ? Helpers.Math.randomInt(3, 8) : Helpers.Math.randomInt(1, 3);
        const damageDealt = enemiesKilled * Helpers.Math.randomInt(20, 50);
        const damageTaken = Helpers.Math.randomInt(10, 30) * (success ? 0.7 : 1.5);
        
        // Apply damage to character
        character.currentHP = Math.max(0, character.currentHP - Math.floor(damageTaken));
        
        // Calculate rewards (only if successful)
        const rewards = success ? {
            gold: Math.floor((dungeon.baseRewards?.gold || 50) * strengthRatio * Helpers.Math.randomFloat(0.8, 1.2)),
            materials: Math.floor((dungeon.baseRewards?.materials || 10) * Helpers.Math.randomFloat(0.5, 1.5)),
            experience: Math.floor(dungeon.recommendedLevel * 25 * strengthRatio)
        } : {
            gold: Math.floor((dungeon.baseRewards?.gold || 50) * 0.2),
            materials: 0,
            experience: Math.floor(dungeon.recommendedLevel * 5)
        };

        return {
            success,
            dungeonName: dungeon.name,
            strengthRatio,
            successChance: finalSuccessChance,
            enemiesKilled,
            damageDealt,
            damageTaken: Math.floor(damageTaken),
            rewards,
            characterStatus: character.isAlive() ? 'survived' : 'defeated'
        };
    }

    /**
     * Show dungeon exploration results
     */
    static showDungeonResults(result, dungeon) {
        const character = gameState.adventurer;
        
        let resultContent = `
            <div class="dungeon-results">
                <h3>${result.success ? '🎉 Victory!' : '💀 Defeat...'}</h3>
                <h4>${character.name} explored ${result.dungeonName}</h4>
                
                <div class="combat-summary">
                    <div class="result-section">
                        <h5>Combat Results</h5>
                        <div class="result-grid">
                            <div class="result-item">
                                <span>Enemies Defeated:</span>
                                <span>${result.enemiesKilled}</span>
                            </div>
                            <div class="result-item">
                                <span>Damage Dealt:</span>
                                <span>${result.damageDealt}</span>
                            </div>
                            <div class="result-item">
                                <span>Damage Taken:</span>
                                <span>${result.damageTaken}</span>
                            </div>
                            <div class="result-item">
                                <span>Character Status:</span>
                                <span class="${result.characterStatus === 'survived' ? 'success' : 'danger'}">${result.characterStatus}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h5>Rewards ${result.success ? 'Earned' : '(Partial)'}</h5>
                        <div class="result-grid">
                            <div class="result-item">
                                <span>💰 Gold:</span>
                                <span>+${result.rewards.gold}</span>
                            </div>
                            <div class="result-item">
                                <span>🔧 Materials:</span>
                                <span>+${result.rewards.materials}</span>
                            </div>
                            <div class="result-item">
                                <span>📊 Experience:</span>
                                <span>+${result.rewards.experience}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h5>Character Status</h5>
                        <div class="character-status-post">
                            <div class="health-display">
                                Health: ${character.currentHP}/${character.maxHP} 
                                (${Math.round((character.currentHP / character.maxHP) * 100)}%)
                            </div>
                            <div class="health-bar">
                                <div class="health-fill" style="width: ${(character.currentHP / character.maxHP) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${!result.success ? `
                    <div class="defeat-advice">
                        <h5>💡 Tips for Next Time</h5>
                        <p>Consider training your character more or trying an easier dungeon. 
                        Your combat rating (${Math.round(result.strengthRatio * 100)}% of recommended) 
                        needs improvement for this dungeon.</p>
                    </div>
                ` : ''}
            </div>
        `;

        UIManager.showResults(resultContent, result.success ? 'victory' : 'defeat');
    }

    /**
     * Helper Methods
     */

    /**
     * Get rest effectiveness based on rest type
     */
    static getRestEffectiveness(restType) {
        const effectiveness = {
            camp: 0.7,      // Basic camping
            inn: 1.0,       // Standard inn rest
            temple: 1.3,    // Divine healing
            guild_hall: 1.1 // Adventurer's guild
        };
        
        return effectiveness[restType] || 1.0;
    }

    /**
     * Select random equipment type
     */
    static selectRandomEquipment() {
        const equipment = ['weapon', 'armor', 'accessory', 'shield', 'boots', 'helmet'];
        return Helpers.Array.randomElement(equipment);
    }

    /**
     * Generate equipment stats based on type
     */
    static generateEquipmentStats(equipmentType) {
        const statBoosts = {
            weapon: ['might', 'agility'],
            armor: ['endurance', 'spirit'],
            accessory: ['mind', 'spirit'],
            shield: ['endurance'],
            boots: ['agility'],
            helmet: ['mind', 'endurance']
        };

        return {
            type: equipmentType,
            boosts: statBoosts[equipmentType] || ['might']
        };
    }

    /**
     * Trigger action event
     */
    static triggerActionEvent(eventType, data) {
        if (this.actionCallbacks[eventType]) {
            this.actionCallbacks[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Action callback error for ${eventType}:`, error);
                }
            });
        }

        // Dispatch DOM event
        const event = new CustomEvent(`action_${eventType}`, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Register action callback
     */
    static onActionEvent(eventType, callback) {
        if (!this.actionCallbacks[eventType]) {
            this.actionCallbacks[eventType] = [];
        }
        this.actionCallbacks[eventType].push(callback);
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.ActionManager = ActionManager;
    console.log('✅ Single Character ActionManager loaded successfully');
}