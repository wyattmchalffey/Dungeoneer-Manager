/**
 * ===========================================
 * DUNGEON EXPLORATION SYSTEM
 * ===========================================
 * Manages dungeon exploration state and room interactions
 */

class DungeonExploration {
    constructor(party, dungeonType, difficulty = 1) {
        this.party = party.filter(char => char.isAlive()); // Only bring alive characters
        this.dungeonType = dungeonType;
        this.difficulty = difficulty;
        
        // Generate the dungeon
        this.generator = new DungeonGenerator(dungeonType, difficulty);
        this.dungeon = this.generator.generateDungeon();
        
        // Exploration state
        this.state = 'exploring'; // exploring, combat, paused, completed, retreated
        this.currentAction = null;
        this.explorationLog = [];
        this.autoExplore = false;
        
        // Initialize exploration
        this.logMessage(`🏰 Entered ${DUNGEONS_DATA[dungeonType]?.name || dungeonType}`, 'info');
        this.logMessage(`Party: ${this.party.map(c => c.name).join(', ')}`, 'info');
    }
    
    /**
     * Get the current room and its status
     */
    getCurrentRoomState() {
        const room = this.dungeon.getCurrentRoom();
        if (!room) return null;
        
        return {
            room: room,
            description: room.getDescription(),
            canExplore: !room.completed,
            availableActions: this.getAvailableActions(room),
            connections: this.dungeon.getConnectedRooms(),
            canRetreat: this.dungeon.canRetreat()
        };
    }
    
    /**
     * Get available actions for the current room
     */
    getAvailableActions(room) {
        const actions = [];
        
        if (!room.completed) {
            switch (room.type) {
                case ROOM_TYPES.COMBAT:
                    actions.push({
                        type: 'fight',
                        name: 'Fight Enemies',
                        description: `Battle ${room.enemies?.length || 1} enemies`,
                        icon: '⚔️'
                    });
                    break;
                    
                case ROOM_TYPES.TREASURE:
                    actions.push({
                        type: 'open_treasure',
                        name: 'Open Treasure',
                        description: `Search ${room.chestType || 'chest'} for loot`,
                        icon: '💰'
                    });
                    break;
                    
                case ROOM_TYPES.TRAP:
                    actions.push({
                        type: 'examine_trap',
                        name: 'Examine Room',
                        description: 'Carefully examine the room for traps',
                        icon: '🔍'
                    });
                    if (room.trap && room.trap.detected && !room.trap.disarmed) {
                        actions.push({
                            type: 'disarm_trap',
                            name: 'Disarm Trap',
                            description: 'Attempt to safely disarm the trap',
                            icon: '🔧'
                        });
                        actions.push({
                            type: 'trigger_trap',
                            name: 'Trigger Trap',
                            description: 'Deliberately trigger the trap and endure damage',
                            icon: '💥'
                        });
                    }
                    break;
                    
                case ROOM_TYPES.PUZZLE:
                    actions.push({
                        type: 'solve_puzzle',
                        name: 'Solve Puzzle',
                        description: 'Attempt to solve the ancient puzzle',
                        icon: '🧩'
                    });
                    break;
                    
                case ROOM_TYPES.REST:
                    actions.push({
                        type: 'rest',
                        name: 'Rest Here',
                        description: 'Take time to rest and recover',
                        icon: '🛏️'
                    });
                    break;
                    
                case ROOM_TYPES.EVENT:
                    actions.push({
                        type: 'investigate_event',
                        name: 'Investigate',
                        description: 'Investigate the unusual occurrence',
                        icon: '✨'
                    });
                    break;
                    
                case ROOM_TYPES.BOSS:
                    actions.push({
                        type: 'fight_boss',
                        name: 'Fight Boss',
                        description: `Face ${room.boss?.name || 'the boss'} in combat`,
                        icon: '👹'
                    });
                    break;
            }
        }
        
        // Movement actions
        const connections = this.dungeon.getConnectedRooms();
        connections.forEach(connectedRoom => {
            actions.push({
                type: 'move',
                name: `Move to ${connectedRoom.type} room`,
                description: connectedRoom.discovered ? 
                    connectedRoom.getDescription() : 
                    'Explore the unknown passage',
                icon: connectedRoom.getRoomIcon(),
                roomId: connectedRoom.id,
                discovered: connectedRoom.discovered,
                completed: connectedRoom.completed
            });
        });
        
        // Retreat action
        if (this.dungeon.canRetreat()) {
            actions.push({
                type: 'retreat',
                name: 'Retreat from Dungeon',
                description: 'Leave the dungeon and keep current progress',
                icon: '🏃'
            });
        }
        
        return actions;
    }
    
