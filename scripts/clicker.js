// ===========================
// Kiss Clicker Game State
// ===========================
const MILESTONE_FACES = {
    69: 'face-69.png',
    228: 'face-228.png',
    666: 'face-666.png',
    1111: 'face-1111.png'
};

const MILESTONE_HATS = [
    { kisses: 10, image: 'hat-10.png', name: '圣诞帽' },
    { kisses: 25, image: 'hat-25.png', name: '皇冠' },
    { kisses: 50, image: 'hat-50.png', name: '派对帽' },
    { kisses: 100, image: 'hat-100.png', name: '魔法帽' },
    { kisses: 250, image: 'hat-250.png', name: '海盗帽' },
    { kisses: 500, image: 'hat-500.png', name: '厨师帽' },
    { kisses: 1000, image: 'hat-1000.png', name: '国王冠' }
];

const BOSS_HAT = { image: 'hat-boss.png', name: '英雄帽' };

const UPGRADES = [
    { power: 2, cost: 50 },
    { power: 3, cost: 150 },
    { power: 5, cost: 400 },
    { power: 10, cost: 1000 }
];

let gameState = {
    totalKisses: 0,
    clickPower: 1,
    purchasedUpgrades: [],
    unlockedHats: [],
    currentHat: null,
    bossDefeated: false,
    bossActive: false
};

// ===========================
// Initialize Clicker Game
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    initClickerGame();
    updateDisplay();
});

// ===========================
// Local Storage Functions
// ===========================
function saveGameState() {
    localStorage.setItem('kissClickerGame', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('kissClickerGame');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
        // Restore unlocked hats
        gameState.unlockedHats.forEach(hat => {
            if (hat.image === BOSS_HAT.image) {
                applyHat(BOSS_HAT.image);
            } else {
                applyHat(hat.image);
            }
        });
    }
}

function resetGame() {
    if (confirm('你确定要重置游戏吗？所有进度将丢失！')) {
        gameState = {
            totalKisses: 0,
            clickPower: 1,
            purchasedUpgrades: [],
            unlockedHats: [],
            currentHat: null,
            bossDefeated: false,
            bossActive: false
        };
        saveGameState();
        location.reload();
    }
}

// ===========================
// Initialize Game
// ===========================
function initClickerGame() {
    const faceContainer = document.getElementById('face-container');
    const resetBtn = document.getElementById('reset-game');
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');

    // Face click handler
    faceContainer.addEventListener('click', handleClick);

    // Reset button
    resetBtn.addEventListener('click', resetGame);

    // Upgrade buttons
    upgradeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const power = parseInt(btn.dataset.power);
            const cost = parseInt(btn.dataset.cost);
            purchaseUpgrade(power, cost, btn);
        });
    });

    // Update upgrade button states
    updateUpgradeButtons();
}

// ===========================
// Click Handler
// ===========================
function handleClick(e) {
    // Don't process clicks during boss battle on mosquitos
    if (gameState.bossActive) {
        handleBossClick();
        return;
    }

    const faceWrapper = document.getElementById('face-wrapper');

    // Flip face
    faceWrapper.classList.toggle('flip');

    // Golden kiss chance (10%)
    const isGolden = Math.random() < 0.1;
    const kissValue = isGolden ? gameState.clickPower * 10 : gameState.clickPower;

    // Add kisses
    gameState.totalKisses += kissValue;

    // Create kiss particle effect
    createKissParticle(e.clientX, e.clientY, isGolden, kissValue);

    // Check for milestones
    checkMilestones();

    // Update display
    updateDisplay();
    saveGameState();
}

