// ===========================
// Global State
// ===========================
let compliments = [];
let currentComplimentIndex = 0;

// ===========================
// Initialize Application
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initPanelNavigation();
    initComplimentGenerator();
    initRelationshipCounter();
    initChristmasQuestion();
    loadCompliments();
});

// ===========================
// Panel Navigation
// ===========================
function initPanelNavigation() {
    const trackerDots = document.querySelectorAll('.tracker-dot');
    const panels = document.querySelectorAll('.panel');

    // Click navigation
    trackerDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            panels[index].scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Scroll tracking
    const observerOptions = {
        root: null,
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const panelIndex = Array.from(panels).indexOf(entry.target);
                updateActiveTracker(panelIndex);
            }
        });
    }, observerOptions);

    panels.forEach(panel => observer.observe(panel));
}

function updateActiveTracker(index) {
    const trackerDots = document.querySelectorAll('.tracker-dot');
    trackerDots.forEach(dot => dot.classList.remove('active'));
    if (trackerDots[index]) {
        trackerDots[index].classList.add('active');
    }
}

// ===========================
// Panel 1: Compliment Generator
// ===========================
async function loadCompliments() {
    try {
        const response = await fetch('data/compliments.json');
        compliments = await response.json();
        if (compliments.length > 0) {
            updateCompliment();
        }
    } catch (error) {
        console.error('Error loading compliments:', error);
        // Fallback compliments if file doesn't load
        compliments = [
            'amazing', 'wonderful', 'extraordinary', 'precious', 'adorable',
            'beautiful', 'brilliant', 'charming', 'delightful', 'fantastic',
            'gorgeous', 'incredible', 'lovely', 'magnificent', 'perfect',
            'radiant', 'stunning', 'sweet', 'treasure', 'unique'
        ];
        updateCompliment();
    }
}

function initComplimentGenerator() {
    const refreshBtn = document.getElementById('refresh-compliment');
    refreshBtn.addEventListener('click', () => {
        updateCompliment();
        // Add rotation animation
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshBtn.style.transform = '';
        }, 300);
    });
}

function updateCompliment() {
    const adjectiveElement = document.querySelector('.adjective-text');

    // Get random compliment different from current
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * compliments.length);
    } while (newIndex === currentComplimentIndex && compliments.length > 1);

    currentComplimentIndex = newIndex;

    // Animate text change
    adjectiveElement.style.opacity = '0';
    adjectiveElement.style.transform = 'translateY(20px)';

    setTimeout(() => {
        adjectiveElement.textContent = compliments[currentComplimentIndex];
        adjectiveElement.style.opacity = '1';
        adjectiveElement.style.transform = 'translateY(0)';
    }, 200);
}

// ===========================
// Panel 2: Relationship Counter
// ===========================
function initRelationshipCounter() {
    updateDaysCounter();
    // Update counter every hour
    setInterval(updateDaysCounter, 3600000);
}

function updateDaysCounter() {
    const startDate = new Date('2025-10-09T00:00:00');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const daysElement = document.getElementById('days-count');

    // Animate number change
    animateNumber(daysElement, parseInt(daysElement.textContent) || 0, diffDays, 1000);
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// ===========================
// Panel 5: Christmas Question
// ===========================
function initChristmasQuestion() {
    const yesBtn1 = document.getElementById('yes-btn');
    const noBtn1 = document.getElementById('no-btn');
    const yesBtn2 = document.getElementById('yes-btn-2');
    const noBtn2 = document.getElementById('no-btn-2');

    const questionDiv = document.getElementById('christmas-question');
    const sadDiv = document.getElementById('sad-response');
    const happyDiv = document.getElementById('happy-response');

    // First Yes button
    yesBtn1.addEventListener('click', () => {
        showHappyResponse();
    });

    // First No button - show sad response
    noBtn1.addEventListener('click', () => {
        questionDiv.classList.add('hidden');
        sadDiv.classList.remove('hidden');
    });

    // Second Yes button
    yesBtn2.addEventListener('click', () => {
        showHappyResponse();
    });

    // Second No button - make it run away or show sad response again
    noBtn2.addEventListener('click', (e) => {
        // Make button jump to random position
        const btn = e.target;
        const maxX = window.innerWidth - btn.offsetWidth - 100;
        const maxY = window.innerHeight - btn.offsetHeight - 100;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        btn.style.position = 'fixed';
        btn.style.left = randomX + 'px';
        btn.style.top = randomY + 'px';
        btn.style.transition = 'all 0.3s ease';
    });

    // Also make No button run away on hover
    noBtn2.addEventListener('mouseenter', (e) => {
        const btn = e.target;
        const maxX = window.innerWidth - btn.offsetWidth - 100;
        const maxY = window.innerHeight - btn.offsetHeight - 100;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        btn.style.position = 'fixed';
        btn.style.left = randomX + 'px';
        btn.style.top = randomY + 'px';
        btn.style.transition = 'all 0.3s ease';
    });

    function showHappyResponse() {
        questionDiv.classList.add('hidden');
        sadDiv.classList.add('hidden');
        happyDiv.classList.remove('hidden');

        // Trigger confetti effect
        createConfetti();
    }
}

// ===========================
// Confetti Effect for Panel 5
// ===========================
function createConfetti() {
    const colors = ['#E8A5A5', '#A8D5A8', '#F4D19B', '#FFB6C1', '#B4D7E8'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear`;

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 30);
    }
}

// Add confetti animation to document
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    .adjective-text {
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
`;
document.head.appendChild(style);
