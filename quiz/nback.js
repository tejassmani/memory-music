const canvas = document.getElementById("nback_canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// Recalculate the internal buffer **only**, never touch CSS sizing.
// Then reset & scale the context so 1 unit = 1 CSS pixel.
function adjustCanvasDPI() {
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  if (!W || !H) return;

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  // reset any old transforms, then scale
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

// A little helper to redraw whatever screen we're on:
function redrawCurrentScreen() {
  if (currentScreen === "genre") drawGenreScreen();
  else if (currentScreen === "instructions")
    drawIntroScreen(); /* quiz */ /* quiz loop paints itself */
  else;
}

// Hook it up:
window.addEventListener("load", () => {
  adjustCanvasDPI();
  redrawCurrentScreen();
});
window.addEventListener("resize", () => {
  adjustCanvasDPI();
  redrawCurrentScreen();
});
new ResizeObserver(() => {
  adjustCanvasDPI();
  redrawCurrentScreen();
}).observe(canvas);

const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

let sequence = [];
let currentIndex = 0;
let stimulusStartTime = 0;
let acceptingResponse = false;
let responseThisTrial = null; // null, 'left', 'right'
let rtData = [];
let quizStarted = false;
let genre = null;
let currentScreen = "genre"; // 'genre' → 'instructions' → 'quiz'
let currentAudio = null;
let halfwayPoint = 30; // Switch to vexing after 30 trials

const N = 2;
const numTrials = 60; // 30 calming + 30 vexing
const matchChance = 0.15;

function drawScreen(lines) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px 'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 40 + i * 30);
  });
}

function drawGenreScreen() {
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  // clear
  ctx.clearRect(0, 0, W, H);

  // header
  const headerY = 30;
  const headerFS = 32;
  const headerBottom = headerY + headerFS + 8;

  ctx.font = `${headerFS}px 'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Select Preferred Genre", W / 2, headerY);

  // lines
  ctx.beginPath();
  ctx.moveTo(0, headerBottom);
  ctx.lineTo(W, headerBottom);
  ctx.moveTo(W / 2, headerBottom);
  ctx.lineTo(W / 2, H);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke();

  // choices
  ctx.font = "28px 'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif";
  ctx.textBaseline = "middle";
  const cy = headerBottom + (H - headerBottom) / 2;

  ctx.fillText("🎻", W / 4, cy - 40);
  ctx.fillText("Click for Classical", W / 4, cy + 10);
  ctx.fillText("🎤", (3 * W) / 4, cy - 40);
  ctx.fillText("Click for Pop", (3 * W) / 4, cy + 10);
}

function drawIntroScreen() {
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  ctx.clearRect(0, 0, W, H);

  // Text style
  const fontSize = 20;
  const lineHeight = 24;
  ctx.font = `${fontSize}px 'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Your instruction lines
  const lines = [
    "N-back working memory task",
    "",
    "In this task, you will see a sequence of letters.",
    "Each letter is shown for 1 second.",
    "You need to decide if you saw the same letter",
    "2 trials ago. This is a n=2-back task.",
    "",
    "Press LEFT ARROW if NO match",
    "(different letter 2 trials ago)",
    "Press RIGHT ARROW if MATCH",
    "(same letter 2 trials ago)",
    "",
    "The task has 60 trials total.",
    "Music will change halfway through.",
    "",
    "Click the mouse to begin the quiz.",
  ];

  // Padding values
  const topPadding = 20;
  const bottomPadding = 20;

  // Compute usable height and where to start drawing
  const usableHeight = H - topPadding - bottomPadding;
  const totalTextHeight = lines.length * lineHeight;
  let startY = topPadding + (usableHeight - totalTextHeight) / 2;

  // Draw every line
  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    ctx.fillText(line, W / 2, y);
  });
}

function drawStimulus(letter) {
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  ctx.clearRect(0, 0, W, H);
  ctx.font = "150px 'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, W / 2, H / 2);
}

