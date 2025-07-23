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
    static isClosing = false; // NEW: Prevent multiple close operations

    /**
     * Start dungeon exploration UI
     */
    static startExploration(dungeonType, party, difficulty = 1) {
        console.log(`🏰 Starting dungeon exploration: ${dungeonType}`);
        
        try {
            // Clean up any existing exploration first
            this.forceCleanup();
            
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
            this.forceCleanup(); // Clean up on error
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
        if (!this.currentExploration || !this.explorationModal || this.isClosing) return;

        try {
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
            const titleEl = document.getElementById('dungeonTitle');
            if (titleEl) {
                titleEl.textContent = `🏰 ${dungeonName}`;
            }
        } catch (error) {
            console.error('Error updating exploration display:', error);
        }
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

        if (!roomState.availableActions || roomState.availableActions.length === 0) {
            actionsEl.innerHTML = '<p>No actions available</p>';
            return;
        }

        // Group actions by type
        const roomActions = roomState.availableActions.filter(action => 
            action.type !== 'move' && action.type !== 'retreat'
        );
        const moveActions = roomState.availableActions.filter(action => action.type === 'move');
        const retreatActions = roomState.availableActions.filter(action => action.type === 'retreat');

        // Add room actions
        if (roomActions.length > 0) {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'action-group';
            roomDiv.innerHTML = '<h4>Room Actions</h4>';
            
            roomActions.forEach(action => {
                const button = this.createActionButton(action);
                roomDiv.appendChild(button);
            });
            
            actionsEl.appendChild(roomDiv);
        }

        // Add movement actions
        if (moveActions.length > 0) {
            const moveDiv = document.createElement('div');
            moveDiv.className = 'action-group';
            moveDiv.innerHTML = '<h4>Move to:</h4>';
            
            moveActions.forEach(action => {
                const button = this.createActionButton(action);
                roomDiv.appendChild(button);
            });
            
            actionsEl.appendChild(moveDiv);
        }

        // Add retreat option
        if (retreatActions.length > 0) {
            const retreatDiv = document.createElement('div');
            retreatDiv.className = 'action-group retreat-group';
            
            retreatActions.forEach(action => {
                const button = this.createActionButton(action);
                button.className += ' btn-warning';
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
        if (!this.currentExploration || this.isClosing) return;

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
                message = `🧩 Puzzle solved!`;
                break;
                
            case 'event_triggered':
                message = `✨ Special event occurred!`;
                break;
                
            case 'movement':
                message = `🚶 Moved to ${result.newRoom}`;
                break;
                
            default:
                message = result.message || 'Action completed';
        }

        UIManager.showMessage(message, messageType);
    }

    /**
     * Update dungeon map display
     */
    static updateDungeonMap() {
        const mapEl = document.getElementById('dungeonMap');
        if (!mapEl || !this.currentExploration) return;

        try {
            const roomMap = this.currentExploration.getRoomMap();
            const currentRoomId = this.currentExploration.dungeon.currentRoomId;
            
            mapEl.innerHTML = roomMap.map(room => {
                const isCurrent = room.id === currentRoomId;
                const isVisited = room.visited;
                const isCompleted = room.completed;
                
                return `
                    <div class="map-room ${isCurrent ? 'current' : ''} ${isVisited ? 'visited' : ''} ${isCompleted ? 'completed' : ''}">
                        <span class="room-icon">${room.icon}</span>
                        ${isCurrent ? '<span class="current-marker">📍</span>' : ''}
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error updating dungeon map:', error);
            mapEl.innerHTML = '<p>Map unavailable</p>';
        }
    }

    /**
     * Update party status display
     */
    static updatePartyStatus() {
        const statusEl = document.getElementById('partyStatus');
        if (!statusEl || !this.currentExploration) return;

        statusEl.innerHTML = this.currentExploration.party.map(char => {
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
        if (!this.autoExploreMode || !this.currentExploration || 
            this.currentExploration.state !== 'exploring' || this.isClosing) {
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
        if (!this.currentExploration || this.isClosing) return;
        
        // Prevent multiple end handlers
        this.isClosing = true;
        
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
        if (!this.currentExploration || this.isClosing) {
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
        if (this.isClosing) return; // Prevent multiple close operations
        this.isClosing = true;
        
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
                this.isClosing = false; // Reset flag after cleanup
            }, 300);
        } else {
            this.isClosing = false; // Reset flag if no modal
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
     * Force cleanup - emergency cleanup method
     */
    static forceCleanup() {
        // Stop all intervals
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Remove modal immediately
        const existingModal = document.querySelector('.dungeon-exploration-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Reset all state
        this.explorationModal = null;
        this.currentExploration = null;
        this.autoExploreMode = false;
        this.isClosing = false;
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
            if (this.currentExploration && this.explorationModal && !this.isClosing) {
                this.updateExplorationDisplay();
                
                // Check for exploration end conditions
                if (this.currentExploration.state === 'completed') {
                    this.handleExplorationEnd(true);
                } else if (this.currentExploration.state === 'retreated') {
                    this.handleExplorationEnd(false, true);
                }
            } else if (!this.currentExploration || !this.explorationModal) {
                // Clean up if exploration is gone
                this.closeExploration();
            }
        }, 1000);
    }

    /**
     * Update exploration log
     */
    static updateExplorationLog() {
        const logEl = document.getElementById('explorationLog');
        if (!logEl || !this.currentExploration) return;

        const logs = this.currentExploration.explorationLog || [];
        
        logEl.innerHTML = logs.slice(-20).map(entry => `
            <div class="log-entry log-${entry.type || 'info'}">
                <span class="log-timestamp">[${entry.timestamp || 'now'}]</span>
                ${entry.message || entry}
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        logEl.scrollTop = logEl.scrollHeight;
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
                min-height: 200px;
            }
            
            .room-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                border-bottom: 1px solid #3282b8;
                padding-bottom: 10px;
            }
            
            .room-icon {
                font-size: 24px;
            }
            
            .room-description {
                margin: 15px 0;
                color: #bbe1fa;
                line-height: 1.4;
            }
            
            .room-actions {
                margin-top: 15px;
            }
            
            .action-group {
                margin-bottom: 15px;
            }
            
            .action-group h4 {
                margin: 0 0 8px 0;
                color: #3b82f6;
                font-size: 14px;
            }
            
            .action-btn {
                margin: 5px 5px 5px 0;
                min-width: 150px;
                font-size: 13px;
            }
            
            .retreat-group {
                border-top: 1px solid #3282b8;
                padding-top: 10px;
            }
            
            .exploration-log-panel {
                background: rgba(15, 52, 96, 0.8);
                border: 2px solid #3282b8;
                border-radius: 8px;
                padding: 15px;
                flex: 1;
                min-height: 300px;
                display: flex;
                flex-direction: column;
            }
            
            .exploration-log {
                flex: 1;
                overflow-y: auto;
                max-height: 250px;
                border: 1px solid rgba(50, 130, 184, 0.3);
                border-radius: 4px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
            }
            
            .log-entry {
                margin-bottom: 8px;
                padding: 6px 8px;
                border-left: 3px solid #3282b8;
                background: rgba(45, 55, 72, 0.2);
                border-radius: 4px;
                font-size: 12px;
                line-height: 1.3;
                animation: fadeInSlide 0.3s ease-out;
            }
            
            .log-entry:hover {
                background: rgba(45, 55, 72, 0.3);
                border-left-color: var(--accent-blue);
            }
            
            @keyframes fadeInSlide {
                from { 
                    opacity: 0; 
                    transform: translateX(-10px);
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0);
                }
            }
            
            .log-damage { 
                color: #ff8a80; 
                border-left-color: #f56565;
            }
            
            .log-heal { 
                color: #a5d6a7; 
                border-left-color: #48bb78;
            }
            
            .log-skill { 
                color: #81d4fa; 
                border-left-color: #4299e1;
            }
            
            .log-death { 
                color: #ffab91; 
                font-weight: 600; 
                border-left-color: #ed8936;
                background: rgba(237, 137, 54, 0.1);
            }
            
            .log-critical {
                color: #ffd54f;
                font-weight: 600;
                border-left-color: #ecc94b;
                background: rgba(236, 201, 75, 0.1);
            }
            
            .log-timestamp {
                color: #a0aec0;
                font-size: 10px;
                margin-right: 8px;
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
            
            .dungeon-map {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
                gap: 8px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .map-room {
                width: 40px;
                height: 40px;
                border: 2px solid #3282b8;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                font-size: 16px;
                background: rgba(45, 55, 72, 0.6);
                transition: all 0.2s ease;
            }
            
            .map-room.visited {
                background: rgba(56, 142, 60, 0.3);
                border-color: #4caf50;
            }
            
            .map-room.completed {
                background: rgba(49, 130, 206, 0.3);
                border-color: #3182ce;
            }
            
            .map-room.current {
                background: rgba(237, 137, 54, 0.4);
                border-color: #ed8936;
                box-shadow: 0 0 10px rgba(237, 137, 54, 0.5);
            }
            
            .current-marker {
                position: absolute;
                top: -2px;
                right: -2px;
                font-size: 8px;
            }
            
            .party-status-compact {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .party-member-compact {
                background: rgba(45, 55, 72, 0.4);
                border: 1px solid #3282b8;
                border-radius: 6px;
                padding: 10px;
                transition: all 0.2s ease;
            }
            
            .party-member-compact.unconscious {
                opacity: 0.6;
                border-color: #f56565;
                background: rgba(245, 101, 101, 0.1);
            }
            
            .member-name {
                font-weight: 600;
                margin-bottom: 6px;
                color: #bbe1fa;
                font-size: 12px;
            }
            
            .member-bars {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .hp-bar-small,
            .mp-bar-small {
                height: 16px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                border: 1px solid rgba(50, 130, 184, 0.3);
            }
            
            .hp-fill-small {
                height: 100%;
                background: linear-gradient(90deg, #48bb78, #38a169);
                transition: width 0.3s ease;
            }
            
            .mp-fill-small {
                height: 100%;
                background: linear-gradient(90deg, #4299e1, #3182ce);
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