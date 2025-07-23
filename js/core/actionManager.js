/**
 * ===========================================
 * ACTION MANAGER
 * ===========================================
 * Handles all player actions like training, dungeon exploration, equipment, etc.
 */

class ActionManager {
    static instance = null;
    static isProcessingAction = false;
    static actionHistory = [];
    static actionCallbacks = {};

    constructor() {
        if (ActionManager.instance) {
            return ActionManager.instance;
        }
        ActionManager.instance = this;
        
        this.actionCosts = this.initializeActionCosts();
    }

    /**
     * Initialize ActionManager
     */
    static initialize() {
        console.log('⚙️ Initializing Action Manager...');
        if (!this.instance) {
            this.instance = new ActionManager();
        }
        console.log('✅ Action Manager initialized');
        return true;
    }

    /**
     * Initialize action cost configurations
     */
    initializeActionCosts() {
        return {
            trainParty: {
                gold: 100,
                turns: 1,
                requiredPartySize: 1
            },
            trainIndividual: {
                gold: 50,
                turns: 1,
                requiredPartySize: 1
            },
            exploreDungeon: {
                turns: 1,
                requiredPartySize: 1,
                minimumHealth: 25 // Percentage
            },
            rest: {
                turns: 1,
                gold: 25 // Small cost for inn/supplies
            },
            buyEquipment: {
                gold: 200,
                materials: 10,
                turns: 1
            },
            buyConsumables: {
                gold: 50,
                turns: 0 // No turn cost
            },
            seekMentor: {
                gold: 300,
                reputation: 5,
                turns: 1
            },
            attemptDemonLord: {
                turns: 3,
                requiredPartySize: 4,
                minimumLevel: 20
            }
        };
    }

    /**
     * Validate action prerequisites
     */
    static validateAction(actionType, options = {}) {
        // Ensure we have an instance
        if (!this.instance) {
            this.instance = new ActionManager();
        }

        const costs = this.instance.actionCosts[actionType];
        if (!costs) {
            return { valid: false, reason: `Unknown action: ${actionType}` };
        }

        // Check if another action is in progress
        if (this.isProcessingAction) {
            return { valid: false, reason: 'Another action is already in progress' };
        }

        // Check if gameState exists
        if (typeof gameState === 'undefined' || !gameState) {
            return { valid: false, reason: 'Game state not available' };
        }

        // Debug logging
        console.log(`Validating action: ${actionType}`);
        console.log('Action costs:', costs);
        console.log('Current resources:', gameState.resources);

        // Check party requirements
        if (costs.requiredPartySize && (!gameState.party || gameState.party.length < costs.requiredPartySize)) {
            return { 
                valid: false, 
                reason: `Need at least ${costs.requiredPartySize} party members` 
            };
        }

        // Check for conscious party members
        const consciousMembers = gameState.party ? gameState.party.filter(char => char.isAlive && char.isAlive()) : [];
        if (costs.requiredPartySize && consciousMembers.length < costs.requiredPartySize) {
            return { 
                valid: false, 
                reason: 'Not enough conscious party members' 
            };
        }

        // Check minimum health requirement
        if (costs.minimumHealth && consciousMembers.length > 0) {
            const hasHealthyMembers = consciousMembers.some(char => 
                char.getHealthPercentage && char.getHealthPercentage() >= costs.minimumHealth
            );
            if (!hasHealthyMembers) {
                return { 
                    valid: false, 
                    reason: `Need at least one party member with ${costs.minimumHealth}% health` 
                };
            }
        }

        // Check resource costs - this is the likely problem area
        const resourceCosts = {};
        Object.entries(costs).forEach(([key, value]) => {
            if (typeof value === 'number' && gameState.resources.hasOwnProperty(key)) {
                resourceCosts[key] = value;
            }
        });

        console.log('Filtered resource costs:', resourceCosts);

        // Check if we can afford the resource costs
        if (!gameState.canAfford(resourceCosts)) {
            const missing = Object.entries(resourceCosts)
                .filter(([resource, amount]) => {
                    return (gameState.resources[resource] || 0) < amount;
                })
                .map(([resource, amount]) => 
                    `${amount} ${resource} (have ${gameState.resources[resource] || 0})`
                );
            
            console.log('Missing resources:', missing);
            
            return { 
                valid: false, 
                reason: missing.length > 0 ? `Insufficient resources: need ${missing.join(', ')}` : 'Cannot afford action'
            };
        }


        // Check turn availability
        if (costs.turns && gameState.turnsLeft < costs.turns) {
            return { 
                valid: false, 
                reason: `Not enough turns remaining (need ${costs.turns})` 
            };
        }

        // Check level requirements
        if (costs.minimumLevel && consciousMembers.length > 0) {
            const hasLeveledMember = consciousMembers.some(char => 
                char.level >= costs.minimumLevel
            );
            if (!hasLeveledMember) {
                return { 
                    valid: false, 
                    reason: `Need at least one party member at level ${costs.minimumLevel}` 
                };
            }
        }

        console.log(`Action ${actionType} validation passed`);
        return { valid: true };
    }