    /**
     * Execute an action in the current room
     */
    async executeAction(actionType, options = {}) {
        const room = this.dungeon.getCurrentRoom();
        if (!room) {
            throw new Error('No current room found');
        }
        
        this.currentAction = actionType;
        
        try {
            switch (actionType) {
                case 'fight':
                    return await this.handleCombat(room);
                case 'fight_boss':
                    return await this.handleBossCombat(room);
                case 'open_treasure':
                    return this.handleTreasure(room);
                case 'examine_trap':
                    return this.handleTrapExamination(room);
                case 'disarm_trap':
                    return this.handleTrapDisarm(room);
                case 'trigger_trap':
                    return this.handleTrapTrigger(room);
                case 'solve_puzzle':
                    return this.handlePuzzle(room);
                case 'rest':
                    return this.handleRest(room);
                case 'investigate_event':
                    return this.handleEvent(room);
                case 'move':
                    return this.handleMovement(options.roomId);
                case 'retreat':
                    return this.handleRetreat();
                default:
                    throw new Error(`Unknown action: ${actionType}`);
            }
        } catch (error) {
            this.logMessage(`❌ Action failed: ${error.message}`, 'error');
            throw error;
        } finally {
            this.currentAction = null;
        }
    }
    
    /**
     * Handle combat encounters
     */
    async handleCombat(room) {
        if (!room.enemies || room.enemies.length === 0) {
            throw new Error('No enemies in combat room');
        }
        
        this.state = 'combat';
        this.logMessage(`⚔️ Combat begins against ${room.enemies.length} enemies!`, 'combat');
        
        let totalDefeated = 0;
        let totalDamageDealt = 0;
        
        // Fight each enemy (or group for higher difficulty)
        for (const enemy of room.enemies) {
            const combatResult = await this.startCombat(enemy);
            
            if (combatResult.victory) {
                totalDefeated++;
                totalDamageDealt += combatResult.damageDealt || 0;
                this.logMessage(`✅ Defeated ${enemy.name}`, 'combat');
            } else {
                this.logMessage(`💀 Party defeated by ${enemy.name}`, 'combat');
                return {
                    success: false,
                    type: 'combat_defeat',
                    enemy: enemy.name,
                    roomType: room.type
                };
            }
            
            // Check if party can continue
            const aliveParty = this.party.filter(char => char.isAlive());
            if (aliveParty.length === 0) {
                return {
                    success: false,
                    type: 'party_wipe',
                    roomType: room.type
                };
            }
        }
        
        // Victory - complete the room
        this.dungeon.completeRoom(room.id, { enemiesDefeated: totalDefeated });
        this.state = 'exploring';
        
        // Loot after combat
        const combatLoot = this.generateCombatLoot(room, totalDefeated);
        if (combatLoot && Object.keys(combatLoot).length > 0) {
            this.applyLoot(combatLoot);
            this.logMessage(`💰 Found: ${this.formatLoot(combatLoot)}`, 'loot');
        }
        
        return {
            success: true,
            type: 'combat_victory',
            enemiesDefeated: totalDefeated,
            loot: combatLoot,
            roomType: room.type
        };
    }
    
