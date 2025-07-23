/**
 * ===========================================
 * UI MANAGER
 * ===========================================
 * Manages all user interface updates, rendering, and interactions
 */

class UIManager {
    static instance = null;
    static currentSection = 'characterSelectionSection';
    static messageQueue = [];
    static isInitialized = false;
    static eventListeners = {};
    static animationQueue = [];

    constructor() {
        if (UIManager.instance) {
            return UIManager.instance;
        }
        UIManager.instance = this;
        
        this.lastUpdate = 0;
        this.refreshRate = 16; // ~60fps
        this.isUpdating = false;
    }

    /**
     * Initialize UI components and event listeners
     */
    static initialize() {
        if (this.isInitialized) return;
        
        console.log('🎨 Initializing UI Manager...');
        
        try {
            // Initialize display elements
            this.updateResourceDisplay();
            this.renderCharacterGrid();
            this.setupEventListeners();
            this.setupResizeHandlers();
            this.setupKeyboardShortcuts();
            this.injectRequiredCSS();
            
            // Setup update loop
            this.startUpdateLoop();
            
            this.isInitialized = true;
            console.log('✅ UI Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize UI Manager:', error);
            throw error;
        }
    }

    /**
     * Inject required CSS for UI components
     */
    static injectRequiredCSS() {
        const css = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-dialog {
                background: rgba(22, 33, 62, 0.95);
                border: 2px solid #3282b8;
                border-radius: 12px;
                padding: 20px;
                max-width: 80vw;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #3282b8;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: #bbe1fa;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                margin-bottom: 20px;
            }
            
            .modal-footer {
                text-align: right;
                padding-top: 15px;
                border-top: 1px solid #3282b8;
            }
            
            .message-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 1000;
                max-width: 350px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                font-weight: 600;
                border: 2px solid;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            
            .message-toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .message-toast.hide {
                opacity: 0;
                transform: translateX(100%);
            }
            
            .message-toast.error {
                background: #d32f2f;
                border-color: #b71c1c;
                color: white;
            }
            
            .message-toast.warning {
                background: #f57c00;
                border-color: #ef6c00;
                color: white;
            }
            
            .message-toast.info {
                background: #3282b8;
                border-color: #2968a3;
                color: white;
            }
            
            .message-toast.success {
                background: #4caf50;
                border-color: #388e3c;
                color: white;
            }
            
            .message-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .message-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
                padding: 0;
            }
            
            .touch-active {
                transform: scale(0.95) !important;
                transition: transform 0.1s !important;
            }
            
            .character-card.unavailable {
                opacity: 0.6;
                pointer-events: none;
            }
            
