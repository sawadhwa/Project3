d3.csv('Passengers.csv').then(function(parsedData) {

    // Extract x and y columns from CSV data
    var xData = parsedData.map(function(row) {
        return row.year + '-' + row.month;
      });
      var yDataDomestic = parsedData.map(function(row) {
        return parseFloat(row.Domestic.replace(/,/g, ''));
      });
    
      var yDataInternational = parsedData.map(function(row) {
        return parseFloat(row.International.replace(/,/g, ''));
      });
    
      // Create data traces
      var traceDomestic = {
        x: xData,
        y: yDataDomestic,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Domestic'
      };
    
      var traceInternational = {
        x: xData,
        y: yDataInternational,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'International'
      };
    
      // Layout configuration
      var layout = {
        title: 'Passenger Count Over Time',
        xaxis: { title: 'Year-Month' },
        yaxis: { title: 'Passenger Count' }
      };
    
      // Combine data and layout to create the plot
      Plotly.newPlot('line-chart', [traceDomestic, traceInternational], layout);
    })