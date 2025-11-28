// Datos para los juegos
const syllableData = [
    { target: "bra", options: ["bra", "pra", "dra", "bla", "gra", "tra"] },
    { target: "tri", options: ["tri", "pri", "dri", "bli", "gri", "tri"] },
    { target: "cro", options: ["cro", "pro", "dro", "clo", "gro", "tro"] },
    { target: "flo", options: ["flo", "plo", "dlo", "flo", "glo", "tlo"] },
    { target: "pri", options: ["pri", "bri", "dri", "fli", "gri", "tri"] }
];

const wordBuilderData = [
    { word: "brazo", syllables: ["bra", "zo"] },
    { word: "tren", syllables: ["tre", "n"] },
    { word: "plato", syllables: ["pla", "to"] },
    { word: "flor", syllables: ["flo", "r"] },
    { word: "globo", syllables: ["glo", "bo"] }
];

const realWordData = [
    { real: "brazo", fake: "blazo" },
    { real: "tren", fake: "dren" },
    { real: "plato", fake: "prato" },
    { real: "flor", fake: "frol" },
    { real: "globo", fake: "glopo" }
];

// Variables globales del juego
let currentGame = null;
let currentGameIndex = {
    'syllable-catch': 0,
    'word-builder': 0,
    'real-word': 0
};
let score = {
    'syllable-catch': 0,
    'word-builder': 0,
    'real-word': 0
};
let timer = 60;
let timerInterval = null;
let selectedPieces = [];

// Mostrar juego seleccionado
function showGame(gameType) {
    // Ocultar todos los juegos
    document.querySelectorAll('.game-container').forEach(game => {
        game.style.display = 'none';
    });

    // Mostrar el juego seleccionado
    document.getElementById(`game-${gameType}`).style.display = 'block';

    // Inicializar el juego
    currentGame = gameType;
    switch (gameType) {
        case 'syllable-catch':
            initSyllableCatch();
            break;
        case 'word-builder':
            initWordBuilder();
            break;
        case 'real-word':
            initRealWord();
            break;
    }
}

// Juego 1: Atrapa la Sílaba
function initSyllableCatch() {
    const startBtn = document.getElementById('start-syllable');
    const targetSyllable = document.getElementById('target-syllable');
    const syllableOptions = document.getElementById('syllable-options');
    const feedback = document.getElementById('feedback-syllable');
    const scoreDisplay = document.getElementById('score-syllable');
    const timeDisplay = document.getElementById('time-syllable');

    startBtn.onclick = startSyllableGame;

    function startSyllableGame() {
        score['syllable-catch'] = 0;
        timer = 60;
        currentGameIndex['syllable-catch'] = 0;
        scoreDisplay.textContent = 'Puntos: 0';
        feedback.textContent = '';
        startBtn.style.display = 'none';
        timeDisplay.textContent = `Tiempo: ${timer}s`;

        // Iniciar temporizador
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer--;
            timeDisplay.textContent = `Tiempo: ${timer}s`;

            if (timer <= 0) {
                endSyllableGame();
            }
        }, 1000);

        loadNextSyllable();
    }

    function loadNextSyllable() {
        if (currentGameIndex['syllable-catch'] >= syllableData.length) {
            endSyllableGame();
            return;
        }

        const data = syllableData[currentGameIndex['syllable-catch']];
        targetSyllable.textContent = data.target;

        // Mezclar opciones
        const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);

        // Limpiar opciones anteriores
        syllableOptions.innerHTML = '';

        // Crear botones de opciones
        shuffledOptions.forEach(syllable => {
            const syllableElement = document.createElement('div');
            syllableElement.className = 'syllable';
            syllableElement.textContent = syllable;
            syllableElement.addEventListener('click', () => checkSyllableAnswer(syllable, data.target));
            syllableOptions.appendChild(syllableElement);
        });
    }

    function checkSyllableAnswer(selected, correct) {
        const syllables = document.querySelectorAll('.syllable');

        syllables.forEach(syllable => {
            syllable.style.pointerEvents = 'none';
            if (syllable.textContent === correct) {
                syllable.classList.add('correct');
            } else if (syllable.textContent === selected && selected !== correct) {
                syllable.classList.add('incorrect');
            }
        });

        if (selected === correct) {
            score['syllable-catch']++;
            scoreDisplay.textContent = `Puntos: ${score['syllable-catch']}`;
            feedback.textContent = '¡Correcto!';
            feedback.className = 'feedback correct-feedback';
        } else {
            feedback.textContent = `Incorrecto. La respuesta era: ${correct}`;
            feedback.className = 'feedback incorrect-feedback';
        }

        setTimeout(() => {
            currentGameIndex['syllable-catch']++;
            loadNextSyllable();
        }, 1500);
    }

    function endSyllableGame() {
        clearInterval(timerInterval);
        feedback.textContent = `¡Juego terminado! Puntuación final: ${score['syllable-catch']}/${syllableData.length}`;
        startBtn.style.display = 'block';
        startBtn.textContent = 'Jugar de nuevo';
    }
}