            .btn.unavailable {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn.ready {
                background: linear-gradient(135deg, #4caf50, #388e3c);
                animation: pulse-ready 2s infinite;
            }
            
            @keyframes pulse-ready {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .empty-party {
                text-align: center;
                padding: 40px 20px;
                color: #aaa;
                font-style: italic;
            }
            
            .stat-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 5px 0;
            }
            
            .stat-name {
                min-width: 80px;
                font-weight: 600;
            }
            
            .stat-value {
                min-width: 30px;
                text-align: right;
                font-weight: bold;
            }
            
            .stats-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                gap: 8px;
                margin: 10px 0;
            }
            
            .stat-compact {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: rgba(0, 0, 0, 0.3);
                padding: 8px 4px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .stat-compact span:first-child {
                font-weight: bold;
                color: #bbe1fa;
            }
            
            .health-mana-bars {
                margin: 10px 0;
            }
            
            .bar-container {
                margin: 5px 0;
            }
            
            .bar-label {
                font-size: 12px;
                margin-bottom: 2px;
            }
            
            .health-bar, .mana-bar {
                background: #333;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .health-fill {
                height: 100%;
                transition: width 0.3s ease;
                background: linear-gradient(90deg, #ff6b6b, #51cf66);
            }
            
            .mana-fill {
                height: 100%;
                transition: width 0.3s ease;
                background: linear-gradient(90deg, #495057, #74c0fc);
            }
            
            .archetype-badge {
                background: #3282b8;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
            }
            
            .character-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .selection-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #ffd700;
                color: #000;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .unlock-info {
                position: relative;
                margin-top: 10px;
            }
            
            .locked-overlay {
                background: rgba(0, 0, 0, 0.8);
                color: #ff6b6b;
                padding: 20px;
                text-align: center;
                font-weight: bold;
                border-radius: 8px;
            }
            
            .unlock-condition {
                margin-top: 5px;
                font-style: italic;
                color: #aaa;
            }
            
            .party-member-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .level-badge {
                background: #666;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
            }
            
            .party-member-info {
                margin: 10px 0;
                font-size: 14px;
            }
            
            .character-stats-summary h4 {
                margin: 15px 0 10px 0;
                color: #bbe1fa;
                font-size: 14px;
            }
            
            .performance-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 5px;
                font-size: 12px;
            }
            
            .perf-stat {
                display: flex;
                justify-content: space-between;
                padding: 2px 0;
            }
            
            .party-member-actions {
                margin-top: 15px;
                display: flex;
                gap: 8px;
            }
            
            .btn-small {
                padding: 6px 12px;
                font-size: 12px;
                min-height: 32px;
            }
            
            .party-member.unconscious {
                opacity: 0.6;
                border-color: #666;
            }
            
            .party-member.unconscious h3::after {
                content: " (Unconscious)";
                color: #ff6b6b;
                font-size: 12px;
            }
            
            .status-effects {
                margin: 10px 0;
            }
            
            .effects-list {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 5px;
            }
            
            .status-effect {
                padding: 2px 6px;
                border-radius: 12px;
                font-size: 11px;
                border: 1px solid;
            }
            
            .status-effect.positive {
                background: rgba(76, 175, 80, 0.2);
                border-color: #4caf50;
                color: #4caf50;
            }
            
            .status-effect.negative {
                background: rgba(244, 67, 54, 0.2);
                border-color: #f44336;
                color: #f44336;
            }
            
            .status-effect.neutral {
                background: rgba(158, 158, 158, 0.2);
                border-color: #9e9e9e;
                color: #9e9e9e;
            }
            
            .result-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }
            
            .result-timestamp {
                font-size: 12px;
                color: #aaa;
                margin-top: 10px;
            }
            
            .loading-screen.hidden {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }
            
            .critical {
                animation: pulse-critical 1s infinite;
            }
            
            @keyframes pulse-critical {
                0%, 100% { background-color: rgba(211, 47, 47, 0.8); }
                50% { background-color: rgba(211, 47, 47, 1); }
            }
            
            .warning {
                border-color: #f57c00 !important;
                background-color: rgba(245, 124, 0, 0.1);
            }
            
            @media (max-width: 768px) {
                .message-toast {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .modal-dialog {
                    max-width: 95vw;
                    margin: 10px;
                }
                
                .stats-compact {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    /**
     * Setup all event listeners
     */
    static setupEventListeners() {
        // Touch/click feedback for mobile
        this.setupTouchFeedback();
        
        // Window events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        // Visibility change for mobile battery optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
        
        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (typeof gameState !== 'undefined' && gameState.isDirty && gameState.isDirty()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    /**
     * Setup touch feedback for mobile devices
     */
    static setupTouchFeedback() {
        const feedbackElements = '.btn, .character-card, .party-member';
        
        // Touch start feedback
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches(feedbackElements)) {
                e.target.classList.add('touch-active');
                this.addTouchRipple(e.target, e.touches[0]);
            }
        }, { passive: true });
        
        // Touch end cleanup
        document.addEventListener('touchend', (e) => {
            if (e.target.matches(feedbackElements)) {
                setTimeout(() => {
                    e.target.classList.remove('touch-active');
                }, 150);
            }
        }, { passive: true });
        
        // Prevent zoom on double tap (iOS)
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
     * Add touch ripple effect
     */
    static addTouchRipple(element, touch) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: ${touch.clientX - rect.left - size / 2}px;
            top: ${touch.clientY - rect.top - size / 2}px;
            z-index: 100;
        `;
        
        // Add ripple animation
        const rippleKeyframes = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = rippleKeyframes;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Setup keyboard shortcuts
     */
    static setupKeyboardShortcuts() {
        const shortcuts = {
            't': () => ActionManager.trainParty(),
            'e': () => ActionManager.exploreDungeon(),
            'r': () => ActionManager.rest(),
            'b': () => ActionManager.buyEquipment(),
            'Escape': () => this.showGameMenu(),
            'F1': (e) => { e.preventDefault(); this.showHelp(); }
        };
        
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const shortcut = shortcuts[e.key] || shortcuts[e.code];
            if (shortcut) {
                e.preventDefault();
                shortcut(e);
            }
        });
    }

    /**
     * Setup resize handlers
     */
    static setupResizeHandlers() {
        // Debounced resize handler
        this.handleResize = this.debounce(() => {
            console.log('🔄 Window resized');
            // Trigger UI reflow if needed
            this.updateResourceDisplay();
        }, 250);
    }

    /**
     * Start the UI update loop
     */
    static startUpdateLoop() {
        const update = (timestamp) => {
            if (timestamp - this.lastUpdate >= this.refreshRate) {
                this.updateAnimations();
                this.processMessageQueue();
                this.lastUpdate = timestamp;
            }
            
            if (this.isInitialized) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    /**
     * Update resource display bar
     */
    static updateResourceDisplay() {
        const resourceBar = document.getElementById('resourceBar');
        if (!resourceBar || !gameState) return;
        
        const resources = gameState.resources || {};
        const turnsLeft = gameState.turnsLeft || 0;
        
        resourceBar.innerHTML = `
            <div class="resource" title="Gold earned from victories and quests">
                <strong>💰 Gold:</strong> ${this.formatNumber(resources.gold || 0)}
            </div>
            <div class="resource" title="Materials for crafting and upgrades">
                <strong>⚒️ Materials:</strong> ${this.formatNumber(resources.materials || 0)}
            </div>
            <div class="resource" title="Reputation with guilds and NPCs">
                <strong>⭐ Reputation:</strong> ${resources.reputation || 0}
            </div>
            <div class="turn-counter ${turnsLeft <= 5 ? 'critical' : ''}" title="Turns remaining before final battle">
                <strong>⏰ Turns Left:</strong> ${turnsLeft}
            </div>
        `;
        
        // Add warning styling if resources are low
        const goldResource = resourceBar.querySelector('.resource');
        if (resources.gold < 100) {
            goldResource.classList.add('warning');
        } else {
            goldResource.classList.remove('warning');
        }
    }

    /**
     * Render the character selection grid
     */
    static renderCharacterGrid() {
        const grid = document.getElementById('characterGrid');
        if (!grid || !gameState) return;
        
        grid.innerHTML = '';
        
        if (typeof CHARACTERS_DATA === 'undefined') {
            grid.innerHTML = '<p>Loading character data...</p>';
            return;
        }
        
        Object.keys(CHARACTERS_DATA).forEach(charId => {
            const charData = CHARACTERS_DATA[charId];
            const isUnlocked = gameState.unlockedCharacters.includes(charId);
            const isSelected = gameState.selectedCharacters.includes(charId);
            
            const card = this.createCharacterCard(charId, charData, isUnlocked, isSelected);
            grid.appendChild(card);
        });
        
        // Update confirm button state
        this.updateConfirmPartyButton();
    }

    /**
     * Create character card element
     */
    static createCharacterCard(charId, charData, isUnlocked, isSelected) {
        const card = document.createElement('div');
        card.className = `character-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        card.dataset.characterId = charId;
        
        if (isUnlocked) {
            card.onclick = () => this.selectCharacter(charId);
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectCharacter(charId);
                }
            });
        }
        
        // Create skill list HTML
        const skillsHTML = charData.skills.map(skillId => {
            const skill = SKILLS_DATA && SKILLS_DATA[skillId];
            if (!skill) {
                return `<div class="skill error" title="Skill data missing">⚠️ ${skillId}</div>`;
            }
            return `<div class="skill" title="${skill.description}">${skill.name}</div>`;
        }).join('');
        
        // Create stats display
        const statsHTML = Object.entries(charData.aptitudes).map(([stat, value]) => {
            return `
                <div class="stat-row">
                    <span class="stat-name">${this.capitalizeWords(stat)}:</span>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: ${value * 20}%"></div>
                    </div>
                    <span class="stat-value">${value}</span>
                </div>
            `;
        }).join('');
        
        card.innerHTML = `
            <div class="character-header">
                <h3>${charData.name}</h3>
                <span class="archetype-badge">${charData.archetype}</span>
            </div>
            <p class="character-description">${charData.description}</p>
            <div class="character-stats">
                <h4>Aptitudes</h4>
                <div class="stats-grid">
                    ${statsHTML}
                </div>
            </div>
            <div class="character-skills">
                <h4>Skills</h4>
                <div class="skills-list">
                    ${skillsHTML}
                </div>
            </div>
            ${!isUnlocked ? `
                <div class="unlock-info">
                    <div class="locked-overlay">🔒 LOCKED</div>
                    <small class="unlock-condition">${this.getUnlockDescription(charData.unlockCondition)}</small>
                </div>
            ` : ''}
            ${isSelected ? '<div class="selection-indicator">✓ Selected</div>' : ''}
        `;
        
        return card;
    }

