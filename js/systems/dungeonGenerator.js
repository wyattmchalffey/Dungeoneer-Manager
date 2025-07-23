/**
 * ===========================================
 * DUNGEON GENERATOR
 * ===========================================
 * Generates procedural dungeons with rooms, connections, and content
 */

// Room types that can appear in dungeons
const ROOM_TYPES = {
    ENTRANCE: 'entrance',
    COMBAT: 'combat',
    TREASURE: 'treasure', 
    TRAP: 'trap',
    REST: 'rest',
    BOSS: 'boss',
    PUZZLE: 'puzzle',
    MERCHANT: 'merchant',
    EMPTY: 'empty',
    EVENT: 'event'
};

// Room templates for different dungeon types
const DUNGEON_ROOM_TEMPLATES = {
    training_grounds: {
        combat: { 
            weight: 50, 
            enemies: ['training_dummy', 'wooden_golem', 'practice_skeleton'],
            minEnemies: 1,
            maxEnemies: 2
        },
        treasure: { 
            weight: 25, 
            loot: { gold: [15, 40], materials: [3, 8] },
            chestTypes: ['wooden_chest', 'training_cache']
        },
        rest: { 
            weight: 20, 
            heal: 0.4,
            description: 'A training rest area with basic supplies'
        },
        empty: { weight: 5 }
    },
    
    crystal_caverns: {
        combat: { 
            weight: 45, 
            enemies: ['crystal_spider', 'cave_troll', 'crystal_golem'],
            minEnemies: 1,
            maxEnemies: 3
        },
        treasure: { 
            weight: 25, 
            loot: { gold: [25, 70], materials: [8, 20] },
            chestTypes: ['crystal_cache', 'hidden_geode']
        },
        trap: { 
            weight: 20, 
            damage: [15, 35], 
            type: 'crystal_explosion',
            detectDC: 15,
            disarmDC: 18
        },
        event: {
            weight: 10,
            events: ['crystal_resonance', 'mana_spring', 'unstable_portal']
        }
    },
    
    ancient_library: {
        combat: { 
            weight: 40, 
            enemies: ['spectral_librarian', 'animated_book', 'ink_elemental'],
            minEnemies: 1,
            maxEnemies: 2
        },
        treasure: { 
            weight: 20, 
            loot: { gold: [20, 60], materials: [5, 15] },
            chestTypes: ['ancient_tome', 'scroll_case'],
            specialLoot: ['skill_book']
        },
        puzzle: {
            weight: 25,
            difficulty: 18,
            type: 'ancient_riddle',
            reward: { gold: 100, skillChance: 0.3 }
        },
        trap: { 
            weight: 10, 
            damage: [10, 25], 
            type: 'knowledge_drain',
            detectDC: 20,
            disarmDC: 22
        },
        rest: { weight: 5, heal: 0.3 }
    },
    
    shadow_fortress: {
        combat: { 
            weight: 55, 
            enemies: ['shadow_knight', 'wraith', 'nightmare_spawn'],
            minEnemies: 2,
            maxEnemies: 3
        },
        treasure: { 
            weight: 20, 
            loot: { gold: [40, 100], materials: [12, 30] },
            chestTypes: ['shadow_cache', 'cursed_vault']
        },
        trap: { 
            weight: 20, 
            damage: [20, 45], 
            type: 'shadow_drain',
            detectDC: 22,
            disarmDC: 25
        },
        event: {
            weight: 5,
            events: ['shadow_whispers', 'fear_aura', 'darkness_consumes']
        }
    },
    
    elemental_planes: {
        combat: { 
            weight: 50, 
            enemies: ['fire_elemental', 'frost_giant', 'storm_lord', 'earth_titan'],
            minEnemies: 1,
            maxEnemies: 2
        },
        treasure: { 
            weight: 25, 
            loot: { gold: [60, 150], materials: [20, 50] },
            chestTypes: ['elemental_core', 'primal_cache'],
            specialLoot: ['elemental_essence']
        },
        trap: { 
            weight: 15, 
            damage: [25, 60], 
            type: 'elemental_storm',
            detectDC: 25,
            disarmDC: 28
        },
        event: {
            weight: 10,
            events: ['elemental_rift', 'primal_chaos', 'reality_storm']
        }
    },
    
    demon_lords_dungeon: {
        combat: { 
            weight: 60, 
            enemies: ['demon_lieutenant', 'pit_fiend'],
            minEnemies: 2,
            maxEnemies: 4
        },
        treasure: { 
            weight: 15, 
            loot: { gold: [100, 300], materials: [50, 100] },
            chestTypes: ['infernal_vault', 'soul_prison']
        },
        trap: { 
            weight: 20, 
            damage: [40, 80], 
            type: 'hellfire_trap',
            detectDC: 30,
            disarmDC: 35
        },
        event: {
            weight: 5,
            events: ['soul_corruption', 'hellfire_rain', 'demonic_whispers']
        }
    }
};