    /**
     * Handle boss combat
     */
    async handleBossCombat(room) {
        if (!room.boss) {
            throw new Error('No boss in boss room');
        }
        
        this.state = 'combat';
        this.logMessage(`👹 BOSS BATTLE: ${room.boss.name}!`, 'boss');
        
        const combatResult = await this.startCombat(room.boss);
        
        if (combatResult.victory) {
            this.dungeon.completeRoom(room.id, { enemiesDefeated: 1 });
            this.dungeon.bossDefeated = true;
            this.dungeon.completed = true;
            this.state = 'completed';
            
            // Boss loot is typically much better
            const bossLoot = this.generateBossLoot(room);
            this.applyLoot(bossLoot);
            
            this.logMessage(`🏆 BOSS DEFEATED! Dungeon completed!`, 'victory');
            this.logMessage(`💎 Boss loot: ${this.formatLoot(bossLoot)}`, 'loot');
            
            return {
                success: true,
                type: 'boss_victory',
                boss: room.boss.name,
                loot: bossLoot,
                dungeonCompleted: true
            };
        } else {
            this.logMessage(`💀 Defeated by ${room.boss.name}`, 'combat');
            return {
                success: false,
                type: 'boss_defeat',
                boss: room.boss.name
            };
        }
    }
    
    /**
     * Handle treasure room
     */
    handleTreasure(room) {
        if (!room.loot) {
            throw new Error('No loot in treasure room');
        }
        
        this.logMessage(`💰 Opening ${room.chestType || 'treasure chest'}...`, 'loot');
        
        // Check for trapped treasure
        let trapDamage = 0;
        if (Helpers.Math.percentChance(15)) {
            trapDamage = this.handleTreasureTrap();
        }
        
        this.applyLoot(room.loot);
        this.dungeon.completeRoom(room.id, { loot: room.loot });
        
        let message = `✨ Found: ${this.formatLoot(room.loot)}`;
        if (room.loot.special) {
            message += ` including ${room.loot.special}!`;
        }
        this.logMessage(message, 'loot');
        
        return {
            success: true,
            type: 'treasure_found',
            loot: room.loot,
            trapDamage: trapDamage,
            roomType: room.type
        };
    }
    
    /**
     * Handle trap examination
     */
    handleTrapExamination(room) {
        if (!room.trap) {
            this.logMessage('🔍 You find nothing dangerous here.', 'info');
            this.dungeon.completeRoom(room.id);
            return { success: true, type: 'no_trap_found' };
        }
        
        // Check for trap detection
        const rogues = this.party.filter(char => 
            char.archetype === 'Rogue' && char.isAlive()
        );
        
        let detected = false;
        let detector = null;
        
        if (rogues.length > 0) {
            detector = rogues.reduce((best, rogue) => 
                rogue.stats.agility > best.stats.agility ? rogue : best
            );
            
            const detectRoll = detector.stats.agility + Helpers.Math.randomInt(1, 20);
            detected = detectRoll >= room.trap.detectDC;
        } else {
            // Non-rogues have a small chance
            const bestAgility = Math.max(...this.party.map(c => c.stats.agility || 0));
            const detectRoll = bestAgility + Helpers.Math.randomInt(1, 20);
            detected = detectRoll >= (room.trap.detectDC + 10);
        }
        
        room.trap.detected = detected;
        
        if (detected) {
            this.logMessage(`🚨 ${detector?.name || 'Someone'} detected a ${room.trap.type}!`, 'warning');
            return {
                success: true,
                type: 'trap_detected',
                trapType: room.trap.type,
                detector: detector?.name
            };
        } else {
            // Failed detection triggers trap
            this.logMessage(`💥 You triggered a hidden ${room.trap.type}!`, 'damage');
            return this.handleTrapTrigger(room);
        }
    }
    