    /**
     * Execute action with validation and resource management
     */
    static async executeAction(actionType, options = {}) {
        // Special handling for exploreDungeon - it now requires a specific dungeon
        if (actionType === 'exploreDungeon' && !options.dungeonType) {
            throw new Error('Dungeon exploration requires specific dungeon selection');
        }

        // Validate prerequisites
        const validation = this.validateAction(actionType, options);
        if (!validation.valid) {
            if (typeof UIManager !== 'undefined') {
                UIManager.showMessage(validation.reason, 'error');
            }
            return false;
        }

        this.isProcessingAction = true;
        const startTime = Date.now();

        try {
            // Deduct costs
            const costs = this.instance.actionCosts[actionType];
            if (!gameState.spendResources(costs)) {
                throw new Error('Failed to spend resources');
            }

            if (costs.turns) {
                gameState.advanceTurn(costs.turns);
            }

            // Execute the specific action
            let result;
            switch (actionType) {
                case 'trainParty':
                    result = await this.executeTrainParty(options);
                    break;
                case 'trainIndividual':
                    result = await this.executeTrainIndividual(options);
                    break;
                case 'exploreDungeon':
                    result = await this.executeExploreDungeon(options);
                    break;
                case 'rest':
                    result = await this.executeRest(options);
                    break;
                case 'buyEquipment':
                    result = await this.executeBuyEquipment(options);
                    break;
                case 'buyConsumables':
                    result = await this.executeBuyConsumables(options);
                    break;
                case 'seekMentor':
                    result = await this.executeSeekMentor(options);
                    break;
                case 'attemptDemonLord':
                    result = await this.executeAttemptDemonLord(options);
                    break;
                default:
                    throw new Error(`Unhandled action type: ${actionType}`);
            }

            // Record action in history
            this.recordAction(actionType, options, result, Date.now() - startTime);

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
            
            if (typeof UIManager !== 'undefined') {
                UIManager.showMessage(`Action failed: ${error.message}`, 'error');
            }

            // Refund resources on failure
            const costs = this.instance.actionCosts[actionType];
            Object.entries(costs).forEach(([resource, amount]) => {
                if (typeof amount === 'number' && gameState.resources.hasOwnProperty(resource)) {
                    gameState.addResource(resource, amount);
                }
            });

            return false;

        } finally {
            this.isProcessingAction = false;
        }
    }

    /**
     * Train the entire party
     */
    static async executeTrainParty(options = {}) {
        const effectiveness = options.effectiveness || 1.0;
        const focusedTraining = options.focusedStat || null;
        
        const results = [];

        gameState.party.forEach(character => {
            const trainingResult = { 
                character: character.name, 
                improvements: {} 
            };

            if (focusedTraining) {
                // Focused training on specific stat
                const improvement = character.trainStat(
                    focusedTraining, 
                    Helpers.Math.randomInt(15, 25), 
                    effectiveness
                );
                trainingResult.improvements[focusedTraining] = improvement;
                
            } else {
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
                }
            }

            results.push(trainingResult);

            // Small chance for skill learning during training
            if (Helpers.Math.percentChance(15)) {
                const availableSkills = character.checkSkillLearning();
                if (availableSkills.length > 0) {
                    const learnedSkill = Helpers.Array.randomElement(availableSkills);
                    if (character.learnSkill(learnedSkill)) {
                        trainingResult.skillLearned = SKILLS_DATA[learnedSkill]?.name || learnedSkill;
                    }
                }
            }
        });

