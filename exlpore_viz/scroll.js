// scroll.js
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
import * as d3    from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// side‐effect imports for charts:
import './swarm.js';
import './eda_line.js';

// now import your new functions:
import { startEmotion, stopEmotion } from './emotion.js';

// dashboard
import './dashboard.js';

const scroller = scrollama();

function updateStep(step) {
  d3.selectAll('.step').classed('is-active', (_,i,n) =>
    +n[i].getAttribute('data-step') === step
  );
  d3.selectAll('.viz-container').style('display','none');
  d3.select(`#vis${step}`).style('display','block');
}

function handleStepEnter({ element }) {
  const step = +element.getAttribute('data-step');
  updateStep(step);

  if (step === 3) {
    startEmotion();
  }
}

function handleStepExit({ element, direction }) {
  const exited = +element.getAttribute('data-step');
  // stop the slideshow if they scroll off step 3:
  if (exited === 3) stopEmotion();

  if (direction === 'up') {
    const prev = exited - 1;
    if (prev >= 1) updateStep(prev);
  }
}

function init() {
  scroller
    .setup({ step: '.step', offset: 0.5, debug: false })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  window.addEventListener('resize', scroller.resize);
  updateStep(1);
}

init();