    /**
     * Handle trap disarming
     */
    handleTrapDisarm(room) {
        if (!room.trap || !room.trap.detected) {
            throw new Error('Cannot disarm undetected trap');
        }
        
        const rogues = this.party.filter(char => 
            char.archetype === 'Rogue' && char.isAlive()
        );
        
        if (rogues.length === 0) {
            this.logMessage('⚠️ No rogues available to disarm trap', 'warning');
            return this.handleTrapTrigger(room);
        }
        
        const disarmer = rogues.reduce((best, rogue) => 
            rogue.stats.agility > best.stats.agility ? rogue : best
        );
        
        const disarmRoll = disarmer.stats.agility + Helpers.Math.randomInt(1, 20);
        const success = disarmRoll >= room.trap.disarmDC;
        
        if (success) {
            room.trap.disarmed = true;
            this.dungeon.completeRoom(room.id);
            this.logMessage(`🔧 ${disarmer.name} successfully disarmed the trap!`, 'success');
            
            // Small loot reward for disarming
            const disarmLoot = { gold: 20 + room.depth * 10 };
            this.applyLoot(disarmLoot);
            
            return {
                success: true,
                type: 'trap_disarmed',
                disarmer: disarmer.name,
                loot: disarmLoot
            };
        } else {
            this.logMessage(`💥 ${disarmer.name} failed to disarm the trap!`, 'damage');
            return this.handleTrapTrigger(room);
        }
    }
    
    /**
     * Handle trap triggering
     */
    handleTrapTrigger(room) {
        if (!room.trap) {
            throw new Error('No trap to trigger');
        }
        
        room.trap.triggered = true;
        let totalDamage = 0;
        
        // Apply trap damage to party
        this.party.forEach(char => {
            if (char.isAlive() && Helpers.Math.percentChance(80)) {
                const damage = Math.floor(room.trap.damage * (0.7 + Math.random() * 0.6));
                char.takeDamage(damage, 'trap', 'environment');
                totalDamage += damage;
            }
        });
        
        this.dungeon.completeRoom(room.id);
        this.logMessage(`💥 Trap deals ${totalDamage} total damage to the party`, 'damage');
        
        return {
            success: true,
            type: 'trap_triggered',
            damage: totalDamage,
            trapType: room.trap.type
        };
    }
    
    /**
     * Handle puzzle solving
     */
    handlePuzzle(room) {
        if (!room.puzzle) {
            throw new Error('No puzzle in puzzle room');
        }
        
        // Calculate party intelligence for puzzle solving
        const totalMind = this.party
            .filter(char => char.isAlive())
            .reduce((sum, char) => sum + (char.stats.mind || 0), 0);
        
        const avgMind = totalMind / this.party.filter(char => char.isAlive()).length;
        const puzzleRoll = avgMind + Helpers.Math.randomInt(1, 20);
        
        const success = puzzleRoll >= room.puzzle.difficulty;
        room.puzzle.solved = success;
        
        if (success) {
            this.applyLoot(room.puzzle.reward);
            this.dungeon.completeRoom(room.id, { loot: room.puzzle.reward });
            
            this.logMessage(`🧩 Puzzle solved! Gained: ${this.formatLoot(room.puzzle.reward)}`, 'success');
            
            // Chance to learn skills from puzzle
            if (room.puzzle.reward.skillChance && Helpers.Math.percentChance(room.puzzle.reward.skillChance * 100)) {
                const learner = Helpers.Array.randomElement(this.party.filter(c => c.isAlive()));
                const availableSkills = learner.checkSkillLearning ? learner.checkSkillLearning() : [];
                if (availableSkills.length > 0) {
                    const skillId = Helpers.Array.randomElement(availableSkills);
                    if (learner.learnSkill(skillId)) {
                        const skillName = SKILLS_DATA[skillId]?.name || skillId;
                        this.logMessage(`📚 ${learner.name} learned ${skillName} from the puzzle!`, 'skill');
                    }
                }
            }
            
            return {
                success: true,
                type: 'puzzle_solved',
                reward: room.puzzle.reward,
                solver: 'party'
            };
        } else {
            this.logMessage(`🧩 Failed to solve the puzzle. Roll: ${puzzleRoll}, needed: ${room.puzzle.difficulty}`, 'info');
            this.dungeon.completeRoom(room.id);
            
            return {
                success: false,
                type: 'puzzle_failed',
                difficulty: room.puzzle.difficulty,
                roll: puzzleRoll
            };
        }
    }
    
