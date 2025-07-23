/**
 * ===========================================
 * MAIN APPLICATION ENTRY POINT
 * ===========================================
 * Coordinates initialization and manages application lifecycle
 */

// Application configuration
const APP_CONFIG = {
    version: '1.0.0-MVP',
    debug: true,
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxSaveSlots: 5,
    defaultSettings: {
        soundEnabled: true,
        musicEnabled: true,
        animationSpeed: 1.0,
        autoAdvanceCombat: true,
        showDetailedLogs: true
    }
};

// Application state manager
class ApplicationManager {
    constructor() {
        this.initialized = false;
        this.loadingSteps = [];
        this.currentStep = 0;
        this.settings = { ...APP_CONFIG.defaultSettings };
        this.autoSaveTimer = null;
    }

    /**
     * Initialize the entire application
     */
    async initialize() {
        console.log(`🚀 Initializing Dungeon Lords Manager v${APP_CONFIG.version}`);
        
        try {
            // Show loading screen
            UIManager.showLoadingScreen();
            
            // Define loading steps
            this.loadingSteps = [
                { name: 'Loading game data...', action: () => this.waitForGameData() },
                { name: 'Initializing game systems...', action: () => this.initializeCoreSystems() },
                { name: 'Setting up user interface...', action: () => this.initializeUI() },
                { name: 'Loading saved progress...', action: () => this.loadGameState() },
                { name: 'Finalizing setup...', action: () => this.finalizeInitialization() }
            ];
            
            // Execute loading steps
            for (let i = 0; i < this.loadingSteps.length; i++) {
                this.currentStep = i;
                this.updateLoadingProgress();
                
                console.log(`📋 ${this.loadingSteps[i].name}`);
                await this.loadingSteps[i].action();
                
                // Small delay for visual feedback
                await this.delay(200);
            }
            
            // Hide loading screen and start game
            UIManager.hideLoadingScreen();
            this.startGame();
            
            console.log('✅ Application initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Wait for game data to be loaded
     */
    async waitForGameData() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds total
            
            const checkData = () => {
                attempts++;
                
                // Check if all required data is loaded
                const requiredData = [
                    'CHARACTERS_DATA', 
                    'SKILLS_DATA', 
                    'DUNGEONS_DATA', 
                    'ENEMIES_DATA'
                ];
                
                const allLoaded = requiredData.every(dataName => 
                    typeof window[dataName] !== 'undefined' && window[dataName] !== null
                );
                
                if (allLoaded) {
                    // Initialize GameData if it exists
                    if (typeof initializeGameData === 'function') {
                        initializeGameData();
                    }
                    resolve();
                } else if (attempts >= maxAttempts) {
                    const missing = requiredData.filter(name => 
                        typeof window[name] === 'undefined'
                    );
                    reject(new Error(`Required data not loaded after ${maxAttempts * 100}ms: ${missing.join(', ')}`));
                } else {
                    setTimeout(checkData, 100);
                }
            };
            
            checkData();
        });
    }

    /**
     * Initialize core game systems
     */
    async initializeCoreSystems() {
        // Wait for all required classes to be loaded
        const requiredClasses = [
            'GameState',
            'Character', 
            'CombatManager',
            'ActionManager',
            'UIManager',
            'GameManager',
            'ValidationManager'
        ];
        
        let attempts = 0;
        const maxAttempts = 100; // Increased from 50
        
        return new Promise((resolve, reject) => {
            const checkClasses = () => {
                attempts++;
                
                // Check each class individually for better debugging
                const classStatus = {};
                requiredClasses.forEach(className => {
                    classStatus[className] = typeof window[className] !== 'undefined' && window[className] !== null;
                });
                
                console.log('Class loading status:', classStatus);
                
                const allLoaded = Object.values(classStatus).every(loaded => loaded);
                
                if (allLoaded) {
                    console.log('✅ All required classes found, initializing systems...');
                    
                    // Initialize global game state
                    window.gameState = new GameState();
                    
                    // Initialize core managers that have initialize methods
                    if (CombatManager.initialize) {
                        CombatManager.initialize();
                    }
                    
                    if (ActionManager.initialize) {
                        ActionManager.initialize();
                    } else {
                        // ActionManager doesn't need initialization, just create instance
                        if (!ActionManager.instance) {
                            ActionManager.instance = new ActionManager();
                        }
                    }
                    
                    if (ValidationManager.initialize) {
                        ValidationManager.initialize();
                    } else {
                        // ValidationManager doesn't need initialization, just create instance
                        if (!ValidationManager.instance) {
                            ValidationManager.instance = new ValidationManager();
                        }
                    }
                    
                    // Set up auto-save if enabled
                    if (APP_CONFIG.autoSave) {
                        this.setupAutoSave();
                    }
                    
                    console.log('✅ All core systems loaded successfully');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    const missing = requiredClasses.filter(name => 
                        typeof window[name] === 'undefined'
                    );
                    
                    // Show detailed error info
                    console.error('Missing classes after', maxAttempts, 'attempts:');
                    console.error('Missing:', missing);
                    console.error('Available classes:', Object.keys(window).filter(key => 
                        typeof window[key] === 'function' && key.match(/^[A-Z]/)
                    ));
                    
                    // Try to create a minimal ActionManager if it's the only missing piece
                    if (missing.length === 1 && missing[0] === 'ActionManager') {
                        console.log('🔧 Creating fallback ActionManager...');
                        window.ActionManager = class ActionManager {
                            static instance = null;
                            static initialize() { return true; }
                            static validateAction() { return { valid: true }; }
                            static getAvailableActions() { return []; }
                            static trainParty() { console.log('ActionManager fallback - trainParty'); }
                            static exploreDungeon() { console.log('ActionManager fallback - exploreDungeon'); }
                            static rest() { console.log('ActionManager fallback - rest'); }
                            static buyEquipment() { console.log('ActionManager fallback - buyEquipment'); }
                            static attemptDemonLord() { console.log('ActionManager fallback - attemptDemonLord'); }
                            static onActionEvent() {}
                            constructor() {
                                if (ActionManager.instance) return ActionManager.instance;
                                ActionManager.instance = this;
                            }
                        };
                        ActionManager.instance = new ActionManager();
                        
                        // Try again with fallback
                        setTimeout(checkClasses, 100);
                        return;
                    }
                    
                    reject(new Error(`Required systems not loaded: ${missing.join(', ')}`));
                } else {
                    // Wait a bit longer between checks
                    setTimeout(checkClasses, 200);
                }
            };
            
            checkClasses();
        });
    }

