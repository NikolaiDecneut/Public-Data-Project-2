// Median Income Data Line Chart

// Define The Dimensions and Margins For The Chart
const margin = {top: 40, right: 50, bottom: 60, left: 80}, // const Margin Values
      width = 1000 - margin.left - margin.right, // Dimension Width of 1000
      height = 500 - margin.top - margin.bottom; // Dimension Height of 500

// Function to Append SVG Object
const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// d3.text Function to Load and Parse CSV Text
d3.text("intablea2.csv").then(function(rawText) { // CSV Load
    const rows = d3.csvParseRows(rawText); // Line to Parse Raw CSV Text Into Array of Rows
    let dataset = [];
    // Function to Scan Header Rows to Find "Median Income" Column in Data
    let medianColIndex = 12;
    for (let i = 0; i < 10; i++) {
        if (rows[i]) {
            for (let j = 0; j < rows[i].length; j++) {
                let cellText = rows[i][j] ? rows[i][j].toLowerCase() : "";
                if (cellText.includes("median income")) { // cell.Text Line That Deals With Scan
                    medianColIndex = j;
                    break;
                }
            }
        }
    }
    // Function to Extract Year and Income Data
    rows.forEach(row => {
        // Function to Extract First Four Characters to Isolate The Year and Remove Footnote Numbers
        let yearStr = row[0] ? row[0].trim().substring(0, 4) : "";
        let year = parseInt(yearStr);
        // Function to Ensure Each Provided Year is Valid Within Timeline
        if (!isNaN(year) && year >= 1967 && year <= 2024) {
            // Function to Clean Out Commas and Dollar Signs From Income Text
            let incomeStr = row[medianColIndex] ? row[medianColIndex].replace(/,/g, '').replace(/\$/g, '') : "";
            let income = parseInt(incomeStr);
            // Function to Ensure Data is Valid and to Prevent Duplication
            if (!isNaN(income) && income > 0) {
                if (!dataset.some(d => d.year === year)) {
                    dataset.push({ year: year, income: income });
                }
            }
        }
    });

    // Function to Sort Dataset in Chronological Order Based on Year
    dataset.sort((a, b) => a.year - b.year);

    // X Scale Function
    const x = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.year))
      .range([0, width]);

    // Y Scale Function
    const y = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.income) * 1.1])
      .range([height, 0]);

    // Function to Append X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x-axis") // .attr to Class X Axis
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // .call Line to Format Text in X Axis

    // Function to Add "Year" Label Under X Axis
    svg.append("text")
      .attr("class", "axis-label") // .attr to Class Axis Label
      .attr("text-anchor", "middle") // Line to Anchor The Text to The Middle
      .attr("x", width / 2)
      .attr("y", height + 45)
      .text("Year"); // "Year" Name For Label

    // Function to Append Y Axis
    svg.append("g")
      .attr("class", "y-axis") // .attr to Class Y Axis
      .call(d3.axisLeft(y).tickFormat(d => "$" + (d / 1000) + "k")); // Line to Format Numbers with "$" in Thousands

    // Function to Add Vertical "Median Income" Label Next to Y Axis
    svg.append("text")
      .attr("class", "axis-label") // .attr to Class Axis Label
      .attr("text-anchor", "middle") // Line to Anchor The Text to The Middle
      .attr("transform", "rotate(-90)") // Line to Rotate the Text Vertically
      .attr("x", -height / 2) 
      .attr("y", -60)
      .text("Median Income"); // "Median Income" Name For Label

    // const Function to Define Shape For Area Beneath Line
    const area = d3.area()
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y(d.income));

    // Function to Draw The Soft Shaded Green Area
    svg.append("path")
      .datum(dataset)
      .attr("fill", "honeydew") // Shade of Green, Honeydew Fill Color
      .attr("opacity", 0.6) // Line For Opacity of 0.6
      .attr("d", area);
    
    // const Function to Define Line Path
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.income));

    // Function to Draw Dark Green Line
    svg.append("path")
      .datum(dataset)
      .attr("fill", "none")
      .attr("stroke", "forestgreen") // Shade of Green, Forest Green Stroke Color
      .attr("stroke-width", 3) // Line stroke-width of 3
      .attr("d", line);

    // Function to Plot Data Points as Circles Along Line
    svg.selectAll("myCircles")
      .data(dataset)
      .enter()
      .append("circle") // Line to State Circle
        .attr("fill", "darkgreen") // Shade of Green, Dark Green Fill Color
        .attr("stroke", "white") // Stroke Color of White
        .attr("stroke-width", 1.5) // Circle stroke-width of 1.5
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.income))
        .attr("r", 4);

    // const Function to Filter Dataset to Only Include Years Ending in 0 or 5 for Labels
    const fiveYearData = dataset.filter(d => d.year % 5 === 0);

    // Function to Draw Dashed Lines Connecting The Labels to Circles
    svg.selectAll("labelLines")
      .data(fiveYearData) // Line to Reference fiveYearData
      .enter()
      .append("line")
        .attr("x1", d => x(d.year))
        .attr("y1", d => y(d.income) - 6)
        .attr("x2", d => x(d.year))
        .attr("y2", d => y(d.income) - 28)
        .attr("stroke", "silver") // Stroke Color of Silver
        .attr("stroke-width", 1.5) // stroke-width of 1.5
        .attr("stroke-dasharray", "3,3"); // .attr to Make Line Dashed

    // Function to Add Clear Income Value Labels Hovering Above Dashed Lines
    svg.selectAll("incomeLabels")
      .data(fiveYearData) // Line to Reference fiveYearData
      .enter()
      .append("text")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.income) - 32)
        .attr("text-anchor", "middle") // Line to Anchor The Text to The Middle
        .attr("font-size", "11px") // Label Font-Size of 11px
        .attr("fill", "darkslategray") // Shade of Gray, Dark-Slate-Gray Fill Color
        .attr("font-weight", "bold") // Line to Make Font Have a Bold Weight
        .text(d => "$" + d.income.toLocaleString()); // .text Function to Add Commas to Numbers

// .catch Function to Log Any Errors if CSV Fails to Load
}).catch(function(error) {
    console.log("Error loading the CSV data: ", error); // Error Line
});