    /**
     * Handle resting
     */
    handleRest(room) {
        if (!room.rest) {
            throw new Error('No rest area in rest room');
        }
        
        let totalHealing = 0;
        let effectsRemoved = 0;
        let manaRestored = 0;
        
        this.party.forEach(char => {
            if (char.isAlive()) {
                // Heal HP
                const healing = char.heal(Math.floor(char.maxHP * room.rest.healPercent));
                totalHealing += healing;
                
                // Restore MP
                if (room.rest.restoreMP) {
                    const mpRestore = char.restoreMana(Math.floor(char.maxMP * room.rest.healPercent));
                    manaRestored += mpRestore;
                }
                
                // Remove status effects
                if (room.rest.removeStatusEffects && char.statusEffects) {
                    const beforeCount = char.statusEffects.length;
                    char.statusEffects = char.statusEffects.filter(effect => 
                        !['poisoned', 'burning', 'fear', 'confused'].includes(effect.type)
                    );
                    effectsRemoved += beforeCount - char.statusEffects.length;
                }
                
                // Reduce skill cooldowns
                if (char.skillCooldowns) {
                    Object.keys(char.skillCooldowns).forEach(skillId => {
                        char.skillCooldowns[skillId] = Math.max(0, char.skillCooldowns[skillId] - 2);
                    });
                }
            }
        });
        
        this.dungeon.completeRoom(room.id);
        
        this.logMessage(`🛏️ Party rests and recovers: ${totalHealing} HP, ${manaRestored} MP restored`, 'heal');
        if (effectsRemoved > 0) {
            this.logMessage(`✨ Removed ${effectsRemoved} negative status effects`, 'heal');
        }
        
        return {
            success: true,
            type: 'rest_completed',
            healingDone: totalHealing,
            manaRestored: manaRestored,
            effectsRemoved: effectsRemoved
        };
    }
    
    /**
     * Handle special events
     */
    handleEvent(room) {
        if (!room.event) {
            throw new Error('No event in event room');
        }
        
        const event = room.event;
        event.triggered = true;
        
        let results = { effects: [] };
        
        // Apply event effects
        switch (event.effects.type) {
            case 'mana_restore':
                this.party.forEach(char => {
                    if (char.isAlive()) {
                        const restore = char.restoreMana(Math.floor(char.maxMP * event.effects.value));
                        results.effects.push(`${char.name} restored ${restore} MP`);
                    }
                });
                break;
                
            case 'stat_drain':
                this.party.forEach(char => {
                    if (char.isAlive() && char.stats[event.effects.stat]) {
                        char.stats[event.effects.stat] = Math.max(1, 
                            char.stats[event.effects.stat] - event.effects.value);
                        results.effects.push(`${char.name} lost ${event.effects.value} ${event.effects.stat}`);
                    }
                });
                break;
                
            case 'hp_drain':
                this.party.forEach(char => {
                    if (char.isAlive()) {
                        const damage = Math.floor(char.maxHP * event.effects.value);
                        char.takeDamage(damage, 'necrotic', 'event');
                        results.effects.push(`${char.name} lost ${damage} HP`);
                    }
                });
                break;
                
            case 'random_element_boost':
                this.party.forEach(char => {
                    if (char.isAlive()) {
                        const randomStat = Helpers.Array.randomElement(['might', 'agility', 'mind', 'spirit']);
                        char.stats[randomStat] = (char.stats[randomStat] || 0) + event.effects.value;
                        results.effects.push(`${char.name} gained ${event.effects.value} ${randomStat}`);
                    }
                });
                break;
        }
        
        this.dungeon.completeRoom(room.id);
        
        this.logMessage(`✨ ${event.description}`, 'event');
        results.effects.forEach(effect => {
            this.logMessage(`• ${effect}`, 'event');
        });
        
        return {
            success: true,
            type: 'event_triggered',
            eventType: event.type,
            effects: results.effects
        };
    }
    
