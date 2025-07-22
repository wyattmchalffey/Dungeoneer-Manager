/**
 * ===========================================
 * UTILITY HELPER FUNCTIONS
 * ===========================================
 * Common utility functions used throughout the game
 */

/**
 * Math and Number Utilities
 */
const MathUtils = {
    /**
     * Clamp a number between min and max values
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation between two values
     */
    lerp(start, end, factor) {
        return start + (end - start) * this.clamp(factor, 0, 1);
    },

    /**
     * Generate random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Generate random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Roll dice (e.g., "3d6" = roll 3 six-sided dice)
     */
    rollDice(count, sides) {
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += this.randomInt(1, sides);
        }
        return total;
    },

    /**
     * Calculate percentage chance success
     */
    percentChance(chance) {
        return Math.random() * 100 < chance;
    },

    /**
     * Round to specified decimal places
     */
    roundTo(value, decimals) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    },

    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Normalize angle to 0-360 degrees
     */
    normalizeAngle(angle) {
        angle = angle % 360;
        if (angle < 0) angle += 360;
        return angle;
    }
};

/**
 * String and Text Utilities
 */
const StringUtils = {
    /**
     * Capitalize first letter of string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Convert camelCase to Title Case
     */
    camelToTitle(str) {
        return str.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
    },

    /**
     * Convert snake_case to Title Case
     */
    snakeToTitle(str) {
        return str.split('_')
                  .map(word => this.capitalize(word))
                  .join(' ');
    },

    /**
     * Truncate string with ellipsis
     */
    truncate(str, maxLength, suffix = '...') {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Format number with commas (e.g., 1,234,567)
     */
    formatNumber(num) {
        return num.toLocaleString();
    },

    /**
     * Format large numbers with suffixes (e.g., 1.2K, 3.4M)
     */
    formatLargeNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    },

    /**
     * Generate random string of specified length
     */
    randomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    },

    /**
     * Pluralize word based on count
     */
    pluralize(word, count, pluralForm = null) {
        if (count === 1) return word;
        return pluralForm || word + 's';
    },

    /**
     * Create slug from string (URL-friendly)
     */
    slugify(str) {
        return str.toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim('-');
    }
};

/**
 * Array and Collection Utilities
 */
const ArrayUtils = {
    /**
     * Shuffle array in place (Fisher-Yates algorithm)
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Get random element from array
     */
    randomElement(array) {
        if (!array.length) return null;
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Get multiple random elements from array (without replacement)
     */
    randomElements(array, count) {
        if (count >= array.length) return [...array];
        const shuffled = [...array];
        this.shuffle(shuffled);
        return shuffled.slice(0, count);
    },

    /**
     * Remove element from array by value
     */
    removeElement(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },

    /**
     * Group array elements by key function
     */
    groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    },

    /**
     * Find element with maximum value by key function
     */
    maxBy(array, keyFn) {
        if (!array.length) return null;
        return array.reduce((max, item) => 
            keyFn(item) > keyFn(max) ? item : max
        );
    },

    /**
     * Find element with minimum value by key function
     */
    minBy(array, keyFn) {
        if (!array.length) return null;
        return array.reduce((min, item) => 
            keyFn(item) < keyFn(min) ? item : min
        );
    },

    /**
     * Create array of numbers from start to end
     */
    range(start, end, step = 1) {
        const result = [];
        for (let i = start; i <= end; i += step) {
            result.push(i);
        }
        return result;
    },

    /**
     * Chunk array into smaller arrays of specified size
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

/**
 * Time and Date Utilities
 */
const TimeUtils = {
    /**
     * Format milliseconds to human readable time
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    },

    /**
     * Format timestamp to readable date
     */
    formatDate(timestamp, includeTime = true) {
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return date.toLocaleDateString('en-US', options);
    },

    /**
     * Get relative time description (e.g., "2 minutes ago")
     */
    getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    },

    /**
     * Create debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Create throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Create delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

/**
 * Object and Data Utilities
 */
const ObjectUtils = {
    /**
     * Deep clone an object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        
        return obj;
    },

    /**
     * Merge objects deeply
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    },

    /**
     * Get nested object value by path string
     */
    getNestedValue(obj, path, defaultValue = null) {
        return path.split('.').reduce((current, key) => {
            return (current && current[key] !== undefined) ? current[key] : defaultValue;
        }, obj);
    },

    /**
     * Set nested object value by path string
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    },

    /**
     * Check if object is empty
     */
    isEmpty(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        return Object.keys(obj).length === 0;
    },

    /**
     * Pick specified keys from object
     */
    pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    },

    /**
     * Omit specified keys from object
     */
    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    }
};

/**
 * Color Utilities
 */
const ColorUtils = {
    /**
     * Convert hex color to RGB object
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to hex color
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    /**
     * Lighten color by percentage
     */
    lighten(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const factor = (100 + percent) / 100;
        return this.rgbToHex(
            Math.min(255, Math.floor(rgb.r * factor)),
            Math.min(255, Math.floor(rgb.g * factor)),
            Math.min(255, Math.floor(rgb.b * factor))
        );
    },

    /**
     * Darken color by percentage
     */
    darken(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const factor = (100 - percent) / 100;
        return this.rgbToHex(
            Math.floor(rgb.r * factor),
            Math.floor(rgb.g * factor),
            Math.floor(rgb.b * factor)
        );
    },

    /**
     * Generate random color
     */
    randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    },

    /**
     * Get contrast color (black or white) for background
     */
    getContrastColor(backgroundColor) {
        const rgb = this.hexToRgb(backgroundColor);
        if (!rgb) return '#000000';
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }
};

