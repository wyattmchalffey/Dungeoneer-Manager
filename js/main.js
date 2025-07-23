/**
 * ===========================================
 * MAIN APPLICATION ENTRY POINT - SOLO EDITION
 * ===========================================
 * Initialize and start the single character dungeon management game
 */

// Application state
let gameInitialized = false;
let loadingTimeout = null;

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('🚀 Starting Dungeon Lords Manager - Solo Edition...');
    
    try {
        showLoadingScreen();
        
        // Step 1: Validate browser compatibility
        updateLoadingStatus('Checking browser compatibility...');
        if (!validateBrowserSupport()) {
            throw new Error('Browser not supported');
        }
        
        // Step 2: Initialize core systems
        updateLoadingStatus('Loading game systems...');
        await initializeSystems();
        
        // Step 3: Load game data
        updateLoadingStatus('Loading character data...');
        validateGameData();
        
        // Step 4: Initialize UI
        updateLoadingStatus('Setting up interface...');
        await initializeUI();
        
        // Step 5: Start game
        updateLoadingStatus('Starting your adventure...');
        await startGame();
        
        // All done!
        hideLoadingScreen();
        gameInitialized = true;
        
        console.log('✅ Application initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage(`Failed to start game: ${error.message}`);
        hideLoadingScreen();
    }
}

/**
 * Validate browser support
 */
function validateBrowserSupport() {
    const requiredFeatures = [
        'localStorage',
        'JSON',
        'Promise',
        'fetch'
    ];
    
    for (const feature of requiredFeatures) {
        if (typeof window[feature] === 'undefined') {
            console.error(`Missing required feature: ${feature}`);
            return false;
        }
    }
    
    // Check for modern JavaScript features
    try {
        eval('const test = () => {}');
        eval('const {x} = {x: 1}');
        eval('const arr = [1, 2, 3]; const [a, ...rest] = arr;');
    } catch (e) {
        console.error('Browser does not support modern JavaScript features');
        return false;
    }
    
    console.log('✅ Browser compatibility check passed');
    return true;
}

/**
 * Initialize core game systems
 */
async function initializeSystems() {
    console.log('🔧 Initializing core systems...');
    
    // Initialize systems in dependency order
    const systems = [
        { name: 'Helpers', instance: Helpers, required: true },
        { name: 'ValidationUtils', instance: ValidationUtils, required: true },
        { name: 'GameState', instance: GameState, required: true },
        { name: 'GameManager', instance: GameManager, required: true },
        { name: 'UIManager', instance: UIManager, required: true },
        { name: 'ActionManager', instance: ActionManager, required: true },
        { name: 'CombatManager', instance: CombatManager, required: false }
    ];
    
    for (const system of systems) {
        try {
            if (system.instance && typeof system.instance.initialize === 'function') {
                await system.instance.initialize();
                console.log(`✅ ${system.name} initialized`);
            } else if (system.required) {
                console.warn(`⚠️ ${system.name} does not have initialize method`);
            }
        } catch (error) {
            if (system.required) {
                throw new Error(`Failed to initialize ${system.name}: ${error.message}`);
            } else {
                console.warn(`⚠️ Optional system ${system.name} failed to initialize:`, error);
            }
        }
    }
    
    console.log('✅ Core systems initialized');
}

/**
 * Validate game data integrity
 */
function validateGameData() {
    console.log('🔍 Validating game data...');
    
    // Check required data objects
    const requiredData = [
        { name: 'CHARACTERS_DATA', data: window.CHARACTERS_DATA },
        { name: 'SKILLS_DATA', data: window.SKILLS_DATA },
        { name: 'DUNGEONS_DATA', data: window.DUNGEONS_DATA }
    ];
    
    for (const dataObj of requiredData) {
        if (!dataObj.data || typeof dataObj.data !== 'object') {
            throw new Error(`Missing required game data: ${dataObj.name}`);
        }
        
        if (Object.keys(dataObj.data).length === 0) {
            throw new Error(`Empty game data: ${dataObj.name}`);
        }
    }
    
    // Validate character data structure
    Object.entries(CHARACTERS_DATA).forEach(([charId, charData]) => {
        const requiredFields = ['name', 'archetype', 'aptitudes', 'baseStats', 'skills'];
        for (const field of requiredFields) {
            if (!charData[field]) {
                throw new Error(`Character ${charId} missing required field: ${field}`);
            }
        }
    });
    
    // Validate skill references in characters
    Object.entries(CHARACTERS_DATA).forEach(([charId, charData]) => {
        if (charData.skills) {
            charData.skills.forEach(skillId => {
                if (!SKILLS_DATA[skillId]) {
                    console.warn(`Character ${charId} references unknown skill: ${skillId}`);
                }
            });
        }
    });
    
    console.log('✅ Game data validation complete');
}

