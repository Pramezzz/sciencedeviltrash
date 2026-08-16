// ==================== PLASTIC DATA ====================

const plastics = [
    {
        type: "PET",
        number: 1,
        name: "ขวดน้ำ",
        emoji: "🧴"
    },
    {
        type: "HDPE",
        number: 2,
        name: "ขวดแชมพู",
        emoji: "🧴"
    },
    {
        type: "PVC",
        number: 3,
        name: "ท่อพลาสติก",
        emoji: "🔧"
    },
    {
        type: "LDPE",
        number: 4,
        name: "ถุงพลาสติก",
        emoji: "🛍️"
    },
    {
        type: "PP",
        number: 5,
        name: "กล่องอาหาร",
        emoji: "🍱"
    },
    {
        type: "PS",
        number: 6,
        name: "กล่องโฟม",
        emoji: "🥡"
    },
    {
        type: "OTHER",
        number: 7,
        name: "พลาสติกอื่น ๆ",
        emoji: "🧃"
    }
];


// ==================== GAME VARIABLES ====================

let score = 0;
let timeLeft = 30;

let correct = 0;
let wrong = 0;

let currentTrash = null;
let gameTimer = null;

let isGameRunning = false;

let playerName = "";
let playerClass = "";


// ==================== ELEMENTS ====================

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");

const trashCard = document.getElementById("trashCard");
const trashEmoji = document.getElementById("trashEmoji");
const trashName = document.getElementById("trashName");
const trashCode = document.getElementById("trashCode");

const binsContainer = document.getElementById("bins");

const feedback = document.getElementById("feedback");

const finalScore = document.getElementById("finalScore");
const correctCount = document.getElementById("correctCount");
const wrongCount = document.getElementById("wrongCount");

const totalPlays = document.getElementById("totalPlays");
const leaderboardList = document.getElementById("leaderboardList");

const playerNameInput = document.getElementById("playerName");
const playerClassInput = document.getElementById("playerClass");


// ==================== LEADERBOARD ====================

function getLeaderboard() {

    const data = localStorage.getItem(
        "plasticSortLeaderboard"
    );

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}


function saveScore(score) {

    const leaderboard = getLeaderboard();

    leaderboard.push({

        name: playerName,

        className: playerClass,

        score: score,

        date: new Date().toLocaleDateString("th-TH")

    });


    leaderboard.sort((a, b) => {
        return b.score - a.score;
    });


    // เก็บคะแนนสูงสุด 5 อันดับ

    const topFive = leaderboard.slice(0, 5);


    localStorage.setItem(
        "plasticSortLeaderboard",
        JSON.stringify(topFive)
    );
}


// ==================== PLAY COUNT ====================

function getTotalPlays() {

    return Number(
        localStorage.getItem("plasticSortPlays") || 0
    );
}


function addPlay() {

    const plays = getTotalPlays() + 1;

    localStorage.setItem(
        "plasticSortPlays",
        plays
    );
}


// ==================== DISPLAY LEADERBOARD ====================

function displayLeaderboard() {

    const leaderboard = getLeaderboard();

    totalPlays.textContent = getTotalPlays();

    leaderboardList.innerHTML = "";


    if (leaderboard.length === 0) {

        leaderboardList.innerHTML = `
            <div style="
                text-align:center;
                color:#94a3b8;
                padding:10px;
            ">
                ยังไม่มีคะแนน
            </div>
        `;

        return;
    }


    leaderboard.forEach((player, index) => {

        const item = document.createElement("div");

        item.className = "leaderboard-item";


        let medal = "";

        if (index === 0) medal = "🥇";
        if (index === 1) medal = "🥈";
        if (index === 2) medal = "🥉";


        item.innerHTML = `

            <div class="leaderboard-left">

                <div class="rank">
                    ${medal || index + 1}
                </div>

                <div class="player-name">

                    <strong>
                        ${player.name}
                    </strong>

                    <span class="player-class">
                        ${player.className || ""}
                    </span>

                </div>

            </div>


            <div class="player-score">
                ${player.score} ⭐
            </div>

        `;


        leaderboardList.appendChild(item);

    });
}


// ==================== CREATE BINS ====================

function createBins() {

    binsContainer.innerHTML = "";


    plastics.forEach(plastic => {

        const bin = document.createElement("div");

        bin.classList.add("bin");

        bin.dataset.type = plastic.type;


        bin.innerHTML = `

            <div class="bin-icon">
                🗑️
            </div>

            <div class="bin-name">
                ${plastic.type}
            </div>

            <div class="bin-number">
                รหัส ${plastic.number}
            </div>

        `;


        // Desktop

        bin.addEventListener(
            "dragover",
            handleDragOver
        );


        bin.addEventListener(
            "drop",
            function(event) {

                event.preventDefault();

                if (!isGameRunning) return;

                checkAnswer(
                    plastic.type,
                    bin
                );

            }
        );


        // Mobile / Click

        bin.addEventListener(
            "click",
            function() {

                if (!isGameRunning) return;

                checkAnswer(
                    plastic.type,
                    bin
                );

            }
        );


        binsContainer.appendChild(bin);

    });
}


