document.addEventListener('DOMContentLoaded', () => {
    const timeLimitInput = document.getElementById('timeLimit');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const quizSection = document.getElementById('quizSection');
    const questionEl = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const submitBtn = document.getElementById('submitBtn');
    const timerEl = document.getElementById('timeLeft');
    const resultMatrix = document.getElementById('resultMatrix');
    const errorSection = document.getElementById('errorSection');
    const errorList = document.getElementById('errorList');

    let timeLimit = 10;
    let timeLeft;
    let timer;
    let currentQuestion;
    let results = loadResults();
    let running = false;

    function loadResults() {
        const storedResults = localStorage.getItem('results');
        return storedResults ? JSON.parse(storedResults) : Array.from({ length: 10 }, () => Array(10).fill(null));
    }

    function saveResults() {
        localStorage.setItem('results', JSON.stringify(results));
    }

    function updateMatrix() {
        resultMatrix.innerHTML = '';

        const headerRow = document.createElement('tr');
        const emptyHeader = document.createElement('th');
        headerRow.appendChild(emptyHeader);

        for (let i = 1; i <= 10; i++) {
            const header = document.createElement('th');
            header.textContent = i;
            headerRow.appendChild(header);
        }
        resultMatrix.appendChild(headerRow);

        for (let i = 1; i <= 10; i++) {
            const row = document.createElement('tr');
            const rowHeader = document.createElement('th');
            rowHeader.textContent = i;
            row.appendChild(rowHeader);

            for (let j = 1; j <= 10; j++) {
                const cell = document.createElement('td');
                const result = results[i - 1][j - 1];
                if (result === null) {
                    cell.textContent = '';
                    cell.className = 'cell';
                } else {
                    const successRate = result.correct / result.attempts;
                    const greenShade = Math.floor(successRate * 255);
                    const redShade = 255 - greenShade;
                    cell.style.backgroundColor = `rgb(${redShade}, ${greenShade}, 150)`;
                    //cell.textContent = result.attempts;
                    cell.textContent = `${result.correct}/${result.attempts}`;
                }
                row.appendChild(cell);
            }
            resultMatrix.appendChild(row);
        }
    }

    function updateErrorList() {
        errorList.innerHTML = '';
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < results[i].length; j++) {
                const result = results[i][j];
                if (result && result.correct < result.attempts) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${i + 1} × ${j + 1} = ${currentQuestion.correctAnswer}`;
                    errorList.appendChild(listItem);
                }
            }
        }
        errorSection.classList.toggle('hidden', errorList.childElementCount === 0);
    }

    function pickQuestion() {
        const flatResults = [];
        for (let i = 1; i <= 10; i++) {
            for (let j = 1; j <= 10; j++) {
                const result = results[i - 1][j - 1];
                flatResults.push({ a: i, b: j, result });
            }
        }

        const priorityQuestions = flatResults.filter(q => q.result === null || q.result.correct < q.result.attempts);
        const questionPool = priorityQuestions.length > 0 ? priorityQuestions : flatResults;
        const selected = questionPool[Math.floor(Math.random() * questionPool.length)];
        return [selected.a, selected.b];
    }

    function startQuiz() {
        timeLimit = parseInt(timeLimitInput.value, 10) || 10;
        running = true;
        quizSection.classList.remove('hidden');
        stopBtn.classList.remove('hidden');
        nextQuestion();
    }

    function stopQuiz() {
        running = false;
        quizSection.classList.add('hidden');
        stopBtn.classList.add('hidden');
        clearInterval(timer);
    }

    function nextQuestion() {
        if (!running) return;
        const [a, b] = pickQuestion();
        currentQuestion = { a, b, correctAnswer: a * b };
        questionEl.textContent = `${a} × ${b} = ?`;
        answerInput.value = '';
        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timeLeft = timeLimit;
        timerEl.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft -= 1;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                recordAnswer(false);
            }
        }, 1000);
    }

    function recordAnswer(correct) {
        const { a, b } = currentQuestion;
        const cell = results[a - 1][b - 1] || { attempts: 0, correct: 0 };
        cell.attempts += 1;
        if (correct) cell.correct += 1;
        results[a - 1][b - 1] = cell;

        saveResults();
        updateMatrix();
        updateErrorList();
        nextQuestion();
    }

    submitBtn.addEventListener('click', () => {
        if (!running) return;
        const userAnswer = parseInt(answerInput.value, 10);
        if (!isNaN(userAnswer)) {
            const correct = userAnswer === currentQuestion.correctAnswer;
            recordAnswer(correct);
        }
    });

    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });

    resetBtn.addEventListener('click', () => {
        results = Array.from({ length: 10 }, () => Array(10).fill(null));
        saveResults();
        updateMatrix();
        updateErrorList();
    });

    startBtn.addEventListener('click', startQuiz);
    stopBtn.addEventListener('click', stopQuiz);

    updateMatrix();
    updateErrorList();
});