/**
 * Initialize user interface
 */
async function initializeUI() {
    console.log('🎨 Initializing user interface...');
    
    // Initialize UI Manager
    if (UIManager && typeof UIManager.initialize === 'function') {
        await UIManager.initialize();
    }
    
    // Setup global event handlers
    setupGlobalEventHandlers();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize tooltips and help system
    initializeTooltips();
    
    console.log('✅ User interface initialized');
}

/**
 * Setup global event handlers
 */
function setupGlobalEventHandlers() {
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (gameInitialized && UIManager) {
            UIManager.handleResize?.();
        }
    }, 250));
    
    // Handle visibility change (tab focus/blur)
    document.addEventListener('visibilitychange', () => {
        if (gameInitialized && GameManager) {
            if (document.hidden) {
                GameManager.onGamePause?.();
            } else {
                GameManager.onGameResume?.();
            }
        }
    });
    
    // Handle before unload (save on exit)
    window.addEventListener('beforeunload', (event) => {
        if (gameInitialized && window.gameState?.isDirty) {
            window.gameState.save();
            
            // Show confirmation for unsaved changes
            event.preventDefault();
            event.returnValue = 'You have unsaved progress. Are you sure you want to leave?';
        }
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (gameInitialized) {
            UIManager?.showMessage?.('An unexpected error occurred. Game progress has been saved.', 'error');
            window.gameState?.save();
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (!gameInitialized) return;
        
        // Don't interfere with input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Handle shortcuts
        switch (event.key) {
            case 'Escape':
                // Close modals or show game menu
                const modals = document.querySelectorAll('.modal-overlay');
                if (modals.length > 0) {
                    modals.forEach(modal => modal.remove());
                } else {
                    UIManager?.showGameMenu?.();
                }
                event.preventDefault();
                break;
                
            case 't':
            case 'T':
                // Quick training shortcut
                if (window.gameState?.adventurer && ActionManager) {
                    ActionManager.trainGeneral();
                    event.preventDefault();
                }
                break;
                
            case 'd':
            case 'D':
                // Quick dungeon exploration
                if (window.gameState?.adventurer && ActionManager) {
                    ActionManager.showDungeonSelection();
                    event.preventDefault();
                }
                break;
                
            case 'r':
            case 'R':
                // Quick rest
                if (window.gameState?.adventurer && ActionManager) {
                    ActionManager.rest();
                    event.preventDefault();
                }
                break;
                
            case 's':
            case 'S':
                // Quick save
                if (event.ctrlKey || event.metaKey) {
                    window.gameState?.save();
                    UIManager?.showMessage?.('Game saved!', 'success');
                    event.preventDefault();
                }
                break;
                
            case 'h':
            case 'H':
            case '?':
                // Show help
                showHelpModal();
                event.preventDefault();
                break;
        }
    });
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    // Simple tooltip system
    document.addEventListener('mouseover', (event) => {
        const element = event.target.closest('[title]');
        if (element && element.title) {
            showTooltip(element, element.title);
        }
    });
    
    document.addEventListener('mouseout', (event) => {
        const element = event.target.closest('[title]');
        if (element) {
            hideTooltip();
        }
    });
}

/**
 * Start the game
 */
async function startGame() {
    console.log('🎮 Starting game...');
    
    // Initialize GameManager
    if (!GameManager.isInitialized) {
        await GameManager.initialize();
    }
    
    // Start the actual game
    GameManager.startGame();
    
    // Show welcome message for new players
    if (!window.gameState?.adventurer) {
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);
    }
    
    console.log('✅ Game started successfully');
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        
        // Set timeout to prevent infinite loading
        loadingTimeout = setTimeout(() => {
            console.error('Loading took too long, showing error');
            showErrorMessage('Game is taking longer than expected to load. Please refresh the page.');
        }, 30000); // 30 seconds timeout
    }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }
}

/**
 * Update loading status
 */
