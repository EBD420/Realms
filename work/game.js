const STORAGE_KEY = "idle-mmo-save-v1";
const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

const DEFINITIONS = {
  skills: [
    { id: "combat", name: "Combat", max: 100 },
    { id: "gathering", name: "Gathering", max: 100 },
    { id: "crafting", name: "Crafting", max: 100 },
    { id: "survival", name: "Survival", max: 100 },
    { id: "leadership", name: "Leadership", max: 100 },
  ],
  skillTree: [
    { id: "war_training", skill: "combat", name: "War Training", cost: 1, req: 2, desc: "+2 attack", effect: (s) => { s.hero.baseAttack += 2; } },
    { id: "guard_stance", skill: "combat", name: "Guard Stance", cost: 1, req: 6, desc: "+2 defense", effect: (s) => { s.hero.baseDefense += 2; } },
    { id: "prospector", skill: "gathering", name: "Prospector", cost: 1, req: 2, desc: "+25% gathering yield", effect: (s) => { s.modifiers.gatheringYield += 0.25; } },
    { id: "scavenger", skill: "gathering", name: "Scavenger", cost: 1, req: 7, desc: "+10% loot chance", effect: (s) => { s.modifiers.lootChance += 0.1; } },
    { id: "field_medic", skill: "survival", name: "Field Medic", cost: 1, req: 2, desc: "+4 max HP", effect: (s) => { s.hero.baseMaxHp += 4; } },
    { id: "camp_craft", skill: "crafting", name: "Camp Craft", cost: 1, req: 2, desc: "Unlock basic equipment crafting", effect: (s) => { s.unlocks.crafting = true; } },
    { id: "war_leader", skill: "leadership", name: "War Leader", cost: 2, req: 5, desc: "+1 party member cap", effect: (s) => { s.party.maxMembers += 1; } },
    { id: "raid_tactician", skill: "leadership", name: "Raid Tactician", cost: 2, req: 12, desc: "+15% raid rewards", effect: (s) => { s.modifiers.raidRewards += 0.15; } },
  ],
  zones: [
    {
      id: "greenwood_fields",
      name: "Greenwood Fields",
      reqLevel: 1,
      enemy: { name: "Wild Boar", hp: 18, attack: 2, level: 1 },
      rewards: { xp: 16, gold: [3, 6], loot: [{ itemId: "boar_hide", chance: 0.4, qty: [1, 2] }, { itemId: "minor_potion", chance: 0.08, qty: [1, 1] }] },
      gather: { itemId: "herb", chance: 0.18, qty: [1, 2] },
    },
    {
      id: "ashen_bog",
      name: "Ashen Bog",
      reqLevel: 6,
      enemy: { name: "Bog Crawler", hp: 32, attack: 5, level: 6 },
      rewards: { xp: 32, gold: [8, 13], loot: [{ itemId: "bog_venom", chance: 0.34, qty: [1, 1] }, { itemId: "iron_ore", chance: 0.26, qty: [1, 3] }] },
      gather: { itemId: "moss", chance: 0.22, qty: [1, 2] },
    },
    {
      id: "sunken_ruins",
      name: "Sunken Ruins",
      reqLevel: 12,
      enemy: { name: "Ruins Knight", hp: 52, attack: 8, level: 12 },
      rewards: { xp: 58, gold: [15, 24], loot: [{ itemId: "ancient_coin", chance: 0.28, qty: [1, 4] }, { itemId: "steel_blade", chance: 0.1, qty: [1, 1] }] },
      gather: { itemId: "relic_shard", chance: 0.2, qty: [1, 1] },
    },
    {
      id: "obsidian_peak",
      name: "Obsidian Peak",
      reqLevel: 20,
      enemy: { name: "Peak Drake", hp: 92, attack: 12, level: 20 },
      rewards: { xp: 110, gold: [28, 42], loot: [{ itemId: "drake_scale", chance: 0.35, qty: [1, 2] }, { itemId: "obsidian_core", chance: 0.08, qty: [1, 1] }] },
      gather: { itemId: "ember_ash", chance: 0.24, qty: [1, 2] },
    },
    {
      id: "raid_citadel",
      name: "Citadel Raid",
      reqLevel: 18,
      raid: true,
      enemy: { name: "Citadel Warden", hp: 180, attack: 18, level: 18 },
      rewards: { xp: 180, gold: [45, 70], loot: [{ itemId: "raid_chest", chance: 0.45, qty: [1, 1] }, { itemId: "legend_shard", chance: 0.12, qty: [1, 1] }] },
    },
  ],
  items: {
    herb: { name: "Herb", type: "material" },
    boar_hide: { name: "Boar Hide", type: "material" },
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
    gathering: 1,
    crafting: 1,
    survival: 1,
    leadership: 1,
  },
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
  inventory: {
    herb: 0,
    boar_hide: 0,
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
  },
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
  modifiers: {
    gatheringYield: 1,
    lootChance: 1,
    raidRewards: 1,
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

function effectiveStats() {
  const gear = equippedBonuses();
  const party = partyBonuses();
  return {
    maxHp: state.hero.baseMaxHp + gear.maxHp + party.maxHp,
    attack: state.hero.baseAttack + gear.attack + party.attack,
    defense: state.hero.baseDefense + gear.defense + party.defense,
    gatheringYield: state.modifiers.gatheringYield + party.gatheringYield,
    lootChance: state.modifiers.lootChance + party.lootChance,
    raidRewards: state.modifiers.raidRewards + party.raidRewards,
  };
}

function equippedBonuses() {
  return Object.values(state.equipment).reduce((sum, itemId) => {
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

function awardSkillXp(skillId, amount) {
  const before = Math.floor(state.skills[skillId]);
  state.skills[skillId] += amount;
  const after = Math.floor(state.skills[skillId]);
  if (after > before) {
    state.skillPoints += after - before;
    addLog(`${capitalize(skillId)} skill increased to ${after}.`);
  }
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
  state.inventory[itemId] = (state.inventory[itemId] ?? 0) + qty;
}

function removeItem(itemId, qty) {
  state.inventory[itemId] = Math.max(0, (state.inventory[itemId] ?? 0) - qty);
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
  const damageToEnemy = Math.max(1, (stats.attack + state.hero.level * 0.2) * dt);
  zone._enemyHp ??= zone.enemy.hp;
  zone._enemyHp -= damageToEnemy;
  if (zone._enemyHp > 0) {
    const incoming = Math.max(0, zone.enemy.attack - stats.defense);
    state.hero.hp -= incoming * dt;
  }
  if (zone._enemyHp <= 0) {
    zone._enemyHp = zone.enemy.hp;
    const rewardMultiplier = zone.raid ? stats.raidRewards : 1;
    const goldReward = roll(zone.rewards.gold[0], zone.rewards.gold[1]) * rewardMultiplier;
    state.gold += goldReward;
    gainHeroXp(zone.rewards.xp * rewardMultiplier);
    awardSkillXp("combat", 0.35);
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
    awardSkillXp("gathering", 0.3);
    addLog(`Gathered ${qty} ${DEFINITIONS.items[zone.gather.itemId].name}.`);
  }
}

function rest(dt) {
  const stats = effectiveStats();
  if (state.hero.hp < stats.maxHp) {
    state.hero.hp = Math.min(stats.maxHp, state.hero.hp + 8 * dt);
    awardSkillXp("survival", 0.15);
  }
}

function tick(dt) {
  state.time += dt;
  if (state.auto.party) recruitParty();
  if (state.auto.combat) fight(dt);
  if (state.auto.gather) gather(dt);
  if (state.auto.rest) rest(dt);
  craftIfPossible();
  progressQuests();
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

  el.inventory.innerHTML = Object.entries(state.inventory)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => `<div class="inventory-row"><span>${DEFINITIONS.items[itemId]?.name ?? itemId}</span><strong>${qty}</strong></div>`)
    .join("") || `<div class="empty">No loot yet.</div>`;

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
      <strong>Raid Progress</strong>
      <div class="bar"><div class="fill xp" style="width: ${Math.min(100, state.raid.progress)}%"></div></div>
      <small>Completions: ${state.raid.completions} | Need at least 1 party member to run</small>
    </div>
  `;

  el.log.innerHTML = state.log
    .map((entry) => `<div class="log-entry">${entry.message}</div>`)
    .join("");
}

function bindUI() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-auto], [data-zone], [data-skill-node], [data-quest], [data-party]");
    if (!target) return;
    if (target.dataset.auto) toggleAuto(target.dataset.auto);
    if (target.dataset.zone) toggleZone(target.dataset.zone);
    if (target.dataset.skillNode) unlockNode(target.dataset.skillNode);
    if (target.dataset.quest) acceptQuest(target.dataset.quest);
    if (target.dataset.party) {
      const member = DEFINITIONS.partyMembers.find((m) => m.id === target.dataset.party);
      if (member && !state.party.members.includes(member.id) && state.party.members.length < state.party.maxMembers && state.gold >= member.cost) {
        state.gold -= member.cost;
        state.party.members.push(member.id);
        addLog(`${member.name} joined the party.`);
      }
    }
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
