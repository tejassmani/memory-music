// emotion.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const ICON_PATH = name => `../icons/${name.toLowerCase()}.png`;

// helper: map a happiness value to an emoticon category
function getEmotionFromHappy(happy) {
  if (happy <= 0.02)      return 'Angry';
  if (happy <= 0.04)      return 'Sad';
  if (happy <= 0.06)      return 'Neutral';
  if (happy <= 0.08)      return 'Happy';
  /* > 0.08 */            return 'Surprised';
}

let calmingTimeline = [], vexingTimeline = [];
let currentRound = 1, maxRound = 0, slideTimer = null;

// — 1) Load & prepare
export const dataReady = d3.csv("../data/face_reader_df.csv", d => {
  // coerce numbers
  d.Happy = +d.Happy;
  d.Trial = +d.Trial;
  return d;
}).then(data => {
  const calmRecs = data.filter(d => d.Condition.toLowerCase().startsWith("calming"));
  const vexRecs  = data.filter(d => d.Condition.toLowerCase().startsWith("vexing"));

  const makeTimeline = recs => d3.groups(recs, d => d.Trial)
    .map(([trial, recs]) => {
      const avgHappy = d3.mean(recs, r => r.Happy);
      const emotion = getEmotionFromHappy(avgHappy);
      return { 
        trial: +trial, 
        happy: avgHappy, 
        emotion 
      };
    })
    .sort((a, b) => a.trial - b.trial);

  calmingTimeline = makeTimeline(calmRecs);
  vexingTimeline  = makeTimeline(vexRecs);
  maxRound = Math.min(calmingTimeline.length, vexingTimeline.length);
});

// — 2) Render one frame
function renderFrame() {
  const calm = calmingTimeline[currentRound - 1];
  const vex  = vexingTimeline[currentRound - 1];

  // swap in the per-round emoticons
  d3.select("#calming-box img")
    .attr("src", ICON_PATH(calm.emotion))
    .attr("alt", calm.emotion);

  d3.select("#vexing-box img")
    .attr("src", ICON_PATH(vex.emotion))
    .attr("alt", vex.emotion);

  // show this round's Happy average under each box
  d3.select("#calming-box")
    .selectAll("p.happy-round")
    .data([calm.happy])
    .join("p")
      .attr("class", "happy-round")
      .text(`Happy: ${calm.happy.toFixed(3)}`);

  d3.select("#vexing-box")
    .selectAll("p.happy-round")
    .data([vex.happy])
    .join("p")
      .attr("class", "happy-round")
      .text(`Happy: ${vex.happy.toFixed(3)}`);

  // update the round counter
  d3.select("#trial-counter")
    .text(`Round: ${currentRound}`);
}


// — 3) Show the final summary
function showSummary() {
  const avgCalm = d3.mean(calmingTimeline, d => d.happy);
  const avgVex  = d3.mean(vexingTimeline,   d => d.happy);
  const emoCalm = getEmotionFromHappy(avgCalm);
  const emoVex  = getEmotionFromHappy(avgVex);

  // 1) swap in the summary emoticons
  d3.select("#calming-box img")
    .attr("src", ICON_PATH(emoCalm))
    .attr("alt", emoCalm);
  d3.select("#vexing-box img")
    .attr("src", ICON_PATH(emoVex))
    .attr("alt", emoVex);

  // 2) REUSE the .happy-round under each box to now show the overall average
  d3.select("#calming-box")
    .selectAll("p.happy-round")
    .data([avgCalm])
    .join("p")
      .attr("class", "happy-round")
      .text(`Happy Avg: ${avgCalm.toFixed(3)}`);

  d3.select("#vexing-box")
    .selectAll("p.happy-round")
    .data([avgVex])
    .join("p")
      .attr("class", "happy-round")
      .text(`Happy Avg: ${avgVex.toFixed(3)}`);

  // 3) repurpose your trial-counter to label the summary
  d3.select("#trial-counter")
    .text("Overall Average Happiness");
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




