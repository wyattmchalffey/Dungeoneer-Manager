/**
 * ===========================================
 * GAME MANAGER - SINGLE CHARACTER
 * ===========================================
 * Main game controller for single character management
 */

class GameManager {
    static gameState = null;
    static systems = {};
    static isInitialized = false;
    static eventHandlers = {};

    /**
     * Initialize the game
     */
    static async initialize() {
        if (this.isInitialized) {
            console.warn('Game already initialized');
            return true;
        }

        console.log('🎮 Initializing Dungeon Lords Manager - Single Character Mode...');

        try {
            // Initialize game state
            this.gameState = new GameState();
            window.gameState = this.gameState;

            // Load saved game if exists
            this.gameState.load();

            // Initialize systems
            await this.initializeSystems();

            // Setup event handling
            this.setupEventHandling();

            // Mark as initialized
            this.isInitialized = true;

            console.log('✅ Game initialization complete');
            return true;

        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            return false;
        }
    }

    /**
     * Initialize game systems
     */
    static async initializeSystems() {
        console.log('🔧 Initializing game systems...');

        // Initialize core systems
        this.systems = {
            ui: UIManager,
            action: ActionManager,
            combat: CombatManager,
            validation: ValidationUtils
        };

        // Validate system availability
        Object.entries(this.systems).forEach(([name, system]) => {
            if (!system) {
                throw new Error(`Required system not available: ${name}`);
            }
        });

        console.log('🎯 Game systems initialized');
    }

    /**
     * Setup event handling
     */
    static setupEventHandling() {
        // Game state change events
        document.addEventListener('gameStateChange', (event) => {
            this.onGameStateChange(event.detail);
        });

        // Character selection events
        document.addEventListener('characterSelected', (event) => {
            this.onCharacterSelected(event.detail);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            if (this.gameState?.isDirty) {
                this.gameState.save();
            }
        });

        // Visibility change (pause/resume)
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
        console.log('🚀 Starting single character game...');

        // Ensure we have access to the global game state
        this.gameState = window.gameState;
        
        if (!this.gameState) {
            console.error('Game state not available');
            return;
        }

        // Show appropriate initial screen
        if (!this.gameState.isCharacterReady()) {
            // New game or no character selected - show character selection
            UIManager.showSection('characterSelectionSection');
        } else {
            // Continuing game with selected character - show actions
            UIManager.showSection('actionsSection');
        }

        // Update all displays
        UIManager.updateResourceDisplay();
        UIManager.renderCharacterGrid();
        UIManager.renderCharacterDisplay();

        // Dispatch game ready event
        this.dispatchGameEvent('gameReady', {
            gameState: this.gameState,
            systems: this.systems
        });

        console.log('🎉 Single character game started successfully!');
    }

