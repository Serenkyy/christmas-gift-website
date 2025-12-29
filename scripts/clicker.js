// ===========================
// Kiss Clicker Game State
// ===========================
const SPECIAL_FACES = {
    69: 'face-69.png',
    228: 'face-228.png',
    666: 'face-666.png',
    1111: 'face-1111.png'
};

const UNLOCKABLE_FACES = [
    { kisses: 10, image: 'face-10.png', emoji: '🎉' },
    { kisses: 25, image: 'face-25.png', emoji: '🤠' },
    { kisses: 50, image: 'face-50.png', emoji: '🧐' },
    { kisses: 100, image: 'face-100.png', emoji: '🫧' },
    { kisses: 250, image: 'face-250.png', emoji: '🦄' }
    // 500 and 1000 kisses trigger special animations instead
];

const SPECIAL_MILESTONE_EMOJIS = {
    500: '🌪️',
    1000: '👑'
};

const BOSS_FACE = { image: 'face-boss.png', emoji: '🦸' };

const UPGRADES = [
    { power: 2, cost: 50 },
    { power: 3, cost: 150 },
    { power: 5, cost: 250 },
    { power: 10, cost: 400 }
];

let gameState = {
    totalKisses: 0,
    clickPower: 1,
    purchasedUpgrades: [],
    unlockedFaces: [],
    currentFace: 'face-default.png',
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
        // Restore current face
        if (gameState.currentFace) {
            const faceElement = document.getElementById('face-image');
            faceElement.src = `images/faces/${gameState.currentFace}`;
        }
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
        gameState = {
            totalKisses: 0,
            clickPower: 1,
            purchasedUpgrades: [],
            unlockedFaces: [],
            currentFace: 'face-default.png',
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

    // Determine animation based on milestone
    let animationClass = 'jump';
    if (gameState.totalKisses >= 1000) {
        animationClass = 'mega-bounce'; // After 1000 kisses: dramatic bounce
    } else if (gameState.totalKisses >= 500) {
        animationClass = 'spin-jump'; // After 500 kisses: spinning jump
    }

    // Apply animation
    faceWrapper.classList.remove('jump', 'spin-jump', 'mega-bounce');
    void faceWrapper.offsetWidth; // Trigger reflow to restart animation
    faceWrapper.classList.add(animationClass);

    // Random offset for variety
    const randomX = (Math.random() - 0.5) * 20; // -10px to +10px
    const randomY = (Math.random() - 0.5) * 20; // -10px to +10px
    faceWrapper.style.setProperty('--jump-x', `${randomX}px`);
    faceWrapper.style.setProperty('--jump-y', `${randomY}px`);

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
    if (SPECIAL_FACES[gameState.totalKisses]) {
        changeFace(SPECIAL_FACES[gameState.totalKisses]);
    }

    // Check for milestone face unlocks
    UNLOCKABLE_FACES.forEach(face => {
        if (gameState.totalKisses >= face.kisses && !gameState.unlockedFaces.some(f => f.kisses === face.kisses)) {
            unlockFace(face);
        }
    });

    // Check for special animation milestones (500 and 1000)
    [500, 1000].forEach(milestone => {
        if (gameState.totalKisses >= milestone && !gameState.unlockedFaces.some(f => f.kisses === milestone)) {
            unlockSpecialMilestone(milestone);
        }
    });

    // Check for boss battle
    if (gameState.totalKisses >= 1200 && !gameState.bossDefeated && !gameState.bossActive) {
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

    // Revert after 3 seconds to the permanent face
    setTimeout(() => {
        faceElement.style.opacity = '0';
        setTimeout(() => {
            faceElement.src = `images/faces/${gameState.currentFace}`;
            faceElement.style.opacity = '1';
        }, 200);
    }, 3000);
}

// ===========================
// Hat System
// ===========================
function unlockFace(face) {
    gameState.unlockedFaces.push(face);
    changeFacePermanent(face.image);
    updateUnlockedGrid();
    saveGameState();
}

function unlockSpecialMilestone(kisses) {
    // Add special milestone to unlocked faces for display purposes
    const milestone = { kisses: kisses, emoji: SPECIAL_MILESTONE_EMOJIS[kisses] };
    gameState.unlockedFaces.push(milestone);
    updateUnlockedGrid();
    saveGameState();

    // Trigger special animations
    if (kisses === 500) {
        floatingHeartsEffect();
    } else if (kisses === 1000) {
        goldenCrownEffect();
    }
}

function changeFacePermanent(faceImage) {
    const faceElement = document.getElementById('face-image');
    faceElement.src = `images/faces/${faceImage}`;
    gameState.currentFace = faceImage;
}

function updateUnlockedGrid() {
    const grid = document.getElementById('unlocked-grid');
    grid.innerHTML = '';

    gameState.unlockedFaces.forEach(face => {
        const item = document.createElement('div');
        item.classList.add('unlocked-item');
        item.textContent = face.emoji || face.kisses; // Use emoji if available, otherwise kisses number
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
        // Don't deduct kisses - just unlock the upgrade
        gameState.clickPower = power;
        gameState.purchasedUpgrades.push(power);

        button.classList.add('purchased');
        button.disabled = true;

        updateDisplay();
        saveGameState();
    } else {
        // Not enough kisses - move button upward
        button.style.animation = 'cannotAfford 0.5s';
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

    bossContainer.classList.remove('hidden');

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

    // Clear mosquitos
    const mosquitoContainer = document.getElementById('mosquito-container');
    mosquitoContainer.innerHTML = '';

    // Unlock boss face
    const bossFaceUnlock = { ...BOSS_FACE, kisses: 1200 };
    gameState.unlockedFaces.push(bossFaceUnlock);
    changeFacePermanent(BOSS_FACE.image);

    // Trigger victory effects
    bossVictoryEffects();

    updateUnlockedGrid();
    saveGameState();
}

// ===========================
// Special Animations
// ===========================
function floatingHeartsEffect() {
    const heartsContainer = document.createElement('div');
    heartsContainer.style.position = 'fixed';
    heartsContainer.style.top = '0';
    heartsContainer.style.left = '0';
    heartsContainer.style.width = '100%';
    heartsContainer.style.height = '100%';
    heartsContainer.style.pointerEvents = 'none';
    heartsContainer.style.zIndex = '9998';
    document.body.appendChild(heartsContainer);

    // Create 30 floating hearts
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = '💖';
            heart.style.position = 'absolute';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.bottom = '-50px';
            heart.style.fontSize = (20 + Math.random() * 30) + 'px';
            heart.style.animation = `floatUpHeart ${3 + Math.random() * 2}s ease-out forwards`;
            heart.style.opacity = '0.8';
            heartsContainer.appendChild(heart);

            setTimeout(() => heart.remove(), 5000);
        }, i * 100);
    }

    setTimeout(() => heartsContainer.remove(), 6000);
}

function goldenCrownEffect() {
    const crownContainer = document.createElement('div');
    crownContainer.style.position = 'fixed';
    crownContainer.style.top = '0';
    crownContainer.style.left = '0';
    crownContainer.style.width = '100%';
    crownContainer.style.height = '100%';
    crownContainer.style.pointerEvents = 'none';
    crownContainer.style.zIndex = '9998';
    crownContainer.style.display = 'flex';
    crownContainer.style.alignItems = 'center';
    crownContainer.style.justifyContent = 'center';
    document.body.appendChild(crownContainer);

    // Giant golden crown
    const crown = document.createElement('div');
    crown.textContent = '👑';
    crown.style.fontSize = '200px';
    crown.style.animation = 'crownAppear 2s ease-out forwards';
    crown.style.filter = 'drop-shadow(0 0 30px gold)';
    crownContainer.appendChild(crown);

    // Golden sparkles
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.fontSize = '30px';
            sparkle.style.animation = 'sparkleEffect 1.5s ease-out forwards';
            crownContainer.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 1500);
        }, i * 30);
    }

    setTimeout(() => crownContainer.remove(), 3000);
}

