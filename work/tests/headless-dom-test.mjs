import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root = path.resolve(process.cwd(), "work");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "game.js"), "utf8");

class Element {
  constructor(id = "", tagName = "div") {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.textContent = "";
    this.innerHTML = "";
    this.disabled = false;
    this.dataset = {};
    this.style = {};
    this.className = "";
    this.listeners = {};
  }

  addEventListener(type, handler) {
    (this.listeners[type] ??= []).push(handler);
  }

  dispatchEvent(type) {
    for (const handler of this.listeners[type] ?? []) handler({ target: this, preventDefault() {} });
  }
}

function buildDocument(markup) {
  const ids = [...markup.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const elements = new Map();
  for (const id of ids) elements.set(id, new Element(id));
  elements.set("bank-search", new Element("bank-search", "input"));
  elements.set("bank-filter", new Element("bank-filter", "select"));
  return {
    elements,
    querySelector(selector) {
      if (selector.startsWith("#")) return elements.get(selector.slice(1)) ?? null;
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
  };
}

function createContext() {
  const document = buildDocument(html);
  const storage = new Map();
  const timers = [];
  const sandbox = {
    console,
    document,
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
    },
    setInterval: (fn, ms) => {
      timers.push({ fn, ms });
      return timers.length;
    },
    clearInterval() {},
    Date,
    JSON,
    Math: Object.assign(Object.create(Math), { random: () => 0.01 }),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: "game.js" });
  return { sandbox, document, storage, timers };
}

function run() {
  const { sandbox, document, storage } = createContext();
  const game = sandbox.__idleMmo;
  assert.ok(game, "game hook should exist");

  assert.equal(document.querySelector("#location").textContent, "Greenwood Fields");
  assert.equal(String(document.querySelector("#gold").textContent), "0");
  assert.equal(typeof game.tick, "function");

  const savedBefore = storage.get("idle-mmo-save-v1");
  assert.ok(savedBefore, "initial save should exist");

  const state = game.state;
  state.hero.level = 3;
  state.skills.combat = 3;
  state.skillPoints = 3;
  state.unlockedNodes = [];
  game.helpers.unlockNode("war_training");
  assert.ok(state.unlockedNodes.includes("war_training"), "skill node should unlock");
  assert.equal(state.hero.baseAttack, 8, "war training should raise attack");

  state.inventory.boar_hide = 5;
  state.quests.active = ["hunt_boil"];
  game.helpers.acceptQuest("bog_path");
  assert.ok(state.quests.active.includes("bog_path"), "quest should be accepted");
  state.inventory.bog_venom = 4;
  game.helpers.acceptQuest("hunt_boil");
  game.helpers.acceptQuest("bog_path");
  state.quests.active = ["hunt_boil", "bog_path"];
  game.render();
  game.tick(0.25);
  assert.ok(state.quests.completed.includes("hunt_boil"), "hunt quest should complete with materials");

  state.gold = 100;
  game.tick(0.25);
  assert.ok(state.party.members.length > 0, "party recruitment should happen when enabled");

  game.saveState();
  const saved = JSON.parse(storage.get("idle-mmo-save-v1"));
  assert.equal(saved.hero.level, state.hero.level, "save should persist hero level");

  state.hero.level = 1;
  const reloaded = game.loadState();
  assert.ok(reloaded.hero.level >= 3, "load should recover saved progress");

  console.log("Headless DOM harness passed.");
}

run();