class DungeonRoom {
    constructor(type, template, depth = 1, dungeonType = 'training_grounds') {
        this.id = Helpers.String.randomString(8);
        this.type = type;
        this.template = template || {};
        this.depth = depth;
        this.dungeonType = dungeonType;
        this.completed = false;
        this.discovered = false;
        this.connections = [];
        this.position = { x: 0, y: 0 }; // For mapping
        
        // Generate room content based on template
        this.generateContent();
    }
    
    generateContent() {
        switch (this.type) {
            case ROOM_TYPES.COMBAT:
                this.enemies = this.generateEnemies();
                break;
            case ROOM_TYPES.TREASURE:
                this.loot = this.generateLoot();
                this.chestType = this.selectChestType();
                break;
            case ROOM_TYPES.TRAP:
                this.trap = this.generateTrap();
                break;
            case ROOM_TYPES.PUZZLE:
                this.puzzle = this.generatePuzzle();
                break;
            case ROOM_TYPES.BOSS:
                this.boss = this.generateBoss();
                break;
            case ROOM_TYPES.EVENT:
                this.event = this.generateEvent();
                break;
            case ROOM_TYPES.REST:
                this.rest = this.generateRestArea();
                break;
        }
    }
    
    generateEnemies() {
        const template = this.template;
        const possibleEnemies = template.enemies || ['training_dummy'];
        const minEnemies = template.minEnemies || 1;
        const maxEnemies = template.maxEnemies || Math.min(4, Math.max(1, Math.floor(this.depth / 2) + 1));
        
        const enemyCount = Helpers.Math.randomInt(minEnemies, maxEnemies);
        const enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = Helpers.Array.randomElement(possibleEnemies);
            const enemy = this.createScaledEnemy(enemyType);
            enemies.push(enemy);
        }
        
