import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.select("#chart"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  margin = { top: 50, right: 200, bottom: 100, left: 60 };

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/df.csv", d3.autoType).then((data) => {
  // Group by condition and compute mean and sd
  const grouped = d3
    .groups(data, (d) => d.condition)
    .map(([condition, values]) => {
      const mean = d3.mean(values, (d) => d.mean_eda);
      const sd = d3.deviation(values, (d) => d.mean_eda);
      return { condition, mean, sd };
    });

  const x = d3
    .scaleBand()
    .domain(grouped.map((d) => d.condition))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(grouped, (d) => d.mean + d.sd)])
    .nice()
    .range([chartHeight, 0]);

  const color = d3.scaleOrdinal(d3.schemeSet2);

  // X axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(30)")
    .style("text-anchor", "start");

  // Y axis
  g.append("g").call(d3.axisLeft(y));

  // Bars
  g.selectAll(".bar")
    .data(grouped)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.condition))
    .attr("y", (d) => y(d.mean))
    .attr("height", (d) => chartHeight - y(d.mean))
    .attr("width", x.bandwidth())
    .attr("fill", (d) => color(d.condition));

  // Error bars
  g.selectAll(".error-line")
    .data(grouped)
    .join("line")
    .attr("class", "error-line")
    .attr("x1", (d) => x(d.condition) + x.bandwidth() / 2)
    .attr("x2", (d) => x(d.condition) + x.bandwidth() / 2)
    .attr("y1", (d) => y(d.mean - d.sd))
    .attr("y2", (d) => y(d.mean + d.sd))
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);

  // Stripplot dots (jittered)
  const jitter = 8;

  g.selectAll(".dot")
    .data(data)
    .join("circle")
    .attr("class", "dot")
    .attr(
      "cx",
      (d) =>
        x(d.condition) + x.bandwidth() / 2 + (Math.random() - 0.5) * jitter,
    )
    .attr("cy", (d) => y(d.mean_eda))
    .attr("r", 5)
    .attr("fill", (d) => color(d.condition))
    .attr("opacity", 0.6);

  // Legend
  const participants = Array.from(new Set(data.map((d) => d.participant)));
  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width - margin.right + 20}, ${margin.top})`,
    );

  participants.forEach((p, i) => {
    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", i * 20)
      .attr("r", 5)
      .attr("fill", "#999");

    legend
      .append("text")
      .attr("x", 10)
      .attr("y", i * 20 + 4)
      .text(p)
      .style("font-size", "12px");
  });
});
