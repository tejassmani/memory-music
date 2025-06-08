// emotion.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const EMOTIONS = ["Happy","Sad","Angry","Surprised","Scared","Disgusted"];
const ICON_PATH = name => `../icons/${name.toLowerCase()}.png`;

let calmingTimeline = [], vexingTimeline = [];
let currentRound = 1, maxRound = 0, slideTimer = null;

// — 1) Load & prepare
export const dataReady = d3.csv("../data/face_reader_df.csv", d => {
  // coerce numbers
  EMOTIONS.forEach(e => d[e] = +d[e]);
  d.Trial = +d.Trial;
  return d;
}).then(data => {
  // split out calming vs vexing
  const calmRecs = data.filter(d => d.Condition.toLowerCase().startsWith("calming"));
  const vexRecs  = data.filter(d => d.Condition.toLowerCase().startsWith("vexing"));

  // helper: build a [ {trial, dominant}, … ] array
  const makeTimeline = recs => d3.groups(recs, d => d.Trial)
    .map(([t, recs]) => {
      const avg = {};
      EMOTIONS.forEach(e => avg[e] = d3.mean(recs, r => r[e]));
      const dominant = EMOTIONS.reduce((a,b) => avg[a] > avg[b] ? a : b);
      return { trial: +t, dominant };
    })
    .sort((a,b) => a.trial - b.trial);

  calmingTimeline = makeTimeline(calmRecs);
  vexingTimeline  = makeTimeline(vexRecs);

  // we expect 16 each
  maxRound = Math.min(calmingTimeline.length, vexingTimeline.length);
});

// — 2) Render one frame
function renderFrame() {
  const calmEm = calmingTimeline[currentRound - 1]?.dominant;
  const vexEm  = vexingTimeline [currentRound - 1]?.dominant;

  d3.select("#calming-box img")
    .attr("src", calmEm ? ICON_PATH(calmEm) : "")
    .attr("alt", calmEm || "");

  d3.select("#vexing-box img")
    .attr("src", vexEm ? ICON_PATH(vexEm) : "")
    .attr("alt", vexEm || "");

  d3.select("#trial-counter")
    .text(`Round: ${currentRound}`);
}

// — 3) Show the final summary
function showSummary() {
  const mostFreq = arr => {
    const counts = d3.rollup(arr, v => v.length, d => d.dominant);
    return Array.from(counts).reduce((a,b) => b[1] > a[1] ? b : a)[0];
  };
  const calmTop = mostFreq(calmingTimeline);
  const vexTop  = mostFreq(vexingTimeline);

  // swap in the PNG of the top emotion
  d3.select("#calming-box img").attr("src", ICON_PATH(calmTop)).attr("alt", calmTop);
  d3.select("#vexing-box img").attr("src", ICON_PATH(vexTop)).attr("alt", vexTop);

  // label each card with “Top: <emotion>”
  d3.select("#trial-counter")
    .text(`Top Emotion`);
}

// — 4) Public API
export async function startEmotion() {
  await dataReady;
  if (slideTimer) slideTimer.stop();
  currentRound = 1;
  renderFrame();

  slideTimer = d3.interval(() => {
    currentRound++;
    if (currentRound > maxRound) {
      slideTimer.stop();
      showSummary();
    } else {
      renderFrame();
    }
  }, 1000);
}

export function stopEmotion() {
  if (slideTimer) slideTimer.stop();
}



