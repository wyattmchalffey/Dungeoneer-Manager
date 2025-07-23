/**
 * ===========================================
 * DUNGEON EXPLORATION UI
 * ===========================================
 * User interface for dungeon exploration system
 */

class DungeonUI {
    static currentExploration = null;
    static explorationModal = null;
    static autoExploreMode = false;
    static updateInterval = null;

    /**
     * Start dungeon exploration UI
     */
    static startExploration(dungeonType, party, difficulty = 1) {
        console.log(`🏰 Starting dungeon exploration: ${dungeonType}`);
        
        try {
            // Create exploration instance
            this.currentExploration = new DungeonExploration(party, dungeonType, difficulty);
            
            // Create and show exploration UI
            this.createExplorationUI();
            this.updateExplorationDisplay();
            
            // Start update loop
            this.startUpdateLoop();
            
            return true;
        } catch (error) {
            console.error('Failed to start dungeon exploration:', error);
            UIManager.showMessage(`Failed to start exploration: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Create the main exploration UI modal
     */
    static createExplorationUI() {
        // Close any existing exploration
        this.closeExploration();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay dungeon-exploration-modal';
        modal.innerHTML = `
            <div class="dungeon-exploration-dialog">
                <div class="dungeon-header">
                    <h2 id="dungeonTitle">🏰 Dungeon Exploration</h2>
                    <div class="dungeon-controls">
                        <button class="btn btn-small" onclick="DungeonUI.toggleAutoExplore()" id="autoExploreBtn">
                            🤖 Auto: OFF
                        </button>
                        <button class="modal-close" onclick="DungeonUI.confirmExit()">×</button>
                    </div>
                </div>
                
                <div class="dungeon-content">
                    <div class="dungeon-main">
                        <div class="current-room-panel">
                            <div class="room-header">
                                <h3 id="roomTitle">Current Room</h3>
                                <span id="roomIcon" class="room-icon">🚪</span>
                            </div>
                            <div id="roomDescription" class="room-description">
                                Loading room information...
                            </div>
                            <div id="roomActions" class="room-actions">
                                <!-- Action buttons will be populated here -->
                            </div>
                        </div>
                        
                        <div class="exploration-log-panel">
                            <h3>📜 Exploration Log</h3>
                            <div id="explorationLog" class="exploration-log">
                                <!-- Log entries will appear here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="dungeon-sidebar">
                        <div class="dungeon-map-panel">
                            <h3>🗺️ Map</h3>
                            <div id="dungeonMap" class="dungeon-map">
                                <!-- Map will be generated here -->
                            </div>
                        </div>
                        
                        <div class="party-status-panel">
                            <h3>👥 Party Status</h3>
                            <div id="partyStatus" class="party-status-compact">
                                <!-- Party status will be updated here -->
                            </div>
                        </div>
                        
                        <div class="progress-panel">
                            <h3>📊 Progress</h3>
                            <div id="explorationProgress" class="exploration-progress">
                                <!-- Progress info will be shown here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add custom styles for dungeon exploration
        this.injectDungeonCSS();

        document.body.appendChild(modal);
        this.explorationModal = modal;

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);

        // Prevent closing on backdrop click during exploration
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.confirmExit();
            }
        });
    }

    /**
     * Update the exploration display
     */
    static updateExplorationDisplay() {
        if (!this.currentExploration || !this.explorationModal) return;

        const roomState = this.currentExploration.getCurrentRoomState();
        if (!roomState) return;

        // Update room information
        this.updateRoomDisplay(roomState);
        
        // Update actions
        this.updateRoomActions(roomState);
        
        // Update map
        this.updateDungeonMap();
        
        // Update party status
        this.updatePartyStatus();
        
        // Update progress
        this.updateProgress();
        
        // Update title
        const dungeonName = DUNGEONS_DATA[this.currentExploration.dungeonType]?.name || 'Unknown Dungeon';
        document.getElementById('dungeonTitle').textContent = `🏰 ${dungeonName}`;
    }

    /**
     * Update room display
     */
    static updateRoomDisplay(roomState) {
        const roomTitleEl = document.getElementById('roomTitle');
        const roomIconEl = document.getElementById('roomIcon');
        const roomDescEl = document.getElementById('roomDescription');

        if (roomTitleEl) {
            const roomType = roomState.room.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            roomTitleEl.textContent = roomType;
        }

        if (roomIconEl) {
            roomIconEl.textContent = roomState.room.getRoomIcon();
        }

        if (roomDescEl) {
            let description = roomState.description;
            
            if (roomState.room.completed) {
                description += ' (Completed)';
            }
            
            roomDescEl.textContent = description;
        }
    }

    /**
     * Update room actions
     */
    static updateRoomActions(roomState) {
        const actionsEl = document.getElementById('roomActions');
        if (!actionsEl) return;

        actionsEl.innerHTML = '';

        // Group actions by type
        const roomActions = roomState.availableActions.filter(action => action.type !== 'move' && action.type !== 'retreat');
        const moveActions = roomState.availableActions.filter(action => action.type === 'move');
        const retreatActions = roomState.availableActions.filter(action => action.type === 'retreat');

        // Room-specific actions
        if (roomActions.length > 0) {
            const roomActionsDiv = document.createElement('div');
            roomActionsDiv.className = 'action-group';
            roomActionsDiv.innerHTML = '<h4>Room Actions</h4>';
            
            roomActions.forEach(action => {
                const button = this.createActionButton(action);
                roomActionsDiv.appendChild(button);
            });
            
            actionsEl.appendChild(roomActionsDiv);
        }

        // Movement actions
        if (moveActions.length > 0) {
            const moveActionsDiv = document.createElement('div');
            moveActionsDiv.className = 'action-group';
            moveActionsDiv.innerHTML = '<h4>Available Paths</h4>';
            
            moveActions.forEach(action => {
                const button = this.createActionButton(action);
                if (!action.discovered) {
                    button.classList.add('unknown-path');
                    button.title = 'Unexplored passage';
                }
                if (action.completed) {
                    button.classList.add('completed-path');
                }
                moveActionsDiv.appendChild(button);
            });
            
            actionsEl.appendChild(moveActionsDiv);
        }

        // Retreat action
        if (retreatActions.length > 0) {
            const retreatDiv = document.createElement('div');
            retreatDiv.className = 'action-group retreat-group';
            
            retreatActions.forEach(action => {
                const button = this.createActionButton(action);
                button.classList.add('btn-warning');
                retreatDiv.appendChild(button);
            });
            
            actionsEl.appendChild(retreatDiv);
        }

        // Disable all actions if in combat
        if (this.currentExploration.state === 'combat') {
            const allButtons = actionsEl.querySelectorAll('.btn');
            allButtons.forEach(btn => {
                btn.disabled = true;
                btn.title = 'Cannot act during combat';
            });
        }
    }

    /**
     * Create action button
     */
    static createActionButton(action) {
        const button = document.createElement('button');
        button.className = 'btn action-btn';
        button.innerHTML = `${action.icon} ${action.name}`;
        button.title = action.description;
        
        button.onclick = () => this.executeAction(action);
        
        return button;
    }

    /**
     * Execute a dungeon action
     */
    static async executeAction(action) {
        if (!this.currentExploration) return;

        try {
            // Disable UI during action
            this.setUIEnabled(false);
            
            // Show action feedback
            UIManager.showMessage(`${action.icon} ${action.name}...`, 'info', 1000);
            
            // Execute the action
            const result = await this.currentExploration.executeAction(action.type, action);
            
            // Handle action result
            this.handleActionResult(result);
            
            // Update display
            this.updateExplorationDisplay();
            
            // Check for auto-exploration
            if (this.autoExploreMode && this.currentExploration.state === 'exploring') {
                setTimeout(() => this.performAutoAction(), 1500);
            }
            
        } catch (error) {
            console.error('Action execution failed:', error);
            UIManager.showMessage(`Action failed: ${error.message}`, 'error');
        } finally {
            this.setUIEnabled(true);
        }
    }

    /**
     * Handle action result
     */
    static handleActionResult(result) {
        if (!result) return;

        // Show result message
        let message = '';
        let messageType = result.success ? 'success' : 'warning';

        switch (result.type) {
            case 'combat_victory':
                message = `⚔️ Victory! Defeated ${result.enemiesDefeated} enemies`;
                if (result.loot) {
                    message += ` and found loot!`;
                }
                break;
                
            case 'combat_defeat':
            case 'boss_defeat':
                message = `💀 Defeated by ${result.enemy || result.boss}`;
                messageType = 'error';
                this.handleExplorationEnd(false);
                return;
                
            case 'boss_victory':
                message = `🏆 BOSS DEFEATED! Dungeon completed!`;
                messageType = 'success';
                this.handleExplorationEnd(true);
                return;
                
            case 'treasure_found':
                message = `💰 Found treasure!`;
                break;
                
            case 'trap_disarmed':
                message = `🔧 Trap safely disarmed by ${result.disarmer}`;
                break;
                
            case 'trap_triggered':
                message = `💥 Trap triggered! ${result.damage} damage dealt`;
                messageType = 'warning';
                break;
                
            case 'puzzle_solved':
                message = `🧩 Puzzle solved! Gained rewards`;
                break;
                
            case 'puzzle_failed':
                message = `🧩 Failed to solve puzzle`;
                messageType = 'warning';
                break;
                
            case 'rest_completed':
                message = `🛏️ Party rested and recovered`;
                break;
                
            case 'retreat':
                message = `🏃 Successfully retreated from dungeon`;
                this.handleExplorationEnd(false, true);
                return;
                
            case 'movement':
                message = `🚶 Moved to ${result.newRoom} room`;
                messageType = 'info';
                break;
        }

        if (message) {
            UIManager.showMessage(message, messageType);
        }
    }

    /**
     * Update dungeon map
     */
    static updateDungeonMap() {
        const mapEl = document.getElementById('dungeonMap');
        if (!mapEl || !this.currentExploration) return;

        const roomMap = this.currentExploration.getRoomMap();
        const currentRoomId = this.currentExploration.dungeon.currentRoomId;
        
        // Simple text-based map
        let mapHTML = '<div class="map-grid">';
        
        // Find bounds
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        Object.keys(roomMap).forEach(key => {
            const [x, y] = key.split(',').map(Number);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        
        // Generate map grid
        for (let y = maxY; y >= minY; y--) {
            mapHTML += '<div class="map-row">';
            for (let x = minX; x <= maxX; x++) {
                const key = `${x},${y}`;
                const room = roomMap[key];
                
                if (room) {
                    const classes = ['map-room'];
                    if (room.current) classes.push('current-room');
                    if (room.completed) classes.push('completed-room');
                    
                    mapHTML += `
                        <div class="${classes.join(' ')}" title="${room.type}">
                            ${room.icon}
                        </div>
                    `;
                } else {
                    mapHTML += '<div class="map-empty">⬜</div>';
                }
            }
            mapHTML += '</div>';
        }
        
        mapHTML += '</div>';
        mapEl.innerHTML = mapHTML;
    }

    /**
     * Update party status
     */
    static updatePartyStatus() {
        const statusEl = document.getElementById('partyStatus');
        if (!statusEl || !this.currentExploration) return;

        const party = this.currentExploration.party;
        
        statusEl.innerHTML = party.map(char => {
            const hpPercent = char.getHealthPercentage ? char.getHealthPercentage() : 100;
            const mpPercent = char.getManaPercentage ? char.getManaPercentage() : 100;
            const isAlive = char.isAlive();
            
            return `
                <div class="party-member-compact ${!isAlive ? 'unconscious' : ''}">
                    <div class="member-name">${char.name}</div>
                    <div class="member-bars">
                        <div class="hp-bar-small">
                            <div class="hp-fill-small" style="width: ${hpPercent}%"></div>
                            <span class="bar-text">${char.currentHP}/${char.maxHP}</span>
                        </div>
                        <div class="mp-bar-small">
                            <div class="mp-fill-small" style="width: ${mpPercent}%"></div>
                            <span class="bar-text">${char.currentMP}/${char.maxMP}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update exploration progress
     */
    static updateProgress() {
        const progressEl = document.getElementById('explorationProgress');
        if (!progressEl || !this.currentExploration) return;

        const progress = this.currentExploration.dungeon.getProgress();
        const summary = this.currentExploration.getExplorationSummary();
        
        progressEl.innerHTML = `
            <div class="progress-item">
                <span>Rooms Visited:</span>
                <span>${progress.roomsVisited}/${progress.totalRooms}</span>
            </div>
            <div class="progress-item">
                <span>Rooms Completed:</span>
                <span>${progress.roomsCompleted}/${progress.totalRooms}</span>
            </div>
            <div class="progress-item">
                <span>Enemies Defeated:</span>
                <span>${summary.enemiesDefeated}</span>
            </div>
            <div class="progress-item">
                <span>Gold Found:</span>
                <span>${summary.totalLoot.gold || 0}</span>
            </div>
            <div class="progress-item">
                <span>Materials Found:</span>
                <span>${summary.totalLoot.materials || 0}</span>
            </div>
            <div class="progress-item">
                <span>Time Elapsed:</span>
                <span>${summary.duration}m</span>
            </div>
        `;
    }

    /**
     * Toggle auto-explore mode
     */
    static toggleAutoExplore() {
        this.autoExploreMode = !this.autoExploreMode;
        
        const btn = document.getElementById('autoExploreBtn');
        if (btn) {
            btn.textContent = `🤖 Auto: ${this.autoExploreMode ? 'ON' : 'OFF'}`;
            btn.classList.toggle('btn-success', this.autoExploreMode);
        }
        
        if (this.currentExploration) {
            this.currentExploration.autoExplore = this.autoExploreMode;
        }
        
        if (this.autoExploreMode && this.currentExploration?.state === 'exploring') {
            setTimeout(() => this.performAutoAction(), 1000);
        }
        
        UIManager.showMessage(`Auto-exploration ${this.autoExploreMode ? 'enabled' : 'disabled'}`, 'info');
    }

    /**
     * Perform automatic action
     */
    static performAutoAction() {
        if (!this.autoExploreMode || !this.currentExploration || this.currentExploration.state !== 'exploring') {
            return;
        }
        
        const roomState = this.currentExploration.getCurrentRoomState();
        if (!roomState) return;
        
        // Check if party should retreat due to low health
        if (this.currentExploration.shouldAutoRetreat()) {
            const retreatAction = roomState.availableActions.find(action => action.type === 'retreat');
            if (retreatAction) {
                this.executeAction(retreatAction);
                return;
            }
        }
        
        // Priority: room actions > movement > retreat
        let actionToTake = null;
        
        // Try room actions first
        const roomActions = roomState.availableActions.filter(action => 
            action.type !== 'move' && action.type !== 'retreat'
        );
        
        if (roomActions.length > 0) {
            // Prioritize safe actions over dangerous ones
            const safeActions = roomActions.filter(action => 
                !['trigger_trap', 'fight_boss'].includes(action.type)
            );
            actionToTake = safeActions[0] || roomActions[0];
        } else {
            // Try movement actions
            const moveActions = roomState.availableActions.filter(action => action.type === 'move');
            if (moveActions.length > 0) {
                // Prefer unexplored rooms
                const unexplored = moveActions.filter(action => !action.discovered);
                const incomplete = moveActions.filter(action => !action.completed);
                
                actionToTake = unexplored[0] || incomplete[0] || moveActions[0];
            }
        }
        
        if (actionToTake) {
            this.executeAction(actionToTake);
        }
    }

    /**
     * Handle exploration end
     */
    static handleExplorationEnd(victory, retreated = false) {
        if (!this.currentExploration) return;
        
        const summary = this.currentExploration.getExplorationSummary();
        const dungeonName = DUNGEONS_DATA[this.currentExploration.dungeonType]?.name || 'Unknown Dungeon';
        
        let resultMessage = '';
        let resultType = 'info';
        
        if (victory) {
            resultMessage = `🏆 ${dungeonName} completed successfully!`;
            resultType = 'victory';
            
            // Mark dungeon as completed in game state
            gameState.completeDungeon(this.currentExploration.dungeonType, 1, true);
        } else if (retreated) {
            resultMessage = `🏃 Retreated from ${dungeonName} with partial progress.`;
            resultType = 'warning';
        } else {
            resultMessage = `💀 Defeated in ${dungeonName}.`;
            resultType = 'defeat';
        }
        
        // Add loot summary
        if (summary.totalLoot.gold > 0 || summary.totalLoot.materials > 0) {
            resultMessage += ` Gained: ${summary.totalLoot.gold || 0} gold, ${summary.totalLoot.materials || 0} materials.`;
        }
        
        // Show results and close exploration
        setTimeout(() => {
            this.closeExploration();
            
            if (typeof UIManager !== 'undefined') {
                UIManager.showResults(resultMessage, resultType);
            }
            
            // Update main UI
            if (typeof UIManager !== 'undefined') {
                UIManager.updateResourceDisplay();
                UIManager.renderPartyDisplay();
            }
        }, 2000);
    }

    /**
     * Confirm exit exploration
     */
    static confirmExit() {
        if (!this.currentExploration) {
            this.closeExploration();
            return;
        }
        
        const progress = this.currentExploration.dungeon.getProgress();
        
        if (progress.roomsCompleted === 0) {
            // No progress made, safe to exit
            this.closeExploration();
            return;
        }
        
        const message = `Are you sure you want to exit? You'll keep any loot found but lose dungeon progress.`;
        
        if (confirm(message)) {
            // Apply any loot gained so far
            const summary = this.currentExploration.getExplorationSummary();
            if (summary.totalLoot.gold > 0 || summary.totalLoot.materials > 0) {
                Object.entries(summary.totalLoot).forEach(([resource, amount]) => {
                    if (typeof amount === 'number' && gameState.resources.hasOwnProperty(resource)) {
                        gameState.addResource(resource, amount);
                    }
                });
            }
            
            this.closeExploration();
            UIManager.showMessage('Exploration cancelled. Kept any loot found.', 'info');
        }
    }

    /**
     * Close exploration UI
     */
    static closeExploration() {
        // Stop update loop
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Close modal
        if (this.explorationModal) {
            this.explorationModal.classList.remove('show');
            setTimeout(() => {
                if (this.explorationModal && this.explorationModal.parentNode) {
                    this.explorationModal.parentNode.removeChild(this.explorationModal);
                }
                this.explorationModal = null;
            }, 300);
        }
        
        // Clean up exploration
        this.currentExploration = null;
        this.autoExploreMode = false;
        
        // Show main game UI
        if (typeof UIManager !== 'undefined') {
            UIManager.showSection('actionsSection');
        }
    }

    /**
     * Set UI enabled/disabled state
     */
    static setUIEnabled(enabled) {
        if (!this.explorationModal) return;
        
        const buttons = this.explorationModal.querySelectorAll('button:not(.modal-close)');
        buttons.forEach(btn => {
            btn.disabled = !enabled;
        });
        
        if (!enabled) {
            this.explorationModal.style.pointerEvents = 'none';
        } else {
            this.explorationModal.style.pointerEvents = '';
        }
    }

    /**
     * Start update loop
     */
    static startUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.currentExploration && this.explorationModal) {
                this.updateExplorationDisplay();
                
                // Check for exploration end conditions
                if (this.currentExploration.state === 'completed') {
                    this.handleExplorationEnd(true);
                } else if (this.currentExploration.state === 'retreated') {
                    this.handleExplorationEnd(false, true);
                }
            } else {
                this.closeExploration();
            }
        }, 1000);
    }

    /**
     * Inject CSS for dungeon exploration
     */
    static injectDungeonCSS() {
        if (document.getElementById('dungeon-exploration-styles')) return;
        
        const css = `
            .dungeon-exploration-modal {
                z-index: 10001;
            }
            
            .dungeon-exploration-dialog {
                width: 95vw;
                height: 90vh;
                max-width: 1400px;
                background: rgba(22, 33, 62, 0.98);
                border: 2px solid #3282b8;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .dungeon-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 2px solid #3282b8;
                background: rgba(0, 0, 0, 0.3);
            }
            
            .dungeon-header h2 {
                margin: 0;
                color: #bbe1fa;
            }
            
            .dungeon-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .dungeon-content {
                flex: 1;
                display: flex;
                gap: 15px;
                padding: 15px;
                overflow: hidden;
            }
            
            .dungeon-main {
                flex: 2;
                display: flex;
                flex-direction: column;
                gap: 15px;
                min-width: 0;
            }
            
            .current-room-panel {
                background: rgba(15, 52, 96, 0.8);
                border: 2px solid #3282b8;
                border-radius: 8px;
                padding: 15px;
                flex: 1;
            }
            
            .room-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .room-header h3 {
                margin: 0;
                color: #bbe1fa;
            }
            
            .room-icon {
                font-size: 24px;
            }
            
            .room-description {
                margin: 15px 0;
                font-style: italic;
                color: #ccc;
                line-height: 1.4;
            }
            
            .room-actions {
                margin-top: 20px;
            }
            
            .action-group {
                margin-bottom: 20px;
            }
            
            .action-group h4 {
                margin: 0 0 10px 0;
                color: #bbe1fa;
                font-size: 14px;
                border-bottom: 1px solid #3282b8;
                padding-bottom: 5px;
            }
            
            .action-btn {
                margin: 5px 5px 5px 0;
                min-width: 140px;
                font-size: 13px;
            }
            
            .unknown-path {
                border-style: dashed !important;
                opacity: 0.8;
            }
            
            .completed-path {
                opacity: 0.6;
                background: linear-gradient(135deg, #666, #555) !important;
            }
            
            .retreat-group {
                border-top: 1px solid #666;
                padding-top: 15px;
            }
            
            .exploration-log-panel {
                background: rgba(15, 52, 96, 0.8);
                border: 2px solid #3282b8;
                border-radius: 8px;
                padding: 15px;
                flex: 1;
                min-height: 200px;
            }
            
            .exploration-log-panel h3 {
                margin: 0 0 10px 0;
                color: #bbe1fa;
            }
            
            .exploration-log {
                height: calc(100% - 40px);
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #3282b8;
                border-radius: 4px;
                padding: 10px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #ccc;
                line-height: 1.3;
            }
            
            .dungeon-sidebar {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 15px;
                min-width: 300px;
            }
            
            .dungeon-map-panel,
            .party-status-panel,
            .progress-panel {
                background: rgba(15, 52, 96, 0.8);
                border: 2px solid #3282b8;
                border-radius: 8px;
                padding: 15px;
            }
            
            .dungeon-map-panel h3,
            .party-status-panel h3,
            .progress-panel h3 {
                margin: 0 0 10px 0;
                color: #bbe1fa;
                font-size: 14px;
            }
            
            .dungeon-map {
                display: flex;
                justify-content: center;
                padding: 10px;
            }
            
            .map-grid {
                display: inline-block;
                border: 1px solid #666;
                background: rgba(0, 0, 0, 0.3);
            }
            
            .map-row {
                display: flex;
            }
            
            .map-room,
            .map-empty {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #333;
                font-size: 14px;
            }
            
            .map-room {
                background: rgba(50, 130, 184, 0.3);
                cursor: help;
            }
            
            .current-room {
                background: rgba(255, 215, 0, 0.5) !important;
                border-color: #ffd700 !important;
                animation: pulse-map 2s infinite;
            }
            
            .completed-room {
                background: rgba(76, 175, 80, 0.3) !important;
            }
            
            @keyframes pulse-map {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .party-member-compact {
                margin-bottom: 10px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                border: 1px solid #3282b8;
            }
            
            .party-member-compact.unconscious {
                opacity: 0.6;
                border-color: #666;
            }
            
            .member-name {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 12px;
            }
            
            .member-bars {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .hp-bar-small,
            .mp-bar-small {
                height: 12px;
                background: #333;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
            }
            
            .hp-fill-small {
                height: 100%;
                background: linear-gradient(90deg, #ff6b6b, #51cf66);
                transition: width 0.3s ease;
            }
            
            .mp-fill-small {
                height: 100%;
                background: linear-gradient(90deg, #495057, #74c0fc);
                transition: width 0.3s ease;
            }
            
            .bar-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 10px;
                font-weight: bold;
                color: white;
                text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
            }
            
            .progress-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 4px 0;
                border-bottom: 1px solid rgba(50, 130, 184, 0.3);
                font-size: 12px;
            }
            
            .progress-item:last-child {
                border-bottom: none;
            }
            
            /* Mobile responsive */
            @media (max-width: 1200px) {
                .dungeon-content {
                    flex-direction: column;
                }
                
                .dungeon-sidebar {
                    flex-direction: row;
                    min-width: 0;
                }
                
                .dungeon-sidebar > div {
                    flex: 1;
                }
            }
            
            @media (max-width: 768px) {
                .dungeon-exploration-dialog {
                    width: 100vw;
                    height: 100vh;
                    max-width: none;
                    border-radius: 0;
                }
                
                .dungeon-sidebar {
                    flex-direction: column;
                }
                
                .action-btn {
                    min-width: 120px;
                    font-size: 12px;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'dungeon-exploration-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DungeonUI = DungeonUI;
    console.log('✅ Dungeon UI loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DungeonUI;
}