// ===========================
// Kiss Particle Effect
// ===========================
function createKissParticle(x, y, isGolden, value) {
    const kissEffects = document.getElementById('kiss-effects');
    const particle = document.createElement('div');

    particle.classList.add('kiss-particle');
    if (isGolden) {
        particle.classList.add('golden');
        particle.textContent = '💛';
    } else {
        particle.textContent = '💋';
    }

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    // Add value text
    const valueText = document.createElement('span');
    valueText.textContent = `+${value}`;
    valueText.style.position = 'absolute';
    valueText.style.left = '50%';
    valueText.style.top = '50%';
    valueText.style.transform = 'translate(-50%, -50%)';
    valueText.style.fontSize = isGolden ? '1.5rem' : '1rem';
    valueText.style.fontWeight = 'bold';
    valueText.style.color = isGolden ? '#FFD700' : '#E8A5A5';
    particle.appendChild(valueText);

    kissEffects.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1500);
}

// ===========================
// Milestone Checking
// ===========================
function checkMilestones() {
    // Check for special faces
    if (MILESTONE_FACES[gameState.totalKisses]) {
        changeFace(MILESTONE_FACES[gameState.totalKisses]);
    }

    // Check for hat unlocks
    MILESTONE_HATS.forEach(hat => {
        if (gameState.totalKisses >= hat.kisses && !gameState.unlockedHats.some(h => h.kisses === hat.kisses)) {
            unlockHat(hat);
        }
    });

    // Check for boss battle
    if (gameState.totalKisses >= 1500 && !gameState.bossDefeated && !gameState.bossActive) {
        startBossBattle();
    }
}

// ===========================
// Face Changing
// ===========================
function changeFace(faceImage) {
    const faceElement = document.getElementById('face-image');
    faceElement.style.opacity = '0';

    setTimeout(() => {
        faceElement.src = `images/faces/${faceImage}`;
        faceElement.style.opacity = '1';
    }, 200);

    // Revert after 3 seconds
    setTimeout(() => {
        faceElement.style.opacity = '0';
        setTimeout(() => {
            faceElement.src = 'images/faces/face-default.png';
            faceElement.style.opacity = '1';
        }, 200);
    }, 3000);
}

// ===========================
// Hat System
// ===========================
function unlockHat(hat) {
    gameState.unlockedHats.push(hat);
    applyHat(hat.image);
    showUnlockedNotification(hat.name);
    updateUnlockedGrid();
    saveGameState();
}

function applyHat(hatImage) {
    const hatContainer = document.getElementById('hat-container');
    hatContainer.innerHTML = '';

    const hatImg = document.createElement('img');
    hatImg.src = `images/hats/${hatImage}`;
    hatImg.alt = 'Hat';
    hatImg.style.width = '100%';
    hatImg.style.height = '100%';
    hatImg.style.objectFit = 'contain';

    hatContainer.appendChild(hatImg);
    gameState.currentHat = hatImage;
}

function showUnlockedNotification(itemName) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.background = 'var(--christmas-gold)';
    notification.style.padding = '2rem 3rem';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.fontSize = '2rem';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
    notification.style.animation = 'fadeInUp 0.5s ease';
    notification.textContent = `解锁: ${itemName}! 🎉`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function updateUnlockedGrid() {
    const grid = document.getElementById('unlocked-grid');
    grid.innerHTML = '';

    gameState.unlockedHats.forEach(hat => {
        const item = document.createElement('div');
        item.classList.add('unlocked-item');
        item.textContent = hat.kisses;
        item.title = hat.name;
        grid.appendChild(item);
    });
}

// ===========================
// Upgrade System
// ===========================
function purchaseUpgrade(power, cost, button) {
    if (gameState.purchasedUpgrades.includes(power)) {
        return; // Already purchased
    }

    if (gameState.totalKisses >= cost) {
        gameState.totalKisses -= cost;
        gameState.clickPower = power;
        gameState.purchasedUpgrades.push(power);

        button.classList.add('purchased');
        button.disabled = true;

        updateDisplay();
        saveGameState();
    } else {
        // Not enough kisses - shake button
        button.style.animation = 'shake 0.5s';
        setTimeout(() => {
            button.style.animation = '';
        }, 500);
    }
}

