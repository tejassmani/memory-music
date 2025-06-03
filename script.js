// d3.csv("data/df.csv").then(raw => {
//   const filtered = raw.filter(d =>
//     d.accuracy !== "" && +d.accuracy > 0 && +d.trial <= 30
//   ).map(d => ({
//     condition: d.condition,
//     trial: +d.trial,
//     accuracy: +d.accuracy
//   }));

//   const grouped = d3.groups(filtered, d => d.condition, d => d.trial)
//     .map(([condition, trialGroups]) => ({
//       condition,
//       values: trialGroups.map(([trial, records]) => ({
//         trial: +trial,
//         mean: d3.mean(records, r => r.accuracy),
//         std: d3.deviation(records, r => r.accuracy)
//       })).sort((a, b) => a.trial - b.trial)
//     }));

//   const svg = d3.select("#accuracy-chart"),
//         margin = { top: 80, right: 150, bottom: 50, left: 60 },
//         width = +svg.attr("width") - margin.left - margin.right,
//         height = +svg.attr("height") - margin.top - margin.bottom;

//   const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

//   const maxTrial = d3.max(grouped, d => d3.max(d.values, v => v.trial));
//   const x = d3.scaleLinear().domain([1, maxTrial]).range([0, width]);
//   const y = d3.scaleLinear().range([height, 0]);

//   const xAxisG = g.append("g")
//     .attr("transform", `translate(0,${height})`);
//   const yAxisG = g.append("g");

//   svg.append("text")
//     .attr("x", width / 2 + margin.left)
//     .attr("y", height + margin.top + 35)
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Trial Number");

//   svg.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -height / 2 - margin.top)
//     .attr("y", 20)
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Mean Accuracy (Proportion Correct)");

//   svg.append("text")
//     .attr("x", width / 2 + margin.left)
//     .attr("y", 25)
//     .attr("text-anchor", "middle")
//     .style("font-size", "16px")
//     .style("font-weight", "bold")
//     .text("Aggregated Accuracy by Trial and Condition");

//   const color = d3.scaleOrdinal(d3.schemeSet2).domain(grouped.map(d => d.condition));
//   const line = d3.line().x(d => x(d.trial)).y(d => y(d.mean));
//   const area = d3.area()
//     .x(d => x(d.trial))
//     .y0(d => y(d.mean - d.std))
//     .y1(d => y(d.mean + d.std));

//   const allConditions = ["All", ...grouped.map(d => d.condition)];

//   const dropdown = d3.select("#controls").append("select");
//   dropdown.selectAll("option")
//     .data(allConditions)
//     .enter()
//     .append("option")
//     .text(d => d);

//   const conditionGroup = g.selectAll(".condition-group")
//     .data(grouped)
//     .enter()
//     .append("g")
//     .attr("class", "condition-group")
//     .attr("id", d => `group-${d.condition.replace(/\s+/g, '-')}`);

//   conditionGroup.append("path")
//     .attr("class", "area")
//     .attr("fill", d => color(d.condition))
//     .attr("opacity", 0.2);

//   conditionGroup.append("path")
//     .attr("class", "line")
//     .attr("fill", "none")
//     .attr("stroke", d => color(d.condition))
//     .attr("stroke-width", 2);

//   conditionGroup.each(function(d) {
//     d3.select(this).selectAll("circle")
//       .data(d.values)
//       .enter()
//       .append("circle")
//       .attr("r", 3)
//       .attr("fill", color(d.condition));
//   });

//   const legend = svg.append("g")
//   .attr("class", "legend")
//   .attr("transform", `translate(${width + margin.left + 10},${margin.top})`);

// function renderLegend(selected) {
//   legend.selectAll("*").remove();

//   const toShow = selected === "All" ? grouped : grouped.filter(d => d.condition === selected);

//   toShow.forEach((d, i) => {
//     const group = legend.append("g")
//       .attr("transform", `translate(0, ${i * 25})`);

//     group.append("rect")
//       .attr("x", 0)
//       .attr("y", -10)
//       .attr("width", 15)
//       .attr("height", 15)
//       .attr("fill", color(d.condition));

//     group.append("text")
//       .attr("x", 20)
//       .attr("y", 0)
//       .text(d.condition)
//       .attr("alignment-baseline", "middle");
//   });
// }


