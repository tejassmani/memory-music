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
  }, 500);
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


// Code for personalized vizualization
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/* Load the CSV
d3.csv("./data/df.csv", d3.autoType).then(data => {
  
  const filtered = data
    .filter(d => d.participant === "3F" && d.mean_rt != null);

  filtered.sort((a, b) => {
    const isCalmingA = a.condition.startsWith("Calming") ? 0 : 1;
    const isCalmingB = b.condition.startsWith("Calming") ? 0 : 1;
    return isCalmingA - isCalmingB;
  });
*/

  const width = 600, height = 400, margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleLinear()
    .domain([0, filtered.length - 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filtered, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.mean_rt));

  svg.append("path")
    .datum(filtered)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  const xAxis = d3.axisBottom(xScale)
    .ticks(filtered.length)
    .tickFormat(d => d);

  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat("")
    )
    .selectAll("line")
    .attr("stroke", "#ccc");

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Partition line
  const calmingCount = filtered.filter(d => d.condition.startsWith("Calming")).length;
  if (calmingCount < filtered.length) {
    const partitionX = xScale(calmingCount - 0.5);
    svg.append("line")
      .attr("x1", partitionX)
      .attr("x2", partitionX)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
  }

  // Zones
  const totalTrials = filtered.length;

  const zone1_start = 0;
  const zone1_end = Math.min(6, calmingCount - 1);

  const zone2_size = 14;
  const zone2_center = calmingCount - 1;
  const zone2_start = Math.max(0, zone2_center - Math.floor(zone2_size / 2));
  const zone2_end = Math.min(totalTrials - 1, zone2_start + zone2_size - 1);

  const zone3_start = totalTrials - 7;
  const zone3_end = totalTrials - 1;

  addInteractionZone(zone1_start, zone1_end, 
    "Which Music Type Helps you Focus Earlier", 
    showZone1Plot);

  addInteractionZone(zone2_start, zone2_end, 
    "How Your Focus Shifts When Changing Music", 
    showZone2Plot);

  addInteractionZone(zone3_start, zone3_end, 
    "Which Music Type Keeps You Focused", 
    showZone3Plot);

  function addInteractionZone(startIndex, endIndex, tooltipText, clickHandler) {
    const zoneX = xScale(startIndex);
    const zoneWidth = xScale(endIndex) - xScale(startIndex) + (xScale(1) - xScale(0));

    svg.append("rect")
      .attr("x", zoneX)
      .attr("y", margin.top)
      .attr("width", zoneWidth)
      .attr("height", height - margin.bottom - margin.top)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", function() {
        tooltip.style("visibility", "visible")
          .text(tooltipText);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 20) + "px")
          .style("left", (event.pageX + 20) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
      })
      .on("click", clickHandler);
  }

  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("visibility", "hidden")
    .style("pointer-events", "none")
    .style("font-size", "14px");

  // === Zone 1 ===
  function showZone1Plot() {
    d3.select("#chart").style("display", "none");
    d3.select("#subchart").style("display", "block");
    d3.select("#backButton").style("display", "inline-block");

    const first7Calming = filtered.filter(d => d.condition.startsWith("Calming")).slice(0, 7);
    const first7Vexing = filtered.filter(d => d.condition.startsWith("Vexing")).slice(0, 7);

    const barData = [
      { type: "Calming", mean_rt: averageMeanRT(first7Calming) },
      { type: "Vexing", mean_rt: averageMeanRT(first7Vexing) }
    ];

    drawBarplot(barData, "First 7: Calming vs Vexing");
  }

  // === Zone 2 ===
  function showZone2Plot() {
    d3.select("#chart").style("display", "none");
    d3.select("#subchart").style("display", "block");
    d3.select("#backButton").style("display", "inline-block");

    const trials = filtered.slice(zone2_start, zone2_end + 1);

    drawLineplotWithPartition(trials, "Middle 14 Rounds: RT Over Time");
  }

  // === Zone 3 ===
  function showZone3Plot() {
    d3.select("#chart").style("display", "none");
    d3.select("#subchart").style("display", "block");
    d3.select("#backButton").style("display", "inline-block");

    const last7Calming = filtered.filter(d => d.condition.startsWith("Calming")).slice(-7);
    const last7Vexing = filtered.filter(d => d.condition.startsWith("Vexing")).slice(-7);

    const barData = [
      { type: "Calming", mean_rt: averageMeanRT(last7Calming) },
      { type: "Vexing", mean_rt: averageMeanRT(last7Vexing) }
    ];

    drawBarplot(barData, "Last 7: Calming vs Vexing");
  }

  // === Barplot ===
  function drawBarplot(data, titleText) {
    const subSvg = d3.select("#subchart").html("").append("svg")
      .attr("width", width)
      .attr("height", height);

    subSvg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(titleText);

    const x = d3.scaleBand()
      .domain(data.map(d => d.type))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.mean_rt)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    subSvg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.type))
      .attr("y", d => y(d.mean_rt))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.mean_rt))
      .attr("fill", "steelblue");

    subSvg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    subSvg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }

  // === Lineplot with Partition ===
  function drawLineplotWithPartition(trials, titleText) {
    const subSvg = d3.select("#subchart").html("").append("svg")
      .attr("width", width)
      .attr("height", height);

    subSvg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(titleText);

    const x = d3.scaleLinear()
      .domain([0, trials.length - 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(trials, d => d.mean_rt)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d.mean_rt));

    subSvg.append("path")
      .datum(trials)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Partition line
    const partitionIndexInZone = trials.findIndex(d => d.condition.startsWith("Vexing"));
    if (partitionIndexInZone > 0) {
      const partitionX = x(partitionIndexInZone - 0.5);
      subSvg.append("line")
        .attr("x1", partitionX)
        .attr("x2", partitionX)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");
    }

    subSvg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(trials.length).tickFormat(d => d));

    subSvg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }

  // === Back button ===
  d3.select("#backButton").on("click", () => {
    d3.select("#subchart").style("display", "none");
    d3.select("#chart").style("display", "block");
    d3.select("#backButton").style("display", "none");
  });

  // === Average helper ===
  function averageMeanRT(trials) {
    return d3.mean(trials, d => d.mean_rt);
  }