    /**
     * Handle movement between rooms
     */
    handleMovement(targetRoomId) {
        if (!targetRoomId) {
            throw new Error('No target room specified');
        }
        
        const targetRoom = this.dungeon.getRoom(targetRoomId);
        if (!targetRoom) {
            throw new Error('Target room not found');
        }
        
        const success = this.dungeon.moveToRoom(targetRoomId);
        if (!success) {
            throw new Error('Cannot move to target room');
        }
        
        this.logMessage(`🚶 Moved to ${targetRoom.type} room`, 'move');
        
        return {
            success: true,
            type: 'movement',
            newRoom: targetRoom.type,
            roomId: targetRoomId,
            discovered: targetRoom.discovered
        };
    }
    
    /**
     * Handle retreat from dungeon
     */
    handleRetreat() {
        if (!this.dungeon.canRetreat()) {
            throw new Error('Cannot retreat from current location');
        }
        
        this.dungeon.retreat();
        this.state = 'retreated';
        
        this.logMessage(`🏃 Retreated from the dungeon`, 'info');
        
        return {
            success: true,
            type: 'retreat',
            progress: this.dungeon.getProgress(),
            lootKept: this.dungeon.totalLoot
        };
    }
    
    /**
     * Start a combat encounter
     */
    async startCombat(enemy) {
        return new Promise((resolve) => {
            // Set up combat completion callback
            const originalEndCombat = CombatManager.endCombat;
            CombatManager.endCombat = function(victory, reason) {
                // Call original end combat
                originalEndCombat.call(this, victory, reason);
                
                // Restore original method
                CombatManager.endCombat = originalEndCombat;
                
                // Get combat stats
                const combatStats = CombatManager.getCombatStats();
                
                // Resolve the combat
                resolve({ 
                    victory, 
                    reason,
                    damageDealt: combatStats?.totalDamageDealt || 0,
                    damageReceived: combatStats?.totalDamageReceived || 0
                });
            };
            
            // Start the combat
            if (!CombatManager.startCombat(enemy, this.dungeonType)) {
                resolve({ victory: false, reason: 'failed_to_start' });
            }
        });
    }
    
    /**
     * Generate loot after combat
     */
    generateCombatLoot(room, enemyCount) {
        const baseLoot = {
            gold: Helpers.Math.randomInt(5, 15) * enemyCount,
            materials: Helpers.Math.randomInt(1, 3) * enemyCount
        };
        
        // Apply depth and dungeon scaling
        const depthMultiplier = 1 + (room.depth * 0.15);
        const dungeonMultiplier = room.getDungeonLootMultiplier();
        
        Object.keys(baseLoot).forEach(resource => {
            baseLoot[resource] = Math.floor(baseLoot[resource] * depthMultiplier * dungeonMultiplier);
        });
        
        return baseLoot;
    }
    
    /**
     * Generate special boss loot
     */
    generateBossLoot(room) {
        const dungeonData = DUNGEONS_DATA[this.dungeonType];
        const baseLoot = {
            gold: Helpers.Math.randomInt(...dungeonData.goldReward) * 2,
            materials: Helpers.Math.randomInt(...dungeonData.materialReward) * 2
        };
        
        // Boss-specific bonuses
        if (dungeonData.completionRewards?.firstTime) {
            Object.entries(dungeonData.completionRewards.firstTime).forEach(([reward, value]) => {
                if (typeof value === 'number') {
                    baseLoot[reward] = (baseLoot[reward] || 0) + value;
                }
            });
        }
        
        return baseLoot;
    }
    
