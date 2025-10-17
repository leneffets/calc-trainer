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
    const feedback = document.getElementById('feedback');

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

    function getResultIndex(a, b) {
        return [Math.min(a, b), Math.max(a, b)];
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
                cell.title = i * j;
                if (j >= i) {
                    const result = results[i - 1][j - 1];
                    if (result === null) {
                        cell.textContent = '';
                        cell.className = 'cell';
                    } else {
                        const successRate = result.correct / result.attempts;
                        const hue = Math.floor(successRate * 120);
                        cell.style.backgroundColor = `hsl(${hue}, 85%, 60%)`;
                        cell.textContent = `${result.correct}/${result.attempts}`;
                    }
                } else {
                    cell.style.backgroundColor = '#f9f9f9';
                }
                row.appendChild(cell);
            }
            resultMatrix.appendChild(row);
        }
    }

    function updateErrorList() {
        errorList.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            for (let j = i; j <= 10; j++) {
                const result = results[i - 1][j - 1];
                if (result && result.correct < result.attempts) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${i} × ${j} = ${i * j} (${result.correct}/${result.attempts})`;
                    errorList.appendChild(listItem);
                }
            }
        }
        errorSection.classList.toggle('hidden', errorList.childElementCount === 0);
    }

    function pickQuestion() {
        const flatResults = [];
        for (let i = 1; i <= 10; i++) {
            for (let j = i; j <= 10; j++) {
                const result = results[i - 1][j - 1];
                const successRate = result ? result.correct / result.attempts : 0;
                const weight = Math.max(1 - successRate, 0.10);
                flatResults.push({ a: i, b: j, weight });
            }
        }
    
        const totalWeight = flatResults.reduce((sum, q) => sum + q.weight, 0);
        let randomWeight = Math.random() * totalWeight;
    
        for (const question of flatResults) {
            randomWeight -= question.weight;
            if (randomWeight <= 0) {
                const shouldSwap = Math.random() < 0.5;
                return shouldSwap ? [question.b, question.a] : [question.a, question.b];
            }
        }
    }


    function startQuiz() {
        timeLimit = parseInt(timeLimitInput.value, 10) || 10;
        running = true;
        quizSection.classList.remove('hidden');
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        nextQuestion();
    }

    function stopQuiz() {
        running = false;
        quizSection.classList.add('hidden');
        startBtn.classList.remove('hidden');
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
                // Hier wird überprüft, ob eine Antwort eingegeben wurde
                if (answerInput.value === '') {
                    // Wenn keine Eingabe erfolgt ist, das Spiel unterbrechen
                    stopQuiz();
                    feedback.textContent = "Zeit abgelaufen! Das Spiel wurde beendet.";
                } else {
                    // Wenn eine Eingabe vorhanden ist, die Antwort aufzeichnen
                    recordAnswer(false);
                }
            }
        }, 1000);
    }

    function recordAnswer(correct) {
        const { a, b } = currentQuestion;
        const [minIdx, maxIdx] = getResultIndex(a, b);
        const cell = results[minIdx - 1][maxIdx - 1] || { attempts: 0, correct: 0 };

        cell.attempts += 1;
        if (correct) {
            showFeedback(`${currentQuestion.a} × ${currentQuestion.b} = ${currentQuestion.correctAnswer}`, true);
            cell.correct += 1;
        } else {
            showFeedback(`${currentQuestion.a} × ${currentQuestion.b} = ${currentQuestion.correctAnswer}`, false);
        }
           
        results[minIdx - 1][maxIdx - 1] = cell;

        saveResults();
        updateMatrix();
        updateErrorList();
        nextQuestion();
    }

    function showFeedback(message, correct) {
    
        feedback.textContent = message;
        feedback.classList.toggle('correct', correct);
        feedback.classList.toggle('incorrect', !correct);
    
        // Feedback nach 3 Sekunden ausblenden
        //setTimeout(() => {
        //    feedback.textContent = '' ;
        //    feedback.classList.remove('correct', 'incorrect');
        //}, 3000);
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