//   function update(selected) {
//     let subset = grouped;

//     if (selected !== "All") {
//       subset = grouped.filter(d => d.condition === selected);
//     }

//     const flatValues = subset.flatMap(d => d.values);
//     const ymin = d3.min(flatValues, d => d.mean - d.std);
//     const ymax = d3.max(flatValues, d => d.mean + d.std);
//     y.domain([Math.max(0, ymin - 0.01), Math.min(1, ymax + 0.01)]);

//     xAxisG.call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
//     yAxisG.call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

//     conditionGroup.style("display", d =>
//       selected === "All" || d.condition === selected ? null : "none"
//     );

//     conditionGroup.each(function(d) {
//       const show = selected === "All" || d.condition === selected;
//       d3.select(this).select(".line")
//         .attr("d", line(d.values));
//       d3.select(this).select(".area")
//         .attr("d", area(d.values));
//       d3.select(this).selectAll("circle")
//         .data(d.values)
//         .attr("cx", d => x(d.trial))
//         .attr("cy", d => y(d.mean));
//     });
//     renderLegend(selected);

//   }

//   dropdown.on("change", function () {
//     update(this.value);
//   });

//   update("All");
// });

// d3.csv("data/Behavioral_data/cleaned_df.csv").then(data => {
//   // parse numbers from strings
//   data.forEach(d => {
//     d.mean_accuracy = +d.mean_accuracy;
//     d.std_accuracy = +d.std_accuracy;
//     d.TrialNumber = +d.TrialNumber;
//   });
//   // This script assumes you have agg_accuracy.csv and agg_response.csv in the same folder
// // It renders two line plots: one for Accuracy and one for Response Time by TrialNumber

// // Create SVG dimensions
// const margin = { top: 60, right: 100, bottom: 50, left: 70 },
//       width = 900 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

// // Colors
// const colorMap = {
//   "Calming": "#2196f3",
//   "Vexing": "#f44336"
// };

// function createLineChart(csvFile, metric, yLabel, containerId) {
//   d3.csv(csvFile).then(data => {
//     data.forEach(d => {
//       d.TrialNumber = +d.TrialNumber;
//       d[metric] = +d[metric];
//     });

//     const svg = d3.select(containerId)
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleLinear()
//       .domain(d3.extent(data, d => d.TrialNumber))
//       .range([0, width]);

//     const y = d3.scaleLinear()
//       .domain([0, d3.max(data, d => d[metric]) * 1.1])
//       .range([height, 0]);

//     const xAxis = d3.axisBottom(x).ticks(16).tickFormat(d3.format("d"));
//     const yAxis = d3.axisLeft(y);

//     svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(xAxis)
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", 40)
//       .attr("fill", "black")
//       .style("font-size", "14px")
//       .text("Trial Number");

//     svg.append("g")
//       .call(yAxis)
//       .append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("x", -height / 2)
//       .attr("y", -50)
//       .attr("fill", "black")
//       .style("text-anchor", "middle")
//       .style("font-size", "14px")
//       .text(yLabel);

//     const line = d3.line()
//       .x(d => x(d.TrialNumber))
//       .y(d => y(d[metric]));

//     const grouped = d3.group(data, d => d.session_type);

//     for (const [key, values] of grouped.entries()) {
//       svg.append("path")
//         .datum(values)
//         .attr("fill", "none")
//         .attr("stroke", colorMap[key])
//         .attr("stroke-width", 2)
//         .attr("d", line);

//       svg.append("text")
//         .attr("x", width - 80)
//         .attr("y", y(values[values.length - 1][metric]))
//         .attr("fill", colorMap[key])
//         .text(key);
//     }

//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", -20)
//       .style("text-anchor", "middle")
//       .style("font-size", "18px")
//       .style("font-weight", "bold")
//       .text(`${yLabel} vs. Trial Number`);
//   });
// }

// // Call the chart functions with correct arguments
// document.addEventListener("DOMContentLoaded", function () {
//   createLineChart("data/Behavioral_data/agg_accuracy.csv", "mean_accuracy", "Accuracy", "#accuracy-chart");
//   createLineChart("data/Behavioral_data/agg_response.csv", "mean_rt", "Response Time (ms)", "#response-chart");
// });

//   // proceed to plot with D3
// });