        return enemies;
    }
    
    createScaledEnemy(enemyType) {
        const baseEnemy = ENEMIES_DATA[enemyType];
        if (!baseEnemy) {
            return {
                name: 'Unknown Creature',
                type: 'beast',
                hp: 50,
                maxHP: 50,
                attackPower: 15,
                defense: 5,
                speed: 5,
                abilities: [],
                difficulty: 1
            };
        }
        
        const scaled = Helpers.Object.deepClone(baseEnemy);
        const depthScaling = 1 + (this.depth * 0.15);
        const randomVariation = 0.8 + (Math.random() * 0.4); // ±20% variation
        
        scaled.hp = Math.floor(scaled.hp * depthScaling * randomVariation);
        scaled.maxHP = scaled.hp;
        scaled.attackPower = Math.floor(scaled.attackPower * depthScaling * randomVariation);
        scaled.currentHP = scaled.hp;
        
        return scaled;
    }
    
    generateLoot() {
        const template = this.template.loot || { gold: [10, 20] };
        const loot = {};
        
        Object.entries(template).forEach(([resource, range]) => {
            if (Array.isArray(range)) {
                loot[resource] = Helpers.Math.randomInt(range[0], range[1]);
            } else {
                loot[resource] = range;
            }
        });
        
        // Apply depth and dungeon scaling
        const depthMultiplier = 1 + (this.depth * 0.2);
        const dungeonMultiplier = this.getDungeonLootMultiplier();
        
        Object.keys(loot).forEach(resource => {
            loot[resource] = Math.floor(loot[resource] * depthMultiplier * dungeonMultiplier);
        });
        
        // Chance for special loot
        if (this.template.specialLoot && Helpers.Math.percentChance(20 + this.depth * 5)) {
            loot.special = Helpers.Array.randomElement(this.template.specialLoot);
        }
        
        return loot;
    }
    
    getDungeonLootMultiplier() {
        const multipliers = {
            training_grounds: 0.8,
            crystal_caverns: 1.0,
            ancient_library: 1.1,
            shadow_fortress: 1.3,
            elemental_planes: 1.5,
            demon_lords_dungeon: 2.0
        };
        return multipliers[this.dungeonType] || 1.0;
    }
    
    selectChestType() {
        if (!this.template.chestTypes) return 'wooden_chest';
        return Helpers.Array.randomElement(this.template.chestTypes);
    }
    
    generateTrap() {
        const template = this.template;
        const damageRange = template.damage || [5, 15];
        
        return {
            type: template.type || 'spike_trap',
            damage: Helpers.Math.randomInt(damageRange[0], damageRange[1]),
            detectDC: template.detectDC || (15 + this.depth * 2),
            disarmDC: template.disarmDC || (20 + this.depth * 3),
            triggered: false,
            detected: false,
            disarmed: false
        };
    }
    
    generatePuzzle() {
        const template = this.template;
        
        return {
            type: template.type || 'riddle',
            difficulty: template.difficulty || (15 + this.depth * 3),
            reward: template.reward || { gold: 50 + this.depth * 20 },
            attempts: 3,
            solved: false,
            description: this.getPuzzleDescription()
        };
    }
    
    getPuzzleDescription() {
        const descriptions = {
            ancient_riddle: "Ancient runes glow on the wall, posing a riddle from ages past.",
            crystal_puzzle: "Crystals must be arranged in the correct pattern to unlock the treasure.",
            shadow_maze: "Navigate through shifting shadows to reach the reward.",
            elemental_trial: "Balance the four elements to prove your worth."
        };
        
        return descriptions[this.puzzle?.type] || "A mysterious puzzle blocks your way.";
    }
    
    generateBoss() {
        const template = this.template;
        const possibleBosses = template.bosses || template.enemies || ['training_dummy'];
        const bossType = Helpers.Array.randomElement(possibleBosses);
        const boss = this.createScaledEnemy(bossType);
        
        // Enhance for boss status
        boss.hp = Math.floor(boss.hp * 2.5);
        boss.maxHP = boss.hp;
        boss.currentHP = boss.hp;
        boss.attackPower = Math.floor(boss.attackPower * 1.5);
        boss.isBoss = true;
        boss.name = boss.name + " (Boss)";
        
        // Add special boss abilities
        if (!boss.abilities) boss.abilities = [];
        boss.abilities.push('boss_rage', 'area_attack');
        
        return boss;
    }
    
    generateEvent() {
        const template = this.template;
        const possibleEvents = template.events || ['mysterious_occurrence'];
        const eventType = Helpers.Array.randomElement(possibleEvents);
        
        return {
            type: eventType,
            description: this.getEventDescription(eventType),
            triggered: false,
            effects: this.getEventEffects(eventType)
        };
    }
    
    getEventDescription(eventType) {
        const descriptions = {
            crystal_resonance: "The crystals in this chamber resonate with magical energy.",
            mana_spring: "A spring of pure magical energy bubbles from the ground.",
            shadow_whispers: "Dark whispers echo through the chamber, speaking of forbidden knowledge.",
            elemental_rift: "A tear in reality reveals the raw power of the elemental planes.",
            soul_corruption: "The very air seems to corrupt the soul with demonic influence."
        };
        
        return descriptions[eventType] || "Something unusual happens in this chamber.";
    }
    
    getEventEffects(eventType) {
        const effects = {
            crystal_resonance: { type: 'mana_restore', value: 0.3 },
            mana_spring: { type: 'mana_restore', value: 0.5 },
            shadow_whispers: { type: 'stat_drain', stat: 'spirit', value: 10 },
            elemental_rift: { type: 'random_element_boost', value: 15 },
            soul_corruption: { type: 'hp_drain', value: 0.2 }
        };
        
        return effects[eventType] || { type: 'no_effect' };
    }
    
    generateRestArea() {
        const template = this.template;
        
        return {
            healPercent: template.heal || 0.3,
            removeStatusEffects: true,
            restoreMP: true,
            description: template.description || "A peaceful area where you can rest and recover."
        };
    }
    
    getDescription() {
        const descriptions = {
            [ROOM_TYPES.ENTRANCE]: "The entrance to the dungeon. You can still retreat from here.",
            [ROOM_TYPES.COMBAT]: this.getCombatDescription(),
            [ROOM_TYPES.TREASURE]: `You spot ${this.chestType || 'a chest'} glinting in the dim light.`,
            [ROOM_TYPES.TRAP]: "This chamber feels dangerous. Your instincts warn of hidden perils.",
            [ROOM_TYPES.REST]: this.rest?.description || "A peaceful alcove where you could rest and recover.",
            [ROOM_TYPES.BOSS]: `A massive chamber looms ahead. The ${this.boss?.name || 'Boss'} awaits within!`,
            [ROOM_TYPES.PUZZLE]: this.puzzle?.description || "Strange symbols and mechanisms fill this chamber.",
            [ROOM_TYPES.EVENT]: this.event?.description || "Something unusual catches your attention.",
            [ROOM_TYPES.EMPTY]: "An empty chamber with nothing of immediate interest."
        };
        
        return descriptions[this.type] || "A mysterious chamber.";
    }
    
    getCombatDescription() {
        if (!this.enemies || this.enemies.length === 0) {
            return "You sense hostile presence in this chamber.";
        }
        
        if (this.enemies.length === 1) {
            return `A ${this.enemies[0].name} lurks in this chamber.`;
        } else {
            return `${this.enemies.length} enemies have made this chamber their lair.`;
        }
    }
    
    getRoomIcon() {
        const icons = {
            [ROOM_TYPES.ENTRANCE]: '🚪',
            [ROOM_TYPES.COMBAT]: '⚔️',
            [ROOM_TYPES.TREASURE]: '💰',
            [ROOM_TYPES.TRAP]: '⚠️',
            [ROOM_TYPES.REST]: '🛏️',
            [ROOM_TYPES.BOSS]: '👹',
            [ROOM_TYPES.PUZZLE]: '🧩',
            [ROOM_TYPES.EVENT]: '✨',
            [ROOM_TYPES.EMPTY]: '⬜'
        };
        
        return icons[this.type] || '❓';
    }
    
    canEnter() {
        return this.discovered && !this.completed;
    }
    
    isBlocked() {
        // Some rooms might be blocked until conditions are met
        return false;
    }
}

