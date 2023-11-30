var csvFilePath = '/Passengers.csv';
var parseDate = function(y, m) {
    // Set a default day (e.g., 1) when parsing month and year
    return d3.timeParse("%Y-%m-%d")(y + '-' + m + '-01');
};
var x, y, area, svg, height, margin; 
var data;
// Set up dimensions for the chart
var margin = { top: 0, right: 30, bottom: 50, left: 120 };
var width = 1400 - margin.left - margin.right;
var height = 600;

Papa.parse(csvFilePath, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        data = results.data;
        console.log("Raw data:", data);

        // Transform and filter data
        data = data.map(function(d) {
            if (d.year && d.month && d.Domestic && d.International) {
                return {
                    date: parseDate(d.year, d.month),
                    domestic: +d.Domestic.replace(/,/g, '') || 0,
                    international: +d.International.replace(/,/g, '') || 0
                };
            }
        }).filter(function(d) {
            return d && !isNaN(d.domestic) && !isNaN(d.international);
        });

        console.log("Transformed and filtered data:", data);

        // Create scales
        x = d3.scaleTime().range([0, width]);
        y = d3.scaleLinear().range([500 - margin.bottom, 0]);

        // Create the area function for the stacked areas
        area = d3.area()
            .x(function(d) { return x(d.data.date); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); });

        // Create the SVG element
        svg = d3.select("#stacked-area-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", 500);

        // Initial rendering of the chart
        renderChart(data, x, y, area, svg, margin);

        // Add legend
        var legendData = ["Domestic", "International"];
        var legend = d3.select("#legend")
            .append("svg")
            .attr("width", 100) // Adjust the width as needed
            .attr("height", 100) // Adjust the height as needed
            .append("g")
            .attr("transform", "translate(10,10)"); // Adjust the position as needed

        legend.selectAll("rect")
            .data(legendData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return i * 20; })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d, i) { return i === 0 ? "steelblue" : "orange"; });

        legend.selectAll("text")
            .data(legendData)
            .enter().append("text")
            .attr("x", 20)
            .attr("y", function(d, i) { return i * 20 + 9; })
            .text(function(d) { return d; })
            .attr("font-size", "12px");
    }
});

// Add event listener for the Apply Filter button outside the Papa.parse callback
document.getElementById("apply-filter").addEventListener("click", function() {
    applyDateFilter(data, x, y, area, svg, margin);
});

// Function to apply the date range filter
function applyDateFilter(data, x, y, area, svg, margin) {
    var startDate = new Date(document.getElementById("start-date").value);
    var endDate = new Date(document.getElementById("end-date").value);

    // Filter data based on date range
    var filteredData = data.filter(function(d) {
        return d.date >= startDate && d.date <= endDate;
    });

    // Update the chart with filtered data
    renderChart(filteredData, x, y, area, svg, margin);
}

// Function to render the chart
function renderChart(data, x, y, area, svg, margin) {
    // Set domains for scales
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.domestic + d.international; })]);

    // Draw the stacked areas
    svg.selectAll(".layer").remove(); // Remove existing layers before redrawing
    svg.selectAll(".layer")
        .data(d3.stack().keys(["domestic", "international"])(data))
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", function(d, i) { return i === 0 ? "steelblue" : "orange"; });

    // Remove existing axis elements
    svg.selectAll(".axis").remove();

    // Add axes
    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", "translate(0," + (500 - margin.bottom) + ")")
        .call(d3.axisBottom(x).ticks(d3.timeMonth.every(12)).tickFormat(d3.timeFormat('%Y-%m')))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Passenger Count");

    // Log axis scales for debugging
    console.log("x.domain():", x.domain());
    console.log("y.domain():", y.domain());
}
