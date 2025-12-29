// ===========================
// Quiz Game State
// ===========================
let quizData = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let correctAnswersCount = 0;

// Result messages based on score
const RESULT_MESSAGES = {
    0: {
        title: '哎呀! 😅',
        description: '看来你需要更多了解Oppa呢！没关系，我们有很多时间一起学习~'
    },
    low: { // 1-5
        title: '还不错! 💪',
        description: '你对我有一些了解，但还有很多可以探索的地方哦！'
    },
    medium: { // 6-7
        title: '做得好! 🌟',
        description: '你对我很了解！我们的默契越来越好了~'
    },
    high: { // 8-9
        title: '太棒了! 🎉',
        description: '你几乎是我的专家了！只差一点点就完美了~'
    },
    perfect: { // 10
        title: '完美! 💝',
        description: '你完全了解我！我们真的是天生一对! ❤️'
    }
};

// ===========================
// Initialize Quiz
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    initQuizButtons();
});

// ===========================
// Load Quiz Data
// ===========================
async function loadQuizData() {
    try {
        const response = await fetch('data/quiz.json');
        quizData = await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        // Fallback sample quiz
        quizData = [
            {
                question: '我最喜欢的颜色是什么？',
                answers: ['红色', '蓝色', '绿色', '黄色'],
                correct: [0],
                multipleChoice: false
            },
            {
                question: '我的生日是哪一天？',
                answers: ['1月1日', '2月14日', '3月15日', '12月25日'],
                correct: [2],
                multipleChoice: false
            },
            {
                question: '我最喜欢吃什么？（可多选）',
                answers: ['披萨', '寿司', '意大利面', '汉堡'],
                correct: [0, 1],
                multipleChoice: true
            }
        ];
    }
}

// ===========================
// Initialize Buttons
// ===========================
function initQuizButtons() {
    const startBtn = document.getElementById('start-quiz-btn');
    const submitBtn = document.getElementById('submit-answer-btn');
    const restartBtn = document.getElementById('restart-quiz-btn');

    startBtn.addEventListener('click', startQuiz);
    submitBtn.addEventListener('click', submitAnswer);
    restartBtn.addEventListener('click', resetQuiz);
}

// ===========================
// Quiz Flow
// ===========================
function startQuiz() {
    currentQuestionIndex = 0;
    selectedAnswers = [];
    correctAnswersCount = 0;

    document.getElementById('quiz-start').classList.add('hidden');
    document.getElementById('quiz-question').classList.remove('hidden');

    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        showResults();
        return;
    }

    const question = quizData[currentQuestionIndex];

    // Update progress
    document.querySelector('.current-question').textContent = currentQuestionIndex + 1;
    document.querySelector('.total-questions').textContent = quizData.length;

    // Update question text
    document.getElementById('question-text').textContent = question.question;

    // Handle question image if present
    const questionImage = document.getElementById('question-image');
    if (question.image) {
        questionImage.src = `images/quiz/${question.image}`;
        questionImage.classList.remove('hidden');
    } else {
        questionImage.classList.add('hidden');
    }

    // Create answer options
    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = '';
    selectedAnswers = [];

    question.answers.forEach((answer, index) => {
        const option = document.createElement('div');
        option.classList.add('answer-option');
        option.textContent = answer;
        option.dataset.index = index;

        option.addEventListener('click', () => {
            selectAnswer(option, index, question.multipleChoice);
        });

        optionsContainer.appendChild(option);
    });

    // Reset submit button
    const submitBtn = document.getElementById('submit-answer-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = '提交答案';
}

function selectAnswer(optionElement, index, multipleChoice) {
    if (multipleChoice) {
        // Toggle selection for multiple choice
        if (selectedAnswers.includes(index)) {
            selectedAnswers = selectedAnswers.filter(i => i !== index);
            optionElement.classList.remove('selected');
        } else {
            selectedAnswers.push(index);
            optionElement.classList.add('selected');
        }
    } else {
        // Single choice - clear previous selection
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        selectedAnswers = [index];
        optionElement.classList.add('selected');
    }
}

function submitAnswer() {
    if (selectedAnswers.length === 0) {
        alert('请选择至少一个答案！');
        return;
    }

    const question = quizData[currentQuestionIndex];
    const correctAnswers = question.correct;

    // Check if answer is correct
    const isCorrect = arraysEqual(selectedAnswers.sort(), correctAnswers.sort());

    if (isCorrect) {
        correctAnswersCount++;
    }

    // Show feedback
    showAnswerFeedback(correctAnswers, isCorrect);

    // Disable submit and prepare next question
    const submitBtn = document.getElementById('submit-answer-btn');
    submitBtn.disabled = true;

    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 2000);
}

function showAnswerFeedback(correctAnswers, isCorrect) {
    const options = document.querySelectorAll('.answer-option');

    options.forEach((option, index) => {
        if (correctAnswers.includes(index)) {
            option.classList.add('correct');
        } else if (selectedAnswers.includes(index)) {
            option.classList.add('incorrect');
        }
    });

    // Update submit button text
    const submitBtn = document.getElementById('submit-answer-btn');
    submitBtn.textContent = isCorrect ? '✅ 正确!' : '❌ 错误';
}

function showResults() {
    document.getElementById('quiz-question').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');

    // Display score
    document.getElementById('final-score').textContent = correctAnswersCount;

    // Determine result message
    let resultData;
    if (correctAnswersCount === 0) {
        resultData = RESULT_MESSAGES[0];
    } else if (correctAnswersCount >= 1 && correctAnswersCount <= 5) {
        resultData = RESULT_MESSAGES.low;
    } else if (correctAnswersCount >= 6 && correctAnswersCount <= 7) {
        resultData = RESULT_MESSAGES.medium;
    } else if (correctAnswersCount >= 8 && correctAnswersCount <= 9) {
        resultData = RESULT_MESSAGES.high;
    } else {
        resultData = RESULT_MESSAGES.perfect;
    }

    document.getElementById('result-message').textContent = resultData.title;
    document.getElementById('result-description').textContent = resultData.description;

    // Trigger celebration for high scores
    if (correctAnswersCount >= 8) {
        createCelebration();
    }
}

function resetQuiz() {
    currentQuestionIndex = 0;
    selectedAnswers = [];
    correctAnswersCount = 0;

    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-start').classList.remove('hidden');
}

// ===========================
// Utility Functions
// ===========================
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function createCelebration() {
    const emojis = ['🎉', '🎊', '⭐', '💝', '🎄', '✨'];

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.top = '-50px';
            emoji.style.fontSize = '2rem';
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '9999';
            emoji.style.animation = 'confettiFall 3s linear';

            document.body.appendChild(emoji);

            setTimeout(() => {
                emoji.remove();
            }, 3000);
        }, i * 100);
    }
}
