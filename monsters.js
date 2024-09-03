let currentHealth = 1000;

const attackMonster = (damage) => {
  currentHealth -= damage;
}

const spawnMonster = (health) => {
  currentHealth = health;
  console.log(`A monster has spawned with ${health} health!`);
  return;
}

const checkHealth = () => {
  return currentHealth;
}

module.exports = { attackMonster, spawnMonster, checkHealth };