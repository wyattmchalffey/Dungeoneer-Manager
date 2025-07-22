/**
 * ===========================================
 * GAME MANAGER
 * ===========================================
 * Central game controller that coordinates all systems
 */

class GameManager {
    static instance = null;
    static isInitialized = false;
    static gameLoop = null;
    static systems = {};

    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = this;
        
        this.initializationSteps = [];
        this.currentStep = 0;
        this.gameState = null;
    }

    /**
     * Initialize the entire game
     */
    static async initialize() {
        if (this.isInitialized) {
            console.warn('Game already initialized');
            return;
        }

        console.log('🎮 Initializing Game Manager...');

        try {
            // Wait for all required systems to be loaded
            await this.waitForSystems();

            // Create and initialize game state
            this.initializeGameState();

            // Initialize all core systems
            await this.initializeSystems();

            // Setup game loop and event handling
            this.setupGameLoop();
            this.setupEventHandling();

            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Game Manager initialized successfully!');

            // Start the game
            this.startGame();

        } catch (error) {
            console.error('❌ Failed to initialize Game Manager:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Wait for all required systems to be available
     */
    static async waitForSystems() {
        const requiredSystems = [
            'GameData',
            'GameState', 
            'Character',
            'CombatManager',
            'ActionManager',
            'UIManager'
        ];

        const checkSystem = (systemName) => {
            return typeof window[systemName] !== 'undefined' && window[systemName] !== null;
        };

        // Simple check since systems should already be loaded by the time GameManager initializes
        const missing = requiredSystems.filter(sys => !checkSystem(sys));
        if (missing.length > 0) {
            console.warn('Some systems not yet available:', missing);
            // Don't throw error, just log warning since ApplicationManager handles this
        }

        console.log('✅ Required systems check complete');
    }

    /**
     * Initialize game state
     */
    static initializeGameState() {
        console.log('🗃️ Initializing game state...');
        
        if (typeof GameState === 'undefined') {
            throw new Error('GameState class not available');
        }

        // Create global game state instance
        window.gameState = new GameState();
        this.gameState = window.gameState;

        // Try to load existing save
        try {
            this.gameState.load();
            console.log('📂 Loaded existing game state');
        } catch (error) {
            console.log('🆕 Starting with fresh game state');
        }
    }

    /**
     * Initialize all core systems
     */
    static async initializeSystems() {
        console.log('⚙️ Initializing core systems...');

        // Store system references
        this.systems = {
            gameData: GameData,
            gameState: this.gameState,
            combat: CombatManager,
            actions: ActionManager,
            ui: UIManager
        };

        // Initialize UI Manager
        if (UIManager.initialize) {
            UIManager.initialize();
            console.log('✅ UI Manager initialized');
        }

        // Initialize Action Manager
        if (ActionManager.initialize) {
            ActionManager.initialize();
            console.log('✅ Action Manager initialized');
        }

        // Initialize Combat Manager
        if (CombatManager.initialize) {
            CombatManager.initialize();
            console.log('✅ Combat Manager initialized');
        }

        // Setup system cross-communication
        this.setupSystemCommunication();
    }

    /**
     * Setup communication between systems
     */
    static setupSystemCommunication() {
        // Action Manager events
        ActionManager.onActionEvent('actionCompleted', (data) => {
            this.onActionCompleted(data);
        });

        // Combat Manager events
        CombatManager.onCombatEvent('combatEnded', (data) => {
            this.onCombatEnded(data);
        });

        // Game State events
        if (this.gameState.onStateChanged) {
            this.gameState.onStateChanged((data) => {
                this.onGameStateChanged(data);
            });
        }

        console.log('🔗 System communication setup complete');
    }

    /**
     * Setup game loop for continuous updates
     */
    static setupGameLoop() {
        let lastUpdate = 0;
        const targetFPS = 60;
        const updateInterval = 1000 / targetFPS;

        const gameLoop = (timestamp) => {
            if (timestamp - lastUpdate >= updateInterval) {
                this.update(timestamp - lastUpdate);
                lastUpdate = timestamp;
            }

            if (this.isInitialized) {
                this.gameLoop = requestAnimationFrame(gameLoop);
            }
        };

        this.gameLoop = requestAnimationFrame(gameLoop);
        console.log('🔄 Game loop started');
    }

    /**
     * Main game update loop
     */
    static update(deltaTime) {
        try {
            // Update game state
            if (this.gameState && this.gameState.update) {
                this.gameState.update(deltaTime);
            }

            // Update combat system
            if (CombatManager.currentCombat && CombatManager.update) {
                CombatManager.update(deltaTime);
            }

            // Update UI (if needed)
            if (UIManager.update) {
                UIManager.update(deltaTime);
            }

            // Check for auto-save
            this.checkAutoSave();

            // Check for game end conditions
            this.checkGameEndConditions();

        } catch (error) {
            console.error('Error in game loop:', error);
            this.handleGameLoopError(error);
        }
    }

    /**
     * Setup global event handling
     */
    static setupEventHandling() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onGamePause();
            } else {
                this.onGameResume();
            }
        });

        // Handle window focus changes
        window.addEventListener('blur', () => this.onGamePause());
        window.addEventListener('focus', () => this.onGameResume());

        // Handle errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });

        console.log('🎯 Event handling setup complete');
    }

    /**
     * Start the game
     */
    static startGame() {
        console.log('🚀 Starting game...');

        // Show appropriate initial screen
        if (this.gameState.party.length === 0) {
            // New game - show character selection
            UIManager.showSection('characterSelectionSection');
        } else {
            // Continuing game - show actions
            UIManager.showSection('actionsSection');
        }

        // Update all displays
        UIManager.updateResourceDisplay();
        UIManager.renderCharacterGrid();
        UIManager.renderPartyDisplay();

        // Dispatch game ready event
        this.dispatchGameEvent('gameReady', {
            gameState: this.gameState,
            systems: this.systems
        });

        console.log('🎉 Game started successfully!');
    }

    /**
     * Confirm selected party and begin adventure
     */
    static confirmParty() {
        if (!this.gameState.selectedCharacters || this.gameState.selectedCharacters.length !== 4) {
            UIManager.showMessage('Please select exactly 4 characters!', 'error');
            return false;
        }

        console.log('👥 Confirming party selection...');

        try {
            // Create character instances from selected characters
            this.gameState.party = this.gameState.selectedCharacters.map(charId => {
                const charData = CHARACTERS_DATA[charId];
                if (!charData) {
                    throw new Error(`Character data not found: ${charId}`);
                }
                return new Character(charData, charId);
            });

            // Show action section
            UIManager.showSection('actionsSection');
            UIManager.renderPartyDisplay();

            // Save game state
            this.gameState.save();

            // Dispatch party ready event
            this.dispatchGameEvent('partyReady', {
                party: this.gameState.party
            });

            UIManager.showMessage('Party confirmed! Adventure begins!', 'success');
            console.log('✅ Party confirmed:', this.gameState.party.map(c => c.name));

            return true;

        } catch (error) {
            console.error('Failed to confirm party:', error);
            UIManager.showMessage('Failed to confirm party. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Advance to next turn
     */
    static nextTurn() {
        if (!this.gameState) return;

        console.log(`⏭️ Advancing to next turn (${this.gameState.maxTurns - this.gameState.turnsLeft + 1})`);

        // Hide results section
        UIManager.showSection('actionsSection');

        // Check for final turn
        if (this.gameState.turnsLeft <= 0) {
            this.handleFinalTurn();
            return;
        }

        // Check for character unlocks
        const newUnlocks = this.gameState.checkCharacterUnlocks();
        if (newUnlocks.length > 0) {
            const unlockNames = newUnlocks.map(unlock => unlock.name).join(', ');
            UIManager.showMessage(`New characters unlocked: ${unlockNames}!`, 'success');
            UIManager.renderCharacterGrid();
        }

        // Update UI
        UIManager.updateResourceDisplay();
        UIManager.renderPartyDisplay();

        // Auto-save
        this.gameState.save();

        this.dispatchGameEvent('turnAdvanced', {
            currentTurn: this.gameState.maxTurns - this.gameState.turnsLeft,
            turnsLeft: this.gameState.turnsLeft
        });
    }

    /**
     * Handle final turn scenario
     */
    static handleFinalTurn() {
        console.log('⚰️ Final turn reached - forcing Demon Lord encounter');

        UIManager.showMessage('Time\'s up! You must face the Demon Lord now!', 'warning');
        
        // Force demon lord attempt after a delay
        setTimeout(() => {
            ActionManager.attemptDemonLord();
        }, 2000);
    }

    /**
     * Start a new game run (reset current progress)
     */
    static newRun() {
        if (!confirm('Start a new run? Current progress will be lost.')) {
            return;
        }

        console.log('🔄 Starting new run...');

        // Reset game state
        this.gameState.reset();

        // Reset UI to character selection
        UIManager.showSection('characterSelectionSection');
        UIManager.updateResourceDisplay();
        UIManager.renderCharacterGrid();

        // Clear combat log
        UIManager.clearCombatLog();

        this.dispatchGameEvent('newRunStarted', {
            season: this.gameState.currentSeason
        });

        UIManager.showMessage(`Starting Season ${this.gameState.currentSeason}!`, 'info');
    }

    /**
     * Event Handlers
     */

    static onActionCompleted(data) {
        console.log('🎬 Action completed:', data.action);

        // Check for achievements
        this.gameState.checkAchievementUnlocks();

        // Update UI
        UIManager.updateResourceDisplay();
        UIManager.renderPartyDisplay();

        // Dispatch event
        this.dispatchGameEvent('actionCompleted', data);
    }

    static onCombatEnded(data) {
        console.log('⚔️ Combat ended:', data.victory ? 'Victory' : 'Defeat');

        // Update party display to show damage
        UIManager.renderPartyDisplay();

        // Dispatch event
        this.dispatchGameEvent('combatEnded', data);
    }

    static onGameStateChanged(data) {
        // Update UI when game state changes
        UIManager.updateResourceDisplay();

        // Dispatch event
        this.dispatchGameEvent('gameStateChanged', data);
    }

    static onGamePause() {
        console.log('⏸️ Game paused');

        // Pause combat if active
        if (CombatManager.currentCombat) {
            CombatManager.pauseCombat();
        }

        // Save game state
        this.gameState.save();

        this.dispatchGameEvent('gamePaused', {});
    }

    static onGameResume() {
        console.log('▶️ Game resumed');

        // Resume combat if it was paused
        if (CombatManager.currentCombat && CombatManager.currentCombat.paused) {
            CombatManager.resumeCombat();
        }

        // Update displays
        UIManager.updateResourceDisplay();
        UIManager.renderPartyDisplay();

        this.dispatchGameEvent('gameResumed', {});
    }

    /**
     * Utility Methods
     */

    static checkAutoSave() {
        if (!this.gameState || !this.gameState.settings?.autoSave) return;

        // Auto-save every 30 seconds if there are changes
        const now = Date.now();
        if (this.gameState.isDirty && this.gameState.isDirty() && 
            now - this.gameState._lastSaveTime > 30000) {
            this.gameState.save();
        }
    }

    static checkGameEndConditions() {
        if (!this.gameState) return;

        // Check for ultimate victory
        if (this.gameState.statistics.victoriesAgainstDemonLord > 0) {
            this.handleUltimateVictory();
        }

        // Check for game over conditions
        if (this.gameState.turnsLeft <= 0 && 
            this.gameState.party.every(char => !char.isAlive())) {
            this.handleGameOver();
        }
    }

    static handleUltimateVictory() {
        console.log('🏆 Ultimate Victory achieved!');
        
        UIManager.showMessage('Congratulations! You have saved the realm!', 'success');
        
        this.dispatchGameEvent('ultimateVictory', {
            season: this.gameState.currentSeason,
            turnsUsed: this.gameState.maxTurns - this.gameState.turnsLeft
        });

        // Offer to start new game+
        setTimeout(() => {
            if (confirm('You have achieved ultimate victory! Start a new run with increased difficulty?')) {
                this.newRun();
            }
        }, 3000);
    }

    static handleGameOver() {
        console.log('💀 Game Over');
        
        UIManager.showMessage('Game Over! Your party has fallen and time has run out.', 'error');
        
        this.dispatchGameEvent('gameOver', {
            season: this.gameState.currentSeason,
            turnsUsed: this.gameState.maxTurns - this.gameState.turnsLeft
        });

        // Offer to start new run
        setTimeout(() => {
            if (confirm('Game Over! Start a new run?')) {
                this.newRun();
            }
        }, 2000);
    }

    static handleError(error) {
        console.error('🚨 Game error occurred:', error);

        // Try to save game state before handling error
        try {
            if (this.gameState) {
                this.gameState.save();
            }
        } catch (saveError) {
            console.error('Failed to save during error handling:', saveError);
        }

        // Show user-friendly error message
        UIManager.showMessage(
            'An error occurred. Game progress has been saved. Please refresh if problems persist.',
            'error',
            5000
        );

        this.dispatchGameEvent('gameError', { error });
    }

    static handleGameLoopError(error) {
        console.error('Game loop error:', error);
        
        // Attempt to recover by pausing the game loop temporarily
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        // Restart game loop after a delay
        setTimeout(() => {
            if (this.isInitialized) {
                this.setupGameLoop();
            }
        }, 1000);
    }

    static handleInitializationError(error) {
        console.error('💥 Critical initialization error:', error);

        // Show error screen
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-screen" style="text-align: center; padding: 50px;">
                    <h1>⚠️ Failed to Load Game</h1>
                    <p>Sorry, the game failed to initialize properly.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <br>
                    <button class="btn" onclick="location.reload()">🔄 Retry</button>
                    <button class="btn btn-secondary" onclick="localStorage.clear(); location.reload()">
                        🗑️ Clear Data & Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Event System
     */

    static gameEventListeners = {};

    static addEventListener(event, callback) {
        if (!this.gameEventListeners[event]) {
            this.gameEventListeners[event] = [];
        }
        this.gameEventListeners[event].push(callback);
    }

    static removeEventListener(event, callback) {
        if (this.gameEventListeners[event]) {
            this.gameEventListeners[event] = this.gameEventListeners[event]
                .filter(cb => cb !== callback);
        }
    }

    static dispatchGameEvent(event, data) {
        if (this.gameEventListeners[event]) {
            this.gameEventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }

        // Also dispatch as DOM event for external systems
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(event, { detail: data }));
        }
    }

    /**
     * Debug and Development Methods
     */

    static getGameState() {
        return this.gameState;
    }

    static getSystems() {
        return this.systems;
    }

    static getGameStats() {
        return {
            initialized: this.isInitialized,
            currentSection: UIManager.currentSection,
            party: this.gameState?.party?.length || 0,
            turnsLeft: this.gameState?.turnsLeft || 0,
            season: this.gameState?.currentSeason || 1,
            systems: Object.keys(this.systems),
            gameLoopActive: !!this.gameLoop
        };
    }

    static debugSkipToFinal() {
        if (!DEBUG_CONFIG?.ENABLED) return;
        
        console.log('🐛 Debug: Skipping to final battle');
        this.gameState.turnsLeft = 1;
        UIManager.updateResourceDisplay();
        UIManager.showMessage('Debug: Skipped to final turn!', 'warning');
    }

    static debugAddResources(gold = 1000, materials = 500) {
        if (!DEBUG_CONFIG?.ENABLED) return;
        
        this.gameState.addResource('gold', gold);
        this.gameState.addResource('materials', materials);
        UIManager.updateResourceDisplay();
        UIManager.showMessage(`Debug: Added ${gold} gold, ${materials} materials`, 'info');
    }

    static debugUnlockAllCharacters() {
        if (!DEBUG_CONFIG?.ENABLED) return;
        
        Object.keys(CHARACTERS_DATA).forEach(charId => {
            this.gameState.unlockCharacter(charId);
        });
        UIManager.renderCharacterGrid();
        UIManager.showMessage('Debug: All characters unlocked!', 'info');
    }

    /**
     * Cleanup
     */
    static destroy() {
        console.log('🧹 Cleaning up Game Manager...');

        this.isInitialized = false;

        // Stop game loop
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        // Clear event listeners
        this.gameEventListeners = {};

        // Save final state
        if (this.gameState) {
            this.gameState.save();
        }

        console.log('✅ Game Manager cleanup complete');
    }
}

// Auto-initialize when explicitly called (not automatically)
if (typeof window !== 'undefined') {
    // Make GameManager globally accessible
    window.GameManager = GameManager;
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        GameManager.destroy();
    });
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}