class DungeonGenerator {
    constructor(dungeonType, difficulty = 1) {
        this.dungeonType = dungeonType;
        this.difficulty = difficulty;
        this.roomTemplates = DUNGEON_ROOM_TEMPLATES[dungeonType] || DUNGEON_ROOM_TEMPLATES.training_grounds;
        this.dungeonData = DUNGEONS_DATA[dungeonType];
    }
    
    generateDungeon() {
        const roomCount = this.calculateRoomCount();
        const rooms = [];
        
        // Create entrance
        const entrance = new DungeonRoom(ROOM_TYPES.ENTRANCE, {}, 0, this.dungeonType);
        entrance.discovered = true;
        entrance.completed = true; // Entrance is always "completed"
        entrance.position = { x: 0, y: 0 };
        rooms.push(entrance);
        
        // Generate main path rooms
        const mainPathLength = Math.floor(roomCount * 0.7);
        for (let i = 1; i <= mainPathLength; i++) {
            const depth = Math.floor(i / 2) + 1;
            const roomType = this.selectRoomType(false); // Not boss room
            const template = this.roomTemplates[roomType];
            const room = new DungeonRoom(roomType, template, depth, this.dungeonType);
            room.position = { x: i, y: 0 };
            rooms.push(room);
        }
        
        // Generate side rooms and branches
        const sideRooms = roomCount - mainPathLength - 1; // -1 for boss
        for (let i = 0; i < sideRooms; i++) {
            const depth = Helpers.Math.randomInt(1, Math.floor(mainPathLength / 2) + 1);
            const roomType = this.selectRoomType(false);
            const template = this.roomTemplates[roomType];
            const room = new DungeonRoom(roomType, template, depth, this.dungeonType);
            
            // Position side rooms off the main path
            const attachPoint = Helpers.Math.randomInt(1, mainPathLength);
            room.position = { 
                x: attachPoint, 
                y: (i % 2 === 0) ? 1 : -1 
            };
            rooms.push(room);
        }
        
        // Create boss room
        const bossDepth = Math.floor(mainPathLength / 2) + 2;
        const bossRoom = new DungeonRoom(ROOM_TYPES.BOSS, {
            bosses: this.getBossesForDungeon(),
            ...this.roomTemplates.combat
        }, bossDepth, this.dungeonType);
        bossRoom.position = { x: mainPathLength + 1, y: 0 };
        rooms.push(bossRoom);
        
        // Connect rooms
        this.connectRooms(rooms);
        
        return new Dungeon(this.dungeonType, rooms, this.difficulty);
    }
    
