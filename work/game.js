const STORAGE_KEY = "idle-mmo-save-v1";
const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

const DEFINITIONS = {
  skills: [
    { id: "combat", name: "Combat", max: 100 },
    { id: "strength", name: "Strength", max: 100 },
    { id: "attack", name: "Attack", max: 100 },
    { id: "hitpoints", name: "Hitpoints", max: 100 },
    { id: "defense", name: "Defense", max: 100 },
    { id: "woodcutting", name: "Woodcutting", max: 100 },
    { id: "fishing", name: "Fishing", max: 100 },
    { id: "mining", name: "Mining", max: 100 },
    { id: "crafting", name: "Crafting", max: 100 },
    { id: "survival", name: "Survival", max: 100 },
    { id: "leadership", name: "Leadership", max: 100 },
  ],
  activities: [
    { id: "combat", name: "Combat", skill: "combat", desc: "Fight enemies in the current zone." },
    { id: "woodcutting", name: "Woodcutting", skill: "woodcutting", desc: "Chop logs for crafting and gold." },
    { id: "fishing", name: "Fishing", skill: "fishing", desc: "Catch fish for food and XP." },
    { id: "mining", name: "Mining", skill: "mining", desc: "Mine ore for gear progression." },
    { id: "crafting", name: "Crafting", skill: "crafting", desc: "Turn materials into equipment." },
  ],
  skillTree: [
    { id: "war_training", skill: "combat", name: "War Training", cost: 1, req: 2, desc: "+2 attack", effect: (s) => { s.hero.baseAttack += 2; } },
    { id: "blade_form", skill: "combat", name: "Blade Form", cost: 1, req: 5, desc: "Unlocks Slash combat style", effect: (s) => { s.combatStyles.slash = true; } },
    { id: "guard_stance", skill: "combat", name: "Guard Stance", cost: 1, req: 8, desc: "+2 defense", effect: (s) => { s.hero.baseDefense += 2; } },
    { id: "battle_focus", skill: "combat", name: "Battle Focus", cost: 2, req: 12, desc: "Unlocks Focus combat style", effect: (s) => { s.combatStyles.focus = true; } },
    { id: "prospector", skill: "woodcutting", name: "Prospector", cost: 1, req: 2, desc: "+25% gathering yield", effect: (s) => { s.modifiers.gatheringYield += 0.25; } },
    { id: "harvester", skill: "woodcutting", name: "Harvester", cost: 1, req: 5, desc: "+20% log yield", effect: (s) => { s.modifiers.logYield += 0.2; } },
    { id: "forest_lore", skill: "woodcutting", name: "Forest Lore", cost: 1, req: 10, desc: "Auto-convert logs into herbs", effect: (s) => { s.modifiers.logToHerb = true; } },
    { id: "angler", skill: "fishing", name: "Angler", cost: 1, req: 2, desc: "+20% fish yield", effect: (s) => { s.modifiers.fishYield += 0.2; } },
    { id: "deep_bait", skill: "fishing", name: "Deep Bait", cost: 1, req: 6, desc: "Fish can produce coin and supplies", effect: (s) => { s.modifiers.fishLoot = true; } },
    { id: "tide_call", skill: "fishing", name: "Tide Call", cost: 2, req: 12, desc: "+10% mastery gain", effect: (s) => { s.modifiers.fishMasteryBonus = 0.1; } },
    { id: "miner", skill: "mining", name: "Miner", cost: 1, req: 2, desc: "+20% ore yield", effect: (s) => { s.modifiers.oreYield += 0.2; } },
    { id: "vein_sense", skill: "mining", name: "Vein Sense", cost: 1, req: 6, desc: "Ore occasionally yields relic shards", effect: (s) => { s.modifiers.oreLoot = true; } },
    { id: "deep_core", skill: "mining", name: "Deep Core", cost: 2, req: 12, desc: "+10% mastery gain", effect: (s) => { s.modifiers.mineMasteryBonus = 0.1; } },
    { id: "field_medic", skill: "survival", name: "Field Medic", cost: 1, req: 2, desc: "+4 max HP", effect: (s) => { s.hero.baseMaxHp += 4; } },
    { id: "camp_craft", skill: "crafting", name: "Camp Craft", cost: 1, req: 2, desc: "Unlock basic equipment crafting", effect: (s) => { s.unlocks.crafting = true; } },
    { id: "smithing", skill: "crafting", name: "Smithing", cost: 1, req: 6, desc: "Crafting has more output", effect: (s) => { s.modifiers.craftingBonus += 1; } },
    { id: "artisan", skill: "crafting", name: "Artisan", cost: 2, req: 12, desc: "Unlocks advanced gear recipes", effect: (s) => { s.unlocks.advancedCrafting = true; } },
    { id: "war_leader", skill: "leadership", name: "War Leader", cost: 2, req: 5, desc: "+1 party member cap", effect: (s) => { s.party.maxMembers += 1; } },
    { id: "raid_tactician", skill: "leadership", name: "Raid Tactician", cost: 2, req: 12, desc: "+15% raid rewards", effect: (s) => { s.modifiers.raidRewards += 0.15; } },
  ],
  zones: [
    {
      id: "greenwood_fields",
      name: "Greenwood Fields",
      reqLevel: 1,
      enemy: { name: "Wild Boar", hp: 18, attack: 2, level: 1, weakness: "slash", resist: { focus: 0.15 } },
      rewards: { xp: 16, gold: [3, 6], loot: [{ itemId: "boar_hide", chance: 0.4, qty: [1, 2] }, { itemId: "minor_potion", chance: 0.08, qty: [1, 1] }] },
      gather: { itemId: "herb", chance: 0.18, qty: [1, 2] },
    },
    {
      id: "ashen_bog",
      name: "Ashen Bog",
      reqLevel: 6,
      enemy: { name: "Bog Crawler", hp: 32, attack: 5, level: 6, weakness: "focus", resist: { slash: 0.1 } },
      rewards: { xp: 32, gold: [8, 13], loot: [{ itemId: "bog_venom", chance: 0.34, qty: [1, 1] }, { itemId: "iron_ore", chance: 0.26, qty: [1, 3] }] },
      gather: { itemId: "moss", chance: 0.22, qty: [1, 2] },
    },
    {
      id: "sunken_ruins",
      name: "Sunken Ruins",
      reqLevel: 12,
      enemy: { name: "Ruins Knight", hp: 52, attack: 8, level: 12, weakness: "slash", resist: { focus: 0.2 } },
      rewards: { xp: 58, gold: [15, 24], loot: [{ itemId: "ancient_coin", chance: 0.28, qty: [1, 4] }, { itemId: "steel_blade", chance: 0.1, qty: [1, 1] }] },
      gather: { itemId: "relic_shard", chance: 0.2, qty: [1, 1] },
    },
    {
      id: "obsidian_peak",
      name: "Obsidian Peak",
      reqLevel: 20,
      enemy: { name: "Peak Drake", hp: 92, attack: 12, level: 20, weakness: "focus", resist: { slash: 0.15 } },
      rewards: { xp: 110, gold: [28, 42], loot: [{ itemId: "drake_scale", chance: 0.35, qty: [1, 2] }, { itemId: "obsidian_core", chance: 0.08, qty: [1, 1] }] },
      gather: { itemId: "ember_ash", chance: 0.24, qty: [1, 2] },
    },
    {
      id: "raid_citadel",
      name: "Citadel Raid",
      reqLevel: 18,
      raid: true,
      enemy: { name: "Citadel Warden", hp: 180, attack: 18, level: 18, weakness: "balanced", resist: { slash: 0.1, focus: 0.1 } },
      rewards: { xp: 180, gold: [45, 70], loot: [{ itemId: "raid_chest", chance: 0.45, qty: [1, 1] }, { itemId: "legend_shard", chance: 0.12, qty: [1, 1] }] },
    },
  ],
  items: {
    herb: { name: "Herb", type: "material" },
    boar_hide: { name: "Boar Hide", type: "material" },
    grain: { name: "Grain", type: "material" },
    flour: { name: "Flour", type: "material" },
    oil: { name: "Oil", type: "material" },
    leather_strip: { name: "Leather Strip", type: "material" },
    ingot: { name: "Iron Ingot", type: "material" },
    coal: { name: "Coal", type: "material" },
    minor_potion: { name: "Minor Potion", type: "consumable", heal: 24 },
    moss: { name: "Bog Moss", type: "material" },
    iron_ore: { name: "Iron Ore", type: "material" },
    bog_venom: { name: "Bog Venom", type: "material" },
    relic_shard: { name: "Relic Shard", type: "material" },
    ancient_coin: { name: "Ancient Coin", type: "currency" },
    steel_blade: { name: "Steel Blade", type: "equipment", slot: "weapon", attack: 8, cost: 0 },
    drake_scale: { name: "Drake Scale", type: "material" },
    obsidian_core: { name: "Obsidian Core", type: "material" },
    ember_ash: { name: "Ember Ash", type: "material" },
    raid_chest: { name: "Raid Chest", type: "lootbox" },
    legend_shard: { name: "Legend Shard", type: "material" },
    iron_sword: { name: "Iron Sword", type: "equipment", slot: "weapon", attack: 4, cost: 3 },
    leather_armor: { name: "Leather Armor", type: "equipment", slot: "armor", defense: 2, cost: 3 },
    scout_cloak: { name: "Scout Cloak", type: "equipment", slot: "cloak", defense: 1, maxHp: 8, cost: 4 },
    war_band: { name: "War Band", type: "equipment", slot: "ring", attack: 2, defense: 1, cost: 5 },
    bronze_pick: { name: "Bronze Pick", type: "equipment", slot: "weapon", attack: 2, cost: 2 },
    fisher_hat: { name: "Fisher Hat", type: "equipment", slot: "cloak", maxHp: 2, cost: 2 },
  },
  bankCategories: {
    materials: ["herb", "boar_hide", "grain", "moss", "iron_ore", "bog_venom", "relic_shard", "drake_scale", "obsidian_core", "ember_ash", "legend_shard"],
    intermediates: ["minor_potion", "flour", "oil", "leather_strip", "ingot", "coal", "iron_sword", "leather_armor", "scout_cloak", "war_band", "bronze_pick", "fisher_hat"],
    consumables: ["minor_potion"],
    currency: ["ancient_coin"],
    equipment: ["steel_blade", "iron_sword", "leather_armor", "scout_cloak", "war_band", "bronze_pick", "fisher_hat"],
    loot: ["raid_chest"],
  },
  masteryActivities: ["combat", "woodcutting", "fishing", "mining", "crafting"],
  combatStyles: {
    slash: false,
    focus: false,
    balanced: true,
  },
  quests: [
    { id: "hunt_boil", name: "Boar Problem", goal: { itemId: "boar_hide", qty: 5 }, rewards: { gold: 25, xp: 30, skillPoint: 1 } },
    { id: "bog_path", name: "Bog Supplies", goal: { itemId: "bog_venom", qty: 4 }, rewards: { gold: 45, xp: 50, skillPoint: 1 } },
    { id: "ruins_echo", name: "Ruins Echo", goal: { itemId: "ancient_coin", qty: 8 }, rewards: { gold: 80, xp: 90, skillPoint: 2 } },
  ],
  partyMembers: [
    { id: "lyra", name: "Lyra", cost: 25, bonus: { attack: 2, defense: 1, gatheringYield: 0.08 } },
    { id: "toren", name: "Toren", cost: 45, bonus: { attack: 4, maxHp: 12, raidRewards: 0.08 } },
    { id: "mira", name: "Mira", cost: 70, bonus: { defense: 3, lootChance: 0.08, raidRewards: 0.1 } },
  ],
  townProjects: [
    { id: "granary", name: "Granary", cost: { herb: 10, boar_hide: 5 }, unlocks: ["bank_cap"] },
    { id: "lumbermill", name: "Lumber Mill", cost: { herb: 15, iron_ore: 5 }, unlocks: ["log_yield"] },
    { id: "dock", name: "Town Dock", cost: { moss: 10, iron_ore: 10 }, unlocks: ["fish_yield"] },
    { id: "smelter", name: "Smelter", cost: { iron_ore: 15, relic_shard: 2 }, unlocks: ["ore_yield"] },
    { id: "forge", name: "Forge", cost: { iron_ore: 20, boar_hide: 10 }, unlocks: ["crafting_bonus"] },
    { id: "mill", name: "Windmill", cost: { herb: 20, moss: 10 }, unlocks: ["grain_chain"] },
    { id: "press", name: "Oil Press", cost: { boar_hide: 12, moss: 10 }, unlocks: ["oil_chain"] },
    { id: "workshop", name: "Workshop", cost: { iron_ore: 18, relic_shard: 5 }, unlocks: ["tool_chain"] },
    { id: "tannery", name: "Tannery", cost: { boar_hide: 15, moss: 8 }, unlocks: ["leather_chain"] },
    { id: "kiln", name: "Kiln", cost: { grain: 12, moss: 12 }, unlocks: ["coal_chain"] },
    { id: "foundry", name: "Foundry", cost: { ingot: 10, relic_shard: 4 }, unlocks: ["steel_chain"] },
  ],
};

