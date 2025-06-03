// js/nback.js

const canvas = document.getElementById("nback_canvas");
const ctx = canvas.getContext("2d");
const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "H",
  "I",
  "K",
  "L",
  "M",
  "O",
  "P",
  "R",
  "S",
  "T",
];

let sequence = [];
let currentIndex = 0;
let stimulusStartTime = 0;
let acceptingResponse = false;
let clickedThisTrial = false;
let rtData = [];
let quizStarted = false;
let treatment = null;

const N = 2;
const numTrials = 17;
const matchChance = 0.25;

function drawIntroScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const introText = [
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
    'Select a treatment and click "Start Quiz" to begin.',
  ];
  introText.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 40 + i * 30);
  });
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
  drawStimulus(sequence[currentIndex]);
  stimulusStartTime = performance.now();
  acceptingResponse = true;
  clickedThisTrial = false;

  setTimeout(() => {
    acceptingResponse = false;
    const now = performance.now();
    const rt = clickedThisTrial ? Math.round(now - stimulusStartTime) : 1500;
    const isMatch =
      currentIndex >= N &&
      sequence[currentIndex] === sequence[currentIndex - N];

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
  }, 1000);
}

function startMusic(type) {
  stopMusic();
  const audio =
    type === "calming"
      ? document.getElementById("calming-audio")
      : document.getElementById("vexing-audio");
  audio.currentTime = 0;
  audio.play();
}

function stopMusic() {
  document.getElementById("calming-audio").pause();
  document.getElementById("vexing-audio").pause();
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
    treatment = null;
    stopMusic();
    drawIntroScreen();
    document.getElementById("stats").innerHTML = "";
    document.getElementById("treatment-selection").style.display = "block";
  });
}

function downloadCSV() {
  const csvHeader = "Trial,Stimulus,Match,Clicked,RT(ms),Correct\n";
  const csvRows = rtData.map(
    (d) =>
      `${d.trial},${d.stimulus},${d.match},${d.clicked},${d.rt},${d.correct}`,
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

document.getElementById("start-button").addEventListener("click", () => {
  const selected = document.querySelector('input[name="treatment"]:checked');
  if (!selected) {
    alert("Please select a treatment before starting.");
    return;
  }

  treatment = selected.value;
  document.getElementById("treatment-selection").style.display = "none";
  quizStarted = true;
  sequence = generateSequence(numTrials);
  currentIndex = 0;
  rtData = [];
  document.getElementById("stats").innerHTML = "";
  startMusic(treatment);
  runTrial();
});

canvas.addEventListener("click", () => {
  if (acceptingResponse && !clickedThisTrial) {
    clickedThisTrial = true;
  }
});

drawIntroScreen();