function bossVictoryEffects() {
    // Screen flash
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'white';
    flash.style.zIndex = '9999';
    flash.style.animation = 'screenFlash 0.5s ease-out forwards';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    // Confetti explosion
    setTimeout(() => {
        const colors = ['#E8A5A5', '#A8D5A8', '#F4D19B', '#FFB6C1', '#B4D7E8', '#D5B8E8'];
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = '50%';
                confetti.style.top = '50%';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9998';

                const angle = (Math.random() * 360) * (Math.PI / 180);
                const velocity = 200 + Math.random() * 300;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;

                confetti.style.setProperty('--vx', vx + 'px');
                confetti.style.setProperty('--vy', vy + 'px');
                confetti.style.animation = 'confettiExplosion 2s ease-out forwards';

                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 2000);
            }, i * 10);
        }
    }, 300);

    // Stars burst
    setTimeout(() => {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.textContent = '⭐';
                star.style.position = 'fixed';
                star.style.left = '50%';
                star.style.top = '50%';
                star.style.fontSize = '40px';
                star.style.pointerEvents = 'none';
                star.style.zIndex = '9998';

                const angle = (i / 20) * 360 * (Math.PI / 180);
                const distance = 300;
                star.style.setProperty('--star-x', Math.cos(angle) * distance + 'px');
                star.style.setProperty('--star-y', Math.sin(angle) * distance + 'px');
                star.style.animation = 'starBurst 1.5s ease-out forwards';

                document.body.appendChild(star);
                setTimeout(() => star.remove(), 1500);
            }, i * 50);
        }
    }, 600);

    // Victory text
    setTimeout(() => {
        const victoryText = document.createElement('div');
        victoryText.textContent = 'VICTORY! 🎉';
        victoryText.style.position = 'fixed';
        victoryText.style.top = '20%';
        victoryText.style.left = '50%';
        victoryText.style.transform = 'translateX(-50%)';
        victoryText.style.fontSize = 'clamp(3rem, 10vw, 6rem)';
        victoryText.style.fontWeight = 'bold';
        victoryText.style.color = '#F4D19B';
        victoryText.style.textShadow = '0 0 20px rgba(244, 209, 155, 0.8), 0 0 40px rgba(232, 165, 165, 0.6)';
        victoryText.style.zIndex = '9999';
        victoryText.style.pointerEvents = 'none';
        victoryText.style.animation = 'victoryTextAppear 2s ease-out forwards';
        document.body.appendChild(victoryText);
        setTimeout(() => victoryText.remove(), 3000);
    }, 800);
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
