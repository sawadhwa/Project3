const fs = require('fs');
const d3 = require('d3-node')().d3;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const csvData = fs.readFileSync('your_file.csv', 'utf8');
const parsedData = d3.csvParse(csvData);

const fareColumn = 'fare';
const city1Column = 'city1';
const city2Column = 'city2';

parsedData.forEach(row => {
  row['airport_pair'] = row[city1Column] + ' and ' + row[city2Column];
});

const averageFareByCityPair = d3.group(parsedData, d => d['airport_pair']);
const topCityPairs = Array.from(averageFareByCityPair.entries())
  .sort((a, b) => d3.mean(b[1], d => +d[fareColumn]) - d3.mean(a[1], d => +d[fareColumn]))
  .slice(0, 5);

const colors = ['skyblue', 'red', 'green', 'orange', 'purple'];

// Set the figure size
const width = 640;
const height = 480;

// Create an SVG element
const svg = d3.select(new JSDOM().window.document.body)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Create bars
svg.selectAll('rect')
  .data(topCityPairs)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * (width / topCityPairs.length))
  .attr('y', d => height - d3.mean(d[1], row => +row[fareColumn]) / 10)
  .attr('width', width / topCityPairs.length - 5)
  .attr('height', d => d3.mean(d[1], row => +row[fareColumn]) / 10)
  .attr('fill', (d, i) => colors[i]);

// Add X-axis
const xScale = d3.scaleBand()
  .domain(topCityPairs.map(d => d[0]))
  .range([0, width]);

svg.append('g')
  .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom(xScale))
  .selectAll('text')
  .attr('transform', 'rotate(-45)')
  .style('text-anchor', 'end');

// Add Y-axis
const yScale = d3.scaleLinear()
  .domain([0, d3.max(topCityPairs, d => d3.mean(d[1], row => +row[fareColumn]) / 10)])
  .range([height, 0]);

svg.append('g')
  .call(d3.axisLeft(yScale));

// Display the chart
console.log('<html>' + svg.html() + '</html>');