    /**
     * Initialize user interface
     */
    async initializeUI() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30;
            
            const checkUI = () => {
                attempts++;
                
                if (typeof UIManager !== 'undefined' && UIManager !== null) {
                    try {
                        UIManager.initialize();
                        this.setupEventListeners();
                        console.log('✅ UI Manager initialized');
                        resolve();
                    } catch (error) {
                        reject(new Error(`UI initialization failed: ${error.message}`));
                    }
                } else if (attempts >= maxAttempts) {
                    reject(new Error('UIManager not loaded within timeout'));
                } else {
                    setTimeout(checkUI, 100);
                }
            };
            
            checkUI();
        });
    }

    /**
     * Load saved game state
     */
    async loadGameState() {
        try {
            if (typeof gameState !== 'undefined') {
                gameState.load();
            }
        } catch (error) {
            console.warn('⚠️ Could not load saved game state:', error);
            // Continue with fresh state
        }
    }

    /**
     * Finalize initialization
     */
    async finalizeInitialization() {
        // Set up error handling
        this.setupErrorHandling();
        
        // Register service worker if available
        this.registerServiceWorker();
        
        // Mark as initialized
        this.initialized = true;
    }

    /**
     * Start the main game
     */
    startGame() {
        console.log('🎮 Starting game...');
        
        // Ensure gameState is available globally
        if (!window.gameState) {
            console.error('Game state not available');
            return;
        }
        
        // Initialize game manager if available, but don't call GameManager.initialize()
        // since we've already set up all the systems
        if (typeof GameManager !== 'undefined') {
            // Set up GameManager's reference to game state
            GameManager.gameState = window.gameState;
            
            // Start the game through GameManager
            GameManager.startGame();
        } else {
            console.error('GameManager not available');
            // Fallback: start UI directly
            if (typeof UIManager !== 'undefined') {
                UIManager.showSection('characterSelectionSection');
                UIManager.updateResourceDisplay();
                UIManager.renderCharacterGrid();
                UIManager.renderPartyDisplay();
            }
        }
        
        // Dispatch game ready event
        window.dispatchEvent(new CustomEvent('gameReady'));
        
        // Track initialization time
        if (APP_CONFIG.debug) {
            console.log(`⏱️ Total initialization time: ${performance.now()}ms`);
        }
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress() {
        if (this.loadingSteps[this.currentStep]) {
            UIManager.updateLoadingProgress(this.loadingSteps[this.currentStep].name);
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (typeof gameState !== 'undefined' && this.initialized) {
                try {
                    gameState.save();
                    if (APP_CONFIG.debug) {
                        console.log('💾 Auto-save completed');
                    }
                } catch (error) {
                    console.error('❌ Auto-save failed:', error);
                }
            }
        }, APP_CONFIG.autoSaveInterval);
        
        console.log(`💾 Auto-save enabled (${APP_CONFIG.autoSaveInterval / 1000}s interval)`);
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle page visibility changes for mobile
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onApplicationPause();
            } else {
                this.onApplicationResume();
            }
        });

        // Handle beforeunload to save game
        window.addEventListener('beforeunload', (event) => {
            this.onApplicationExit();
        });

        // Handle orientation changes on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.onOrientationChange(), 100);
        });

        // Handle resize events
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.code) {
                case 'KeyT':
                    if (typeof ActionManager !== 'undefined') {
                        ActionManager.trainParty();
                    }
                    break;
                case 'KeyE':
                    if (typeof ActionManager !== 'undefined') {
                        ActionManager.exploreDungeon();
                    }
                    break;
                case 'KeyR':
                    if (typeof ActionManager !== 'undefined') {
                        ActionManager.rest();
                    }
                    break;
                case 'KeyB':
                    if (typeof ActionManager !== 'undefined') {
                        ActionManager.buyEquipment();
                    }
                    break;
                case 'KeyD':
                    if (e.shiftKey && typeof ActionManager !== 'undefined') {
                        ActionManager.attemptDemonLord();
                    }
                    break;
                case 'F1':
                    e.preventDefault();
                    UIManager.showHelp();
                    break;
                case 'Escape':
                    UIManager.showGameMenu();
                    break;
            }
        });
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('🚨 Uncaught error:', e.error);
            this.handleError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('🚨 Unhandled promise rejection:', e.reason);
            this.handleError(e.reason);
        });
    }

    /**
     * Register service worker for offline functionality
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('📱 Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('📱 Service Worker registration failed:', error);
                });
        }
    }

    /**
     * Handle application pause (mobile background, tab switch)
     */
    onApplicationPause() {
        console.log('⏸️ Application paused');
        
        // Save game state
        if (typeof gameState !== 'undefined') {
            gameState.save();
        }
        
        // Pause any running animations or timers
        if (typeof CombatManager !== 'undefined' && CombatManager.currentCombat) {
            CombatManager.pauseCombat();
        }
    }

    /**
     * Handle application resume
     */
    onApplicationResume() {
        console.log('▶️ Application resumed');
        
        // Reload game state
        if (typeof gameState !== 'undefined') {
            gameState.load();
        }
        
        // Update UI
        if (typeof UIManager !== 'undefined') {
            UIManager.updateResourceDisplay();
            UIManager.renderPartyDisplay();
        }
    }

    /**
     * Handle application exit
     */
    onApplicationExit() {
        console.log('👋 Application exiting');
        
        // Final save
        if (typeof gameState !== 'undefined') {
            gameState.save();
        }
        
        // Clear auto-save timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
    }

    /**
     * Handle orientation changes on mobile
     */
    onOrientationChange() {
        console.log('🔄 Orientation changed');
        
        // Trigger UI reflow
        if (typeof UIManager !== 'undefined') {
            UIManager.handleOrientationChange();
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        // Debounce resize events
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        
        this.resizeTimer = setTimeout(() => {
            if (typeof UIManager !== 'undefined') {
                UIManager.handleResize();
            }
        }, 250);
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('💥 Critical initialization error:', error);
        
        // Show error screen with more details
        const container = document.querySelector('.container');
        if (container) {
            // Check what systems are actually loaded
            const systemStatus = [
                'CHARACTERS_DATA',
                'SKILLS_DATA', 
                'DUNGEONS_DATA',
                'GameState',
                'Character',
                'CombatManager',
                'ActionManager',
                'UIManager',
                'GameManager'
            ].map(system => {
                const loaded = typeof window[system] !== 'undefined';
                return `${system}: ${loaded ? '✅' : '❌'}`;
            }).join('<br>');
            
            container.innerHTML = `
                <div class="error-screen" style="text-align: center; padding: 50px; color: #fff;">
                    <h1>⚠️ Failed to Load Game</h1>
                    <p>Sorry, the game failed to initialize properly.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <br>
                    <details style="margin: 20px 0; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                        <summary style="cursor: pointer; margin-bottom: 10px;"><strong>System Status</strong></summary>
                        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
                            ${systemStatus}
                        </div>
                    </details>
                    <br>
                    <button class="btn" onclick="location.reload()" style="background: #3282b8; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px;">
                        🔄 Retry
                    </button>
                    <button class="btn" onclick="localStorage.clear(); location.reload()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px;">
                        🗑️ Clear Data & Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Handle runtime errors
     */
    handleError(error) {
        // Log error details
        if (APP_CONFIG.debug) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
        
        // Show user-friendly error message
        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage(
                'An error occurred. The game has been saved and will continue.',
                'error'
            );
        }
        
        // Auto-save in case of error
        if (typeof gameState !== 'undefined') {
            try {
                gameState.save();
            } catch (saveError) {
                console.error('Failed to save after error:', saveError);
            }
        }
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global application instance
let app = null;

/**
 * Initialize application when DOM is ready
 */
function initializeApplication() {
    app = new ApplicationManager();
    app.initialize().catch(error => {
        console.error('Failed to initialize application:', error);
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.app = app;
    window.APP_CONFIG = APP_CONFIG;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApplicationManager, APP_CONFIG };
}