const defaultState = () => ({
  version: 1,
  time: 0,
  lastSaveAt: Date.now(),
  gold: 0,
  skillPoints: 0,
  hero: {
    level: 1,
    xp: 0,
    hp: 100,
    baseMaxHp: 100,
    baseAttack: 6,
    baseDefense: 3,
  },
  skills: {
    combat: 1,
    strength: 1,
    attack: 1,
    hitpoints: 1,
    defense: 1,
    woodcutting: 1,
    fishing: 1,
    mining: 1,
    crafting: 1,
    survival: 1,
    leadership: 1,
  },
  activeActivity: "combat",
  zoneId: "greenwood_fields",
  world: {
    zonesUnlocked: ["greenwood_fields"],
  },
  equipment: {
    weapon: null,
    armor: null,
    cloak: null,
    ring: null,
  },
  loadout: {
    combat: {
      weapon: null,
      armor: null,
      cloak: null,
      ring: null,
      style: "balanced",
    },
  },
  combatStyles: {
    slash: false,
    focus: false,
  },
  inventory: {
    herb: 0,
    boar_hide: 0,
    grain: 0,
    flour: 0,
    oil: 0,
    leather_strip: 0,
    ingot: 0,
    coal: 0,
    minor_potion: 1,
    moss: 0,
    iron_ore: 0,
    bog_venom: 0,
    relic_shard: 0,
    ancient_coin: 0,
    steel_blade: 0,
    drake_scale: 0,
    obsidian_core: 0,
    ember_ash: 0,
    raid_chest: 0,
    legend_shard: 0,
    iron_sword: 0,
    leather_armor: 0,
    scout_cloak: 0,
    war_band: 0,
    bronze_pick: 0,
    fisher_hat: 0,
  },
  bankCap: 100,
  party: {
    members: [],
    maxMembers: 2,
  },
  quests: {
    active: ["hunt_boil"],
    completed: [],
  },
  raid: {
    progress: 0,
    completions: 0,
  },
  mastery: {
    combat: 0,
    woodcutting: 0,
    fishing: 0,
    mining: 0,
    crafting: 0,
  },
  town: {
    projects: [],
  },
  tab: "skills",
  modifiers: {
    gatheringYield: 1,
    logYield: 1,
    fishYield: 1,
    oreYield: 1,
    lootChance: 1,
    raidRewards: 1,
    bankCapBonus: 0,
    craftingBonus: 0,
    logToHerb: false,
    fishLoot: false,
    oreLoot: false,
    fishMasteryBonus: 0,
    mineMasteryBonus: 0,
    armorPen: 0,
  },
  unlocks: {
    crafting: false,
  },
  auto: {
    combat: true,
    gather: true,
    rest: true,
    craft: true,
    quest: true,
    party: true,
  },
  log: [],
});