    /**
     * Handle character selection
     */
    static selectCharacter(charId) {
        if (!gameState.unlockedCharacters.includes(charId)) {
            this.showMessage('This character is not unlocked yet!', 'warning');
            return;
        }
        
        const index = gameState.selectedCharacters.indexOf(charId);
        if (index > -1) {
            // Deselect character
            gameState.selectedCharacters.splice(index, 1);
            this.showMessage(`${CHARACTERS_DATA[charId]?.name} removed from party`, 'info');
        } else if (gameState.selectedCharacters.length < 4) {
            // Select character
            gameState.selectedCharacters.push(charId);
            this.showMessage(`${CHARACTERS_DATA[charId]?.name} added to party`, 'success');
        } else {
            this.showMessage('Party is full! Remove a character first.', 'warning');
            return;
        }
        
        // Update UI
        this.renderCharacterGrid();
        gameState.markDirty();
    }

    /**
     * Update confirm party button state
     */
    static updateConfirmPartyButton() {
        const confirmBtn = document.getElementById('confirmPartyBtn');
        if (!confirmBtn) return;
        
        const selectedCount = gameState.selectedCharacters?.length || 0;
        const isReady = selectedCount === 4;
        
        confirmBtn.disabled = !isReady;
        confirmBtn.textContent = `Confirm Party (${selectedCount}/4)`;
        
        if (isReady) {
            confirmBtn.classList.add('ready');
        } else {
            confirmBtn.classList.remove('ready');
        }
    }

    /**
     * Render current party display
     */
    static renderPartyDisplay() {
        const display = document.getElementById('partyDisplay');
        if (!display) return;
        
        if (!gameState.party || gameState.party.length === 0) {
            display.innerHTML = '<div class="empty-party">No party selected yet. Choose 4 characters to begin.</div>';
            return;
        }
        
        display.innerHTML = '';
        
        gameState.party.forEach((character, index) => {
            const memberElement = this.createPartyMemberElement(character, index);
            display.appendChild(memberElement);
        });
    }