// ==================== START GAME ====================

function startGame() {

    const name =
        playerNameInput.value.trim();

    const playerClassValue =
        playerClassInput.value.trim();


    // ตรวจชื่อ

    if (!name) {

        alert("กรุณากรอกชื่อก่อนเริ่มเกม");

        playerNameInput.focus();

        return;
    }


    // ตรวจชั้น

    if (!playerClassValue) {

        alert("กรุณากรอกชั้นก่อนเริ่มเกม");

        playerClassInput.focus();

        return;
    }


    // เก็บข้อมูลผู้เล่น

    playerName = name;
    playerClass = playerClassValue;


    // Reset เกม

    score = 0;
    timeLeft = 60;
    correct = 0;
    wrong = 0;

    isGameRunning = true;


    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;


    // เปลี่ยนหน้า

    startScreen.classList.remove("active");
    resultScreen.classList.remove("active");

    gameScreen.classList.add("active");


    createBins();
    nextTrash();


    clearInterval(gameTimer);


    gameTimer = setInterval(() => {

        timeLeft--;

        timerElement.textContent = timeLeft;


        if (timeLeft <= 0) {

            endGame();

        }

    }, 1000);
}


// ==================== NEXT TRASH ====================

function nextTrash() {

    const randomIndex =
        Math.floor(
            Math.random() * plastics.length
        );


    currentTrash =
        plastics[randomIndex];


    trashEmoji.textContent =
        currentTrash.emoji;

    trashName.textContent =
        currentTrash.name;

    trashCode.textContent =
        `♻️ ${currentTrash.type} ${currentTrash.number}`;
}


// ==================== DRAG ====================

trashCard.addEventListener(
    "dragstart",
    function(event) {

        if (!isGameRunning) {

            event.preventDefault();

            return;
        }


        event.dataTransfer.setData(
            "text/plain",
            currentTrash.type
        );

    }
);


function handleDragOver(event) {

    event.preventDefault();

}


// ==================== CHECK ANSWER ====================

function checkAnswer(
    selectedType,
    selectedBin
) {

    if (
        !currentTrash ||
        !isGameRunning
    ) {
        return;
    }


    // ==================== CORRECT ====================

    if (
        selectedType === currentTrash.type
    ) {

        score += 10;

        correct++;


        scoreElement.textContent =
            score;


        selectedBin.classList.add(
            "correct"
        );


        showFeedback(
            "ถูกต้อง! +10 คะแนน",
            "correct"
        );


        setTimeout(() => {

            selectedBin.classList.remove(
                "correct"
            );

            if (isGameRunning) {
                nextTrash();
            }

        }, 450);

    }


    // ==================== WRONG ====================

    else {

        score -= 5;

        wrong++;


        if (score < 0) {
            score = 0;
        }


        scoreElement.textContent =
            score;


        selectedBin.classList.add(
            "wrong"
        );


        showFeedback(
            "ผิด! -5 คะแนน",
            "wrong"
        );


        setTimeout(() => {

            selectedBin.classList.remove(
                "wrong"
            );

        }, 400);

    }

}


// ==================== FEEDBACK ====================

let feedbackTimeout;


function showFeedback(
    message,
    type
) {

    clearTimeout(
        feedbackTimeout
    );


    feedback.textContent =
        message;


    feedback.className =
        `feedback show ${type}`;


    feedbackTimeout =
        setTimeout(() => {

            feedback.classList.remove(
                "show"
            );

        }, 800);
}


// ==================== END GAME ====================

function endGame() {

    // ป้องกัน endGame ทำงานซ้ำ

    if (!isGameRunning) {
        return;
    }


    isGameRunning = false;


    clearInterval(gameTimer);


    // ====================
    // SAVE GAME
    // ====================

    addPlay();

    saveScore(score);


    // ====================
    // UPDATE RESULT
    // ====================

    finalScore.textContent =
        score;

    correctCount.textContent =
        correct;

    wrongCount.textContent =
        wrong;


    // ====================
    // SHOW RESULT SCREEN
    // ====================

    gameScreen.classList.remove(
        "active"
    );

    startScreen.classList.remove(
        "active"
    );

    resultScreen.classList.add(
        "active"
    );

}


// ==================== HOME ====================

function goHome() {

    isGameRunning = false;


    clearInterval(gameTimer);


    gameScreen.classList.remove(
        "active"
    );

    resultScreen.classList.remove(
        "active"
    );

    startScreen.classList.add(
        "active"
    );


    // อัปเดต Leaderboard

    displayLeaderboard();

}


// ==================== BUTTONS ====================

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);


homeBtn.addEventListener(
    "click",
    goHome
);


// ==================== INITIAL LOAD ====================

displayLeaderboard();

createBins();