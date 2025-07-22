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
        
        const healthPercentage = character.getHealthPercentage();
        const manaPercentage = character.getManaPercentage();
        
        const healthColor = this.getHealthColor(healthPercentage);
        const statusEffectsHTML = this.renderStatusEffects(character);
        
        member.innerHTML = `
            <div class="party-member-header">
                <h3>${character.name} ${!character.isAlive() ? '💀' : ''}</h3>
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
                    <button class="btn menu-btn" onclick="this.saveGame()">💾 Save Game</button>
                    <button class="btn menu-btn" onclick="this.loadGame()">📂 Load Game</button>
                    <button class="btn menu-btn btn-danger" onclick="this.newGame()">🆕 New Game</button>
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
     * Utility methods
     */

    static formatNumber(num) {
        return Helpers.String.formatNumber(num);
    }

    static capitalizeWords(str) {
        return Helpers.String.camelToTitle(str);
    }

    static getUnlockDescription(condition) {
        if (typeof Helpers !== 'undefined' && Helpers.Game && Helpers.Game.getUnlockDescription) {
            return Helpers.Game.getUnlockDescription(condition);
        }
        return 'Complete special requirements';
    }

    static debounce(func, wait) {
        return Helpers.Time.debounce(func, wait);
    }

    static handleResize() {
        // Handle responsive layout changes
        console.log('🔄 Window resized');
    }

    static handleOrientationChange() {
        // Handle mobile orientation changes
        console.log('🔄 Orientation changed');
    }

    static onPageHidden() {
        // Pause updates when page is hidden (mobile battery optimization)
        this.isUpdating = false;
    }

    static onPageVisible() {
        // Resume updates when page becomes visible
        this.isUpdating = true;
    }

    static updateAnimations() {
        // Process any queued animations
        // Reserved for future animation system
    }
}

// Add required CSS for modals and messages
const uiStyles = document.createElement('style');
uiStyles.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;/**
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
        `;
        
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
            <div class="turn-counter" title="Turns remaining before final battle">
                <strong>⏰ Turns Left:</strong> ${turnsLeft}
            </div>
        `;
        
        // Add warning styling if resources are low
        if (resources.gold < 100) {
            resourceBar.querySelector('.resource').classList.add('warning');
        }
        
        if (turnsLeft <= 5) {
            resourceBar.querySelector('.turn-counter').classList.add('critical');
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
            card.