// Juego 2: Construye la Palabra
function initWordBuilder() {
    const targetWord = document.getElementById('target-word');
    const wordSlots = document.getElementById('word-slots');
    const wordPieces = document.getElementById('word-pieces');
    const checkBtn = document.getElementById('check-word');
    const nextBtn = document.getElementById('next-word');
    const feedback = document.getElementById('feedback-word');
    const scoreDisplay = document.getElementById('score-word');
    const attemptsDisplay = document.getElementById('attempts-word');

    let currentWord = '';
    let attempts = 0;

    checkBtn.onclick = checkWord;
    nextBtn.onclick = loadWordBuilderRound;

    loadWordBuilderRound();

    function loadWordBuilderRound() {
        if (currentGameIndex['word-builder'] >= wordBuilderData.length) {
            endWordBuilderGame();
            return;
        }

        const data = wordBuilderData[currentGameIndex['word-builder']];
        currentWord = data.word;

        // Mezclar sílabas
        const shuffledSyllables = [...data.syllables].sort(() => Math.random() - 0.5);
        selectedPieces = [];

        // Actualizar interfaz
        targetWord.textContent = currentWord;
        wordSlots.innerHTML = '';
        wordPieces.innerHTML = '';
        feedback.textContent = '';
        nextBtn.style.display = 'none';
        checkBtn.style.display = 'block';

        // Crear espacios para las sílabas
        data.syllables.forEach((syllable, index) => {
            const slot = document.createElement('div');
            slot.className = 'word-slot';
            slot.id = `slot-${index}`;
            slot.textContent = '?';
            wordSlots.appendChild(slot);
        });

        // Crear piezas de sílabas
        shuffledSyllables.forEach(syllable => {
            const piece = document.createElement('div');
            piece.className = 'syllable';
            piece.textContent = syllable;
            piece.draggable = true;

            piece.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', syllable);
            });

            piece.addEventListener('click', () => {
                if (!selectedPieces.includes(syllable)) {
                    selectedPieces.push(syllable);
                    updateWordSlots();
                    piece.style.display = 'none';
                }
            });

            wordPieces.appendChild(piece);
        });

        // Hacer el área de construcción receptiva a arrastrar
        wordSlots.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        wordSlots.addEventListener('drop', (e) => {
            e.preventDefault();
            const syllable = e.dataTransfer.getData('text/plain');
            if (!selectedPieces.includes(syllable)) {
                selectedPieces.push(syllable);
                updateWordSlots();

                // Ocultar la pieza en el contenedor de piezas
                const pieces = document.querySelectorAll('.syllable');
                pieces.forEach(piece => {
                    if (piece.textContent === syllable) {
                        piece.style.display = 'none';
                    }
                });
            }
        });
    }

    function updateWordSlots() {
        const slots = document.querySelectorAll('.word-slot');
        slots.forEach((slot, index) => {
            if (index < selectedPieces.length) {
                slot.textContent = selectedPieces[index];
            } else {
                slot.textContent = '?';
            }
        });
    }

    function checkWord() {
        const constructedWord = selectedPieces.join('');
        attempts++;
        attemptsDisplay.textContent = `Intentos: ${attempts}`;

        if (constructedWord === currentWord) {
            feedback.textContent = '¡Correcto! Has construido la palabra correctamente.';
            feedback.className = 'feedback correct-feedback';
            score['word-builder']++;
            scoreDisplay.textContent = `Puntos: ${score['word-builder']}`;
        } else {
            feedback.textContent = `Incorrecto. La palabra correcta es: ${currentWord}`;
            feedback.className = 'feedback incorrect-feedback';
        }

        checkBtn.style.display = 'none';
        nextBtn.style.display = 'block';
    }

    function endWordBuilderGame() {
        feedback.textContent = `¡Juego terminado! Has acertado ${score['word-builder']}/${wordBuilderData.length} palabras.`;
        nextBtn.style.display = 'none';
        checkBtn.style.display = 'none';

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-primary';
        restartBtn.textContent = 'Jugar de nuevo';
        restartBtn.addEventListener('click', () => {
            currentGameIndex['word-builder'] = 0;
            score['word-builder'] = 0;
            attempts = 0;
            scoreDisplay.textContent = 'Puntos: 0';
            attemptsDisplay.textContent = 'Intentos: 0';
            loadWordBuilderRound();
            restartBtn.remove();
        });
        document.querySelector('#game-word-builder .game-content').appendChild(restartBtn);
    }
}