let state = loadState() ?? defaultState();
applyOfflineProgress();

const el = {
  location: document.querySelector("#location"),
  gold: document.querySelector("#gold"),
  time: document.querySelector("#time"),
  hpBar: document.querySelector("#hp-bar"),
  xpBar: document.querySelector("#xp-bar"),
  hpText: document.querySelector("#hp-text"),
  xpText: document.querySelector("#xp-text"),
  stats: document.querySelector("#stats"),
  activityList: document.querySelector("#activity-list"),
  autoList: document.querySelector("#automation-list"),
  log: document.querySelector("#log"),
  skillTree: document.querySelector("#skill-tree"),
  zoneList: document.querySelector("#zone-list"),
  inventory: document.querySelector("#inventory"),
  equipment: document.querySelector("#equipment"),
  questList: document.querySelector("#quest-list"),
  partyList: document.querySelector("#party-list"),
  raidPanel: document.querySelector("#raid-panel"),
  saveStatus: document.querySelector("#save-status"),
  bankSearch: document.querySelector("#bank-search"),
  bankFilter: document.querySelector("#bank-filter"),
  combatEnemy: document.querySelector("#combat-enemy"),
  combatLoadout: document.querySelector("#combat-loadout"),
  combatStyle: document.querySelector("#combat-style"),
  combatStyleBar: document.querySelector("#combat-style-bar"),
  combatStyleText: document.querySelector("#combat-style-text"),
};

function now() {
  return Date.now();
}

function xpToNext(level) {
  return 100 + (level - 1) * 40;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return mergeState(defaultState(), parsed);
  } catch {
    return null;
  }
}