function updateLoadingStatus(status) {
    const loadingDetails = document.querySelector('.loading-details small');
    if (loadingDetails) {
        loadingDetails.textContent = status;
    }
    console.log(`📋 Loading: ${status}`);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h2>❌ Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">
                🔄 Reload Page
            </button>
        </div>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        color: white;
        text-align: center;
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * Show welcome message for new players
 */
function showWelcomeMessage() {
    const welcomeContent = `
        <div class="welcome-message">
            <h3>🎉 Welcome to Solo Adventure Mode!</h3>
            <div class="welcome-content">
                <p>You're about to embark on an epic solo journey. Here's what you need to know:</p>
                
                <div class="welcome-tips">
                    <div class="tip">
                        <h4>🎭 Choose Your Hero</h4>
                        <p>Select one character to train and adventure with. Each character has unique strengths and abilities.</p>
                    </div>
                    
                    <div class="tip">
                        <h4>💪 Train Regularly</h4>
                        <p>Use General Training for balanced growth, or Focused Training to boost specific stats.</p>
                    </div>
                    
                    <div class="tip">
                        <h4>🗡️ Solo Adventures</h4>
                        <p>Explore dungeons alone for greater rewards but higher risk. Strategic thinking is key!</p>
                    </div>
                    
                    <div class="tip">
                        <h4>⚡ Keyboard Shortcuts</h4>
                        <p>Press <kbd>T</kbd> for training, <kbd>D</kbd> for dungeons, <kbd>R</kbd> for rest, <kbd>H</kbd> for help.</p>
                    </div>
                </div>
                
                <p class="welcome-footer">Good luck, and may your solo adventures be legendary!</p>
            </div>
        </div>
    `;
    
    if (UIManager?.createModal) {
        const modal = UIManager.createModal('Welcome, Adventurer!', welcomeContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

/**
 * Show help modal
 */
function showHelpModal() {
    const helpContent = `
        <div class="help-content">
            <div class="help-section">
                <h4>🎮 Game Controls</h4>
                <div class="shortcut-list">
                    <div class="shortcut"><kbd>T</kbd> - Quick General Training</div>
                    <div class="shortcut"><kbd>D</kbd> - Open Dungeon Selection</div>
                    <div class="shortcut"><kbd>R</kbd> - Rest and Recover</div>
                    <div class="shortcut"><kbd>Ctrl+S</kbd> - Save Game</div>
                    <div class="shortcut"><kbd>Esc</kbd> - Close Modals / Game Menu</div>
                    <div class="shortcut"><kbd>H</kbd> or <kbd>?</kbd> - Show This Help</div>
                </div>
            </div>
            
            <div class="help-section">
                <h4>💡 Tips for Success</h4>
                <ul>
                    <li>Train regularly to improve your character's stats</li>
                    <li>Focus on your character's aptitudes for better training results</li>
                    <li>Rest when your health is low before entering dungeons</li>
                    <li>Start with easier dungeons and work your way up</li>
                    <li>Buy equipment to boost your character's capabilities</li>
                    <li>Monitor your gold and materials carefully</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>🏰 Solo Adventure Mode</h4>
                <ul>
                    <li>You control one powerful hero instead of a party</li>
                    <li>Solo adventures offer higher rewards but greater risk</li>
                    <li>Character progression is faster and more focused</li>
                    <li>Strategic decision-making is crucial for survival</li>
                </ul>
            </div>
        </div>
    `;
    
    if (UIManager?.createModal) {
        const modal = UIManager.createModal('Game Help', helpContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

/**
 * Utility functions
 */

// Debounce function to limit event frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Simple tooltip system
let currentTooltip = null;

function showTooltip(element, text) {
    hideTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        max-width: 250px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 8;
    
    // Adjust if tooltip goes off screen
    if (left < 0) left = 8;
    if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top < 0) {
        top = rect.bottom + 8;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    currentTooltip = tooltip;
}

function hideTooltip() {
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

/**
 * Development helpers (only in development mode)
 */
if (typeof window !== 'undefined') {
    // Expose useful functions globally for debugging
    window.dev = {
        gameState: () => window.gameState,
        resetGame: () => GameManager?.resetGame?.(),
        addGold: (amount) => window.gameState?.addResource('gold', amount),
        addMaterials: (amount) => window.gameState?.addResource('materials', amount),
        levelUpCharacter: () => {
            const char = window.gameState?.adventurer;
            if (char && char.gainExperience) {
                char.gainExperience(char.experienceToNext);
            }
        },
        showAllSections: () => {
            document.querySelectorAll('.game-section').forEach(section => {
                section.classList.remove('hidden');
            });
        }
    };
    
    console.log('🛠️ Development helpers available at window.dev');
}

/**
 * Application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, initializing application...');
    initializeApp();
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Do nothing, DOMContentLoaded will fire
} else {
    // DOM is already ready
    console.log('📱 DOM already ready, initializing application...');
    initializeApp();
}

console.log('✅ Main application script loaded');