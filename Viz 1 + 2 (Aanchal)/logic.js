var csvFilePath = '/Passengers.csv';
var parseDate = function (y, m) {
    // Set a default day (e.g., 1) when parsing month and year
    return y + '-' + m + '-01';
};

var x, y, area, plot;
var transformedData;

Plotly.d3.csv(csvFilePath, function (data) {
    console.log("Raw data:", data);

    // Transform and filter data
    transformedData = data.map(function (d) {
        if (d.year && d.month && d.Domestic && d.International) {
            return {
                date: parseDate(d.year, d.month),
                domestic: +d.Domestic.replace(/,/g, '') || 0,
                international: +d.International.replace(/,/g, '') || 0
            };
        }
    }).filter(function (d) {
        return d && !isNaN(d.domestic) && !isNaN(d.international);
    });

    console.log("Transformed and filtered data:", transformedData);

    // Create the Plotly trace for domestic data
    var traceDomestic = {
        x: transformedData.map(d => d.date),
        y: transformedData.map(d => d.domestic),
        type: 'scatter',
        mode: 'lines',
        name: 'Domestic',
        fill: 'tonexty'
    };

    // Create the Plotly trace for international data
    var traceInternational = {
        x: transformedData.map(d => d.date),
        y: transformedData.map(d => d.international),
        type: 'scatter',
        mode: 'lines',
        name: 'International',
        fill: 'tonexty'
    };

    // Layout settings
    var layout = {
        xaxis: {
            type: 'date'
        },
        yaxis: {
            title: 'Passenger Count'
        },
        margin: { t: 0 }
    };

    // Create the Plotly plot
    Plotly.newPlot('stacked-area-chart', [traceDomestic, traceInternational], layout);

});

// Add event listener for the Apply Filter button
document.getElementById("apply-filter").addEventListener("click", function () {
    applyDateFilter();
});


// Function to apply the date range filter
function applyDateFilter() {
    var startDate = new Date(document.getElementById("start-date").value);
    var endDate = new Date(document.getElementById("end-date").value);

    // Filter data based on date range
    var filteredData = transformedData.filter(function (d) {
        return new Date(d.date) >= startDate && new Date(d.date) <= endDate;
    });

    // Update the x-axis range
    var xaxisUpdate = {
        'xaxis.range[0]': startDate.toISOString().split('T')[0],
        'xaxis.range[1]': endDate.toISOString().split('T')[0]
    };

    // Update the Plotly plot
    Plotly.relayout('stacked-area-chart', xaxisUpdate);
}