function generateSequence(length) {
  const minMatches = 15; // Minimum required matches
  const seq = [];
  let guaranteedMatches = 0;

  // First pass: generate sequence with some guaranteed matches
  for (let i = 0; i < length; i++) {
    if (i >= N && guaranteedMatches < minMatches && Math.random() < 0.4) {
      // Higher chance for matches when we need to meet minimum
      seq.push(seq[i - N]);
      guaranteedMatches++;
    } else if (i >= N && Math.random() < matchChance) {
      // Normal random matches
      seq.push(seq[i - N]);
    } else {
      // Generate non-matching letter
      let newLetter;
      do {
        newLetter = letters[Math.floor(Math.random() * letters.length)];
      } while (i >= N && newLetter === seq[i - N]);
      seq.push(newLetter);
    }
  }

  // Second pass: ensure we have at least the minimum number of matches
  let currentMatches = 0;
  for (let i = N; i < length; i++) {
    if (seq[i] === seq[i - N]) {
      currentMatches++;
    }
  }

  // If we don't have enough matches, force some
  if (currentMatches < minMatches) {
    const neededMatches = minMatches - currentMatches;
    let attempts = 0;

    for (let added = 0; added < neededMatches && attempts < 100; attempts++) {
      // Pick a random position where we can create a match
      const randomIndex = Math.floor(Math.random() * (length - N)) + N;

      // Only modify if it's not already a match
      if (seq[randomIndex] !== seq[randomIndex - N]) {
        seq[randomIndex] = seq[randomIndex - N];
        added++;
      }
    }
  }

  return seq;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function flash(color) {
  const radius = 10;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, radius);
  ctx.fill();
  ctx.restore();
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Don't redraw stimulus - just clear the flash
  }, 500);
}

function runTrial() {
  if (currentIndex >= sequence.length) {
    endTask();
    return;
  }

  // Switch to vexing at halfway point (after 30 trials)
  if (currentIndex === halfwayPoint) {
    playMusic("vexing");
  }

  drawStimulus(sequence[currentIndex]);
  stimulusStartTime = performance.now();
  acceptingResponse = true;
  responseThisTrial = null;
  let responseTime = null;

  setTimeout(() => {
    acceptingResponse = false;

    // Only record data for trials where N-back comparison is possible
    if (currentIndex >= N) {
      const isMatch = sequence[currentIndex] === sequence[currentIndex - N];

      let correct = false;
      if (isMatch && responseThisTrial === "right") {
        correct = true;
      } else if (!isMatch && responseThisTrial === "left") {
        correct = true;
      }
      // Note: feedback already shown immediately when key was pressed

      rtData.push({
        trial: currentIndex + 1,
        stimulus: sequence[currentIndex],
        match: isMatch,
        response: responseThisTrial || "none",
        rt: responseTime || 1000, // Use actual response time or max time
        correct: correct,
      });
    }
    // For first N trials, don't record any data since no valid response is possible

    currentIndex++;
    setTimeout(runTrial, 750);
  }, 1000);

  // Store the response time calculation function for use in keyboard handler
  window.recordResponseTime = () => {
    responseTime = Math.round(performance.now() - stimulusStartTime);
  };
}

function playMusic(type) {
  stopMusic();
  const path = `../audio/${genre}/${type}.mp3`;
  currentAudio = new Audio(path);
  currentAudio.loop = true;
  currentAudio.play();

  // Update audio status indicator using CSS class
  updateAudioStatus(`Playing: ${genre} ${type} music`);
}

function stopMusic() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// Audio status indicator function - uses CSS class system
function updateAudioStatus(message) {
  const audioStatus = document.getElementById("audioStatus");
  if (audioStatus) {
    if (message) {
      audioStatus.textContent = message;
      audioStatus.classList.add("show");
    } else {
      audioStatus.classList.remove("show");
      setTimeout(() => {
        audioStatus.textContent = "";
      }, 300); // Wait for fade out animation
    }
  }
}

