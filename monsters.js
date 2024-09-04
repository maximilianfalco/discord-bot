let currentHealth = 1000;
let originalHealth = 1000;

const attackMonster = (damage) => {
  currentHealth -= damage;
}

const spawnMonster = (health) => {
  currentHealth = health;
  originalHealth = health;
  console.log(`A monster has spawned with ${health} health!`);
  return;
}

const checkHealth = () => {
  return currentHealth;
}

const getOriginalHealth = () => {
  return originalHealth;
}

module.exports = { attackMonster, spawnMonster, checkHealth, getOriginalHealth };