function updateUpgradeButtons() {
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');

    upgradeButtons.forEach(btn => {
        const power = parseInt(btn.dataset.power);

        if (gameState.purchasedUpgrades.includes(power)) {
            btn.classList.add('purchased');
            btn.disabled = true;
        }
    });
}

// ===========================
// Boss Battle System
// ===========================
function startBossBattle() {
    gameState.bossActive = true;

    const bossContainer = document.getElementById('boss-battle');
    const faceImage = document.getElementById('face-image');

    bossContainer.classList.remove('hidden');
    faceImage.src = 'images/faces/face-boss.png';

    // Create mosquitos
    spawnMosquitos();

    // Initialize boss health
    let bossHealth = 100;
    updateBossHealth(bossHealth);

    // Store boss health in game state temporarily
    gameState.bossHealth = bossHealth;
}

function handleBossClick() {
    if (!gameState.bossActive) return;

    // Decrease boss health
    gameState.bossHealth -= 2;
    updateBossHealth(gameState.bossHealth);

    // Create impact effect
    createKissParticle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.5,
        false,
        0
    );

    if (gameState.bossHealth <= 0) {
        defeatBoss();
    }
}

function updateBossHealth(health) {
    const healthBar = document.getElementById('boss-health-bar');
    healthBar.style.width = Math.max(0, health) + '%';
}

function spawnMosquitos() {
    const mosquitoContainer = document.getElementById('mosquito-container');
    const mosquitoCount = 5;

    for (let i = 0; i < mosquitoCount; i++) {
        setTimeout(() => {
            const mosquito = document.createElement('div');
            mosquito.classList.add('mosquito');
            mosquito.style.backgroundImage = 'url(images/effects/mosquito.png)';

            // Random starting position at edges
            const startSide = Math.floor(Math.random() * 4);
            let startX, startY;

            switch (startSide) {
                case 0: // Top
                    startX = Math.random() * 100;
                    startY = -10;
                    break;
                case 1: // Right
                    startX = 110;
                    startY = Math.random() * 100;
                    break;
                case 2: // Bottom
                    startX = Math.random() * 100;
                    startY = 110;
                    break;
                case 3: // Left
                    startX = -10;
                    startY = Math.random() * 100;
                    break;
            }

            mosquito.style.left = startX + '%';
            mosquito.style.top = startY + '%';

            // Target: center of face
            const targetX = (50 - startX) + 'vw';
            const targetY = (50 - startY) + 'vh';

            mosquito.style.setProperty('--target-x', targetX);
            mosquito.style.setProperty('--target-y', targetY);
            mosquito.style.animationDuration = (8 + Math.random() * 4) + 's';

            mosquitoContainer.appendChild(mosquito);
        }, i * 500);
    }
}

function defeatBoss() {
    gameState.bossActive = false;
    gameState.bossDefeated = true;

    const bossContainer = document.getElementById('boss-battle');
    const faceImage = document.getElementById('face-image');

    // Hide boss battle
    bossContainer.classList.add('hidden');
    faceImage.src = 'images/faces/face-default.png';

    // Clear mosquitos
    const mosquitoContainer = document.getElementById('mosquito-container');
    mosquitoContainer.innerHTML = '';

    // Unlock boss hat
    const bossHatUnlock = { ...BOSS_HAT, kisses: 1500 };
    gameState.unlockedHats.push(bossHatUnlock);
    applyHat(BOSS_HAT.image);

    // Show victory message
    showUnlockedNotification(BOSS_HAT.name + ' - 你拯救了Oppa!');

    updateUnlockedGrid();
    saveGameState();
}

// ===========================
// Display Updates
// ===========================
function updateDisplay() {
    const kissCount = document.getElementById('kiss-count');
    const clickPower = document.getElementById('click-power');

    kissCount.textContent = gameState.totalKisses;
    clickPower.textContent = gameState.clickPower;

    updateUpgradeButtons();
    updateUnlockedGrid();
}
