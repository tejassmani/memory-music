const canvas = document.getElementById("nback_canvas");
const ctx = canvas.getContext("2d");
const letters = [
  "A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T",
];

let sequence = [];
let currentIndex = 0;
let stimulusStartTime = 0;
let acceptingResponse = false;
let clickedThisTrial = false;
let rtData = [];
let quizStarted = false;
let genre = null;
let currentScreen = "genre"; // 'genre' → 'instructions' → 'quiz'
let currentAudio = null;
let halfwayPoint = 0;

const N = 2;
const numTrials = 17;
const matchChance = 0.25;

function drawScreen(lines) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 40 + i * 30);
  });
}

function drawGenreScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === Settings ===
  const borderColor = "black";
  const borderWidth = 1;  // Matches typical canvas border
  const headerY = 30;
  const headerFontSize = 32;
  const headerBottom = headerY + headerFontSize + 8;

  // === Header ===
  ctx.font = `${headerFontSize}px Arial`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Select Preferred Genre", canvas.width / 2, headerY);

  // === Underline === (full width, matching border thickness/color)
  ctx.beginPath();
  ctx.moveTo(0, headerBottom);
  ctx.lineTo(canvas.width, headerBottom);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  // === Partition line === (same thickness/color, starts below header)
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, headerBottom);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  // === Choices ===
  ctx.font = "28px Arial";
  ctx.textBaseline = "middle";

  // Compute vertical center for text/icon block
  const choiceCenterY = headerBottom + (canvas.height - headerBottom) / 2;

  // Left side: Classical
  ctx.fillText("🎻", canvas.width / 4, choiceCenterY - 40);
  ctx.fillText("Click Here for Classical", canvas.width / 4, choiceCenterY + 10);

  // Right side: Pop
  ctx.fillText("🎤", (3 * canvas.width) / 4, choiceCenterY - 40);
  ctx.fillText("Click Here for Pop", (3 * canvas.width) / 4, choiceCenterY + 10);
}




function drawIntroScreen() {
  drawScreen([
    "N-back working memory task",
    "",
    "In this task, you will see a sequence of letters.",
    "Each letter is shown for a few seconds.",
    "You need to decide if you saw the same letter 2 trials ago.",
    "That is, this is a n=2-back task.",
    "",
    "If you saw the same letter 2 trials ago, click the mouse.",
    "Otherwise, do not click.",
    "",
    "Click the mouse to begin the quiz.",
  ]);
}

function drawStimulus(stim) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "150px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(stim, canvas.width / 2, canvas.height / 2);
}

function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    if (i >= N && Math.random() < matchChance) {
      seq.push(seq[i - N]);
    } else {
      let newLetter;
      do {
        newLetter = letters[Math.floor(Math.random() * letters.length)];
      } while (i >= N && newLetter === seq[i - N]);
      seq.push(newLetter);
    }
  }
  return seq;
}

function flash(color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStimulus(sequence[currentIndex - 1]);
  }, 200);
}

function runTrial() {
  if (currentIndex >= sequence.length) {
    endTask();
    return;
  }

  // Switch to vexing at halfway point
  if (currentIndex === halfwayPoint) {
    playMusic("vexing");
  }

  drawStimulus(sequence[currentIndex]);
  stimulusStartTime = performance.now();
  acceptingResponse = true;
  clickedThisTrial = false;

  setTimeout(() => {
    acceptingResponse = false;
    const now = performance.now();
    const rt = clickedThisTrial ? Math.round(now - stimulusStartTime) : 1500;
    const isMatch =
      currentIndex >= N && sequence[currentIndex] === sequence[currentIndex - N];

    let correct = false;
    if (isMatch && clickedThisTrial) {
      correct = true;
      flash("green");
    } else if (!isMatch && !clickedThisTrial) {
      correct = true;
    } else if (clickedThisTrial) {
      flash("red");
    }

    rtData.push({
      trial: currentIndex + 1,
      stimulus: sequence[currentIndex],
      match: isMatch,
      clicked: clickedThisTrial,
      rt: rt,
      correct: correct,
    });

    currentIndex++;
    setTimeout(runTrial, 750);
  }, 1500);
}

function playMusic(type) {
  stopMusic();
  const path = `audio/${genre}/${type}.mp3`;
  currentAudio = new Audio(path);
  currentAudio.loop = true;
  currentAudio.play();
}

function stopMusic() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function endTask() {
  stopMusic();

  const totalCorrect = rtData.filter((d) => d.correct).length;
  const accuracy = Math.round((totalCorrect / rtData.length) * 100);
  const rtList = rtData.filter((d) => d.clicked).map((d) => d.rt);
  const avgRT =
    rtList.length > 0
      ? Math.round(rtList.reduce((a, b) => a + b) / rtList.length)
      : "N/A";

  document.getElementById("stats").innerHTML = `
    <h2>Task Complete!</h2>
    <p>Accuracy: ${accuracy}%</p>
    <p>Average Reaction Time (for clicks): ${avgRT} ms</p>
    <button id="download_button">Download CSV</button>
    <button id="restart_button">Restart Quiz</button>
  `;

  document
    .getElementById("download_button")
    .addEventListener("click", downloadCSV);
  document.getElementById("restart_button").addEventListener("click", () => {
    quizStarted = false;
    genre = null;
    currentScreen = "genre";
    drawGenreScreen();
    document.getElementById("stats").innerHTML = "";
  });
}

function downloadCSV() {
  const csvHeader = "Trial,Stimulus,Match,Clicked,RT(ms),Correct\n";
  const csvRows = rtData.map(
    (d) =>
      `${d.trial},${d.stimulus},${d.match},${d.clicked},${d.rt},${d.correct}`
  );
  const csvContent = csvHeader + csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "2back_results.csv";
  a.click();

  URL.revokeObjectURL(url);
}

// Handle ALL canvas clicks
canvas.addEventListener("click", (e) => {
  if (currentScreen === "genre") {
    // Select genre by canvas side
    const x = e.offsetX;
    genre = x < canvas.width / 2 ? "classical" : "pop";
    console.log(`Genre selected: ${genre}`);
    currentScreen = "instructions";
    drawIntroScreen();
  } else if (currentScreen === "instructions") {
    // Start quiz
    currentScreen = "quiz";
    quizStarted = true;
    sequence = generateSequence(numTrials);
    currentIndex = 0;
    halfwayPoint = Math.floor(sequence.length / 2);
    rtData = [];
    document.getElementById("stats").innerHTML = "";
    playMusic("calming");
    runTrial();
  } else if (currentScreen === "quiz") {
    if (acceptingResponse && !clickedThisTrial) {
      clickedThisTrial = true;
    }
  }
});

// Initial screen
drawGenreScreen();