// Juego 3: ¿Cuál es la palabra real?
function initRealWord() {
    const instruction = document.getElementById('instruction-real-word');
    const wordOptions = document.getElementById('real-word-options');
    const feedback = document.getElementById('feedback-real-word');
    const scoreDisplay = document.getElementById('score-real-word');
    const levelDisplay = document.getElementById('level-real-word');
    const nextBtn = document.getElementById('next-real-word');

    nextBtn.onclick = loadRealWordRound;

    loadRealWordRound();

    function loadRealWordRound() {
        if (currentGameIndex['real-word'] >= realWordData.length) {
            endRealWordGame();
            return;
        }

        const data = realWordData[currentGameIndex['real-word']];

        // Limpiar opciones anteriores
        wordOptions.innerHTML = '';
        feedback.textContent = '';
        nextBtn.style.display = 'none';

        // Decidir aleatoriamente en qué posición poner la palabra real
        const realFirst = Math.random() > 0.5;

        const option1 = document.createElement('div');
        option1.className = 'word-option';
        option1.textContent = realFirst ? data.real : data.fake;
        option1.addEventListener('click', () => checkRealWordAnswer(realFirst));

        const option2 = document.createElement('div');
        option2.className = 'word-option';
        option2.textContent = realFirst ? data.fake : data.real;
        option2.addEventListener('click', () => checkRealWordAnswer(!realFirst));

        wordOptions.appendChild(option1);
        wordOptions.appendChild(option2);
    }

    function checkRealWordAnswer(isCorrect) {
        const options = document.querySelectorAll('.word-option');

        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });

        if (isCorrect) {
            score['real-word']++;
            scoreDisplay.textContent = `Puntos: ${score['real-word']}`;
            feedback.textContent = '¡Correcto! Has identificado la palabra real.';
            feedback.className = 'feedback correct-feedback';

            // Resaltar la opción correcta
            options.forEach(option => {
                if (realWordData[currentGameIndex['real-word']].real === option.textContent) {
                    option.classList.add('correct');
                }
            });
        } else {
            feedback.textContent = `Incorrecto. La palabra real es: ${realWordData[currentGameIndex['real-word']].real}`;
            feedback.className = 'feedback incorrect-feedback';

            // Resaltar la opción correcta e incorrecta
            options.forEach(option => {
                if (realWordData[currentGameIndex['real-word']].real === option.textContent) {
                    option.classList.add('correct');
                } else {
                    option.classList.add('incorrect');
                }
            });
        }

        nextBtn.style.display = 'block';
        currentGameIndex['real-word']++;
        levelDisplay.textContent = `Nivel: ${currentGameIndex['real-word'] + 1}`;
    }

    function endRealWordGame() {
        feedback.textContent = `¡Juego terminado! Has acertado ${score['real-word']}/${realWordData.length} palabras.`;
        nextBtn.style.display = 'none';

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-primary';
        restartBtn.textContent = 'Jugar de nuevo';
        restartBtn.addEventListener('click', () => {
            currentGameIndex['real-word'] = 0;
            score['real-word'] = 0;
            scoreDisplay.textContent = 'Puntos: 0';
            levelDisplay.textContent = 'Nivel: 1';
            loadRealWordRound();
            restartBtn.remove();
        });
        document.querySelector('#game-real-word .game-content').appendChild(restartBtn);
    }
}

// Inicializar el primer juego al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    showGame('syllable-catch');
});