    calculateRoomCount() {
        const baseRooms = 6;
        const difficultyRooms = this.difficulty * 2;
        const dungeonTypeBonus = this.getDungeonTypeRoomBonus();
        
        return Math.max(5, Math.min(15, baseRooms + difficultyRooms + dungeonTypeBonus));
    }
    
    getDungeonTypeRoomBonus() {
        const bonuses = {
            training_grounds: -1,
            crystal_caverns: 0,
            ancient_library: 1,
            shadow_fortress: 2,
            elemental_planes: 3,
            demon_lords_dungeon: 4
        };
        return bonuses[this.dungeonType] || 0;
    }
    
    selectRoomType(allowBoss = false) {
        const weights = [];
        const types = [];
        
        Object.entries(this.roomTemplates).forEach(([type, template]) => {
            if (type === 'boss' && !allowBoss) return;
            
            types.push(type);
            weights.push(template.weight || 10);
        });
        
        return Helpers.Game.weightedRandom(types, weights);
    }
    
    getBossesForDungeon() {
        const dungeonBosses = {
            training_grounds: ['practice_skeleton'],
            crystal_caverns: ['crystal_golem'],
            ancient_library: ['spectral_librarian'],
            shadow_fortress: ['nightmare_spawn', 'shadow_knight'],
            elemental_planes: ['fire_elemental', 'frost_giant', 'storm_lord', 'earth_titan'],
            demon_lords_dungeon: ['demon_lieutenant', 'pit_fiend']
        };
        
        return dungeonBosses[this.dungeonType] || ['training_dummy'];
    }
    
    connectRooms(rooms) {
        // Connect main path linearly
        const mainPathRooms = rooms.filter(room => room.position.y === 0).sort((a, b) => a.position.x - b.position.x);
        
        for (let i = 0; i < mainPathRooms.length - 1; i++) {
            mainPathRooms[i].connections.push(mainPathRooms[i + 1].id);
            mainPathRooms[i + 1].connections.push(mainPathRooms[i].id); // Bidirectional
        }
        
        // Connect side rooms to main path
        const sideRooms = rooms.filter(room => room.position.y !== 0);
        sideRooms.forEach(sideRoom => {
            const attachPoint = mainPathRooms.find(room => room.position.x === sideRoom.position.x);
            if (attachPoint) {
                attachPoint.connections.push(sideRoom.id);
                sideRoom.connections.push(attachPoint.id);
            }
        });
        
        // Add some additional connections for complexity
        mainPathRooms.forEach((room, index) => {
            if (index > 1 && index < mainPathRooms.length - 2 && Helpers.Math.percentChance(20)) {
                // Sometimes connect to room two steps ahead
                const skipTarget = mainPathRooms[index + 2];
                if (skipTarget && !room.connections.includes(skipTarget.id)) {
                    room.connections.push(skipTarget.id);
                    skipTarget.connections.push(room.id);
                }
            }
        });
    }
}

