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
            this.showLoadingScreen();
            
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
            this.hideLoadingScreen();
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
        const maxAttempts = 50;
        
        return new Promise((resolve, reject) => {
            const checkClasses = () => {
                attempts++;
                
                const allLoaded = requiredClasses.every(className => 
                    typeof window[className] !== 'undefined' && window[className] !== null
                );
                
                if (allLoaded) {
                    // Initialize global game state
                    window.gameState = new GameState();
                    
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
                    reject(new Error(`Required systems not loaded: ${missing.join(', ')}`));
                } else {
                    setTimeout(checkClasses, 100);
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
        
        // Initialize game manager after all systems are ready
        if (typeof GameManager !== 'undefined') {
            // Don't call GameManager.initialize() here since we've already set everything up
            // Just call startGame directly
            GameManager.startGame();
        } else {
            console.error('GameManager not available');
        }
        
        // Dispatch game ready event
        window.dispatchEvent(new CustomEvent('gameReady'));
        
        // Track initialization time
        if (APP_CONFIG.debug) {
            console.log(`⏱️ Total initialization time: ${performance.now()}ms`);
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && this.loadingSteps[this.currentStep]) {
            const progressText = loadingScreen.querySelector('p');
            if (progressText) {
                progressText.textContent = this.loadingSteps[this.currentStep].name;
            }
            
            // Update progress bar if exists
            const progressBar = loadingScreen.querySelector('.progress-bar');
            if (progressBar) {
                const progress = ((this.currentStep + 1) / this.loadingSteps.length) * 100;
                progressBar.style.width = `${progress}%`;
            }
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

        // Handle touch events for mobile feedback
        this.setupTouchFeedback();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup touch feedback for mobile devices
     */
    setupTouchFeedback() {
        // Add touch feedback
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('btn') || e.target.classList.contains('character-card')) {
                e.target.style.transform = 'scale(0.95)';
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('btn') || e.target.classList.contains('character-card')) {
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        }, { passive: true });
        
        // Prevent zoom on double tap for iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
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
                    this.showHelp();
                    break;
                case 'Escape':
                    this.showGameMenu();
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
            // Pause combat if active
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
     * Show help screen
     */
    showHelp() {
        const helpContent = `
            <div class="help-screen">
                <h2>🎮 Controls & Help</h2>
                <div class="help-section">
                    <h3>Keyboard Shortcuts:</h3>
                    <ul>
                        <li><strong>T</strong> - Train Party</li>
                        <li><strong>E</strong> - Explore Dungeon</li>
                        <li><strong>R</strong> - Rest & Recover</li>
                        <li><strong>B</strong> - Buy Equipment</li>
                        <li><strong>Shift+D</strong> - Attempt Demon Lord</li>
                        <li><strong>F1</strong> - Show Help</li>
                        <li><strong>Esc</strong> - Game Menu</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h3>Game Objective:</h3>
                    <p>Build and train a party of 4 adventurers to defeat the Demon Lord within 20 turns.</p>
                </div>
                <button class="btn" onclick="this.parentElement.remove()">Close</button>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        overlay.innerHTML = helpContent;
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    /**
     * Show game menu
     */
    showGameMenu() {
        const menuContent = `
            <div class="game-menu">
                <h2>⚙️ Game Menu</h2>
                <button class="btn" onclick="gameState.save(); UIManager.showMessage('Game Saved!', 'success')">💾 Save Game</button>
                <button class="btn" onclick="if(confirm('Load saved game?')) { gameState.load(); location.reload(); }">📂 Load Game</button>
                <button class="btn" onclick="app.showSettings()">⚙️ Settings</button>
                <button class="btn" onclick="app.showHelp()">❓ Help</button>
                <button class="btn btn-danger" onclick="if(confirm('Start new game? Current progress will be lost.')) { GameManager.newRun(); }">🆕 New Game</button>
                <button class="btn" onclick="this.parentElement.parentElement.remove()">❌ Close</button>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        overlay.innerHTML = menuContent;
        document.body.appendChild(overlay);
    }

    /**
     * Show settings screen
     */
    showSettings() {
        // Implementation for settings screen
        console.log('Settings screen - TODO: Implement');
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