        // Show results
        const summary = this.summarizeTrainingResults(results);
        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(
                `Training completed! ${summary}`,
                'victory'
            );
        }

        return { success: true, results, summary };
    }

    /**
     * Train individual character
     */
    static async executeTrainIndividual(options = {}) {
        const characterIndex = options.characterIndex || 0;
        const character = gameState.party[characterIndex];
        
        if (!character) {
            throw new Error('Character not found');
        }

        const stat = options.stat || Helpers.Array.randomElement(Object.keys(character.stats));
        const baseAmount = options.amount || Helpers.Math.randomInt(20, 35);
        const effectiveness = options.effectiveness || 1.2; // Individual training is more effective
        
        const improvement = character.trainStat(stat, baseAmount, effectiveness);
        
        // Higher chance for skill learning with individual training
        let skillLearned = null;
        if (Helpers.Math.percentChance(25)) {
            const availableSkills = character.checkSkillLearning();
            if (availableSkills.length > 0) {
                const learnedSkill = Helpers.Array.randomElement(availableSkills);
                if (character.learnSkill(learnedSkill)) {
                    skillLearned = SKILLS_DATA[learnedSkill]?.name || learnedSkill;
                }
            }
        }

        let message = `${character.name} improved ${Helpers.String.camelToTitle(stat)} by ${improvement}!`;
        if (skillLearned) {
            message += ` Also learned ${skillLearned}!`;
        }

        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(message, 'victory');
        }

        return { 
            success: true, 
            character: character.name, 
            stat, 
            improvement, 
            skillLearned 
        };
    }

    /**
     * Show dungeon selection screen
     */
    static showDungeonSelection() {
        if (!gameState.party || gameState.party.length === 0) {
            UIManager.showMessage('Need a party to explore dungeons!', 'error');
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
     * Create dungeon selection content with stats and risk assessment
     */
    static createDungeonSelectionContent() {
        const partyRating = Helpers.Game.calculatePartyRating(gameState.party);
        
        let content = `
            <div class="dungeon-selection">
                <div class="party-info" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <h4>Current Party Status</h4>
                    <p><strong>Combat Rating:</strong> ${partyRating}</p>
                    <p><strong>Average Health:</strong> ${Math.round(gameState.party.reduce((sum, char) => sum + (char.getHealthPercentage ? char.getHealthPercentage() : 100), 0) / gameState.party.length)}%</p>
                    <p><strong>Conscious Members:</strong> ${gameState.party.filter(char => char.isAlive()).length}/4</p>
                </div>
                
                <div class="dungeons-grid" style="display: grid; gap: 15px;">
        `;

        Object.entries(DUNGEONS_DATA).forEach(([dungeonId, dungeonData]) => {
            const riskAssessment = this.calculateDungeonRisk(dungeonId, partyRating);
            const isUnlocked = gameState.unlockedDungeons.includes(dungeonId);
            const isDemonLord = dungeonId === 'demon_lords_dungeon';
            
            content += this.createDungeonCard(dungeonId, dungeonData, riskAssessment, isUnlocked, isDemonLord);
        });

        content += `
                </div>
                <div class="risk-legend" style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <h4>Risk Levels:</h4>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px;">
                        <span style="color: #51cf66;">🟢 <strong>Safe:</strong> 90%+ success chance</span>
                        <span style="color: #ffd43b;">🟡 <strong>Moderate:</strong> 60-89% success chance</span>
                        <span style="color: #ff922b;">🟠 <strong>Risky:</strong> 30-59% success chance</span>
                        <span style="color: #ff6b6b;">🔴 <strong>Dangerous:</strong> 10-29% success chance</span>
                        <span style="color: #9775fa;">💀 <strong>Suicidal:</strong> <10% success chance</span>
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    /**
     * Create individual dungeon card
     */
    static createDungeonCard(dungeonId, dungeonData, riskAssessment, isUnlocked, isDemonLord) {
        const riskColor = this.getRiskColor(riskAssessment.successChance);
        const riskIcon = this.getRiskIcon(riskAssessment.successChance);
        const canExplore = isUnlocked || riskAssessment.gamblingAllowed;
        
        let statusText = '';
        if (!isUnlocked && !isDemonLord) {
            statusText = '<span style="color: #ff6b6b;">🔒 LOCKED</span>';
        } else if (isDemonLord) {
            statusText = '<span style="color: #9775fa;">👹 FINAL BATTLE</span>';
        } else {
            statusText = '<span style="color: #51cf66;">✅ UNLOCKED</span>';
        }

        return `
            <div class="dungeon-card" style="
                border: 2px solid ${riskColor}; 
                border-radius: 8px; 
                padding: 15px; 
                background: rgba(0,0,0,0.4);
                ${!canExplore ? 'opacity: 0.6;' : 'cursor: pointer;'}
                transition: all 0.3s ease;
            " ${canExplore ? `onclick="ActionManager.selectDungeon('${dungeonId}')"` : ''}>
                
                <div class="dungeon-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0;">${dungeonData.name}</h3>
                    <div style="text-align: right;">
                        ${statusText}
                        <div style="color: ${riskColor}; font-weight: bold; margin-top: 5px;">
                            ${riskIcon} ${riskAssessment.riskLevel}
                        </div>
                    </div>
                </div>

                <p style="margin-bottom: 15px; font-style: italic; color: #ccc;">${dungeonData.description}</p>

                <div class="dungeon-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="difficulty-info">
                        <h4 style="margin-bottom: 8px; color: #bbe1fa;">Difficulty & Requirements</h4>
                        <p><strong>Difficulty:</strong> ${dungeonData.difficulty}/10</p>
                        <p><strong>Recommended Level:</strong> ${dungeonData.minLevel}-${dungeonData.maxLevel}</p>
                        <p><strong>Turn Cost:</strong> ${dungeonData.turnCost}</p>
                        <p><strong>Success Chance:</strong> <span style="color: ${riskColor};">${Math.round(riskAssessment.successChance)}%</span></p>
                    </div>

                    <div class="rewards-info">
                        <h4 style="margin-bottom: 8px; color: #bbe1fa;">Potential Rewards</h4>
                        <p><strong>Gold:</strong> ${dungeonData.goldReward[0]}-${dungeonData.goldReward[1]}</p>
                        <p><strong>Materials:</strong> ${dungeonData.materialReward[0]}-${dungeonData.materialReward[1]}</p>
                        <p><strong>Experience:</strong> ${Math.round(dungeonData.experienceMultiplier * 100)}</p>
                        ${dungeonData.completionRewards?.firstTime?.skillBook ? '<p><strong>Bonus:</strong> Skill Book!</p>' : ''}
                    </div>
                </div>

                ${riskAssessment.injuryRisk > 30 ? `
                    <div class="warning" style="margin-top: 15px; padding: 10px; background: rgba(255, 107, 107, 0.2); border-left: 4px solid #ff6b6b; border-radius: 4px;">
                        <strong>⚠️ Warning:</strong> ${Math.round(riskAssessment.injuryRisk)}% chance of serious injuries!
                        ${riskAssessment.deathRisk > 10 ? `<br><strong>💀 Death Risk:</strong> ${Math.round(riskAssessment.deathRisk)}% chance of party member death!` : ''}
                    </div>
                ` : ''}

                ${!isUnlocked && !isDemonLord ? `
                    <div class="unlock-condition" style="margin-top: 15px; padding: 10px; background: rgba(0, 0, 0, 0.5); border-radius: 4px;">
                        <small><strong>Unlock Condition:</strong> ${this.getUnlockDescription(dungeonId)}</small>
                    </div>
                ` : ''}

            </div>
        `;
    }

    /**
     * Calculate comprehensive dungeon risk assessment
     */
    static calculateDungeonRisk(dungeonId, partyRating) {
        const dungeonData = DUNGEONS_DATA[dungeonId];
        const baseRequiredRating = dungeonData.difficulty * 200; // Rough estimate
        const ratingRatio = partyRating / baseRequiredRating;
        
        // Calculate success chance
        let successChance = Math.min(95, Math.max(5, ratingRatio * 60 + 30));
        
        // Factor in party health
        const avgHealth = gameState.party.reduce((sum, char) => 
            sum + (char.getHealthPercentage ? char.getHealthPercentage() : 100), 0) / gameState.party.length;
        successChance *= (avgHealth / 100) * 0.8 + 0.2;
        
        // Factor in conscious members
        const consciousMembers = gameState.party.filter(char => char.isAlive()).length;
        successChance *= (consciousMembers / 4) * 0.7 + 0.3;
        
        // Calculate injury and death risks
        const injuryRisk = Math.max(0, 100 - successChance * 1.2);
        const deathRisk = Math.max(0, injuryRisk - 40);
        
        // Determine risk level
        let riskLevel;
        if (successChance >= 90) riskLevel = 'Safe';
        else if (successChance >= 60) riskLevel = 'Moderate';
        else if (successChance >= 30) riskLevel = 'Risky';
        else if (successChance >= 10) riskLevel = 'Dangerous';
        else riskLevel = 'Suicidal';
        
        return {
            successChance: Math.round(successChance),
            injuryRisk: Math.round(injuryRisk),
            deathRisk: Math.round(deathRisk),
            riskLevel,
            gamblingAllowed: dungeonId !== 'demon_lords_dungeon' // Can always gamble except final boss
        };
    }

    /**
     * Get risk color based on success chance
     */
    static getRiskColor(successChance) {
        if (successChance >= 90) return '#51cf66';
        if (successChance >= 60) return '#ffd43b';
        if (successChance >= 30) return '#ff922b';
        if (successChance >= 10) return '#ff6b6b';
        return '#9775fa';
    }

    /**
     * Get risk icon based on success chance
     */
    static getRiskIcon(successChance) {
        if (successChance >= 90) return '🟢';
        if (successChance >= 60) return '🟡';
        if (successChance >= 30) return '🟠';
        if (successChance >= 10) return '🔴';
        return '💀';
    }

    /**
     * Get unlock description for locked dungeons
     */
    static getUnlockDescription(dungeonId) {
        const descriptions = {
            crystal_caverns: 'Complete Training Grounds',
            ancient_library: 'Complete Crystal Caverns',
            shadow_fortress: 'Complete Ancient Library',
            elemental_planes: 'Complete Shadow Fortress'
        };
        return descriptions[dungeonId] || 'Complete previous dungeons';
    }

    /**
     * Handle dungeon selection
     */
    static selectDungeon(dungeonId) {
        const dungeonData = DUNGEONS_DATA[dungeonId];
        const isUnlocked = gameState.unlockedDungeons.includes(dungeonId);
        const partyRating = Helpers.Game.calculatePartyRating(gameState.party);
        const riskAssessment = this.calculateDungeonRisk(dungeonId, partyRating);
        
        // Close the selection modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
        
        // Show confirmation for risky dungeons
        if (!isUnlocked || riskAssessment.successChance < 60) {
            this.confirmRiskyDungeon(dungeonId, dungeonData, riskAssessment, isUnlocked);
        } else {
            // Safe dungeon, proceed directly
            this.executeDungeonExploration(dungeonId);
        }
    }

    /**
     * Confirm risky dungeon exploration
     */
    static confirmRiskyDungeon(dungeonId, dungeonData, riskAssessment, isUnlocked) {
        let warningMessage = `
            <div class="risk-confirmation">
                <h3 style="color: ${this.getRiskColor(riskAssessment.successChance)};">
                    ${this.getRiskIcon(riskAssessment.successChance)} ${dungeonData.name} - ${riskAssessment.riskLevel} Risk
                </h3>
        `;
        
        if (!isUnlocked) {
            warningMessage += `
                <div style="background: rgba(255, 107, 107, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>🔒 LOCKED DUNGEON</strong><br>
                    This dungeon is not unlocked yet. You can still attempt it, but at greatly increased risk!
                </div>
            `;
        }
        
        warningMessage += `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                    <div>
                        <h4>Estimated Outcome:</h4>
                        <p><strong>Success Chance:</strong> <span style="color: ${this.getRiskColor(riskAssessment.successChance)};">${riskAssessment.successChance}%</span></p>
                        <p><strong>Injury Risk:</strong> ${riskAssessment.injuryRisk}%</p>
                        ${riskAssessment.deathRisk > 0 ? `<p><strong>Death Risk:</strong> <span style="color: #ff6b6b;">${riskAssessment.deathRisk}%</span></p>` : ''}
                    </div>
                    <div>
                        <h4>Potential Rewards:</h4>
                        <p><strong>Gold:</strong> ${dungeonData.goldReward[0]}-${dungeonData.goldReward[1]}</p>
                        <p><strong>Materials:</strong> ${dungeonData.materialReward[0]}-${dungeonData.materialReward[1]}</p>
                        <p><strong>Experience:</strong> ${Math.round(dungeonData.experienceMultiplier * 100)}</p>
                    </div>
                </div>
                
                <p style="text-align: center; margin-top: 20px; font-weight: bold;">
                    Are you sure you want to risk your party in this ${riskAssessment.riskLevel.toLowerCase()} dungeon?
                </p>
            </div>
        `;
        
        const actions = `
            <button class="btn btn-danger" onclick="ActionManager.executeDungeonExploration('${dungeonId}'); this.closest('.modal-overlay').remove();">
                💀 Take the Risk!
            </button>
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove();">
                🛡️ Play it Safe
            </button>
        `;
        
        const confirmModal = UIManager.createModal('⚠️ Dangerous Expedition', warningMessage, actions);
        document.body.appendChild(confirmModal);
        setTimeout(() => confirmModal.classList.add('show'), 10);
    }

    /**
     * Execute the actual dungeon exploration (called from dungeon selection UI)
     */
    static async executeDungeonExploration(dungeonId) {
        // Validate basic requirements (not unlock status)
        const basicValidation = this.validateBasicExplorationRequirements();
        if (!basicValidation.valid) {
            UIManager.showMessage(basicValidation.reason, 'error');
            return false;
        }

        // Deduct costs manually since we're bypassing executeAction
        const costs = this.instance.actionCosts.exploreDungeon;
        if (!gameState.spendResources(costs)) {
            UIManager.showMessage('Cannot afford dungeon exploration', 'error');
            return false;
        }

        if (costs.turns) {
            gameState.advanceTurn(costs.turns);
        }

        try {
            const result = await this.executeExploreDungeon({ dungeonType: dungeonId });
            
            // Record action in history
            this.recordAction('exploreDungeon', { dungeonType: dungeonId }, result, 0);

            // Trigger callbacks
            this.triggerActionEvent('actionCompleted', { 
                action: 'exploreDungeon', 
                options: { dungeonType: dungeonId }, 
                result
            });

            return result;

        } catch (error) {
            console.error(`Dungeon exploration failed:`, error);
            UIManager.showMessage(`Exploration failed: ${error.message}`, 'error');

            // Refund resources on failure
            Object.entries(costs).forEach(([resource, amount]) => {
                if (typeof amount === 'number' && gameState.resources.hasOwnProperty(resource)) {
                    gameState.addResource(resource, amount);
                }
            });

            return false;
        }
    }

    /**
     * Validate basic exploration requirements (without unlock check)
     */
    static validateBasicExplorationRequirements() {
        if (!gameState.party || gameState.party.length === 0) {
            return { valid: false, reason: 'Need a party to explore dungeons' };
        }

        const consciousMembers = gameState.party.filter(char => char.isAlive && char.isAlive());
        if (consciousMembers.length === 0) {
            return { valid: false, reason: 'Need at least one conscious party member' };
        }

        const costs = this.instance.actionCosts.exploreDungeon;
        if (!gameState.canAfford(costs)) {
            return { valid: false, reason: 'Cannot afford exploration costs' };
        }

        if (costs.turns && gameState.turnsLeft < costs.turns) {
            return { valid: false, reason: 'Not enough turns remaining' };
        }

        return { valid: true };
    }

    /**
     * Execute dungeon exploration (called after dungeon selection)
     */
    static async executeExploreDungeon(options = {}) {
        const dungeonType = options.dungeonType;
        
        if (!dungeonType) {
            throw new Error('No dungeon specified for exploration');
        }
        
        const dungeonData = DUNGEONS_DATA[dungeonType];
        
        if (!dungeonData) {
            throw new Error(`Unknown dungeon: ${dungeonType}`);
        }

        // Pre-exploration preparations
        this.preparePartyForExploration();

        // Generate enemy for this exploration
        const enemy = this.generateDungeonEnemy(dungeonData, options);
        
        // Apply dungeon-specific modifiers
        const environmentalEffects = this.getDungeonEnvironmentalEffects(dungeonType);
        
        // Start combat encounter
        const combatOptions = {
            environmentalEffects,
            difficulty: dungeonData.difficulty
        };

        return new Promise((resolve) => {
            // Set up combat completion callback
            const originalEndCombat = CombatManager.endCombat;
            CombatManager.endCombat = function(victory, reason) {
                // Call original end combat
                originalEndCombat.call(this, victory, reason);
                
                // Restore original method
                CombatManager.endCombat = originalEndCombat;
                
                // Resolve the exploration
                resolve({
                    success: victory,
                    dungeon: dungeonType,
                    enemy: enemy.name,
                    reason
                });
            };

            // Start the combat
            if (!CombatManager.startCombat(enemy, dungeonType, combatOptions)) {
                resolve({ success: false, reason: 'Failed to start combat' });
            }
        });
    }

    /**
     * Rest and recover the party
     */
    static async executeRest(options = {}) {
        const restType = options.restType || 'inn'; // inn, camp, temple
        const effectiveness = this.getRestEffectiveness(restType);
        
        const results = [];

        gameState.party.forEach(character => {
            const restResult = character.rest(effectiveness);
            results.push({
                character: character.name,
                hpHealed: restResult.hpHealed,
                mpRestored: restResult.mpRestored,
                effectsCleared: restResult.effectsCleared
            });
        });

        const totalHPHealed = results.reduce((sum, r) => sum + r.hpHealed, 0);
        const totalMPRestored = results.reduce((sum, r) => sum + r.mpRestored, 0);

        let message = `Party rested at ${restType}. `;
        message += `Restored ${totalHPHealed} HP and ${totalMPRestored} MP total.`;

        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(message, 'victory');
        }

        return { success: true, restType, results, totalHPHealed, totalMPRestored };
    }

    /**
     * Buy equipment for the party
     */
    static async executeBuyEquipment(options = {}) {
        const equipmentType = options.equipmentType || this.selectRandomEquipment();
        const recipient = options.recipient || this.selectEquipmentRecipient();
        
        if (!recipient) {
            throw new Error('No suitable party member for equipment');
        }

        // Generate equipment stats based on current game progress
        const equipmentStats = this.generateEquipmentStats(equipmentType, gameState.currentSeason);
        
        // Apply equipment bonus
        const improvement = this.applyEquipmentImprovement(recipient, equipmentStats);
        
        let message = `${recipient.name} received new ${equipmentType}! `;
        message += Object.entries(improvement)
            .map(([stat, amount]) => `${Helpers.String.camelToTitle(stat)} +${amount}`)
            .join(', ');

        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(message, 'victory');
        }

        return { 
            success: true, 
            recipient: recipient.name, 
            equipmentType, 
            improvement 
        };
    }

    /**
     * Buy consumable items
     */
    static async executeBuyConsumables(options = {}) {
        const itemType = options.itemType || 'health_potion';
        const quantity = options.quantity || 3;
        
        // For now, just provide immediate benefits since we don't have inventory system
        const benefits = this.applyConsumableBenefits(itemType, quantity);
        
        let message = `Purchased ${quantity} ${itemType.replace('_', ' ')}s. `;
        message += benefits.description;

        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(message, 'victory');
        }

        return { success: true, itemType, quantity, benefits };
    }

    /**
     * Seek mentor for future runs
     */
    static async executeSeekMentor(options = {}) {
        // This would be expanded when mentor system is implemented
        const mentorType = options.mentorType || this.selectAvailableMentorType();
        
        // For now, provide immediate small bonus
        const selectedChar = options.character || Helpers.Array.randomElement(gameState.party);
        if (selectedChar) {
            selectedChar.mentorQualities.teaching += 5;
            selectedChar.mentorQualities.leadership += 3;
        }

        const message = `Found a ${mentorType} mentor. Future characters will benefit from this experience.`;
        
        if (typeof UIManager !== 'undefined') {
            UIManager.showResults(message, 'victory');
        }

        return { success: true, mentorType, character: selectedChar?.name };
    }

    /**
     * Attempt the final Demon Lord battle
     */
    static async executeAttemptDemonLord(options = {}) {
        // Validate party is ready for final battle
        const readinessCheck = this.validateDemonLordReadiness();
        if (!readinessCheck.ready) {
            throw new Error(readinessCheck.reason);
        }

        // Create the ultimate enemy
        const demonLord = this.createDemonLordEnemy();
        
        // Apply final battle environmental effects
        const environmentalEffects = [
            { type: 'hellfire_traps', chance: 40 },
            { type: 'soul_draining_aura', chance: 30 },
            { type: 'reality_corruption', chance: 20 }
        ];

        // Start the final combat
        return new Promise((resolve) => {
            const originalEndCombat = CombatManager.endCombat;
            CombatManager.endCombat = function(victory, reason) {
                originalEndCombat.call(this, victory, reason);
                CombatManager.endCombat = originalEndCombat;
                
                if (victory) {
                    // Handle ultimate victory
                    gameState.statistics.victoriesAgainstDemonLord++;
                    gameState.addAchievement('DEMON_SLAYER');
                }
                
                resolve({
                    success: victory,
                    ultimateVictory: victory,
                    reason
                });
            };

            if (!CombatManager.startCombat(demonLord, 'demon_lords_dungeon', { 
                environmentalEffects,
                difficulty: 10 
            })) {
                resolve({ success: false, reason: 'Failed to start final combat' });
            }
        });
    }

    /**
     * Helper Methods
     */

    /**
     * Prepare party for dungeon exploration
     */
    static preparePartyForExploration() {
        gameState.party.forEach(character => {
            // Reset any temporary states
            character.actionThisTurn = false;
            
            // Apply pre-exploration buffs based on character archetype
            if (character.archetype === 'Ranger' && character.hasStatusEffect) {
                // Rangers get nature bonus in dungeons
                character.addStatusEffect({
                    type: 'nature_awareness',
                    duration: -1, // Lasts entire exploration
                    source: 'exploration_prep'
                });
            }
        });
    }

    /**
     * Generate enemy for dungeon
     */
    static generateDungeonEnemy(dungeonData, options = {}) {
        const possibleEnemies = dungeonData.possibleEnemies || ['training_dummy'];
        const chosenEnemyType = options.enemyType || Helpers.Array.randomElement(possibleEnemies);
        
        let enemy = ENEMIES_DATA[chosenEnemyType];
        if (!enemy) {
            // Fallback to basic enemy
            enemy = {
                name: 'Unknown Creature',
                type: 'beast',
                hp: 80,
                maxHP: 80,
                attackPower: 20,
                defense: 5,
                speed: 5,
                abilities: [],
                resistances: [],
                weaknesses: [],
                difficulty: dungeonData.difficulty || 1
            };
        }

        // Scale enemy based on party strength and dungeon difficulty
        const scaledEnemy = this.scaleEnemyToDungeon(Helpers.Object.deepClone(enemy), dungeonData);
        return scaledEnemy;
    }

    /**
     * Scale enemy difficulty based on party and dungeon
     */
    static scaleEnemyToDungeon(enemy, dungeonData) {
        const partyRating = Helpers.Game.calculatePartyRating(gameState.party);
        const baseScaling = dungeonData.difficulty || 1;
        const dynamicScaling = Math.max(1, partyRating / 400); // Scale with party strength
        
        const totalScaling = baseScaling * dynamicScaling * 0.8; // Slight reduction for balance
        
        enemy.hp = Math.floor(enemy.hp * totalScaling);
        enemy.maxHP = enemy.hp;
        enemy.attackPower = Math.floor(enemy.attackPower * totalScaling);
        enemy.defense = Math.floor(enemy.defense * Math.sqrt(totalScaling));
        
        return enemy;
    }

    /**
     * Get environmental effects for dungeon type
     */
    static getDungeonEnvironmentalEffects(dungeonType) {
        const effects = {
            training_grounds: [],
            crystal_caverns: [
                { type: 'crystal_resonance', chance: 20 },
                { type: 'unstable_crystals', chance: 15 }
            ],
            ancient_library: [
                { type: 'knowledge_overload', chance: 25 },
                { type: 'cursed_tomes', chance: 20 }
            ],
            shadow_fortress: [
                { type: 'shadow_drain', chance: 30 },
                { type: 'fear_inducing_darkness', chance: 25 }
            ],
            elemental_planes: [
                { type: 'elemental_chaos', chance: 35 },
                { type: 'reality_fluctuation', chance: 20 }
            ]
        };
        
        return effects[dungeonType] || [];
    }

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
     * Select party member who would benefit most from equipment
     */
    static selectEquipmentRecipient() {
        if (gameState.party.length === 0) return null;
        
        // Prioritize alive members with lower combat ratings
        const candidates = gameState.party
            .filter(char => char.isAlive())
            .sort((a, b) => a.getCombatRating() - b.getCombatRating());
        
        return candidates[0] || gameState.party[0];
    }

    /**
     * Generate equipment stats based on game progress
     */
    static generateEquipmentStats(equipmentType, season) {
        const baseImprovement = Math.floor(season * 5) + 10;
        const stats = {};
        
        // Different equipment types focus on different stats
        switch (equipmentType) {
            case 'weapon':
                stats.might = Helpers.Math.randomInt(baseImprovement, baseImprovement * 2);
                if (Helpers.Math.percentChance(30)) {
                    stats.agility = Math.floor(baseImprovement * 0.5);
                }
                break;
                
            case 'armor':
                stats.endurance = Helpers.Math.randomInt(baseImprovement, baseImprovement * 1.8);
                if (Helpers.Math.percentChance(40)) {
                    stats.might = Math.floor(baseImprovement * 0.3);
                }
                break;
                
            case 'accessory':
                // Accessories can boost any stat
                const randomStat = Helpers.Array.randomElement(['might', 'agility', 'mind', 'spirit', 'endurance']);
                stats[randomStat] = Helpers.Math.randomInt(baseImprovement * 0.7, baseImprovement * 1.3);
                break;
                
            case 'shield':
                stats.endurance = Math.floor(baseImprovement * 1.2);
                stats.spirit = Math.floor(baseImprovement * 0.8);
                break;
                
            default:
                stats.endurance = Math.floor(baseImprovement * 0.8);
        }
        
        return stats;
    }

    /**
     * Apply equipment improvement to character
     */
    static applyEquipmentImprovement(character, equipmentStats) {
        const actualImprovement = {};
        
        Object.entries(equipmentStats).forEach(([stat, amount]) => {
            const improved = character.trainStat(stat, amount, 1.0);
            actualImprovement[stat] = improved;
        });
        
        return actualImprovement;
    }

    /**
     * Apply consumable item benefits
     */
    static applyConsumableBenefits(itemType, quantity) {
        const benefits = { description: '' };
        
        switch (itemType) {
            case 'health_potion':
                gameState.party.forEach(char => {
                    if (char.isAlive()) {
                        const healing = char.heal(30 * quantity);
                        benefits.totalHealing = (benefits.totalHealing || 0) + healing;
                    }
                });
                benefits.description = `Immediately healed ${benefits.totalHealing || 0} HP across the party`;
                break;
                
            case 'mana_potion':
                gameState.party.forEach(char => {
                    if (char.isAlive()) {
                        const restoration = char.restoreMana(40 * quantity);
                        benefits.totalManaRestored = (benefits.totalManaRestored || 0) + restoration;
                    }
                });
                benefits.description = `Immediately restored ${benefits.totalManaRestored || 0} MP across the party`;
                break;
                
            case 'stat_booster':
                gameState.party.forEach(char => {
                    const randomStat = Helpers.Array.randomElement(Object.keys(char.stats));
                    char.trainStat(randomStat, 5 * quantity, 1.0);
                });
                benefits.description = `Permanently increased random stats for all party members`;
                break;
                
            default:
                benefits.description = `Applied ${itemType} effects`;
        }
        
        return benefits;
    }

    /**
     * Select available mentor type
     */
    static selectAvailableMentorType() {
        const mentorTypes = ['veteran_warrior', 'wise_mage', 'holy_priest', 'master_thief', 'beast_tamer'];
        return Helpers.Array.randomElement(mentorTypes);
    }

    /**
     * Validate party readiness for Demon Lord
     */
    static validateDemonLordReadiness() {
        const party = gameState.party.filter(char => char.isAlive());
        
        if (party.length < 4) {
            return { ready: false, reason: 'Need a full party of 4 conscious members' };
        }
        
        const avgLevel = party.reduce((sum, char) => sum + char.level, 0) / party.length;
        if (avgLevel < 20) {
            return { ready: false, reason: 'Party average level must be at least 20' };
        }
        
        const totalCombatRating = Helpers.Game.calculatePartyRating(party);
        if (totalCombatRating < 2000) {
            return { ready: false, reason: 'Party combat rating too low for Demon Lord' };
        }
        
        const avgHealth = party.reduce((sum, char) => sum + char.getHealthPercentage(), 0) / party.length;
        if (avgHealth < 75) {
            return { ready: false, reason: 'Party should be healed before facing the Demon Lord' };
        }
        
        return { ready: true };
    }

    /**
     * Create the Demon Lord enemy
     */
    static createDemonLordEnemy() {
        const baseDemonLord = ENEMIES_DATA.demon_lord_malphas;
        if (!baseDemonLord) {
            // Fallback if enemy data not found
            return {
                name: 'Demon Lord Malphas',
                type: 'fiend_lord',
                hp: 800,
                maxHP: 800,
                attackPower: 80,
                defense: 30,
                speed: 10,
                abilities: ['hellfire', 'reality_rend', 'soul_steal'],
                resistances: ['fire', 'dark', 'physical'],
                weaknesses: ['holy'],
                difficulty: 10
            };
        }
        
        // Scale based on party strength for final challenge
        const partyRating = Helpers.Game.calculatePartyRating(gameState.party);
        const scaling = Math.max(1.0, partyRating / 1000);
        
        const demonLord = Helpers.Object.deepClone(baseDemonLord);
        demonLord.hp = Math.floor(demonLord.hp * scaling);
        demonLord.maxHP = demonLord.hp;
        demonLord.attackPower = Math.floor(demonLord.attackPower * scaling);
        
        return demonLord;
    }

    /**
     * Summarize training results for display
     */
    static summarizeTrainingResults(results) {
        const totalImprovements = {};
        const skillsLearned = [];
        
        results.forEach(result => {
            Object.entries(result.improvements).forEach(([stat, amount]) => {
                totalImprovements[stat] = (totalImprovements[stat] || 0) + amount;
            });
            
            if (result.skillLearned) {
                skillsLearned.push(result.skillLearned);
            }
        });
        
        let summary = 'Total improvements: ';
        summary += Object.entries(totalImprovements)
            .map(([stat, amount]) => `${Helpers.String.camelToTitle(stat)} +${amount}`)
            .join(', ');
            
        if (skillsLearned.length > 0) {
            summary += `. Skills learned: ${skillsLearned.join(', ')}`;
        }
        
        return summary;
    }

    /**
     * Record action in history for analysis
     */
    static recordAction(actionType, options, result, duration) {
        const record = {
            timestamp: Date.now(),
            action: actionType,
            options: { ...options },
            result: { ...result },
            duration,
            turn: gameState.maxTurns - gameState.turnsLeft,
            season: gameState.currentSeason
        };
        
        this.actionHistory.push(record);
        
        // Keep history manageable
        if (this.actionHistory.length > 200) {
            this.actionHistory = this.actionHistory.slice(-100);
        }
    }

    /**
     * Get action history for analysis
     */
    static getActionHistory(actionType = null, limit = 50) {
        let history = [...this.actionHistory];
        
        if (actionType) {
            history = history.filter(record => record.action === actionType);
        }
        
        return history.slice(-limit);
    }

    /**
     * Get action statistics
     */
    static getActionStatistics() {
        const stats = {
            totalActions: this.actionHistory.length,
            actionCounts: {},
            averageDuration: 0,
            successRate: 0
        };
        
        let totalDuration = 0;
        let successCount = 0;
        
        this.actionHistory.forEach(record => {
            stats.actionCounts[record.action] = (stats.actionCounts[record.action] || 0) + 1;
            totalDuration += record.duration;
            if (record.result.success) successCount++;
        });
        
        if (this.actionHistory.length > 0) {
            stats.averageDuration = totalDuration / this.actionHistory.length;
            stats.successRate = (successCount / this.actionHistory.length) * 100;
        }
        
        return stats;
    }

    /**
     * Register action event callback
     */
    static onActionEvent(event, callback) {
        if (!this.actionCallbacks) {
            this.actionCallbacks = {};
        }
        
        if (!this.actionCallbacks[event]) {
            this.actionCallbacks[event] = [];
        }
        
        this.actionCallbacks[event].push(callback);
    }

    /**
     * Trigger action event callbacks
     */
    static triggerActionEvent(event, data) {
        if (this.actionCallbacks && this.actionCallbacks[event]) {
            this.actionCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in action event callback for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get available actions for current game state
     */
    static getAvailableActions() {
        // Ensure we have an instance
        if (!this.instance) {
            this.instance = new ActionManager();
        }

        const actions = [];
        
        Object.keys(this.instance.actionCosts || {}).forEach(actionType => {
            const validation = this.validateAction(actionType);
            actions.push({
                type: actionType,
                available: validation.valid,
                reason: validation.reason || null,
                costs: this.instance.actionCosts[actionType]
            });
        });
        
        return actions;
    }

    // Convenient static methods for common actions
    static trainParty(options = {}) {
        return this.executeAction('trainParty', options);
    }

    static trainIndividual(characterIndex, stat = null) {
        return this.executeAction('trainIndividual', { characterIndex, stat });
    }

    static exploreDungeon(dungeonType = null) {
        if (dungeonType) {
            // Direct dungeon selection (for programmatic calls)
            return this.executeAction('exploreDungeon', { dungeonType });
        } else {
            // Show dungeon selection UI
            this.showDungeonSelection();
        }
    }

    static rest(restType = 'inn') {
        return this.executeAction('rest', { restType });
    }

    static buyEquipment(equipmentType = null, recipientIndex = null) {
        const options = {};
        if (equipmentType) options.equipmentType = equipmentType;
        if (recipientIndex !== null) options.recipient = gameState.party[recipientIndex];
        return this.executeAction('buyEquipment', options);
    }

    static buyConsumables(itemType = 'health_potion', quantity = 3) {
        return this.executeAction('buyConsumables', { itemType, quantity });
    }

    static seekMentor(mentorType = null) {
        return this.executeAction('seekMentor', { mentorType });
    }

    static attemptDemonLord() {
        return this.executeAction('attemptDemonLord');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ActionManager = ActionManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActionManager;
}