class Dungeon {
    constructor(type, rooms, difficulty) {
        this.id = Helpers.String.randomString(12);
        this.type = type;
        this.rooms = rooms;
        this.difficulty = difficulty;
        this.currentRoomId = rooms[0].id; // Start at entrance
        this.roomsVisited = new Set([rooms[0].id]);
        this.completed = false;
        this.retreated = false;
        this.startTime = Date.now();
        this.totalLoot = { gold: 0, materials: 0 };
        this.enemiesDefeated = 0;
        this.bossDefeated = false;
    }
    
    getCurrentRoom() {
        return this.rooms.find(room => room.id === this.currentRoomId);
    }
    
    getRoom(roomId) {
        return this.rooms.find(room => room.id === roomId);
    }
    
    getConnectedRooms() {
        const currentRoom = this.getCurrentRoom();
        if (!currentRoom) return [];
        
        return currentRoom.connections.map(roomId => 
            this.rooms.find(room => room.id === roomId)
        ).filter(room => room !== undefined);
    }
    
    moveToRoom(roomId) {
        const targetRoom = this.getRoom(roomId);
        if (!targetRoom) return false;
        
        const currentRoom = this.getCurrentRoom();
        if (!currentRoom.connections.includes(roomId)) return false;
        
        this.currentRoomId = roomId;
        this.roomsVisited.add(roomId);
        targetRoom.discovered = true;
        
        return true;
    }
    
    canRetreat() {
        const currentRoom = this.getCurrentRoom();
        return currentRoom && currentRoom.type !== ROOM_TYPES.BOSS;
    }
    
    retreat() {
        if (!this.canRetreat()) return false;
        
        this.retreated = true;
        this.completed = true;
        return true;
    }
    
    completeRoom(roomId, results = {}) {
        const room = this.getRoom(roomId);
        if (!room) return false;
        
        room.completed = true;
        
        // Track loot and progress
        if (results.loot) {
            Object.entries(results.loot).forEach(([resource, amount]) => {
                this.totalLoot[resource] = (this.totalLoot[resource] || 0) + amount;
            });
        }
        
        if (results.enemiesDefeated) {
            this.enemiesDefeated += results.enemiesDefeated;
        }
        
        if (room.type === ROOM_TYPES.BOSS) {
            this.bossDefeated = true;
            this.completed = true;
        }
        
        return true;
    }
    
    getProgress() {
        const totalRooms = this.rooms.length;
        const visitedRooms = this.roomsVisited.size;
        const completedRooms = this.rooms.filter(room => room.completed).length;
        
        return {
            roomsVisited: visitedRooms,
            roomsCompleted: completedRooms,
            totalRooms: totalRooms,
            visitProgress: visitedRooms / totalRooms,
            completionProgress: completedRooms / totalRooms,
            bossDefeated: this.bossDefeated,
            completed: this.completed,
            retreated: this.retreated
        };
    }
    
    getDurationMinutes() {
        return Math.floor((Date.now() - this.startTime) / 60000);
    }
    
    getDiscoveredRooms() {
        return this.rooms.filter(room => room.discovered);
    }
    
    getCompletedRooms() {
        return this.rooms.filter(room => room.completed);
    }
    
    getRoomMap() {
        // Generate a simple text map of discovered rooms
        const discovered = this.getDiscoveredRooms();
        const map = {};
        
        discovered.forEach(room => {
            const key = `${room.position.x},${room.position.y}`;
            map[key] = {
                id: room.id,
                type: room.type,
                icon: room.getRoomIcon(),
                completed: room.completed,
                current: room.id === this.currentRoomId
            };
        });
        
        return map;
    }
}

// Export classes and constants
if (typeof window !== 'undefined') {
    window.ROOM_TYPES = ROOM_TYPES;
    window.DUNGEON_ROOM_TEMPLATES = DUNGEON_ROOM_TEMPLATES;
    window.DungeonRoom = DungeonRoom;
    window.DungeonGenerator = DungeonGenerator;
    window.Dungeon = Dungeon;
    console.log('✅ Dungeon Generator loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ROOM_TYPES, 
        DUNGEON_ROOM_TEMPLATES, 
        DungeonRoom, 
        DungeonGenerator, 
        Dungeon 
    };
}