function mergeState(base, saved) {
  for (const [key, value] of Object.entries(saved ?? {})) {
    if (value && typeof value === "object" && !Array.isArray(value) && base[key]) {
      base[key] = mergeState(base[key], value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function saveState() {
  state.lastSaveAt = now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  el.saveStatus.textContent = `Saved ${new Date(state.lastSaveAt).toLocaleTimeString()}`;
}

function addLog(message) {
  state.log.unshift({ message, at: state.time });
  state.log = state.log.slice(0, 12);
}

function findZone(zoneId) {
  return DEFINITIONS.zones.find((zone) => zone.id === zoneId);
}

function currentZone() {
  return findZone(state.zoneId) ?? DEFINITIONS.zones[0];
}

function zoneEnemyStats(zone) {
  const loadout = state.loadout.combat;
  const weapon = loadout.weapon ? DEFINITIONS.items[loadout.weapon] : null;
  const armor = loadout.armor ? DEFINITIONS.items[loadout.armor] : null;
  const cloak = loadout.cloak ? DEFINITIONS.items[loadout.cloak] : null;
  const ring = loadout.ring ? DEFINITIONS.items[loadout.ring] : null;
  const style = loadout.style;
  const bonus = {
    attack: (weapon?.attack ?? 0) + (ring?.attack ?? 0),
    defense: (armor?.defense ?? 0) + (cloak?.defense ?? 0) + (ring?.defense ?? 0),
    maxHp: (armor?.maxHp ?? 0) + (cloak?.maxHp ?? 0),
  };
  return {
    name: zone.enemy.name,
    level: zone.enemy.level,
    hp: zone.enemy.hp,
    attack: zone.enemy.attack,
    style,
    bonus,
  };
}

function effectiveStats() {
  const gear = equippedBonuses();
  const party = partyBonuses();
  return {
    maxHp: state.hero.baseMaxHp + gear.maxHp + party.maxHp,
    attack: state.hero.baseAttack + gear.attack + party.attack + Math.floor(state.skills.attack * 0.05),
    defense: state.hero.baseDefense + gear.defense + party.defense + Math.floor(state.skills.defense * 0.05),
    armorPen: state.modifiers.armorPen + Math.floor(state.skills.strength * 0.03),
    gatheringYield: state.modifiers.gatheringYield + party.gatheringYield,
    lootChance: state.modifiers.lootChance + party.lootChance,
    raidRewards: state.modifiers.raidRewards + party.raidRewards,
  };
}

function applyTownProject(projectId) {
  const project = DEFINITIONS.townProjects.find((entry) => entry.id === projectId);
  if (!project || state.town.projects.includes(projectId)) return;
  const hasCost = Object.entries(project.cost).every(([itemId, qty]) => (state.inventory[itemId] ?? 0) >= qty);
  if (!hasCost) return;
  for (const [itemId, qty] of Object.entries(project.cost)) removeItem(itemId, qty);
  state.town.projects.push(projectId);
  for (const unlock of project.unlocks) {
    if (unlock === "bank_cap") state.modifiers.bankCapBonus += 25;
    if (unlock === "log_yield") state.modifiers.logYield += 0.25;
    if (unlock === "fish_yield") state.modifiers.fishYield += 0.25;
    if (unlock === "ore_yield") state.modifiers.oreYield += 0.25;
    if (unlock === "crafting_bonus") state.modifiers.craftingBonus += 2;
  }
  addLog(`Completed town project: ${project.name}.`);
}

function equippedBonuses() {
  const active = state.loadout?.combat ?? {};
  return Object.values(active).reduce((sum, itemId) => {
    const item = itemId ? DEFINITIONS.items[itemId] : null;
    if (!item || item.type !== "equipment") return sum;
    sum.attack += item.attack ?? 0;
    sum.defense += item.defense ?? 0;
    sum.maxHp += item.maxHp ?? 0;
    return sum;
  }, { attack: 0, defense: 0, maxHp: 0 });
}

function partyBonuses() {
  return state.party.members.reduce((sum, memberId) => {
    const member = DEFINITIONS.partyMembers.find((m) => m.id === memberId);
    if (!member) return sum;
    for (const [key, value] of Object.entries(member.bonus)) {
      sum[key] = (sum[key] ?? 0) + value;
    }
    return sum;
  }, { attack: 0, defense: 0, maxHp: 0, gatheringYield: 0, lootChance: 0, raidRewards: 0 });
}

function skillLevel(skillId) {
  return state.skills[skillId] ?? 1;
}

function canBuyNode(node) {
  return skillLevel(node.skill) >= node.req && !state.unlockedNodes?.includes(node.id) && state.skillPoints >= node.cost;
}

function ensureUnlocks() {
  state.unlockedNodes ??= [];
  for (const zone of DEFINITIONS.zones) {
    if (state.hero.level >= zone.reqLevel && !state.world.zonesUnlocked.includes(zone.id)) {
      state.world.zonesUnlocked.push(zone.id);
      addLog(`${zone.name} has been unlocked.`);
    }
  }
}

function gainSkillXp(skillId, amount) {
  const before = Math.floor(state.skills[skillId]);
  state.skills[skillId] += amount;
  const after = Math.floor(state.skills[skillId]);
  if (after > before) {
    state.skillPoints += after - before;
    addLog(`${capitalize(skillId)} skill increased to ${after}.`);
  }
}

function bankSpaceOk(qty = 1) {
  return bankCount() + qty <= bankCap();
}

function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
}

function gainHeroXp(amount) {
  state.hero.xp += amount;
  while (state.hero.xp >= xpToNext(state.hero.level)) {
    state.hero.xp -= xpToNext(state.hero.level);
    state.hero.level += 1;
    state.hero.baseMaxHp += 8;
    state.hero.baseAttack += 1;
    state.hero.baseDefense += 1;
    state.hero.hp = effectiveStats().maxHp;
    state.skillPoints += 1;
    addLog(`Hero reached level ${state.hero.level}.`);
    ensureUnlocks();
  }
}

function roll(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function chance(prob) {
  return Math.random() < prob;
}

function addItem(itemId, qty) {
  if (!bankSpaceOk(qty)) {
    addLog("Bank is full.");
    return;
  }
  state.inventory[itemId] = (state.inventory[itemId] ?? 0) + qty;
}

function removeItem(itemId, qty) {
  state.inventory[itemId] = Math.max(0, (state.inventory[itemId] ?? 0) - qty);
}

function bankCount() {
  return Object.values(state.inventory).reduce((sum, qty) => sum + qty, 0);
}

function bankCap() {
  return state.bankCap + state.modifiers.bankCapBonus;
}

function masteryXp(activity, amount) {
  state.mastery[activity] += amount;
  const level = Math.floor(state.mastery[activity] / 10) + 1;
  if (state.mastery[activity] % 10 < amount) {
    addLog(`${capitalize(activity)} mastery reached ${level}.`);
    const tiers = [
      { level: 5, bonus: () => { if (activity === "combat") state.hero.baseAttack += 1; if (activity === "woodcutting") state.modifiers.logYield += 0.1; if (activity === "fishing") state.modifiers.fishYield += 0.1; if (activity === "mining") state.modifiers.oreYield += 0.1; if (activity === "crafting") state.modifiers.craftingBonus += 1; } },
      { level: 10, bonus: () => { if (activity === "combat") state.hero.baseDefense += 1; if (activity === "woodcutting") state.modifiers.gatheringYield += 0.05; if (activity === "fishing") state.modifiers.fishLoot = true; if (activity === "mining") state.modifiers.oreLoot = true; if (activity === "crafting") state.unlocks.advancedCrafting = true; } },
      { level: 20, bonus: () => { if (activity === "combat") state.modifiers.raidRewards += 0.05; if (activity === "woodcutting") state.modifiers.logToHerb = true; if (activity === "fishing") state.modifiers.fishMasteryBonus += 0.05; if (activity === "mining") state.modifiers.mineMasteryBonus += 0.05; if (activity === "crafting") state.bankCap += 25; } },
      { level: 30, bonus: () => { if (activity === "combat") state.combatStyles.focus = true; if (activity === "woodcutting") state.modifiers.bankCapBonus += 10; if (activity === "fishing") state.modifiers.raidRewards += 0.02; if (activity === "mining") state.modifiers.raidRewards += 0.02; if (activity === "crafting") state.modifiers.craftingBonus += 2; } },
      { level: 40, bonus: () => { if (activity === "combat") state.modifiers.armorPen += 2; if (activity === "woodcutting") state.modifiers.bankCapBonus += 15; if (activity === "fishing") state.modifiers.fishLoot = true; if (activity === "mining") state.modifiers.oreLoot = true; if (activity === "crafting") state.modifiers.craftingBonus += 3; } },
    ];
    for (const tier of tiers) {
      if (level === tier.level) {
        tier.bonus();
        addLog(`${capitalize(activity)} mastery milestone unlocked.`);
      }
    }
  }
}

function autoEquipBetter() {
  for (const [itemId, item] of Object.entries(DEFINITIONS.items)) {
    if (item.type !== "equipment") continue;
    if ((state.inventory[itemId] ?? 0) <= 0) continue;
    const slot = item.slot;
    const currentId = state.equipment[slot];
    const current = currentId ? DEFINITIONS.items[currentId] : null;
    const currentScore = (current?.attack ?? 0) + (current?.defense ?? 0) + (current?.maxHp ?? 0);
    const newScore = (item.attack ?? 0) + (item.defense ?? 0) + (item.maxHp ?? 0);
    if (!currentId || newScore > currentScore) {
      state.equipment[slot] = itemId;
      addLog(`Equipped ${item.name}.`);
    }
  }
}

function sellDuplicateLoot() {
  for (const [itemId, qty] of Object.entries(state.inventory)) {
    const item = DEFINITIONS.items[itemId];
    if (!item) continue;
    if (item.type === "material" && qty > 12) {
      const sellQty = qty - 12;
      removeItem(itemId, sellQty);
      state.gold += sellQty * 2;
    }
  }
}

function itemMatchesFilter(itemId, filter) {
  if (!filter || filter === "all") return true;
  const category = Object.entries(DEFINITIONS.bankCategories).find(([, items]) => items.includes(itemId))?.[0];
  return category === filter;
}

function completeQuest(questId) {
  if (state.quests.completed.includes(questId)) return;
  const quest = DEFINITIONS.quests.find((q) => q.id === questId);
  if (!quest) return;
  if (!state.quests.active.includes(questId)) return;
  if ((state.inventory[quest.goal.itemId] ?? 0) < quest.goal.qty) return;

  removeItem(quest.goal.itemId, quest.goal.qty);
  state.gold += quest.rewards.gold;
  gainHeroXp(quest.rewards.xp);
  state.skillPoints += quest.rewards.skillPoint ?? 0;
  state.quests.completed.push(questId);
  state.quests.active = state.quests.active.filter((id) => id !== questId);
  addLog(`Quest completed: ${quest.name}.`);
}

function progressQuests() {
  if (!state.auto.quest) return;
  for (const questId of [...state.quests.active]) {
    completeQuest(questId);
  }
}

function craftIfPossible() {
  if (!state.auto.craft || !state.unlocks.crafting) return;
  const recipes = [
    { itemId: "iron_sword", cost: { iron_ore: 6, boar_hide: 2 }, craftAt: 4 },
    { itemId: "leather_armor", cost: { boar_hide: 6, herb: 2 }, craftAt: 3 },
    { itemId: "scout_cloak", cost: { moss: 4, herb: 4 }, craftAt: 2 },
    { itemId: "war_band", cost: { relic_shard: 4, ancient_coin: 4 }, craftAt: 2 },
  ];
  for (const recipe of recipes) {
    if (state.inventory[recipe.itemId] >= 1) continue;
    const canCraft = Object.entries(recipe.cost).every(([itemId, qty]) => (state.inventory[itemId] ?? 0) >= qty);
    if (!canCraft) continue;
    for (const [itemId, qty] of Object.entries(recipe.cost)) removeItem(itemId, qty);
    addItem(recipe.itemId, 1);
    addLog(`Crafted ${DEFINITIONS.items[recipe.itemId].name}.`);
    masteryXp("crafting", 0.5);
    autoEquipBetter();
    break;
  }
}

function recruitParty() {
  if (!state.auto.party) return;
  if (state.party.members.length >= state.party.maxMembers) return;
  const available = DEFINITIONS.partyMembers.find((member) => state.gold >= member.cost && !state.party.members.includes(member.id));
  if (!available) return;
  state.gold -= available.cost;
  state.party.members.push(available.id);
  addLog(`${available.name} joined the party.`);
}

function runTownProduction() {
  if (state.town.projects.includes("granary") && state.time % 10 < 0.25) addItem("minor_potion", 1);
  if (state.town.projects.includes("lumbermill") && state.time % 12 < 0.25) {
    addItem("herb", 1);
    if (chance(0.3)) addItem("moss", 1);
  }
  if (state.town.projects.includes("mill") && state.time % 14 < 0.25) {
    addItem("grain", 1);
    if (chance(0.35)) addItem("flour", 1);
  }
  if (state.town.projects.includes("dock") && state.time % 15 < 0.25) {
    addItem("boar_hide", 1);
    if (chance(0.3)) addItem("bog_venom", 1);
  }
  if (state.town.projects.includes("smelter") && state.time % 18 < 0.25) {
    addItem("iron_ore", 1);
    if (chance(0.25)) addItem("relic_shard", 1);
  }
  if (state.town.projects.includes("forge") && state.time % 20 < 0.25) {
    addItem("war_band", 1);
    if (chance(0.4)) addItem("bronze_pick", 1);
  }
  if (state.town.projects.includes("press") && state.time % 22 < 0.25) addItem("ember_ash", 1);
  if (state.town.projects.includes("workshop") && state.time % 24 < 0.25) addItem("legend_shard", 1);
  if (state.town.projects.includes("tannery") && state.time % 16 < 0.25) {
    addItem("leather_strip", 1);
    if (chance(0.25)) addItem("oil", 1);
  }
  if (state.town.projects.includes("kiln") && state.time % 18 < 0.25) {
    addItem("coal", 1);
    if (chance(0.2)) addItem("ancient_coin", 1);
  }
  if (state.town.projects.includes("foundry") && state.time % 21 < 0.25) {
    addItem("ingot", 1);
    if (chance(0.25)) addItem("steel_blade", 1);
  }
}

function chooseNextZone() {
  const unlocked = DEFINITIONS.zones.filter((zone) => state.world.zonesUnlocked.includes(zone.id));
  const current = currentZone();
  const next = unlocked.find((zone) => zone.reqLevel > current.reqLevel && state.hero.level >= zone.reqLevel);
  if (next) state.zoneId = next.id;
}

function fight(dt) {
  const zone = currentZone();
  if (state.hero.hp <= 0) return;
  if (zone.raid && state.party.members.length === 0) return;

  const stats = effectiveStats();
  const enemy = zone.enemy;
  const style = state.loadout.combat.style;
  const resist = enemy.resist?.[style] ?? 0;
  const styleBonus = style === enemy.weakness ? 1.35 : style === "balanced" ? 1 : 0.9;
  const gearBonus = 1 + ((state.combatStyles.slash && style === "slash") ? 0.1 : 0) + ((state.combatStyles.focus && style === "focus") ? 0.1 : 0);
  const damageToEnemy = Math.max(1, (stats.attack + state.skills.strength * 0.04 + state.hero.level * 0.2) * dt * styleBonus * gearBonus * (1 - resist) * (1 + stats.armorPen * 0.03));
  zone._enemyHp ??= zone.enemy.hp;
  zone._enemyHp -= damageToEnemy;
  if (zone._enemyHp > 0) {
    const incomingStyle = style === "focus" ? 0.85 : style === "slash" ? 1.1 : 1;
    const incoming = Math.max(0, zone.enemy.attack * incomingStyle - stats.defense - Math.floor(state.skills.hitpoints * 0.03));
    state.hero.hp -= incoming * dt;
  }
  if (zone._enemyHp <= 0) {
    zone._enemyHp = zone.enemy.hp;
    const rewardMultiplier = zone.raid ? stats.raidRewards : 1;
    const goldReward = roll(zone.rewards.gold[0], zone.rewards.gold[1]) * rewardMultiplier;
    state.gold += goldReward;
    gainHeroXp(zone.rewards.xp * rewardMultiplier);
    gainSkillXp("combat", 0.35);
    gainSkillXp("strength", 0.2);
    gainSkillXp("attack", 0.2);
    gainSkillXp("hitpoints", 0.15);
    gainSkillXp("defense", 0.15);
    masteryXp("combat", 0.5 * (style === enemy.weakness ? 1.5 : 1));
    addLog(`Defeated ${zone.enemy.name} in ${zone.name}.`);
    dropLoot(zone);
    if (zone.raid) state.raid.completions += 1;
  }
  if (state.hero.hp <= 0) {
    state.hero.hp = 1;
    addLog("Hero was knocked out and recovered automatically.");
  }
}

function dropLoot(zone) {
  const stats = effectiveStats();
  for (const drop of zone.rewards.loot) {
    const adjustedChance = Math.min(0.9, drop.chance * stats.lootChance);
    if (chance(adjustedChance)) {
      const qty = roll(drop.qty[0], drop.qty[1]);
      addItem(drop.itemId, qty);
      addLog(`Looted ${qty} ${DEFINITIONS.items[drop.itemId].name}.`);
    }
  }
}

function gather(dt) {
  const zone = currentZone();
  if (!zone.gather) return;
  const stats = effectiveStats();
  const yieldQty = dt * stats.gatheringYield;
  if (chance(zone.gather.chance)) {
    const qty = Math.max(1, Math.round(roll(zone.gather.qty[0], zone.gather.qty[1]) * yieldQty));
    addItem(zone.gather.itemId, qty);
    gainSkillXp("woodcutting", 0.3);
    masteryXp("woodcutting", 0.25);
    addLog(`Gathered ${qty} ${DEFINITIONS.items[zone.gather.itemId].name}.`);
  }
}

function rest(dt) {
  const stats = effectiveStats();
  if (state.hero.hp < stats.maxHp) {
    state.hero.hp = Math.min(stats.maxHp, state.hero.hp + 8 * dt);
    gainSkillXp("survival", 0.15);
  }
}

function woodcut(dt) {
  const qty = Math.max(1, Math.round((1 + state.skills.woodcutting * 0.05) * dt * effectiveStats().logYield));
  addItem("herb", qty);
  if (state.modifiers.logToHerb && chance(0.35)) addItem("moss", 1);
  gainSkillXp("woodcutting", 0.35);
  masteryXp("woodcutting", 0.4);
  addLog(`Chopped ${qty} logs.`);
}

function fish(dt) {
  const qty = Math.max(1, Math.round((1 + state.skills.fishing * 0.05) * dt * effectiveStats().fishYield));
  addItem("minor_potion", qty > 1 ? 1 : 0);
  if (state.modifiers.fishLoot && chance(0.25)) addItem("ancient_coin", 1);
  gainSkillXp("fishing", 0.35);
  masteryXp("fishing", 0.4);
  addLog(`Fished ${qty} catches.`);
}

function mine(dt) {
  const qty = Math.max(1, Math.round((1 + state.skills.mining * 0.05) * dt * effectiveStats().oreYield));
  addItem("iron_ore", qty);
  if (state.modifiers.oreLoot && chance(0.2)) addItem("relic_shard", 1);
  gainSkillXp("mining", 0.35);
  masteryXp("mining", 0.4);
  addLog(`Mined ${qty} ore.`);
}

function runActiveActivity(dt) {
  switch (state.activeActivity) {
    case "combat":
      fight(dt);
      break;
    case "woodcutting":
      woodcut(dt);
      break;
    case "fishing":
      fish(dt);
      break;
    case "mining":
      mine(dt);
      break;
    case "crafting":
      craftIfPossible();
      break;
    default:
      break;
  }
}

function tick(dt) {
  state.time += dt;
  if (state.auto.party) recruitParty();
  runActiveActivity(dt);
  if (state.auto.rest) rest(dt);
  craftIfPossible();
  progressQuests();
  runTownProduction();
  sellDuplicateLoot();
  chooseNextZone();
  render();
}

function unlockNode(nodeId) {
  const node = DEFINITIONS.skillTree.find((entry) => entry.id === nodeId);
  if (!node) return;
  state.unlockedNodes ??= [];
  if (state.unlockedNodes.includes(nodeId)) return;
  if (state.skillPoints < node.cost) return;
  if (skillLevel(node.skill) < node.req) return;
  state.skillPoints -= node.cost;
  state.unlockedNodes.push(nodeId);
  node.effect(state);
  addLog(`Unlocked skill tree node: ${node.name}.`);
}

function toggleZone(zoneId) {
  const zone = findZone(zoneId);
  if (!zone) return;
  if (state.hero.level < zone.reqLevel) return;
  state.zoneId = zoneId;
  addLog(`Traveling to ${zone.name}.`);
}

function acceptQuest(questId) {
  if (state.quests.active.includes(questId) || state.quests.completed.includes(questId)) return;
  state.quests.active.push(questId);
  addLog(`Accepted quest: ${DEFINITIONS.quests.find((q) => q.id === questId)?.name ?? questId}.`);
}

function toggleAuto(key) {
  state.auto[key] = !state.auto[key];
}

function applyOfflineProgress() {
  const savedAt = state.lastSaveAt ?? now();
  const elapsed = Math.min(OFFLINE_CAP_SECONDS, Math.floor((now() - savedAt) / 1000));
  if (elapsed <= 5) return;
  const steps = Math.max(1, Math.floor(elapsed / 5));
  const dt = elapsed / steps;
  for (let i = 0; i < steps; i += 1) {
    tick(dt);
  }
  addLog(`Applied ${elapsed} seconds of offline progress.`);
}

function render() {
  const zone = currentZone();
  const stats = effectiveStats();
  el.location.textContent = zone.name;
  el.gold.textContent = Math.floor(state.gold);
  el.time.textContent = `${Math.floor(state.time)}s`;

  el.hpText.textContent = `${Math.floor(state.hero.hp)} / ${Math.floor(stats.maxHp)}`;
  el.xpText.textContent = `${Math.floor(state.hero.xp)} / ${xpToNext(state.hero.level)}`;
  el.hpBar.style.width = `${Math.max(0, Math.min(100, (state.hero.hp / stats.maxHp) * 100))}%`;
  el.xpBar.style.width = `${Math.max(0, Math.min(100, (state.hero.xp / xpToNext(state.hero.level)) * 100))}%`;

  el.stats.innerHTML = `
    <div class="stat"><span>Level</span><strong>${state.hero.level}</strong></div>
    <div class="stat"><span>Attack</span><strong>${Math.floor(stats.attack)}</strong></div>
    <div class="stat"><span>Defense</span><strong>${Math.floor(stats.defense)}</strong></div>
    <div class="stat"><span>Skill Points</span><strong>${state.skillPoints}</strong></div>
  `;

  el.saveStatus.textContent = `Bank ${bankCount()} / ${bankCap()} | Tab ${capitalize(state.tab)}`;

  const tabs = [
    { id: "skills", label: "Skills" },
    { id: "bank", label: "Bank" },
    { id: "combat", label: "Combat" },
    { id: "town", label: "Town" },
  ];
  document.querySelector("#tab-bar").innerHTML = tabs
    .map((tab) => `<button class="tab-button ${state.tab === tab.id ? "active" : ""}" data-tab="${tab.id}">${tab.label}</button>`)
    .join("");

  el.activityList.innerHTML = DEFINITIONS.activities
    .map((activity) => `
      <button class="skill-node ${state.activeActivity === activity.id ? "active" : ""}" data-activity="${activity.id}">
        <strong>${activity.name}</strong>
        <small>${activity.desc}</small>
      </button>
    `)
    .join("");

  el.autoList.innerHTML = Object.entries(state.auto)
    .map(([key, enabled]) => `
      <button class="automation-item" data-auto="${key}">
        <div>
          <strong>${capitalize(key)}</strong>
          <small>${enabled ? "Running automatically" : "Paused"}</small>
        </div>
        <div class="${enabled ? "good" : "bad"}">${enabled ? "ON" : "OFF"}</div>
      </button>
    `)
    .join("");

  el.zoneList.innerHTML = DEFINITIONS.zones
    .map((zoneEntry) => `
      <button class="zone-item ${zoneEntry.id === state.zoneId ? "active" : ""}" data-zone="${zoneEntry.id}" ${state.hero.level < zoneEntry.reqLevel ? "disabled" : ""}>
        <strong>${zoneEntry.name}</strong>
        <small>${zoneEntry.raid ? "Raid" : `Req level ${zoneEntry.reqLevel}`}</small>
      </button>
    `)
    .join("");

  const bankSearch = (el.bankSearch?.value ?? "").trim().toLowerCase();
  const bankFilter = el.bankFilter?.value ?? "all";
  el.inventory.innerHTML = Object.entries(state.inventory)
    .filter(([itemId, qty]) => qty > 0 && itemMatchesFilter(itemId, bankFilter) && (bankSearch === "" || (DEFINITIONS.items[itemId]?.name ?? itemId).toLowerCase().includes(bankSearch)))
    .map(([itemId, qty]) => `<div class="inventory-row"><span>${DEFINITIONS.items[itemId]?.name ?? itemId}</span><strong>${qty}</strong></div>`)
    .join("") || `<div class="empty">No items match your filter.</div>`;

  el.equipment.innerHTML = Object.entries(state.equipment)
    .map(([slot, itemId]) => `<div class="inventory-row"><span>${capitalize(slot)}</span><strong>${itemId ? DEFINITIONS.items[itemId]?.name : "Empty"}</strong></div>`)
    .join("");

  el.skillTree.innerHTML = DEFINITIONS.skillTree
    .map((node) => {
      const unlocked = state.unlockedNodes?.includes(node.id);
      const canUnlock = canBuyNode(node);
      return `
        <button class="skill-node ${unlocked ? "unlocked" : ""}" data-skill-node="${node.id}" ${canUnlock ? "" : "disabled"}>
          <strong>${node.name}</strong>
          <small>${node.skill} ${node.req}+ | ${node.desc} | Cost ${node.cost}</small>
        </button>
      `;
    })
    .join("");

  el.questList.innerHTML = DEFINITIONS.quests
    .map((quest) => {
      const completed = state.quests.completed.includes(quest.id);
      const active = state.quests.active.includes(quest.id);
      const progress = Math.min(quest.goal.qty, state.inventory[quest.goal.itemId] ?? 0);
      return `
        <button class="quest-item ${completed ? "completed" : active ? "active" : ""}" data-quest="${quest.id}" ${completed ? "disabled" : ""}>
          <strong>${quest.name}</strong>
          <small>${DEFINITIONS.items[quest.goal.itemId].name} ${progress}/${quest.goal.qty} | Gold ${quest.rewards.gold} | XP ${quest.rewards.xp}</small>
        </button>
      `;
    })
    .join("");

  el.partyList.innerHTML = DEFINITIONS.partyMembers
    .map((member) => {
      const hired = state.party.members.includes(member.id);
      return `
        <button class="party-item ${hired ? "hired" : ""}" data-party="${member.id}" ${hired || state.party.members.length >= state.party.maxMembers ? "disabled" : ""}>
          <strong>${member.name}</strong>
          <small>Cost ${member.cost} gold | ${Object.entries(member.bonus).map(([k, v]) => `${k}+${v}`).join(", ")}</small>
        </button>
      `;
    })
    .join("");

  el.raidPanel.innerHTML = `
    <div class="raid-box">
      <strong>Production Chains</strong>
      <div class="inventory-row"><span>Granary</span><strong>Potions</strong></div>
      <div class="inventory-row"><span>Mill</span><strong>Grain + Flour</strong></div>
      <div class="inventory-row"><span>Tannery</span><strong>Leather + Oil</strong></div>
      <div class="inventory-row"><span>Smelter</span><strong>Ore + Shards</strong></div>
      <div class="inventory-row"><span>Kiln</span><strong>Coal + Coins</strong></div>
      <div class="inventory-row"><span>Foundry</span><strong>Ingots + Steel</strong></div>
      <strong>Bank</strong>
      <small>${bankCount()} / ${bankCap()}</small>
      <strong>Mastery</strong>
      ${Object.entries(state.mastery).map(([k, v]) => `<div class="inventory-row"><span>${capitalize(k)}</span><strong>${v.toFixed(1)}</strong></div>`).join("")}
      <strong>Town Projects</strong>
      ${DEFINITIONS.townProjects.map((project) => {
        const done = state.town.projects.includes(project.id);
        const canBuild = !done && Object.entries(project.cost).every(([itemId, qty]) => (state.inventory[itemId] ?? 0) >= qty);
        return `<button class="town-project ${done ? "completed" : ""}" data-town="${project.id}" ${canBuild ? "" : "disabled"}><strong>${project.name}</strong><small>${Object.entries(project.cost).map(([itemId, qty]) => `${DEFINITIONS.items[itemId].name} ${qty}`).join(", ")}</small></button>`;
      }).join("")}
      <strong>Raid Progress</strong>
      <div class="bar"><div class="fill xp" style="width: ${Math.min(100, state.raid.progress)}%"></div></div>
      <small>Completions: ${state.raid.completions} | Need at least 1 party member to run</small>
    </div>
  `;

  el.log.innerHTML = state.log
    .map((entry) => `<div class="log-entry">${entry.message}</div>`)
    .join("");

  const combatEnemy = currentZone();
  el.combatEnemy.innerHTML = `
    <div class="inventory-row"><span>Enemy</span><strong>${combatEnemy.enemy.name}</strong></div>
    <div class="inventory-row"><span>Level</span><strong>${combatEnemy.enemy.level}</strong></div>
    <div class="inventory-row"><span>HP</span><strong>${combatEnemy.enemy.hp}</strong></div>
    <div class="inventory-row"><span>Attack</span><strong>${combatEnemy.enemy.attack}</strong></div>
    <div class="inventory-row"><span>Weakness</span><strong>${combatEnemy.enemy.weakness}</strong></div>
    <div class="inventory-row"><span>Style</span><strong>${state.loadout.combat.style}</strong></div>
  `;
  el.combatLoadout.innerHTML = Object.entries(state.loadout.combat)
    .map(([slot, itemId]) => slot === "style"
      ? `
        <div class="skill-tree">
          <button class="town-project" data-style="balanced"><strong>Balanced</strong><small>Default stance</small></button>
          <button class="town-project" data-style="slash"><strong>Slash</strong><small>High attack</small></button>
          <button class="town-project" data-style="focus"><strong>Focus</strong><small>Higher defense</small></button>
        </div>`
      : `
        <div class="inventory-row">
          <span>${capitalize(slot)}</span>
          <strong>${itemId ? DEFINITIONS.items[itemId]?.name : "Empty"}</strong>
        </div>
        <div class="skill-tree">
          ${Object.entries(state.inventory)
            .filter(([id, qty]) => qty > 0 && DEFINITIONS.items[id]?.type === "equipment" && DEFINITIONS.items[id].slot === slot)
            .map(([id]) => `<button class="town-project" data-loadout-slot="${slot}" data-loadout-item="${id}"><strong>Equip ${DEFINITIONS.items[id].name}</strong><small>Set as ${capitalize(slot)}</small></button>`)
            .join("") || `<div class="empty">No ${slot} gear in bank.</div>`}
        </div>`)
    .join("");
  el.combatStyle.innerHTML = `
    <div class="inventory-row"><span>Style</span><strong>${state.loadout.combat.style}</strong></div>
    <div class="inventory-row"><span>Slash Unlocked</span><strong>${state.combatStyles.slash ? "Yes" : "No"}</strong></div>
    <div class="inventory-row"><span>Focus Unlocked</span><strong>${state.combatStyles.focus ? "Yes" : "No"}</strong></div>
    <div class="inventory-row"><span>Enemy Resist</span><strong>${JSON.stringify(currentZone().enemy.resist ?? {})}</strong></div>
  `;
  el.combatStyleBar.style.width = `${state.loadout.combat.style === "balanced" ? 100 : state.loadout.combat.style === currentZone().enemy.weakness ? 100 : 60}%`;
  el.combatStyleText.textContent = `Enemy weak to ${currentZone().enemy.weakness}`;

  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.style.display = panel.dataset.panel === state.tab ? "block" : "none";
  });
}

function bindUI() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-auto], [data-zone], [data-skill-node], [data-quest], [data-party], [data-activity], [data-town], [data-tab], [data-style], [data-loadout-slot]");
    if (!target) return;
    if (target.dataset.tab) {
      state.tab = target.dataset.tab;
      render();
      saveState();
      return;
    }
    if (target.dataset.auto) toggleAuto(target.dataset.auto);
    if (target.dataset.zone) toggleZone(target.dataset.zone);
    if (target.dataset.skillNode) unlockNode(target.dataset.skillNode);
    if (target.dataset.quest) acceptQuest(target.dataset.quest);
    if (target.dataset.activity) {
      state.activeActivity = target.dataset.activity;
      addLog(`Selected ${capitalize(target.dataset.activity)}.`);
    }
    if (target.dataset.party) {
      const member = DEFINITIONS.partyMembers.find((m) => m.id === target.dataset.party);
      if (member && !state.party.members.includes(member.id) && state.party.members.length < state.party.maxMembers && state.gold >= member.cost) {
        state.gold -= member.cost;
        state.party.members.push(member.id);
        addLog(`${member.name} joined the party.`);
      }
    }
    if (target.dataset.town) applyTownProject(target.dataset.town);
    if (target.dataset.style) state.loadout.combat.style = target.dataset.style;
    if (target.dataset.loadoutSlot && target.dataset.loadoutItem) state.loadout.combat[target.dataset.loadoutSlot] = target.dataset.loadoutItem;
    render();
    saveState();
  });
}

document.querySelector("#save-btn").addEventListener("click", () => {
  saveState();
});

document.querySelector("#load-btn").addEventListener("click", () => {
  const loaded = loadState();
  if (loaded) {
    state = loaded;
    addLog("Loaded saved game.");
    render();
  }
});

document.querySelector("#reset-btn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  addLog("Started a new adventure.");
  render();
  saveState();
});

addLog("Your automated adventure begins.");
ensureUnlocks();
render();
bindUI();
saveState();
setInterval(() => {
  tick(0.25);
}, 250);
setInterval(saveState, 10000);

globalThis.__idleMmo = {
  get state() {
    return state;
  },
  setState(nextState) {
    state = nextState;
  },
  definitions: DEFINITIONS,
  tick,
  render,
  saveState,
  loadState,
  defaultState,
  applyOfflineProgress,
  helpers: {
    currentZone,
    effectiveStats,
    unlockNode,
    toggleZone,
    acceptQuest,
    toggleAuto,
    gainHeroXp,
    autoEquipBetter,
  },
};
