const canvas = document.getElementById("nback_canvas");
const ctx = canvas.getContext("2d");
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
  "Z"
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
  const borderWidth = 1; // Matches typical canvas border
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
  ctx.fillText(
    "Click Here for Classical",
    canvas.width / 4,
    choiceCenterY + 10,
  );

  // Right side: Pop
  ctx.fillText("🎤", (3 * canvas.width) / 4, choiceCenterY - 40);
  ctx.fillText(
    "Click Here for Pop",
    (3 * canvas.width) / 4,
    choiceCenterY + 10,
  );
}

function drawIntroScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "22px Arial"; // Slightly smaller font
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

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

  const startY = 30;
  const lineHeight = 28; // Adjust line spacing

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    // Only draw if line fits within canvas
    if (y < canvas.height - 20) {
      ctx.fillText(line, canvas.width / 2, y);
    }
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

  const totalCorrect = rtData.filter((d) => d.correct).length;
  const accuracy = Math.round((totalCorrect / rtData.length) * 100);
  const rtList = rtData.filter((d) => d.response !== "none").map((d) => d.rt);
  const avgRT =
    rtList.length > 0
      ? Math.round(rtList.reduce((a, b) => a + b) / rtList.length)
      : "N/A";

  document.getElementById("stats").innerHTML = `
    <h2>Task Complete!</h2>
    <p>Accuracy: ${accuracy}%</p>
    <p>Average Reaction Time (for responses): ${avgRT} ms</p>
    <button id="download_button">Download CSV</button>
    <button id="restart_button">Restart Quiz</button>
  `;

  // Show the View Analysis button
  document.getElementById("viewAnalysisButton").style.display = "inline-block";

  // Add event listeners for the dynamically created buttons
  document
    .getElementById("download_button")
    .addEventListener("click", downloadCSV);
  document.getElementById("restart_button").addEventListener("click", () => {
    quizStarted = false;
    genre = null;
    currentScreen = "genre";
    drawGenreScreen();
    document.getElementById("stats").innerHTML = "";
    // Hide the View Analysis button and visualization on restart
    document.getElementById("viewAnalysisButton").style.display = "none";
    document.getElementById("vizContainer").style.display = "none";
    updateAudioStatus("");
  });
}

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

  const width = 600,
    height = 400,
    margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3
    .scaleLinear()
    .domain([0, filtered.length - 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(filtered, (d) => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d, i) => xScale(i))
    .y((d) => yScale(d.mean_rt));

  svg
    .append("path")
    .datum(filtered)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(Math.min(filtered.length, 10))
    .tickFormat((d) => Math.round(d + 1));

  const yAxis = d3.axisLeft(yScale);

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
    .attr("stroke", "#ccc");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis);

  // Add axis labels
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Reaction Time (ms)");

  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height - 5})`)
    .style("text-anchor", "middle")
    .text("Trial Number");

  // Partition line at halfway point
  const calmingCount = filtered.filter((d) =>
    d.condition.startsWith("Calming"),
  ).length;
  if (calmingCount < filtered.length) {
    const partitionX = xScale(calmingCount - 0.5);
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
      .attr("x", partitionX / 2)
      .attr("y", margin.top - 10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "blue")
      .text("Calming Music");

    svg
      .append("text")
      .attr("x", partitionX + (width - margin.right - partitionX) / 2)
      .attr("y", margin.top - 10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "orange")
      .text("Vexing Music");
  }

  // Zones for interaction
  const totalTrials = filtered.length;

  const zone1_start = 0;
  const zone1_end = Math.min(6, calmingCount - 1);

  const zone2_size = 14;
  const zone2_center = calmingCount - 1;
  const zone2_start = Math.max(0, zone2_center - Math.floor(zone2_size / 2));
  const zone2_end = Math.min(totalTrials - 1, zone2_start + zone2_size - 1);

  const zone3_start = totalTrials - 7;
  const zone3_end = totalTrials - 1;

  addInteractionZone(
    zone1_start,
    zone1_end,
    "Which Music Type Helps you Focus Earlier",
    () => showZone1Plot(filtered),
    svg,
    xScale,
  );

  addInteractionZone(
    zone2_start,
    zone2_end,
    "How Your Focus Shifts When Changing Music",
    () => showZone2Plot(filtered, zone2_start, zone2_end),
    svg,
    xScale,
  );

  addInteractionZone(
    zone3_start,
    zone3_end,
    "Which Music Type Keeps You Focused",
    () => showZone3Plot(filtered),
    svg,
    xScale,
  );
}

function addInteractionZone(
  startIndex,
  endIndex,
  tooltipText,
  clickHandler,
  svg,
  xScale,
) {
  const zoneX = xScale(startIndex);
  const zoneWidth = xScale(endIndex) - xScale(startIndex) + 20;

  svg
    .append("rect")
    .attr("x", zoneX)
    .attr("y", 40)
    .attr("width", zoneWidth)
    .attr("height", 320)
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
  .style("padding", "6px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("visibility", "hidden")
  .style("pointer-events", "none")
  .style("font-size", "14px");

// === Zone 1 ===
function showZone1Plot(filtered) {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "block");

  const first7Calming = filtered
    .filter((d) => d.condition.startsWith("Calming"))
    .slice(0, 7);
  const first7Vexing = filtered
    .filter((d) => d.condition.startsWith("Vexing"))
    .slice(0, 7);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(first7Calming) },
    { type: "Vexing", mean_rt: averageMeanRT(first7Vexing) },
  ];

  drawBarplot(barData, "First 7: Calming vs Vexing");
}

// === Zone 2 ===
function showZone2Plot(filtered, zone2_start, zone2_end) {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "block");

  const trials = filtered.slice(zone2_start, zone2_end + 1);

  drawLineplotWithPartition(trials, "Middle 14 Rounds: RT Over Time");
}

// === Zone 3 ===
function showZone3Plot(filtered) {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "block");

  const last7Calming = filtered
    .filter((d) => d.condition.startsWith("Calming"))
    .slice(-7);
  const last7Vexing = filtered
    .filter((d) => d.condition.startsWith("Vexing"))
    .slice(-7);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(last7Calming) },
    { type: "Vexing", mean_rt: averageMeanRT(last7Vexing) },
  ];

  drawBarplot(barData, "Last 7: Calming vs Vexing");
}

// === Barplot ===
function drawBarplot(data, titleText) {
  const width = 600,
    height = 400,
    margin = { top: 40, right: 40, bottom: 40, left: 60 };

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

  subSvg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.type))
    .attr("y", (d) => y(d.mean_rt))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.mean_rt))
    .attr("fill", "steelblue");

  subSvg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  subSvg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}

// === Lineplot with Partition ===
function drawLineplotWithPartition(trials, titleText) {
  const width = 600,
    height = 400,
    margin = { top: 40, right: 40, bottom: 40, left: 60 };

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

  const line = d3
    .line()
    .x((d, i) => x(i))
    .y((d) => y(d.mean_rt));

  subSvg
    .append("path")
    .datum(trials)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Partition line
  const partitionIndexInZone = trials.findIndex((d) =>
    d.condition.startsWith("Vexing"),
  );
  if (partitionIndexInZone > 0) {
    const partitionX = x(partitionIndexInZone - 0.5);
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
      d3
        .axisBottom(x)
        .ticks(trials.length)
        .tickFormat((d) => d),
    );

  subSvg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}

// === Average helper ===
function averageMeanRT(trials) {
  return d3.mean(trials, (d) => d.mean_rt);
}
