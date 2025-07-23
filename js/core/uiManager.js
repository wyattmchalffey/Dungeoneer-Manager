/**
 * ===========================================
 * UI MANAGER - SINGLE CHARACTER
 * ===========================================
 * User interface management for single character mode
 */

class UIManager {
    static currentSection = null;
    static messageQueue = [];
    static isAnimating = false;

    /**
     * Show specific game section
     */
    static showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show requested section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            this.currentSection = sectionId;
            console.log(`📱 Showing section: ${sectionId}`);
        }
    }

    /**
     * Update resource display
     */
    static updateResourceDisplay() {
        const resourceBar = document.getElementById('resourceBar');
        if (!resourceBar || !gameState) return;

        const resources = gameState.resources;
        
        resourceBar.innerHTML = `
            <div class="resource-item">
                <span class="resource-icon">💰</span>
                <span class="resource-value">${resources.gold}</span>
                <span class="resource-label">Gold</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🔧</span>
                <span class="resource-value">${resources.materials}</span>
                <span class="resource-label">Materials</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">⭐</span>
                <span class="resource-value">${resources.reputation}</span>
                <span class="resource-label">Reputation</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">📅</span>
                <span class="resource-value">${gameState.turnsLeft}</span>
                <span class="resource-label">Turns Left</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🍂</span>
                <span class="resource-value">${gameState.currentSeason}</span>
                <span class="resource-label">Season</span>
            </div>
        `;
    }

    /**
     * Render character selection grid
     */
    static renderCharacterGrid() {
        const grid = document.getElementById('characterGrid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.entries(CHARACTERS_DATA).forEach(([charId, charData]) => {
            const card = this.createCharacterCard(charId, charData);
            grid.appendChild(card);
        });

        this.updateConfirmCharacterButton();
    }

    /**
     * Create character selection card
     */
    static createCharacterCard(charId, charData) {
        const isUnlocked = gameState.unlockedCharacters.includes(charId);
        const isSelected = gameState.selectedCharacter === charId;
        
        const card = document.createElement('div');
        card.className = `character-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        card.onclick = isUnlocked ? () => this.selectCharacter(charId) : null;
        
        card.innerHTML = `
            <div class="character-portrait">
                <div class="character-archetype">${charData.archetype}</div>
                ${!isUnlocked ? '<div class="locked-overlay">🔒</div>' : ''}
            </div>
            <div class="character-info">
                <h3>${charData.name}</h3>
                <p class="character-description">${charData.description}</p>
                
                <div class="character-stats">
                    <h4>Base Aptitudes</h4>
                    <div class="aptitude-grid">
                        ${Object.entries(charData.aptitudes).map(([stat, value]) => 
                            `<div class="aptitude-item">
                                <span class="stat-name">${Helpers.String.camelToTitle(stat)}</span>
                                <span class="stat-value">${value}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                ${!isUnlocked ? `
                    <div class="unlock-info">
                        <div class="unlock-condition">
                            ${this.getUnlockCondition(charId)}
                        </div>
                    </div>
                ` : ''}
            </div>
            ${isSelected ? '<div class="selection-indicator">✓ Selected</div>' : ''}
        `;
        
        return card;
    }

    /**
     * Get unlock condition text for character
     */
    static getUnlockCondition(charId) {
        const conditions = {
            'berserker': 'Win 5 solo battles',
            'paladin': 'Complete 3 dungeons as Guardian',
            'assassin': 'Defeat 20 enemies as Rogue',
            'archmage': 'Learn 10 skills as Mage'
        };
        
        return conditions[charId] || 'Complete special requirements';
    }

    /**
     * Handle character selection
     */
    static selectCharacter(charId) {
        if (!gameState.unlockedCharacters.includes(charId)) {
            this.showMessage('This character is not unlocked yet!', 'warning');
            return;
        }
        
        // Set selected character
        gameState.setSelectedCharacter(charId);
        this.showMessage(`${CHARACTERS_DATA[charId]?.name} selected!`, 'success');
        
        // Update UI
        this.renderCharacterGrid();
        gameState.markDirty();
    }

    /**
     * Update confirm character button state
     */
    static updateConfirmCharacterButton() {
        const confirmBtn = document.getElementById('confirmCharacterBtn');
        if (!confirmBtn) return;
        
        const hasSelection = gameState.selectedCharacter !== null;
        const characterName = hasSelection ? CHARACTERS_DATA[gameState.selectedCharacter]?.name : '';
        
        confirmBtn.disabled = !hasSelection;
        confirmBtn.textContent = hasSelection ? `Confirm ${characterName}` : 'Select a Character';
        
        if (hasSelection) {
            confirmBtn.classList.add('ready');
        } else {
            confirmBtn.classList.remove('ready');
        }
    }

    /**
     * Render current character display
     */
    static renderCharacterDisplay() {
        const display = document.getElementById('characterDisplay');
        if (!display) return;
        
        if (!gameState.adventurer) {
            display.innerHTML = '<div class="empty-character">No character selected yet. Choose a character to begin.</div>';
            return;
        }
        
        const character = gameState.adventurer;
        const element = this.createCharacterDisplayElement(character);
        display.innerHTML = '';
        display.appendChild(element);
    }

    /**
     * Create detailed character display element
     */
    static createCharacterDisplayElement(character) {
        const container = document.createElement('div');
        container.className = `character-display ${!character.isAlive() ? 'unconscious' : ''}`;
        
        const healthPercentage = character.getHealthPercentage ? character.getHealthPercentage() : 100;
        const manaPercentage = character.getManaPercentage ? character.getManaPercentage() : 100;
        const expPercentage = character.getExperiencePercentage ? character.getExperiencePercentage() : 0;

        container.innerHTML = `
            <div class="character-header">
                <div class="character-title">
                    <h2>${character.name}</h2>
                    <span class="level-badge">Level ${character.level}</span>
                    <span class="archetype-badge">${character.archetype}</span>
                </div>
                <div class="character-status">
                    ${character.isAlive() ? '⚔️ Ready' : '💀 Unconscious'}
                </div>
            </div>
            
            <div class="character-vitals">
                <div class="vital-bar health-bar">
                    <div class="vital-label">
                        <span>Health</span>
                        <span>${character.currentHP}/${character.maxHP}</span>
                    </div>
                    <div class="bar">
                        <div class="fill health-fill" style="width: ${healthPercentage}%"></div>
                    </div>
                </div>
                
                <div class="vital-bar mana-bar">
                    <div class="vital-label">
                        <span>Mana</span>
                        <span>${character.currentMP}/${character.maxMP}</span>
                    </div>
                    <div class="bar">
                        <div class="fill mana-fill" style="width: ${manaPercentage}%"></div>
                    </div>
                </div>
                
                <div class="vital-bar exp-bar">
                    <div class="vital-label">
                        <span>Experience</span>
                        <span>${character.experience}/${character.experienceToNext}</span>
                    </div>
                    <div class="bar">
                        <div class="fill exp-fill" style="width: ${expPercentage}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="character-stats-display">
                <h3>Current Stats</h3>
                <div class="stats-grid">
                    ${Object.entries(character.stats).map(([stat, value]) => `
                        <div class="stat-item">
                            <span class="stat-name">${Helpers.String.camelToTitle(stat)}</span>
                            <span class="stat-value">${value}</span>
                            <span class="stat-aptitude">(${character.aptitudes[stat]})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="character-skills">
                <h3>Learned Skills</h3>
                <div class="skills-list">
                    ${character.learnedSkills && character.learnedSkills.length > 0 ? 
                        character.learnedSkills.map(skillId => {
                            const skill = SKILLS_DATA[skillId];
                            return skill ? `
                                <div class="skill-item">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-description">${skill.description}</span>
                                </div>
                            ` : '';
                        }).join('') : 
                        '<div class="no-skills">No skills learned yet</div>'
                    }
                </div>
            </div>
            
            <div class="character-actions">
                <h3>Training Options</h3>
                <div class="training-grid">
                    ${Object.keys(character.stats).map(stat => `
                        <button class="btn btn-small training-btn" 
                                onclick="ActionManager.trainSpecificStat('${stat}')"
                                title="Train ${Helpers.String.camelToTitle(stat)}">
                            🎯 ${Helpers.String.camelToTitle(stat)}
                        </button>
                    `).join('')}
                </div>
                <button class="btn btn-primary" onclick="ActionManager.trainGeneral()">
                    🎓 General Training
                </button>
            </div>
            
            <div class="character-performance">
                <h3>Performance Statistics</h3>
                <div class="performance-grid">
                    <div class="perf-stat">
                        <span>Damage Dealt:</span>
                        <span>${character.combatStats?.damageDealt || 0}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Damage Taken:</span>
                        <span>${character.combatStats?.damageReceived || 0}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Victories:</span>
                        <span>${character.combatStats?.combatsWon || 0}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Defeats:</span>
                        <span>${character.combatStats?.combatsLost || 0}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Enemies Killed:</span>
                        <span>${character.combatStats?.enemiesKilled || 0}</span>
                    </div>
                    <div class="perf-stat">
                        <span>Skills Used:</span>
                        <span>${character.combatStats?.skillsActivated || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="character-management">
                <div class="management-actions">
                    <button class="btn btn-secondary" onclick="UIManager.showCharacterDetails()">
                        📊 View Details
                    </button>
                    <button class="btn btn-warning" onclick="GameManager.changeCharacter()">
                        🔄 Change Character
                    </button>
                </div>
            </div>
        `;
        
        return container;
    }

    /**
     * Show detailed character information modal
     */
    static showCharacterDetails() {
        const character = gameState.adventurer;
        if (!character) return;

        const trainingHistory = character.trainingHistory || [];
        const recentTraining = trainingHistory.slice(-10);

        const detailsContent = `
            <div class="character-details">
                <div class="detail-section">
                    <h4>Character Information</h4>
                    <p><strong>Name:</strong> ${character.name}</p>
                    <p><strong>Archetype:</strong> ${character.archetype}</p>
                    <p><strong>Level:</strong> ${character.level}</p>
                    <p><strong>Experience:</strong> ${character.experience}/${character.experienceToNext}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Stat Progression</h4>
                    <div class="stat-progression">
                        ${Object.entries(character.stats).map(([stat, current]) => {
                            const base = character.aptitudes[stat] * 20;
                            const growth = current - base;
                            return `
                                <div class="stat-progress-item">
                                    <span class="stat-name">${Helpers.String.camelToTitle(stat)}</span>
                                    <span class="stat-base">Base: ${base}</span>
                                    <span class="stat-growth">Growth: +${growth}</span>
                                    <span class="stat-current">Current: ${current}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Recent Training History</h4>
                    <div class="training-history">
                        ${recentTraining.length > 0 ? 
                            recentTraining.map(entry => `
                                <div class="training-entry">
                                    <span class="training-stat">${Helpers.String.camelToTitle(entry.stat)}</span>
                                    <span class="training-amount">+${entry.amount}</span>
                                    <span class="training-method">${entry.method}</span>
                                </div>
                            `).join('') :
                            '<div class="no-training">No training history yet</div>'
                        }
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Combat Statistics</h4>
                    <div class="combat-details">
                        <div class="combat-stat">
                            <span>Win Rate:</span>
                            <span>${character.combatStats ? 
                                Math.round((character.combatStats.combatsWon / Math.max(1, character.combatStats.combatsWon + character.combatStats.combatsLost)) * 100) 
                                : 0}%</span>
                        </div>
                        <div class="combat-stat">
                            <span>Average Damage:</span>
                            <span>${character.combatStats ? 
                                Math.round(character.combatStats.damageDealt / Math.max(1, character.combatStats.combatsWon + character.combatStats.combatsLost))
                                : 0}</span>
                        </div>
                        <div class="combat-stat">
                            <span>Survival Rate:</span>
                            <span>${character.combatStats ? 
                                Math.round(((character.combatStats.combatsWon + character.combatStats.combatsLost - character.combatStats.deathsSuffered) / Math.max(1, character.combatStats.combatsWon + character.combatStats.combatsLost)) * 100)
                                : 100}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = this.createModal('Character Details', detailsContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Show training selection modal
     */
    static showTrainingModal() {
        const character = gameState.adventurer;
        if (!character) {
            this.showMessage('No character selected!', 'error');
            return;
        }

        const trainingContent = `
            <div class="training-selection">
                <div class="training-info">
                    <h4>Training Costs</h4>
                    <p>🪙 Gold: 100 per session</p>
                    <p>⚡ Effectiveness varies by aptitude</p>
                    <p>🎯 Focused training is more effective</p>
                </div>
                
                <div class="training-options">
                    <h4>Specific Stat Training</h4>
                    <div class="stat-training-grid">
                        ${Object.entries(character.stats).map(([stat, value]) => {
                            const aptitude = character.aptitudes[stat];
                            const effectiveness = aptitude * 1.5;
                            return `
                                <div class="stat-training-option">
                                    <div class="stat-info">
                                        <span class="stat-name">${Helpers.String.camelToTitle(stat)}</span>
                                        <span class="stat-current">${value}</span>
                                        <span class="stat-aptitude">Aptitude: ${aptitude}</span>
                                        <span class="stat-effectiveness">~${Math.round(effectiveness)} growth</span>
                                    </div>
                                    <button class="btn btn-primary" onclick="ActionManager.trainSpecificStat('${stat}'); this.closest('.modal-overlay').remove();">
                                        Train ${Helpers.String.camelToTitle(stat)}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="general-training">
                        <h4>General Training</h4>
                        <p>Improves 2-3 random stats with moderate effectiveness</p>
                        <button class="btn btn-secondary" onclick="ActionManager.trainGeneral(); this.closest('.modal-overlay').remove();">
                            General Training Session
                        </button>
                    </div>
                </div>
            </div>
        `;

        const modal = this.createModal('Character Training', trainingContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Show message to user
     */
    static showMessage(message, type = 'info', duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Add to message container or create one
        let container = document.getElementById('messageContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'messageContainer';
            container.className = 'message-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => messageEl.classList.add('show'), 10);
        
        // Auto-remove
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }

    /**
     * Show results section
     */
    static showResults(content, type = 'info') {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');
        
        if (resultsSection && resultsContent) {
            resultsContent.innerHTML = content;
            this.showSection('resultsSection');
            
            // Add type-specific styling
            resultsSection.className = `game-section results-${type}`;
        }
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
                    <button class="btn menu-btn" onclick="gameState.load(); UIManager.showMessage('Game Loaded!', 'success'); this.closest('.modal-overlay').remove()">📁 Load Game</button>
                    <button class="btn menu-btn btn-danger" onclick="GameManager.resetGame(); this.closest('.modal-overlay').remove()">🔄 Reset Game</button>
                </div>
                
                <div class="menu-section">
                    <h3>Character</h3>
                    <button class="btn menu-btn" onclick="UIManager.showCharacterDetails(); this.closest('.modal-overlay').remove()">📊 Character Details</button>
                    <button class="btn menu-btn" onclick="UIManager.showTrainingModal(); this.closest('.modal-overlay').remove()">🎓 Training Options</button>
                    <button class="btn menu-btn" onclick="GameManager.changeCharacter(); this.closest('.modal-overlay').remove()">🔄 Change Character</button>
                </div>
                
                <div class="menu-section">
                    <h3>Statistics</h3>
                    <button class="btn menu-btn" onclick="UIManager.showStatistics(); this.closest('.modal-overlay').remove()">📈 View Statistics</button>
                </div>
            </div>
        `;

        const modal = this.createModal('Game Menu', menuContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Show game statistics
     */
    static showStatistics() {
        const stats = gameState.getStatistics();
        
        const statsContent = `
            <div class="statistics-display">
                <div class="stat-category">
                    <h4>General Progress</h4>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <span>Current Season:</span>
                            <span>${stats.currentSeason}</span>
                        </div>
                        <div class="stat-item">
                            <span>Turns Remaining:</span>
                            <span>${stats.turnsLeft}</span>
                        </div>
                        <div class="stat-item">
                            <span>Character:</span>
                            <span>${stats.characterName} (Level ${stats.characterLevel})</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-category">
                    <h4>Combat Statistics</h4>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <span>Solo Victories:</span>
                            <span>${stats.soloVictories}</span>
                        </div>
                        <div class="stat-item">
                            <span>Dungeons Completed:</span>
                            <span>${stats.dungeonsCompleted}</span>
                        </div>
                        <div class="stat-item">
                            <span>Enemies Defeated:</span>
                            <span>${stats.enemiesDefeated}</span>
                        </div>
                        <div class="stat-item">
                            <span>Total Damage Dealt:</span>
                            <span>${stats.totalDamageDealt}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-category">
                    <h4>Training Progress</h4>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <span>Training Sessions:</span>
                            <span>${stats.totalTrainingSessions}</span>
                        </div>
                        <div class="stat-item">
                            <span>Skills Learned:</span>
                            <span>${stats.skillsLearned}</span>
                        </div>
                        <div class="stat-item">
                            <span>Total Gold Earned:</span>
                            <span>${stats.totalGoldEarned}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-category">
                    <h4>Stat Improvements</h4>
                    <div class="stat-grid">
                        ${Object.entries(stats.statImprovements).map(([stat, improvement]) => `
                            <div class="stat-item">
                                <span>${Helpers.String.camelToTitle(stat)}:</span>
                                <span>+${improvement}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const modal = this.createModal('Game Statistics', statsContent);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Initialize UI system
     */
    static initialize() {
        console.log('🎨 Initializing UI Manager for single character mode...');
        
        // Setup global click handlers
        document.addEventListener('click', (e) => {
            // Handle menu button
            if (e.target.matches('.menu-button') || e.target.closest('.menu-button')) {
                this.showGameMenu();
            }
        });
        
        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => modal.remove());
            }
        });
        
        console.log('✅ UI Manager initialized');
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
    console.log('✅ Single Character UIManager loaded successfully');
}