    /**
     * Create party member element
     */
    static createPartyMemberElement(character, index) {
        const member = document.createElement('div');
        member.className = `party-member ${!character.isAlive() ? 'unconscious' : ''}`;
        member.dataset.characterIndex = index;
        
        const healthPercentage = character.getHealthPercentage ? character.getHealthPercentage() : 100;
        const manaPercentage = character.getManaPercentage ? character.getManaPercentage() : 100;
        
        const healthColor = this.getHealthColor(healthPercentage);
        const statusEffectsHTML = this.renderStatusEffects(character);
        
        member.innerHTML = `
            <div class="party-member-header">
                <h3>${character.name}</h3>
                <span class="level-badge">Lvl ${character.level || 1}</span>
            </div>
            
            <div class="party-member-info">
                <p><strong>Class:</strong> ${character.archetype}</p>
                <p><strong>Combat Rating:</strong> ${character.getCombatRating ? character.getCombatRating() : 'N/A'}</p>
            </div>
            
            <div class="health-mana-bars">
                <div class="bar-container">
                    <div class="bar-label">HP: ${character.currentHP}/${character.maxHP}</div>
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${healthPercentage}%; background-color: ${healthColor}"></div>
                    </div>
                </div>
                <div class="bar-container">
                    <div class="bar-label">MP: ${character.currentMP}/${character.maxMP}</div>
                    <div class="mana-bar">
                        <div class="mana-fill" style="width: ${manaPercentage}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="character-stats-summary">
                <h4>Stats</h4>
                <div class="stats-compact">
                    ${Object.entries(character.stats || {}).map(([stat, value]) => `
                        <div class="stat-compact">
                            <span>${stat.substr(0, 3).toUpperCase()}</span>
                            <span>${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${statusEffectsHTML}
            
            <div class="combat-performance">
                <h4>Performance</h4>
                <div class="performance-stats">
                    <div class="perf-stat">
                        <span>Damage:</span>
                        <span>${this.formatNumber(character.combatStats?.damageDealt || 0)}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Healing:</span>
                        <span>${this.formatNumber(character.combatStats?.healingDone || 0)}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Wins:</span>
                        <span>${character.combatStats?.combatsWon || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="party-member-actions">
                <button class="btn btn-small" onclick="UIManager.showCharacterDetails(${index})" title="View detailed stats">
                    📊 Details
                </button>
                <button class="btn btn-small" onclick="ActionManager.trainIndividual(${index})" title="Train this character individually">
                    🎓 Train
                </button>
            </div>
        `;
        
        return member;
    }

    /**
     * Render status effects for character
     */
    static renderStatusEffects(character) {
        if (!character.statusEffects || character.statusEffects.length === 0) {
            return '';
        }
        
        const effectsHTML = character.statusEffects.map(effect => {
            const effectClass = this.getStatusEffectClass(effect.type);
            const durationText = effect.duration > 0 ? `(${effect.duration})` : '';
            
            return `
                <span class="status-effect ${effectClass}" title="${effect.type}">
                    ${this.getStatusEffectIcon(effect.type)} ${durationText}
                </span>
            `;
        }).join('');
        
        return `
            <div class="status-effects">
                <h4>Status Effects</h4>
                <div class="effects-list">${effectsHTML}</div>
            </div>
        `;
    }

    /**
     * Get health bar color based on percentage
     */
    static getHealthColor(percentage) {
        if (percentage > 70) return '#51cf66';
        if (percentage > 30) return '#ffd43b';
        if (percentage > 10) return '#ff922b';
        return '#ff6b6b';
    }

    /**
     * Get status effect CSS class
     */
    static getStatusEffectClass(effectType) {
        const classes = {
            'poisoned': 'negative',
            'burning': 'negative',
            'stunned': 'negative',
            'fear': 'negative',
            'blessed': 'positive',
            'regeneration': 'positive',
            'damage_reduction': 'positive',
            'might_bonus': 'positive'
        };
        return classes[effectType] || 'neutral';
    }

    /**
     * Get status effect icon
     */
    static getStatusEffectIcon(effectType) {
        const icons = {
            'poisoned': '☠️',
            'burning': '🔥',
            'stunned': '😵',
            'fear': '😨',
            'blessed': '✨',
            'regeneration': '💚',
            'damage_reduction': '🛡️',
            'might_bonus': '💪'
        };
        return icons[effectType] || '❓';
    }

    /**
     * Update combat log display
     */
    static updateCombatLog(message, className = '') {
        const log = document.getElementById('combatLog');
        if (!log) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${className}`;
        entry.textContent = message;
        
        // Add timestamp for detailed logs
        if (gameState.settings?.showDetailedLogs) {
            const timestamp = new Date().toLocaleTimeString();
            entry.setAttribute('data-timestamp', timestamp);
        }
        
        log.appendChild(entry);
        
        // Auto-scroll to bottom
        log.scrollTop = log.scrollHeight;
        
        // Limit log entries for performance
        const maxEntries = UI_CONFIG?.MAX_COMBAT_LOG_ENTRIES || 100;
        while (log.children.length > maxEntries) {
            log.removeChild(log.firstChild);
        }
        
        // Highlight important entries
        if (className.includes('death') || className.includes('victory')) {
            entry.classList.add('important');
            setTimeout(() => entry.classList.remove('important'), 3000);
        }
    }

    /**
     * Clear combat log
     */
    static clearCombatLog() {
        const log = document.getElementById('combatLog');
        if (log) {
            log.innerHTML = '';
        }
    }

    /**
     * Show game results
     */
    static showResults(message, type = 'info') {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');
        
        if (!resultsSection || !resultsContent) return;
        
        const resultClass = type === 'victory' ? 'victory' : 
                           type === 'defeat' ? 'defeat' : 'neutral';
        
        resultsContent.innerHTML = `
            <div class="dungeon-results ${resultClass}">
                <div class="result-icon">${this.getResultIcon(type)}</div>
                <h3>${message}</h3>
                <div class="result-timestamp">
                    ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
        
        this.showSection('resultsSection');
        
        // Update displays
        this.updateResourceDisplay();
        this.renderPartyDisplay();
        
        // Check for game end conditions
        if (gameState.turnsLeft <= 0 && type !== 'victory') {
            setTimeout(() => {
                this.showMessage('Time is up! You must face the Demon Lord now!', 'warning');
            }, 2000);
        }
        
        // Auto-save after results
        if (gameState.settings?.autoSave) {
            gameState.save();
        }
    }

    /**
     * Get result icon for different result types
     */
    static getResultIcon(type) {
        const icons = {
            victory: '🎉',
            defeat: '💀',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅',
            error: '❌'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Show specific game section
     */
    static showSection(sectionId) {
        // Hide all major sections
        const sections = [
            'characterSelectionSection',
            'partySection', 
            'actionsSection',
            'combatSection',
            'resultsSection'
        ];
        
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // Show requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentSection = sectionId;
            
            // Add section-specific behavior
            this.onSectionShown(sectionId);
        }
    }

    /**
     * Handle section-specific behavior when shown
     */
    static onSectionShown(sectionId) {
        switch (sectionId) {
            case 'combatSection':
                // Auto-scroll combat log to bottom
                setTimeout(() => {
                    const log = document.getElementById('combatLog');
                    if (log) log.scrollTop = log.scrollHeight;
                }, 100);
                break;
                
            case 'partySection':
                this.renderPartyDisplay();
                break;
                
            case 'actionsSection':
                this.updateActionButtonStates();
                break;
        }
    }

    /**
     * Update action button states based on current game state
     */
    static updateActionButtonStates() {
        if (typeof ActionManager === 'undefined') return;
        
        const availableActions = ActionManager.getAvailableActions();
        
        availableActions.forEach(action => {
            const button = document.querySelector(`button[onclick*="${action.type}"]`);
            if (button) {
                button.disabled = !action.available;
                button.title = action.available ? 
                    `Cost: ${this.formatActionCosts(action.costs)}` : 
                    action.reason;
                    
                if (!action.available) {
                    button.classList.add('unavailable');
                } else {
                    button.classList.remove('unavailable');
                }
            }
        });
    }

    /**
     * Format action costs for display
     */
    static formatActionCosts(costs) {
        return Object.entries(costs)
            .filter(([resource, amount]) => typeof amount === 'number')
            .map(([resource, amount]) => `${amount} ${resource}`)
            .join(', ');
    }

    /**
     * Show temporary message to user
     */
    static showMessage(message, type = 'info', duration = 3000) {
        const messageData = {
            message,
            type,
            duration,
            timestamp: Date.now(),
            id: Helpers.String.randomString(8)
        };
        
        this.messageQueue.push(messageData);
        this.displayMessage(messageData);
    }

    /**
     * Display message on screen
     */
    static displayMessage(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${messageData.type}`;
        messageDiv.id = `message-${messageData.id}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${this.getResultIcon(messageData.type)}</span>
                <span class="message-text">${messageData.message}</span>
            </div>
            <button class="message-close" onclick="UIManager.dismissMessage('${messageData.id}')">×</button>
        `;
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => messageDiv.classList.add('show'), 10);
        
        // Auto-dismiss
        setTimeout(() => {
            this.dismissMessage(messageData.id);
        }, messageData.duration);
    }

    /**
     * Dismiss message
     */
    static dismissMessage(messageId) {
        const messageDiv = document.getElementById(`message-${messageId}`);
        if (messageDiv) {
            messageDiv.classList.add('hide');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }

    /**
     * Process message queue
     */
    static processMessageQueue() {
        const now = Date.now();
        this.messageQueue = this.messageQueue.filter(msg => {
            return now - msg.timestamp < msg.duration + 1000; // Keep for animation
        });
    }

    /**
     * Show character details modal
     */
    static showCharacterDetails(characterIndex) {
        const character = gameState.party[characterIndex];
        if (!character) return;
        
        const modal = this.createModal('Character Details', this.renderCharacterDetailsContent(character));
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Render character details content
     */
    static renderCharacterDetailsContent(character) {
        const availableSkills = character.checkSkillLearning ? character.checkSkillLearning() : [];
        const relationships = character.relationships || {};
        
        return `
            <div class="character-details">
                <div class="character-overview">
                    <h3>${character.name}</h3>
                    <p>Level ${character.level || 1} ${character.archetype}</p>
                    <p>Combat Rating: ${character.getCombatRating ? character.getCombatRating() : 'N/A'}</p>
                </div>
                
                <div class="detailed-stats">
                    <h4>Detailed Stats</h4>
                    <div class="stats-table">
                        ${Object.entries(character.stats || {}).map(([stat, value]) => `
                            <div class="stat-row-detailed">
                                <span class="stat-name">${this.capitalizeWords(stat)}</span>
                                <span class="stat-value">${value}</span>
                                <div class="stat-bar-small">
                                    <div class="stat-fill" style="width: ${Math.min(100, value / 10)}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="skills-detailed">
                    <h4>Known Skills (${character.learnedSkills?.length || 0})</h4>
                    <div class="skills-grid">
                        ${(character.learnedSkills || []).map(skillId => {
                            const skill = SKILLS_DATA?.[skillId];
                            if (!skill) return '';
                            const activationChance = character.getSkillActivationChance ? 
                                character.getSkillActivationChance(skillId) : 0;
                            const isMastered = character.masteredSkills?.includes(skillId);
                            
                            return `
                                <div class="skill-detailed ${isMastered ? 'mastered' : ''}">
                                    <div class="skill-header">
                                        <span class="skill-name">${skill.name}</span>
                                        ${isMastered ? '<span class="mastery-badge">⭐</span>' : ''}
                                    </div>
                                    <div class="skill-info">
                                        <p class="skill-description">${skill.description}</p>
                                        <p class="skill-chance">Activation: ${activationChance}%</p>
                                        <p class="skill-trigger">Trigger: ${skill.trigger.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                ${availableSkills.length > 0 ? `
                    <div class="available-skills">
                        <h4>Can Learn (${availableSkills.length})</h4>
                        <div class="skills-list">
                            ${availableSkills.map(skillId => {
                                const skill = SKILLS_DATA?.[skillId];
                                return skill ? `<span class="skill-available">${skill.name}</span>` : '';
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="combat-statistics">
                    <h4>Combat Statistics</h4>
                    <div class="stats-grid">
                        ${Object.entries(character.combatStats || {}).map(([stat, value]) => `
                            <div class="stat-item">
                                <span class="stat-label">${this.capitalizeWords(stat.replace(/([A-Z])/g, ' $1'))}</span>
                                <span class="stat-value">${this.formatNumber(value)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${Object.keys(relationships).length > 0 ? `
                    <div class="relationships">
                        <h4>Party Relationships</h4>
                        <div class="relationships-list">
                            ${Object.entries(relationships).map(([charId, value]) => {
                                const otherChar = gameState.party.find(c => c.id === charId);
                                const level = character.getRelationshipLevel ? character.getRelationshipLevel(charId) : 'strangers';
                                return otherChar ? `
                                    <div class="relationship-item">
                                        <span>${otherChar.name}</span>
                                        <span class="relationship-level ${level}">${level.replace('_', ' ')}</span>
                                        <span class="relationship-value">(${value})</span>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create modal dialog
     */
    static createModal(title, content, actions = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${actions || '<button class="btn" onclick="this.closest(\'.modal-overlay\').remove()">Close</button>'}
                </div>
            </div>
        `;
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        return modal;
    }

    /**
     * Show game menu
     */
    static showGameMenu() {
        const menuContent = `
            <div class="game-menu-content">
                <div class="menu-section">
                    <h3>Game</h3>
                    <button class="btn menu-btn" onclick="gameState.save(); UIManager.showMessage('Game Saved!', 'success'); this.closest('.modal-overlay').remove()">💾 Save Game</button>
                    <button class="btn menu-btn" onclick="gameState.load(); UIManager.showMessage('Game Loaded!', 'success'); this.closest('.modal-overlay').remove()">📂 Load Game</button>
                    <button class="btn menu-btn btn-danger" onclick="if(confirm('Start new game? Current progress will be lost.')) { GameManager.newRun(); this.closest('.modal-overlay').remove(); }">🆕 New Game</button>
                </div>
                
                <div class="menu-section">
                    <h3>Settings</h3>
                    <button class="btn menu-btn" onclick="UIManager.showSettings()">⚙️ Settings</button>
                    <button class="btn menu-btn" onclick="UIManager.showStatistics()">📊 Statistics</button>
                </div>
                
                <div class="menu-section">
                    <h3>Help</h3>
                    <button class="btn menu-btn" onclick="UIManager.showHelp()">❓ How to Play</button>
                    <button class="btn menu-btn" onclick="UIManager.showAbout()">ℹ️ About</button>
                </div>
            </div>
        `;
        
        const actions = `
            <button class="btn" onclick="this.closest('.modal-overlay').remove()">Close Menu</button>
        `;
        
        const modal = this.createModal('Game Menu', menuContent, actions);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Show help screen
     */
    static showHelp() {
        const helpContent = `
            <div class="help-content">
                <div class="help-section">
                    <h3>🎯 Objective</h3>
                    <p>Build and train a party of 4 adventurers to defeat the Demon Lord within 20 turns.</p>
                </div>
                
                <div class="help-section">
                    <h3>⌨️ Controls</h3>
                    <ul>
                        <li><kbd>T</kbd> - Train Party</li>
                        <li><kbd>E</kbd> - Explore Dungeon</li>
                        <li><kbd>R</kbd> - Rest & Recover</li>
                        <li><kbd>B</kbd> - Buy Equipment</li>
                        <li><kbd>Esc</kbd> - Game Menu</li>
                        <li><kbd>F1</kbd> - This Help</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>🎮 Gameplay</h3>
                    <ul>
                        <li><strong>Character Selection:</strong> Choose 4 characters with different roles (Tank, Healer, DPS, Caster)</li>
                        <li><strong>Training:</strong> Improve your party's stats to prepare for tougher challenges</li>
                        <li><strong>Dungeon Exploration:</strong> Auto-battle encounters that reward gold and materials</li>
                        <li><strong>Equipment:</strong> Spend resources to permanently improve character abilities</li>
                        <li><strong>Rest:</strong> Heal your party and clear negative status effects</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>⚔️ Combat</h3>
                    <p>Combat is fully automated. Success depends on:</p>
                    <ul>
                        <li><strong>Party Composition:</strong> Balanced teams perform better</li>
                        <li><strong>Character Stats:</strong> Higher stats increase skill activation chances</li>
                        <li><strong>Skill Synergy:</strong> Different skills trigger based on battle conditions</li>
                        <li><strong>Equipment:</strong> Better gear provides permanent stat bonuses</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>📈 Tips for Success</h3>
                    <ul>
                        <li>Train regularly to improve skill activation chances</li>
                        <li>Rest after difficult battles to recover health and clear debuffs</li>
                        <li>Balance your party with different character archetypes</li>
                        <li>Don't wait until the last turn to attempt the Demon Lord</li>
                        <li>Experiment with different character combinations</li>
                    </ul>
                </div>
            </div>
        `;
        
        const modal = this.createModal('How to Play', helpContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Show settings screen
     */
    static showSettings() {
        const settings = gameState.settings || {};
        
        const settingsContent = `
            <div class="settings-content">
                <div class="setting-group">
                    <h3>Game Settings</h3>
                    <label class="setting-item">
                        <input type="checkbox" ${settings.autoSave ? 'checked' : ''} onchange="UIManager.updateSetting('autoSave', this.checked)">
                        Auto-save game progress
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" ${settings.showDetailedLogs ? 'checked' : ''} onchange="UIManager.updateSetting('showDetailedLogs', this.checked)">
                        Show detailed combat logs
                    </label>
                </div>
                
                <div class="setting-group">
                    <h3>Combat Settings</h3>
                    <label class="setting-item">
                        <span>Combat Speed:</span>
                        <input type="range" min="0.5" max="3" step="0.1" value="${settings.combatSpeed || 1}" 
                               onchange="UIManager.updateSetting('combatSpeed', parseFloat(this.value)); this.nextElementSibling.textContent = this.value + 'x'">
                        <span>${settings.combatSpeed || 1}x</span>
                    </label>
                </div>
                
                <div class="setting-group">
                    <h3>Audio Settings</h3>
                    <label class="setting-item">
                        <input type="checkbox" ${settings.soundEnabled ? 'checked' : ''} onchange="UIManager.updateSetting('soundEnabled', this.checked)">
                        Sound Effects
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" ${settings.musicEnabled ? 'checked' : ''} onchange="UIManager.updateSetting('musicEnabled', this.checked)">
                        Background Music
                    </label>
                </div>
            </div>
        `;
        
        const modal = this.createModal('Settings', settingsContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Update a game setting
     */
    static updateSetting(key, value) {
        if (!gameState.settings) {
            gameState.settings = {};
        }
        gameState.settings[key] = value;
        gameState.markDirty();
        
        // Apply setting immediately
        switch (key) {
            case 'combatSpeed':
                if (typeof CombatManager !== 'undefined') {
                    CombatManager.setCombatSpeed(value);
                }
                break;
        }
        
        this.showMessage(`Setting updated: ${key}`, 'success');
    }

    /**
     * Show statistics screen
     */
    static showStatistics() {
        const stats = gameState.statistics || {};
        const playtime = gameState.getFormattedPlayTime ? gameState.getFormattedPlayTime() : 'Unknown';
        
        const statsContent = `
            <div class="statistics-content">
                <div class="stats-section">
                    <h3>Game Progress</h3>
                    <div class="stat-row"><span>Current Season:</span> <span>${gameState.currentSeason || 1}</span></div>
                    <div class="stat-row"><span>Total Playtime:</span> <span>${playtime}</span></div>
                    <div class="stat-row"><span>Characters Unlocked:</span> <span>${gameState.unlockedCharacters?.length || 4}</span></div>
                    <div class="stat-row"><span>Achievements:</span> <span>${gameState.achievements?.length || 0}</span></div>
                </div>
                
                <div class="stats-section">
                    <h3>Combat Statistics</h3>
                    <div class="stat-row"><span>Dungeons Completed:</span> <span>${stats.dungeonsCompleted || 0}</span></div>
                    <div class="stat-row"><span>Enemies Defeated:</span> <span>${stats.enemiesDefeated || 0}</span></div>
                    <div class="stat-row"><span>Total Damage Dealt:</span> <span>${this.formatNumber(stats.totalDamageDealt || 0)}</span></div>
                    <div class="stat-row"><span>Total Damage Taken:</span> <span>${this.formatNumber(stats.totalDamageTaken || 0)}</span></div>
                    <div class="stat-row"><span>Demon Lord Victories:</span> <span>${stats.victoriesAgainstDemonLord || 0}</span></div>
                </div>
                
                <div class="stats-section">
                    <h3>Resources</h3>
                    <div class="stat-row"><span>Total Gold Earned:</span> <span>${this.formatNumber(stats.totalGoldEarned || 0)}</span></div>
                    <div class="stat-row"><span>Materials Gathered:</span> <span>${this.formatNumber(stats.totalMaterialsGathered || 0)}</span></div>
                    <div class="stat-row"><span>Skills Learned:</span> <span>${stats.skillsLearned || 0}</span></div>
                </div>
            </div>
        `;
        
        const modal = this.createModal('Statistics', statsContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Show about screen
     */
    static showAbout() {
        const aboutContent = `
            <div class="about-content">
                <h3>🏰 Dungeon Lords Manager</h3>
                <p><strong>Version:</strong> ${APP_INFO?.VERSION || '1.0.0'}</p>
                <p><strong>Description:</strong> A turn-based party management game where you build and train adventurers to defeat the ultimate evil.</p>
                
                <h4>Game Features:</h4>
                <ul>
                    <li>10 unique character archetypes with different skills</li>
                    <li>6 challenging dungeons with progressive difficulty</li>
                    <li>Auto-battle combat with tactical depth</li>
                    <li>20-turn time limit creating strategic pressure</li>
                    <li>Character progression and equipment systems</li>
                    <li>Achievement and unlock systems</li>
                </ul>
                
                <h4>Technologies Used:</h4>
                <ul>
                    <li>Vanilla JavaScript (ES6+)</li>
                    <li>CSS3 with animations and responsive design</li>
                    <li>LocalStorage for save/load functionality</li>
                    <li>Mobile-first responsive design</li>
                </ul>
                
                <p style="text-align: center; margin-top: 20px;">
                    <em>Defeat the Demon Lord and save the realm!</em>
                </p>
            </div>
        `;
        
        const modal = this.createModal('About', aboutContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Hide loading screen
     */
    static hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * Show loading screen
     */
    static showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Update loading progress text
     */
    static updateLoadingProgress(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            const progressText = loadingScreen.querySelector('p');
            if (progressText) {
                progressText.textContent = message;
            }
            
            const detailsText = loadingScreen.querySelector('.loading-details small');
            if (detailsText) {
                detailsText.textContent = message;
            }
        }
    }

    /**
     * Utility methods
     */

    static formatNumber(num) {
        return Helpers.String.formatNumber(num);
    }

    static capitalizeWords(str) {
        return Helpers.String.camelToTitle(str);
    }

    static getUnlockDescription(condition) {
        const descriptions = {
            'starter': 'Available from start',
            'complete_3_dungeons': 'Complete 3 dungeon expeditions',
            'defeat_boss_low_hp': 'Defeat a boss while a party member has less than 10% HP',
            'max_spirit_might': 'Have a character with maximum Spirit and Might stats',
            'complete_dungeon_no_damage': 'Complete a dungeon without taking damage',
            'defeat_demon_lieutenant_magic': 'Defeat a Demon Lieutenant using primarily magic',
            'survive_party_wipe': 'Survive a party wipe through special circumstances'
        };
        return descriptions[condition] || 'Complete special requirements';
    }

    static debounce(func, wait) {
        return Helpers.Time.debounce(func, wait);
    }

    static handleResize() {
        // Handle responsive layout changes
        console.log('🔄 Window resized');
        this.updateResourceDisplay();
    }

    static handleOrientationChange() {
        // Handle mobile orientation changes
        console.log('🔄 Orientation changed');
        setTimeout(() => {
            this.updateResourceDisplay();
            this.renderPartyDisplay();
        }, 100);
    }

    static onPageHidden() {
        // Pause updates when page is hidden (mobile battery optimization)
        this.isUpdating = false;
    }

    static updateAnimations() {
        // Process any queued animations
        if (this.animationQueue.length > 0) {
            this.animationQueue.forEach((animation, index) => {
                // Process animation frame
                if (animation.update) {
                    animation.update();
                }
                
                // Remove completed animations
                if (animation.completed) {
                    this.animationQueue.splice(index, 1);
                }
            });
        }
    }

    /**
     * Update method for game loop integration
     */
    static update(deltaTime) {
        if (!this.isUpdating) return;
        
        // Update any time-based UI elements
        this.updateAnimations();
        
        // Process message queue
        this.processMessageQueue();
        
        // Update resource display if needed
        if (Date.now() - this.lastUpdate > 1000) { // Every second
            this.updateResourceDisplay();
            this.lastUpdate = Date.now();
        }
    }

    /**
     * Add animation to queue
     */
    static addAnimation(animation) {
        this.animationQueue.push(animation);
    }

    /**
     * Remove all animations
     */
    static clearAnimations() {
        this.animationQueue = [];
    }

    /**
     * Create a simple animation object
     */
    static createAnimation(element, properties, duration, easing = 'ease') {
        return {
            element,
            properties,
            duration,
            easing,
            startTime: Date.now(),
            completed: false,
            update() {
                const elapsed = Date.now() - this.startTime;
                const progress = Math.min(elapsed / this.duration, 1);
                
                // Apply easing
                let easedProgress = progress;
                if (this.easing === 'ease-out') {
                    easedProgress = 1 - Math.pow(1 - progress, 2);
                } else if (this.easing === 'ease-in') {
                    easedProgress = Math.pow(progress, 2);
                }
                
                // Update element properties
                Object.entries(this.properties).forEach(([prop, endValue]) => {
                    const currentValue = parseFloat(this.element.style[prop] || 0);
                    const newValue = currentValue + (endValue - currentValue) * easedProgress;
                    this.element.style[prop] = `${newValue}px`;
                });
                
                if (progress >= 1) {
                    this.completed = true;
                }
            }
        };
    }

    /**
     * Smooth scroll to element
     */
    static scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementTop = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = elementTop - startPosition;
        const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
        
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startPosition + distance * easeProgress);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }

    /**
     * Flash element to draw attention
     */
    static flashElement(element, color = '#ffd700', duration = 1000) {
        if (!element) return;
        
        const originalBorder = element.style.border;
        const originalBoxShadow = element.style.boxShadow;
        
        element.style.border = `2px solid ${color}`;
        element.style.boxShadow = `0 0 20px ${color}`;
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.boxShadow = originalBoxShadow;
            
            setTimeout(() => {
                element.style.transition = '';
            }, 300);
        }, duration);
    }

    /**
     * Shake element (for errors or warnings)
     */
    static shakeElement(element, intensity = 10, duration = 500) {
        if (!element) return;
        
        const originalTransform = element.style.transform;
        const startTime = Date.now();
        
        function shake() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const amplitude = intensity * (1 - progress);
                const x = Math.sin(elapsed * 0.02) * amplitude;
                element.style.transform = `translateX(${x}px)`;
                requestAnimationFrame(shake);
            } else {
                element.style.transform = originalTransform;
            }
        }
        
        shake();
    }

    /**
     * Pulse element
     */
    static pulseElement(element, scale = 1.1, duration = 1000) {
        if (!element) return;
        
        const originalTransform = element.style.transform;
        element.style.transition = `transform ${duration}ms ease-in-out`;
        element.style.transform = `scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = originalTransform;
            setTimeout(() => {
                element.style.transition = '';
            }, duration);
        }, duration / 2);
    }

    /**
     * Show tooltip
     */
    static showTooltip(element, content, position = 'top') {
        this.hideTooltip(); // Hide any existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.className = 'ui-tooltip';
        tooltip.innerHTML = content;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 8;
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 8;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 8;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = rect.right + 8;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
        }
        
        // Keep tooltip in viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Show tooltip
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        // Store reference for cleanup
        this.currentTooltip = tooltip;
    }

    /**
     * Hide tooltip
     */
    static hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.opacity = '0';
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 200);
        }
    }

    /**
     * Setup tooltip listeners for elements with data-tooltip
     */
    static setupTooltips() {
        document.addEventListener('mouseover', (e) => {
            const tooltip = e.target.getAttribute('data-tooltip');
            if (tooltip) {
                this.showTooltip(e.target, tooltip);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        });
    }

    /**
     * Create loading overlay
     */
    static showLoadingOverlay(message = 'Loading...') {
        this.hideLoadingOverlay(); // Remove any existing overlay
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        this.currentLoadingOverlay = overlay;
        
        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
    }

    /**
     * Hide loading overlay
     */
    static hideLoadingOverlay() {
        if (this.currentLoadingOverlay) {
            this.currentLoadingOverlay.style.opacity = '0';
            setTimeout(() => {
                if (this.currentLoadingOverlay && this.currentLoadingOverlay.parentNode) {
                    this.currentLoadingOverlay.parentNode.removeChild(this.currentLoadingOverlay);
                }
                this.currentLoadingOverlay = null;
            }, 300);
        }
    }

    /**
     * Create notification badge
     */
    static showNotificationBadge(element, count) {
        // Remove existing badge
        const existingBadge = element.querySelector('.notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        if (count <= 0) return;
        
        const badge = document.createElement('div');
        badge.className = 'notification-badge';
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
        `;
        
        element.style.position = 'relative';
        element.appendChild(badge);
    }

    /**
     * Initialize all UI systems
     */
    static initializeAll() {
        this.initialize();
        this.setupTooltips();
        this.injectRequiredCSS();
        
        // Setup global error handler for UI
        window.addEventListener('error', (e) => {
            this.showMessage('An unexpected error occurred', 'error');
            console.error('UI Error:', e);
        });
        
        console.log('🎨 UIManager fully initialized');
    }

    /**
     * Cleanup method
     */
    static cleanup() {
        this.isInitialized = false;
        this.clearAnimations();
        this.hideTooltip();
        this.hideLoadingOverlay();
        this.messageQueue = [];
        
        // Clear any timers or intervals
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        console.log('🧹 UIManager cleaned up');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
    console.log('✅ UIManager loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}