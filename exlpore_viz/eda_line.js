import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";




// 1) SVG & margins
// const svg = d3.select("#eda-line"),
const svg = d3.select("#vis2").append("svg")
  .attr("id", "eda-line")
  .attr("width", 800)
  .attr("height", 450);

const margin = { top: 60, right: 40, bottom: 80, left: 60 };
const width  = +svg.attr("width")  - margin.left - margin.right;
const height = +svg.attr("height") - margin.top  - margin.bottom;

const g = svg.append("g")
             .attr("transform", `translate(${margin.left},${margin.top})`);


// 2) Color palette
const condColor = d3.scaleOrdinal()
  .domain(["Calming","Vexing"])
  .range([ d3.interpolateMagma(0.3), d3.interpolateMagma(0.7) ]);

// 3) Load & prepare data
d3.csv("../data/df.csv").then(raw => {
  raw.forEach(d => {
    const global = +d.trial;              // 1–32 global
    d.cond  = d.condition.split(" ")[0];  // "Calming" or "Vexing"
    d.eda   = +d.mean_eda;
    // map into 1–16 trial16
    d.trial16 = d.cond === "Calming"
      ? global
      : global - 16;
  });

  // 4) Nest and build series
  const nested = d3.group(raw, d=>d.cond, d=>d.trial16),
        build  = name => d3.range(1,17).map(i => ({
          trial16: i,
          eda: d3.mean(nested.get(name)?.get(i) || [], d=>d.eda)
        })),
        series = [
          { name:"Calming", data: build("Calming") },
          { name:"Vexing",  data: build("Vexing")  }
        ];

  // 5) Scales & axes over [1,16]
  const x = d3.scaleLinear().domain([1,16]).range([0,width]);
  const allVals = series.flatMap(s=>s.data.map(d=>d.eda));
  const y = d3.scaleLinear()
      .domain([d3.min(allVals), d3.max(allVals)])
      .nice()
      .range([height,0]);

  // 6) Gridlines
  g.append("g")
    .attr("class","grid")
    .call(d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat("")
    )
    .selectAll("line")
      .attr("stroke","#ddd")
      .attr("stroke-dasharray","2 2");

  // 7) Axes
  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(16));

  // 8) Title
  svg.append("text")
    .attr("x", margin.left + width/2)
    .attr("y", margin.top/2)
    .attr("text-anchor","middle")
    .attr("font-size","16px")
    .attr("font-weight","bold")
    .text("How Stressful is the Music");

  // 9) Legend (fixed spacing)
  const legend = svg.append("g")
    .attr("font-family","sans-serif")
    .attr("font-size",12)
    .attr("text-anchor","start")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("transform",(d,i) => {
        const total   = series.length;
        const spacing = 100; 
        const x0      = margin.left + width/2 - (spacing*(total-1))/2;
        return `translate(${x0 + i*spacing}, ${margin.top + height + 50})`;
      });

  legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", d=>condColor(d.name))
      .attr("stroke-width", 2);

  legend.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .text(d=>d.name);

  // 10) Line generator
  const lineGen = d3.line()
    .defined(d=>!isNaN(d.eda))
    .x(d=>x(d.trial16))
    .y(d=>y(d.eda));

  // 11) Draw & animate loop
  function animate() {
    const paths = g.selectAll("path.eda")
      .data(series, d=>d.name);

    paths.enter().append("path")
        .attr("class","eda")
      .merge(paths)
        .attr("fill","none")
        .attr("stroke", d=>condColor(d.name))
        .attr("stroke-width", 2)
        .attr("d", d=>lineGen(d.data))
        .attr("stroke-dasharray", function(){
          return this.getTotalLength() + " " + this.getTotalLength();
        })
        .attr("stroke-dashoffset", function(){
          return this.getTotalLength();
        })
      .transition().duration(4000)
        .attr("stroke-dashoffset", 0)
      .transition().delay(4000)
        .on("end", animate);

    paths.exit().remove();
  }

  // kick off animation
  animate();
})
.catch(console.error);

