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
        title: 'Oops! 😅',
        description: 'Looks like you need to get to know me better! No worries, we have plenty of time to learn together~'
    },
    low: { // 1-5
        title: 'Not Bad! 💪',
        description: 'You know some things about me, but there\'s still a lot to discover!'
    },
    medium: { // 6-7
        title: 'Well Done! 🌟',
        description: 'You know me quite well! Our connection is getting stronger~'
    },
    high: { // 8-9
        title: 'Amazing! 🎉',
        description: 'You\'re almost an expert on me! Just a tiny bit away from perfection~'
    },
    perfect: { // 10
        title: 'Perfect! 💝',
        description: 'You know me completely! We\'re truly meant to be together! ❤️'
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        quizData = await response.json();
        console.log('Quiz data loaded successfully:', quizData.length, 'questions');
    } catch (error) {
        console.error('Error loading quiz data:', error);
        // Fallback sample quiz
        quizData = [
            {
                question: "What is Oppa real name?",
                answers: ["Sergey", "Oppa", "孔子", "Baby"],
                correct: [0],
                multipleChoice: false
            },
            {
                question: "When Oppa was born?",
                answers: ["17.07.2000", "07.17.2000", "17.04.2003", "yesterday"],
                correct: [0, 1],
                multipleChoice: false
            },
            {
                question: "Pick Oppa favorite food from the list.",
                answers: ["Pizza", "Pasta", "宝宝", "KFC"],
                correct: [0, 1, 2, 3],
                multipleChoice: true
            },
            {
                question: "What type of Oppa does NOT exist?",
                answers: ["Cute Oppa", "Horny Oppa", "Angry Oppa", "Bald Oppa"],
                correct: [3],
                multipleChoice: false
            },
            {
                question: "Do you love Oppa?",
                answers: ["Yes", "Definitely", "Absolutely", "NO"],
                correct: [0, 1, 2],
                multipleChoice: true
            }
        ];
        console.log('Using fallback quiz data:', quizData.length, 'questions');
    }
}

// ===========================
// Initialize Buttons
// ===========================
function initQuizButtons() {
    const startBtn = document.getElementById('start-quiz-btn');
    const submitBtn = document.getElementById('submit-answer-btn');
    const restartBtn = document.getElementById('restart-quiz-btn');
    const restartBtnSmall = document.getElementById('restart-quiz-btn-small');

    startBtn.addEventListener('click', startQuiz);
    submitBtn.addEventListener('click', submitAnswer);
    restartBtn.addEventListener('click', resetQuiz);
    restartBtnSmall.addEventListener('click', () => {
        if (confirm('Are you sure you want to restart the quiz? Your progress will be lost.')) {
            resetQuiz();
        }
    });
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
    submitBtn.textContent = 'Submit Answer';
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
        alert('Please select at least one answer!');
        return;
    }

    const question = quizData[currentQuestionIndex];
    const correctAnswers = question.correct;

    // Check if answer is correct
    let isCorrect;
    if (!question.multipleChoice && correctAnswers.length > 1) {
        // Special case: single choice but multiple correct answers
        // Any one of the correct answers is acceptable
        isCorrect = correctAnswers.includes(selectedAnswers[0]);
    } else {
        // Standard case: exact match required
        isCorrect = arraysEqual(selectedAnswers.sort(), correctAnswers.sort());
    }

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
    submitBtn.textContent = isCorrect ? '✅ Correct!' : '❌ Wrong';
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