function endTask() {
  stopMusic();
  updateAudioStatus("Quiz completed - Music stopped");

  // Show quiz completion screen first
  showQuizCompletionScreen();

  // Calculate accuracy by condition
  const calmingTrials = rtData.filter((d, i) => i < halfwayPoint);
  const vexingTrials = rtData.filter((d, i) => i >= halfwayPoint);

  const calmingCorrect = calmingTrials.filter((d) => d.correct).length;
  const vexingCorrect = vexingTrials.filter((d) => d.correct).length;

  const calmingAccuracy =
    calmingTrials.length > 0
      ? Math.round((calmingCorrect / calmingTrials.length) * 100)
      : 0;
  const vexingAccuracy =
    vexingTrials.length > 0
      ? Math.round((vexingCorrect / vexingTrials.length) * 100)
      : 0;

  // Calculate reaction times by condition
  const calmingRTs = rtData
    .filter((d, i) => i < halfwayPoint && d.response !== "none")
    .map((d) => d.rt);
  const vexingRTs = rtData
    .filter((d, i) => i >= halfwayPoint && d.response !== "none")
    .map((d) => d.rt);

  const calmingAvgRT =
    calmingRTs.length > 0
      ? Math.round(calmingRTs.reduce((a, b) => a + b) / calmingRTs.length)
      : "N/A";
  const vexingAvgRT =
    vexingRTs.length > 0
      ? Math.round(vexingRTs.reduce((a, b) => a + b) / vexingRTs.length)
      : "N/A";

  // Store the stats globally so they can be accessed when the completion screen is dismissed
  window.taskStats = {
    calmingAccuracy,
    vexingAccuracy,
    calmingAvgRT,
    vexingAvgRT,
  };
}

function showQuizCompletionScreen() {
  const completionScreen = document.createElement("div");
  completionScreen.className = "quiz-completed";
  completionScreen.innerHTML = `
    <div class="quiz-completed-content">
      <div class="celebration">🎉</div>
      <h2>Congratulations!</h2>
      <p>You've successfully completed the N-Back Memory Challenge! Your performance data has been recorded and is ready for analysis.</p>
      <button class="continue-btn" onclick="hideQuizCompletionScreen()">View Results</button>
    </div>
  `;
  document.body.appendChild(completionScreen);
}

// Make this function globally accessible
window.hideQuizCompletionScreen = function () {
  const completionScreen = document.querySelector(".quiz-completed");
  if (completionScreen) {
    completionScreen.remove();
  }

  // Hide the canvas and switch to results mode
  const container = document.querySelector(".container");
  container.classList.add("results-mode");

  // Now display the results using the stored stats
  if (window.taskStats) {
    const { calmingAccuracy, vexingAccuracy, calmingAvgRT, vexingAvgRT } =
      window.taskStats;

    document.getElementById("stats").innerHTML = `
      <h2>Task Complete!</h2>
      
      <div class="accuracy-breakdown">
        <h3>Accuracy by Music Type</h3>
        <div class="accuracy-row">
          <span class="accuracy-label">🎵 Calming Music:</span>
          <span class="accuracy-value calming-color">${calmingAccuracy}%</span>
        </div>
        <div class="accuracy-row">
          <span class="accuracy-label">🎶 Vexing Music:</span>
          <span class="accuracy-value vexing-color">${vexingAccuracy}%</span>
        </div>
      </div>

      <div class="accuracy-breakdown">
        <h3>Response Time by Music Type</h3>
        <div class="accuracy-row">
          <span class="accuracy-label">🎵 Calming Music:</span>
          <span class="accuracy-value calming-color">${calmingAvgRT} ms</span>
        </div>
        <div class="accuracy-row">
          <span class="accuracy-label">🎶 Vexing Music:</span>
          <span class="accuracy-value vexing-color">${vexingAvgRT} ms</span>
        </div>
      </div>

      <button id="download_button">Download CSV</button>
      <button id="restart_button">Restart Quiz</button>
    `;

    // Show the View Analysis button
    document.getElementById("viewAnalysisButton").style.display =
      "inline-block";

    // Add event listeners for the dynamically created buttons
    document
      .getElementById("download_button")
      .addEventListener("click", downloadCSV);
    document.getElementById("restart_button").addEventListener("click", () => {
      quizStarted = false;
      genre = null;
      currentScreen = "genre";

      // Reset container state
      container.classList.remove("results-mode");

      drawGenreScreen();
      document.getElementById("stats").innerHTML = "";
      // Hide the View Analysis button and visualization on restart
      document.getElementById("viewAnalysisButton").style.display = "none";
      document.getElementById("vizContainer").style.display = "none";
      updateAudioStatus("");
      // Clear stored stats
      window.taskStats = null;
    });
  }
};

