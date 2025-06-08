// scroll.js
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
import * as d3    from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// import your two chart modules for side-effects
import './swarm.js';
import './eda_line.js';
// dashboard for step 3
import './dashboard.js';

const scroller = scrollama();

function updateStep(step) {
  // Highlight the active step text
  d3.selectAll('.step')
    .classed('is-active', (_, i, nodes) =>
      +nodes[i].getAttribute('data-step') === step
    );

  // Hide all viz
  d3.selectAll('.viz-container').style('display', 'none');
  // Show the one matching current step
  d3.select(`#vis${step}`).style('display', 'block');
}

function handleStepEnter({ element }) {
  updateStep(+element.getAttribute('data-step'));
}

function handleStepExit({ element, direction }) {
  if (direction === 'up') {
    const prev = +element.getAttribute('data-step') - 1;
    if (prev >= 1) updateStep(prev);
  }
}

function init() {
  scroller
    .setup({
      step: '.step',
      offset: 0.5,    // trigger when step crosses middle
      debug: false
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  window.addEventListener('resize', scroller.resize);

  // Show the first viz on load
  updateStep(1);
}

init();