/**
 * Browser and Platform Utilities
 */
const PlatformUtils = {
    /**
     * Detect if running on mobile device
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Detect if running on tablet
     */
    isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    },

    /**
     * Detect if running on desktop
     */
    isDesktop() {
        return !this.isMobile();
    },

    /**
     * Detect if running in Electron
     */
    isElectron() {
        return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
    },

    /**
     * Get browser information
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /Chrome\/(\d+)/.exec(ua),
            firefox: /Firefox\/(\d+)/.exec(ua),
            safari: /Safari\/(\d+)/.exec(ua),
            edge: /Edge\/(\d+)/.exec(ua)
        };
        
        for (const [name, match] of Object.entries(browsers)) {
            if (match) {
                return { name, version: parseInt(match[1]) };
            }
        }
        
        return { name: 'unknown', version: 0 };
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
            }
        }
        
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    },

    /**
     * Get device pixel ratio
     */
    getPixelRatio() {
        return window.devicePixelRatio || 1;
    },

    /**
     * Check if device supports touch
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

/**
 * Performance Utilities
 */
const PerformanceUtils = {
    /**
     * Measure function execution time
     */
    measure(fn, iterations = 1) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        const end = performance.now();
        return end - start;
    },

    /**
     * Create performance profiler
     */
    createProfiler(name) {
        const start = performance.now();
        return {
            end: () => {
                const end = performance.now();
                const duration = end - start;
                console.log(`${name}: ${duration.toFixed(2)}ms`);
                return duration;
            }
        };
    },

    /**
     * Get memory usage (if available)
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    },

    /**
     * Request animation frame with fallback
     */
    requestAnimationFrame(callback) {
        const raf = window.requestAnimationFrame || 
                   window.webkitRequestAnimationFrame || 
                   window.mozRequestAnimationFrame ||
                   ((callback) => setTimeout(callback, 16));
        return raf(callback);
    }
};

/**
 * Game-Specific Utilities
 */
const GameUtils = {
    /**
     * Calculate skill effectiveness based on stats
     */
    calculateSkillEffectiveness(character, skill) {
        if (!skill || !character) return 0;
        
        const baseStat = character.stats[skill.statModifier] || 0;
        const level = character.level || 1;
        const mastery = character.masteredSkills?.includes(skill.id) ? 1.2 : 1.0;
        
        return Math.floor(baseStat * level * mastery / 100);
    },

    /**
     * Generate combat rating for matchmaking
     */
    calculatePartyRating(party) {
        if (!party || !party.length) return 0;
        
        return party.reduce((total, character) => {
            const statTotal = Object.values(character.stats || {}).reduce((sum, stat) => sum + stat, 0);
            const levelBonus = (character.level || 1) * 10;
            const skillBonus = (character.learnedSkills?.length || 0) * 5;
            return total + statTotal + levelBonus + skillBonus;
        }, 0);
    },

    /**
     * Calculate resource efficiency
     */
    calculateResourceEfficiency(spent, gained) {
        if (spent <= 0) return gained > 0 ? Infinity : 0;
        return gained / spent;
    },

    /**
     * Generate weighted random selection
     */
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    },

    /**
     * Interpolate between game states for smooth transitions
     */
    interpolateGameState(from, to, factor) {
        const result = ObjectUtils.deepClone(from);
        
        // Interpolate numeric values
        Object.keys(to).forEach(key => {
            if (typeof to[key] === 'number' && typeof from[key] === 'number') {
                result[key] = MathUtils.lerp(from[key], to[key], factor);
            } else if (to[key] !== undefined) {
                result[key] = to[key];
            }
        });
        
        return result;
    }
};

/**
 * Validation Utilities
 */
const ValidationUtils = {
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate character name
     */
    isValidCharacterName(name) {
        if (!name || typeof name !== 'string') return false;
        if (name.length < 1 || name.length > 50) return false;
        if (!/^[a-zA-Z0-9\s\-_.]+$/.test(name)) return false;
        return true;
    },

    /**
     * Validate game save data
     */
    isValidSaveData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.version || !data.timestamp || !data.gameData) return false;
        if (typeof data.gameData !== 'object') return false;
        return true;
    },

    /**
     * Sanitize user input
     */
    sanitizeInput(input, maxLength = 1000) {
        if (typeof input !== 'string') return '';
        return input.trim()
                   .substring(0, maxLength)
                   .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                   .replace(/[<>]/g, '');
    },

    /**
     * Validate numeric range
     */
    isInRange(value, min, max) {
        return typeof value === 'number' && value >= min && value <= max;
    }
};

// Combine all utilities into single object
const Helpers = {
    Math: MathUtils,
    String: StringUtils,
    Array: ArrayUtils,
    Time: TimeUtils,
    Object: ObjectUtils,
    Color: ColorUtils,
    Platform: PlatformUtils,
    Performance: PerformanceUtils,
    Game: GameUtils,
    Validation: ValidationUtils
};

// Export utilities
if (typeof window !== 'undefined') {
    window.Helpers = Helpers;
    
    // Also expose individual utility groups for convenience
    Object.entries(Helpers).forEach(([key, value]) => {
        window[`${key}Utils`] = value;
    });
    
    console.log('✅ Helper utilities loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
}