function downloadCSV() {
  const csvHeader = "Trial,Stimulus,Match,Response,RT(ms),Correct\n";
  const csvRows = rtData.map(
    (d) =>
      `${d.trial},${d.stimulus},${d.match},${d.response},${d.rt},${d.correct}`,
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

// Handle canvas clicks (for genre selection and starting quiz only)
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
    rtData = [];
    document.getElementById("stats").innerHTML = "";
    playMusic("calming");
    runTrial();
  }
  // NO CLICK HANDLING DURING QUIZ - only arrow keys work
});

// Handle keyboard input for quiz responses
document.addEventListener("keydown", (e) => {
  if (currentScreen === "quiz" && acceptingResponse && !responseThisTrial) {
    // Only accept responses starting from trial 3 (index 2) when N-back comparison is possible
    if (currentIndex < N) {
      // Ignore key presses for first N trials - no valid comparison possible
      e.preventDefault();
      return;
    }

    if (e.code === "ArrowLeft") {
      responseThisTrial = "left";
      window.recordResponseTime(); // Record the exact time of key press

      // Immediate feedback - check if correct
      const isMatch =
        currentIndex >= N &&
        sequence[currentIndex] === sequence[currentIndex - N];
      if (!isMatch) {
        flash("green"); // Correct: left arrow for no match
      } else {
        flash("red"); // Wrong: left arrow for match
      }

      e.preventDefault();
    } else if (e.code === "ArrowRight") {
      responseThisTrial = "right";
      window.recordResponseTime(); // Record the exact time of key press

      // Immediate feedback - check if correct
      const isMatch =
        currentIndex >= N &&
        sequence[currentIndex] === sequence[currentIndex - N];
      if (isMatch) {
        flash("green"); // Correct: right arrow for match
      } else {
        flash("red"); // Wrong: right arrow for no match
      }

      e.preventDefault();
    }
  }
});

// Initial screen
drawGenreScreen();

// Code for personalized visualization
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Wait for DOM to be fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
  // View Analysis Button Event Listener
  const viewAnalysisButton = document.getElementById("viewAnalysisButton");
  if (viewAnalysisButton) {
    viewAnalysisButton.addEventListener("click", () => {
      document.getElementById("vizContainer").style.display = "block";
      createVisualization();
    });
  }

  // Back Button Event Listener
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      d3.select("#subchart").style("display", "none");
      d3.select("#chart").style("display", "block");
      d3.select("#backButton").style("display", "none");
    });
  }
});

// Also add event listeners immediately in case DOM is already loaded
setTimeout(() => {
  const viewAnalysisButton = document.getElementById("viewAnalysisButton");
  if (viewAnalysisButton && !viewAnalysisButton.onclick) {
    viewAnalysisButton.addEventListener("click", () => {
      document.getElementById("vizContainer").style.display = "block";
      createVisualization();
    });
  }

  const backButton = document.getElementById("backButton");
  if (backButton && !backButton.onclick) {
    backButton.addEventListener("click", () => {
      d3.select("#subchart").style("display", "none");
      d3.select("#chart").style("display", "block");
      d3.select("#backButton").style("display", "none");
    });
  }
}, 100);

