import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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


// ==================== FIREBASE LEADERBOARD ====================

async function saveScoreToFirebase() {

    try {

        await addDoc(
            collection(db, "leaderboard"),
            {

                name: playerName,

                className: playerClass,

                score: score,

                correct: correct,

                wrong: wrong,

                createdAt: serverTimestamp()

            }
        );

        console.log(
            "บันทึกคะแนนสำเร็จ"
        );

    } catch (error) {

        console.error(
            "บันทึกคะแนนไม่สำเร็จ:",
            error
        );

    }

}


// ==================== PLAY COUNT ====================

function getTotalPlays() {

    return Number(
        localStorage.getItem("plasticSortPlays") || 0
    );
}


// ==================== FIREBASE PLAY COUNT ====================

async function addPlay() {

    try {

        const statsRef = doc(
            db,
            "stats",
            "game"
        );

        await setDoc(
            statsRef,
            {
                totalPlays: increment(1)
            },
            {
                merge: true
            }
        );

        console.log("เพิ่มจำนวนการเล่นสำเร็จ");

    } catch (error) {

        console.error(
            "เพิ่มจำนวนการเล่นไม่สำเร็จ:",
            error
        );

    }
}
// ==================== LOAD PLAY COUNT ====================

async function loadPlayCount() {

    try {

        const statsRef = doc(
            db,
            "stats",
            "game"
        );

        const snapshot = await getDoc(statsRef);

        if (snapshot.exists()) {

            const data = snapshot.data();

            totalPlays.textContent =
                data.totalPlays || 0;

        } else {

            totalPlays.textContent = 0;

        }

    } catch (error) {

        console.error(
            "โหลดจำนวนการเล่นไม่สำเร็จ:",
            error
        );

        totalPlays.textContent = 0;
    }
}


// ==================== DISPLAY LEADERBOARD ====================

async function displayLeaderboard() {

    leaderboardList.innerHTML = `

        <div style="
            text-align:center;
            color:#94a3b8;
            padding:15px;
        ">
            กำลังโหลดคะแนน...
        </div>

    `;


    try {

        const leaderboardQuery = query(
            collection(db, "leaderboard"),
            orderBy("score", "desc")
        );


        const snapshot =
            await getDocs(
                leaderboardQuery
            );


        leaderboardList.innerHTML = "";


        if (snapshot.empty) {

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


        let index = 0;


        snapshot.forEach(doc => {

            const player =
                doc.data();


            const item =
                document.createElement("div");


            item.className =
                "leaderboard-item";


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
                            ${escapeHTML(player.name)}
                        </strong>

                        <span class="player-class">
                            ${escapeHTML(
                                player.className
                            )}
                        </span>

                    </div>

                </div>


                <div class="player-score">
                    ${player.score} ⭐
                </div>

            `;


            leaderboardList.appendChild(item);


            index++;

        });


    } catch (error) {

        console.error(
            "โหลด Leaderboard ไม่สำเร็จ:",
            error
        );


        leaderboardList.innerHTML = `

            <div style="
                text-align:center;
                color:#ef4444;
                padding:10px;
            ">
                โหลด Leaderboard ไม่สำเร็จ
            </div>

        `;

    }

}

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

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

// ==================== END GAME ====================

// ==================== END GAME ====================

async function endGame() {

    if (!isGameRunning) {
        return;
    }

    isGameRunning = false;

    clearInterval(gameTimer);

    // เพิ่มจำนวนการเล่นใน Firebase
    await addPlay();

    // บันทึกคะแนน
    await saveScoreToFirebase();

    // แสดงคะแนน
    finalScore.textContent = score;
    correctCount.textContent = correct;
    wrongCount.textContent = wrong;

    // อัปเดตจำนวนเล่น
    await loadPlayCount();

    // ไปหน้าสรุป
    gameScreen.classList.remove("active");
    startScreen.classList.remove("active");
    resultScreen.classList.add("active");
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


    // โหลด Leaderboard ใหม่
    displayLeaderboard();

}

// ==================== INITIAL LOAD ====================

displayLeaderboard();
loadPlayCount();
createBins();
// ==================== BUTTON EVENTS ====================

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    startGame();
});

homeBtn.addEventListener("click", goHome);