    /**
     * Select and confirm character choice
     */
    static confirmCharacter() {
        if (!this.gameState.selectedCharacter) {
            UIManager.showMessage('Please select a character!', 'error');
            return false;
        }

        console.log(`👤 Confirming character selection: ${this.gameState.selectedCharacter}`);

        try {
            // Create character instance from selected character
            const charData = CHARACTERS_DATA[this.gameState.selectedCharacter];
            if (!charData) {
                throw new Error(`Character data not found: ${this.gameState.selectedCharacter}`);
            }

            const character = new Character(charData, this.gameState.selectedCharacter);
            this.gameState.setAdventurer(character);

            // Show action section
            UIManager.showSection('actionsSection');
            UIManager.renderCharacterDisplay();

            // Save game state
            this.gameState.save();

            // Dispatch character ready event
            this.dispatchGameEvent('characterReady', {
                character: character
            });

            UIManager.showMessage(`${character.name} is ready for adventure!`, 'success');

            console.log('✅ Character confirmed successfully');
            return true;

        } catch (error) {
            console.error('Failed to confirm character:', error);
            UIManager.showMessage(`Failed to select character: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Change selected character (allows switching characters)
     */
    static changeCharacter() {
        const confirm = window.confirm('Are you sure you want to change characters? Current progress will be saved but you\'ll start fresh with the new character.');
        
        if (!confirm) return;

        // Save current progress
        this.gameState.save();

        // Reset character selection
        this.gameState.selectedCharacter = null;
        this.gameState.adventurer = null;

        // Show character selection screen
        UIManager.showSection('characterSelectionSection');
        UIManager.renderCharacterGrid();

        UIManager.showMessage('Select a new character to continue your adventure!', 'info');
    }

    /**
     * Next turn
     */
    static nextTurn() {
        console.log('⏭️ Advancing to next turn...');

        // Advance game state
        this.gameState.nextTurn();

        // Update character state (recovery, etc.)
        if (this.gameState.adventurer) {
            this.gameState.adventurer.onTurnEnd();
        }

        // Update displays
        UIManager.updateResourceDisplay();
        UIManager.renderCharacterDisplay();

        // Check for new unlocks
        this.checkForUnlocks();

        // Auto-save
        this.gameState.save();

        // Show turn summary
        this.showTurnSummary();

        console.log(`📅 Turn completed. Season ${this.gameState.currentSeason}, Turn ${this.gameState.maxTurns - this.gameState.turnsLeft + 1}`);
    }

    /**
     * Check for character/content unlocks
     */
    static checkForUnlocks() {
        const stats = this.gameState.statistics;
        const adventurer = this.gameState.adventurer;

        // Example unlock conditions for single character mode
        const unlockConditions = {
            'berserker': stats.soloVictories >= 5,
            'paladin': stats.dungeonsCompleted >= 3 && adventurer?.archetype === 'guardian',
            'assassin': stats.enemiesDefeated >= 20 && adventurer?.archetype === 'rogue',
            'archmage': stats.skillsLearned >= 10 && adventurer?.archetype === 'mage'
        };

        Object.entries(unlockConditions).forEach(([charId, condition]) => {
            if (condition && !this.gameState.unlockedCharacters.includes(charId)) {
                this.gameState.unlockCharacter(charId);
                UIManager.showMessage(`🔓 New character unlocked: ${CHARACTERS_DATA[charId]?.name || charId}!`, 'success');
            }
        });
    }

    /**
     * Show turn summary
     */
    static showTurnSummary() {
        const adventurer = this.gameState.adventurer;
        if (!adventurer) return;

        const summary = `
            <div class="turn-summary">
                <h3>Turn Summary</h3>
                <div class="character-status">
                    <h4>${adventurer.name} (Level ${adventurer.level})</h4>
                    <div class="status-bars">
                        <div class="health-bar">
                            <span>Health: ${adventurer.currentHP}/${adventurer.maxHP}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${(adventurer.currentHP / adventurer.maxHP) * 100}%"></div>
                            </div>
                        </div>
                        <div class="mana-bar">
                            <span>Mana: ${adventurer.currentMP}/${adventurer.maxMP}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${(adventurer.currentMP / adventurer.maxMP) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="turn-info">
                    <p><strong>Season:</strong> ${this.gameState.currentSeason}</p>
                    <p><strong>Turns Remaining:</strong> ${this.gameState.turnsLeft}</p>
                    <p><strong>Total Solo Victories:</strong> ${this.gameState.statistics.soloVictories}</p>
                </div>
            </div>
        `;

        UIManager.showResults(summary, 'info');
    }

    /**
     * Event handling methods
     */
    static onGameStateChange(detail) {
        console.log('Game state changed:', detail);
        UIManager.updateResourceDisplay();
    }

    static onCharacterSelected(detail) {
        console.log('Character selected:', detail);
        UIManager.renderCharacterGrid();
    }

    static onGamePause() {
        console.log('Game paused');
        if (this.gameState?.isDirty) {
            this.gameState.save();
        }
    }

    static onGameResume() {
        console.log('Game resumed');
        // Update displays in case data changed while away
        if (this.gameState) {
            UIManager.updateResourceDisplay();
            UIManager.renderCharacterDisplay();
        }
    }

    /**
     * Error handling
     */
    static handleError(error) {
        console.error('Game error:', error);
        
        // Show user-friendly error message
        UIManager.showMessage(
            'An error occurred. The game has been saved and should continue normally.',
            'error'
        );

        // Auto-save on error to prevent data loss
        if (this.gameState) {
            this.gameState.save();
        }
    }

    /**
     * Dispatch custom game events
     */
    static dispatchGameEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Register event handler
     */
    static on(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }

    /**
     * Game state queries
     */
    static isGameReady() {
        return this.isInitialized && this.gameState && this.gameState.isCharacterReady();
    }

    static getGameState() {
        return this.gameState;
    }

    static getAdventurer() {
        return this.gameState?.adventurer;
    }

    /**
     * Reset game
     */
    static resetGame() {
        if (this.gameState) {
            const success = this.gameState.reset();
            if (success) {
                // Restart the game
                UIManager.showSection('characterSelectionSection');
                UIManager.renderCharacterGrid();
                UIManager.updateResourceDisplay();
                UIManager.showMessage('Game reset successfully!', 'success');
            }
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.GameManager = GameManager;
    console.log('✅ Single Character GameManager loaded successfully');
}