function createVisualization() {
  // Clear any existing visualization
  d3.select("#chart").selectAll("*").remove();

  // Convert rtData to the format expected by the visualization
  const filtered = rtData.map((d, i) => ({
    trial: d.trial,
    mean_rt: d.rt,
    condition: i < halfwayPoint ? "Calming" : "Vexing",
    participant: "current_user",
  }));

  const width = 800;
  const height = 500;
  const margin = { top: 60, right: 60, bottom: 60, left: 80 };

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3
    .scaleLinear()
    .domain([1, filtered.length])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(filtered, (d) => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => xScale(d.trial))
    .y((d) => yScale(d.mean_rt));

  // Add grid lines
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat(""),
    )
    .selectAll("line")
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 1);

  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(-(height - margin.top - margin.bottom))
        .tickFormat(""),
    )
    .selectAll("line")
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 1);

  // Add the line
  svg
    .append("path")
    .datum(filtered)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("d", line);

  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px");

  // Add axis labels
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 50)
    .attr("x", -(height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("Reaction Time (ms)");

  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height - 10})`)
    .style("text-anchor", "middle")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("Trial Number");

  // Partition line at halfway point
  const calmingCount = filtered.filter((d) =>
    d.condition.startsWith("Calming"),
  ).length;
  if (calmingCount < filtered.length) {
    const partitionX = xScale(calmingCount + 0.5);
    svg
      .append("line")
      .attr("x1", partitionX)
      .attr("x2", partitionX)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");

    // Add labels for music conditions
    svg
      .append("text")
      .attr("x", margin.left + (partitionX - margin.left) / 2)
      .attr("y", margin.top - 20)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "steelblue")
      .style(
        "font-family",
        "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif",
      )
      .text("Calming Music");

    svg
      .append("text")
      .attr("x", partitionX + (width - margin.right - partitionX) / 2)
      .attr("y", margin.top - 20)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "tomato")
      .style(
        "font-family",
        "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif",
      )
      .text("Vexing Music");
  }

  // Zones for interaction - adjusted for 60 trials
  const totalTrials = filtered.length;

  // Early phase: first 10 trials of each condition
  const zone1_start = 0;
  const zone1_end = Math.min(9, calmingCount - 1);

  // Transition phase: 20 trials around the switch (10 before, 10 after)
  const zone2_size = 20;
  const zone2_center = calmingCount;
  const zone2_start = Math.max(0, zone2_center - 10);
  const zone2_end = Math.min(totalTrials - 1, zone2_center + 9);

  // Late phase: last 10 trials of each condition
  const zone3_start = Math.max(calmingCount, totalTrials - 10);
  const zone3_end = totalTrials - 1;

  addInteractionZone(
    zone1_start,
    zone1_end,
    "Early Performance: First 10 Trials of Each Music Type",
    () => showZone1Plot(filtered),
    svg,
    xScale,
    margin,
    height,
  );

  addInteractionZone(
    zone2_start,
    zone2_end,
    "Transition Period: How Your Focus Changes During Music Switch",
    () => showZone2Plot(filtered, zone2_start, zone2_end),
    svg,
    xScale,
    margin,
    height,
  );

  addInteractionZone(
    zone3_start,
    zone3_end,
    "Late Performance: Last 10 Trials - Which Music Maintains Focus",
    () => showZone3Plot(filtered),
    svg,
    xScale,
    margin,
    height,
  );
}

function addInteractionZone(
  startIndex,
  endIndex,
  tooltipText,
  clickHandler,
  svg,
  xScale,
  margin,
  height,
) {
  const zoneX = xScale(startIndex + 1);
  const zoneWidth = xScale(endIndex + 1) - xScale(startIndex + 1) + 10;

  svg
    .append("rect")
    .attr("x", zoneX - 5)
    .attr("y", margin.top)
    .attr("width", zoneWidth)
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", function () {
      tooltip.style("visibility", "visible").text(tooltipText);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 20 + "px")
        .style("left", event.pageX + 20 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    })
    .on("click", clickHandler);
}

const tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "#f9f9f9")
  .style("padding", "8px 12px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "6px")
  .style("visibility", "hidden")
  .style("pointer-events", "none")
  .style("font-size", "14px")
  .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
  .style("max-width", "200px")
  .style("z-index", "1000");

// === Zone 1 ===
function showZone1Plot(filtered) {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "block");

  const first10Calming = filtered
    .filter((d) => d.condition.startsWith("Calming"))
    .slice(0, 10);
  const first10Vexing = filtered
    .filter((d) => d.condition.startsWith("Vexing"))
    .slice(0, 10);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(first10Calming) },
    { type: "Vexing", mean_rt: averageMeanRT(first10Vexing) },
  ];

  drawBarplot(barData, "Early Performance: First 10 Trials of Each Music Type");
}

// === Zone 2 ===
function showZone2Plot(filtered, zone2_start, zone2_end) {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "block");

  const trials = filtered.slice(zone2_start, zone2_end + 1);

  drawLineplotWithPartition(
    trials,
    "Transition Period: 20 Trials Around Music Switch",
  );
}

// === Zone 3 ===
function showZone3Plot(filtered) {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "block");

  const last10Calming = filtered
    .filter((d) => d.condition.startsWith("Calming"))
    .slice(-10);
  const last10Vexing = filtered
    .filter((d) => d.condition.startsWith("Vexing"))
    .slice(-10);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(last10Calming) },
    { type: "Vexing", mean_rt: averageMeanRT(last10Vexing) },
  ];

  drawBarplot(barData, "Late Performance: Last 10 Trials of Each Music Type");
}

// === Barplot ===
function drawBarplot(data, titleText) {
  const width = 800;
  const height = 500;
  const margin = { top: 80, right: 60, bottom: 60, left: 80 };

  const subSvg = d3
    .select("#subchart")
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  subSvg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-weight", "600")
    .text(titleText);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.type))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Add grid lines
  subSvg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat(""),
    )
    .selectAll("line")
    .attr("stroke", "#e0e0e0");

  subSvg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.type))
    .attr("y", (d) => y(d.mean_rt))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.mean_rt))
    .attr("fill", (d) => (d.type === "Calming" ? "steelblue" : "tomato"));

  subSvg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600");

  subSvg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px");

  // Add Y-axis label
  subSvg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 50)
    .attr("x", -(height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("Reaction Time (ms)");
}

// === Lineplot with Partition ===
function drawLineplotWithPartition(trials, titleText) {
  const width = 800;
  const height = 500;
  const margin = { top: 80, right: 60, bottom: 60, left: 80 };

  const subSvg = d3
    .select("#subchart")
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  subSvg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-weight", "600")
    .text(titleText);

  const x = d3
    .scaleLinear()
    .domain([0, trials.length - 1])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(trials, (d) => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Add grid lines
  subSvg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat(""),
    )
    .selectAll("line")
    .attr("stroke", "#e0e0e0");

  const line = d3
    .line()
    .x((d, i) => x(i))
    .y((d) => y(d.mean_rt));

  subSvg
    .append("path")
    .datum(trials)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("d", line);

  // Find partition point in this subset
  const partitionIndex = trials.findIndex((d) => d.condition === "Vexing");
  if (partitionIndex > 0) {
    const partitionX = x(partitionIndex - 0.5);
    subSvg
      .append("line")
      .attr("x1", partitionX)
      .attr("x2", partitionX)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
  }

  subSvg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3.axisBottom(x).tickFormat((d, i) => `Trial ${trials[i]?.trial || ""}`),
    )
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  subSvg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px");

  // Add Y-axis label
  subSvg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 50)
    .attr("x", -(height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("Reaction Time (ms)")
    .text(titleText);
}

const x = d3
  .scaleLinear()
  .domain([0, trials.length - 1])
  .range([margin.left, width - margin.right]);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(trials, (d) => d.mean_rt)])
  .nice()
  .range([height - margin.bottom, margin.top]);

// Add grid lines
subSvg
  .append("g")
  .attr("class", "grid")
  .attr("transform", `translate(${margin.left},0)`)
  .call(
    d3
      .axisLeft(y)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat(""),
  )
  .selectAll("line")
  .attr("stroke", "#e0e0e0");

const line = d3
  .line()
  .x((d, i) => x(i))
  .y((d) => y(d.mean_rt));

subSvg
  .append("path")
  .datum(trials)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 3)
  .attr("d", line);

// Find partition point in this subset
const partitionIndex = trials.findIndex((d) => d.condition === "Vexing");
if (partitionIndex > 0) {
  const partitionX = x(partitionIndex - 0.5);
  subSvg
    .append("line")
    .attr("x1", partitionX)
    .attr("x2", partitionX)
    .attr("y1", margin.top)
    .attr("y2", height - margin.bottom)
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4,4");

  subSvg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3.axisBottom(x).tickFormat((d, i) => `Trial ${trials[i]?.trial || ""}`),
    )
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  subSvg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "12px");

  // Add Y-axis label
  subSvg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 60)
    .attr("x", -(height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "'Gotham Bold', Tahoma, Geneva, Verdana, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .text("Reaction Time (ms)");
}

function averageMeanRT(data) {
  if (data.length === 0) return 0;
  return data.reduce((sum, d) => sum + d.mean_rt, 0) / data.length;
}
