d3.csv("data/df.csv").then(raw => {
  const filtered = raw.filter(d =>
    d.accuracy !== "" && +d.accuracy > 0 && +d.trial <= 30
  ).map(d => ({
    condition: d.condition,
    trial: +d.trial,
    accuracy: +d.accuracy
  }));

  const grouped = d3.groups(filtered, d => d.condition, d => d.trial)
    .map(([condition, trialGroups]) => ({
      condition,
      values: trialGroups.map(([trial, records]) => ({
        trial: +trial,
        mean: d3.mean(records, r => r.accuracy),
        std: d3.deviation(records, r => r.accuracy)
      })).sort((a, b) => a.trial - b.trial)
    }));

  const svg = d3.select("#accuracy-chart"),
        margin = { top: 80, right: 150, bottom: 50, left: 60 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const maxTrial = d3.max(grouped, d => d3.max(d.values, v => v.trial));
  const x = d3.scaleLinear().domain([1, maxTrial]).range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxisG = g.append("g")
    .attr("transform", `translate(0,${height})`);
  const yAxisG = g.append("g");

  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 35)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Trial Number");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 - margin.top)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Mean Accuracy (Proportion Correct)");

  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Aggregated Accuracy by Trial and Condition");

  const color = d3.scaleOrdinal(d3.schemeSet2).domain(grouped.map(d => d.condition));
  const line = d3.line().x(d => x(d.trial)).y(d => y(d.mean));
  const area = d3.area()
    .x(d => x(d.trial))
    .y0(d => y(d.mean - d.std))
    .y1(d => y(d.mean + d.std));

  const allConditions = ["All", ...grouped.map(d => d.condition)];

  const dropdown = d3.select("#controls").append("select");
  dropdown.selectAll("option")
    .data(allConditions)
    .enter()
    .append("option")
    .text(d => d);

  const conditionGroup = g.selectAll(".condition-group")
    .data(grouped)
    .enter()
    .append("g")
    .attr("class", "condition-group")
    .attr("id", d => `group-${d.condition.replace(/\s+/g, '-')}`);

  conditionGroup.append("path")
    .attr("class", "area")
    .attr("fill", d => color(d.condition))
    .attr("opacity", 0.2);

  conditionGroup.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", d => color(d.condition))
    .attr("stroke-width", 2);

  conditionGroup.each(function(d) {
    d3.select(this).selectAll("circle")
      .data(d.values)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("fill", color(d.condition));
  });

  const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width + margin.left + 10},${margin.top})`);

function renderLegend(selected) {
  legend.selectAll("*").remove();

  const toShow = selected === "All" ? grouped : grouped.filter(d => d.condition === selected);

  toShow.forEach((d, i) => {
    const group = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    group.append("rect")
      .attr("x", 0)
      .attr("y", -10)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(d.condition));

    group.append("text")
      .attr("x", 20)
      .attr("y", 0)
      .text(d.condition)
      .attr("alignment-baseline", "middle");
  });
}


  function update(selected) {
    let subset = grouped;

    if (selected !== "All") {
      subset = grouped.filter(d => d.condition === selected);
    }

    const flatValues = subset.flatMap(d => d.values);
    const ymin = d3.min(flatValues, d => d.mean - d.std);
    const ymax = d3.max(flatValues, d => d.mean + d.std);
    y.domain([Math.max(0, ymin - 0.01), Math.min(1, ymax + 0.01)]);

    xAxisG.call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
    yAxisG.call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    conditionGroup.style("display", d =>
      selected === "All" || d.condition === selected ? null : "none"
    );

    conditionGroup.each(function(d) {
      const show = selected === "All" || d.condition === selected;
      d3.select(this).select(".line")
        .attr("d", line(d.values));
      d3.select(this).select(".area")
        .attr("d", area(d.values));
      d3.select(this).selectAll("circle")
        .data(d.values)
        .attr("cx", d => x(d.trial))
        .attr("cy", d => y(d.mean));
    });
    renderLegend(selected);

  }

  dropdown.on("change", function () {
    update(this.value);
  });

  update("All");
});