    /**
     * Handle treasure trap damage
     */
    handleTreasureTrap() {
        const trapDamage = Helpers.Math.randomInt(10, 25);
        let totalDamage = 0;
        
        this.party.forEach(char => {
            if (char.isAlive() && Helpers.Math.percentChance(60)) {
                const damage = Math.floor(trapDamage * (0.5 + Math.random() * 0.5));
                char.takeDamage(damage, 'trap', 'treasure');
                totalDamage += damage;
            }
        });
        
        this.logMessage(`💥 Trapped treasure! Party takes ${totalDamage} damage`, 'damage');
        return totalDamage;
    }
    
    /**
     * Apply loot to game state
     */
    applyLoot(loot) {
        if (!loot) return;
        
        Object.entries(loot).forEach(([resource, amount]) => {
            if (typeof amount === 'number' && gameState.resources.hasOwnProperty(resource)) {
                gameState.addResource(resource, amount);
            }
        });
    }
    
    /**
     * Format loot for display
     */
    formatLoot(loot) {
        if (!loot) return 'nothing';
        
        return Object.entries(loot)
            .filter(([resource, amount]) => typeof amount === 'number' && amount > 0)
            .map(([resource, amount]) => `${amount} ${resource}`)
            .join(', ') || 'nothing';
    }
    
    /**
     * Log exploration message
     */
    logMessage(message, type = 'info') {
        const logEntry = {
            message,
            type,
            timestamp: Date.now(),
            room: this.dungeon.getCurrentRoom()?.type || 'unknown'
        };
        
        this.explorationLog.push(logEntry);
        
        // Also log to combat log if available
        if (typeof UIManager !== 'undefined') {
            const cssClass = this.getLogCSSClass(type);
            UIManager.updateCombatLog(message, cssClass);
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * Get CSS class for log type
     */
    getLogCSSClass(type) {
        const classes = {
            combat: 'log-damage',
            damage: 'log-damage',
            heal: 'log-heal',
            loot: 'log-skill',
            success: 'log-heal',
            victory: 'log-heal',
            boss: 'log-death',
            warning: 'log-damage',
            error: 'log-death',
            skill: 'log-skill',
            event: 'log-skill',
            move: '',
            info: ''
        };
        
        return classes[type] || '';
    }
    
    /**
     * Get exploration summary
     */
    getExplorationSummary() {
        const progress = this.dungeon.getProgress();
        const duration = this.dungeon.getDurationMinutes();
        
        return {
            dungeonType: this.dungeonType,
            state: this.state,
            progress: progress,
            duration: duration,
            totalLoot: this.dungeon.totalLoot,
            enemiesDefeated: this.dungeon.enemiesDefeated,
            partyStatus: this.party.map(char => ({
                name: char.name,
                alive: char.isAlive(),
                hp: char.currentHP,
                maxHP: char.maxHP,
                hpPercent: char.getHealthPercentage ? char.getHealthPercentage() : 0
            })),
            currentRoom: this.dungeon.getCurrentRoom()?.type || 'none',
            explorationLog: this.explorationLog.slice(-20) // Last 20 entries
        };
    }
    
    /**
     * Check if exploration should auto-retreat
     */
    shouldAutoRetreat() {
        if (!this.autoExplore) return false;
        
        const aliveParty = this.party.filter(char => char.isAlive());
        if (aliveParty.length === 0) return true;
        
        const avgHealth = aliveParty.reduce((sum, char) => 
            sum + (char.getHealthPercentage ? char.getHealthPercentage() : 0), 0) / aliveParty.length;
        
        return avgHealth < 25 && this.dungeon.canRetreat();
    }
    
    /**
     * Get room map for display
     */
    getRoomMap() {
        return this.dungeon.getRoomMap();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DungeonExploration = DungeonExploration;
    console.log('✅ Dungeon Exploration loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DungeonExploration;
}