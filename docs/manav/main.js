//Pull theme colors from the shared design system (CSS variables) so the
//chart matches the group palette and responds to the dark-mode toggle.
function themeColor(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const COLOR_INCOME = themeColor('--color-primary', '#01696f'); // teal — income
const COLOR_CPI    = themeColor('--color-accent', '#a12c7b');   // magenta — CPI
const COLOR_MUTED  = themeColor('--color-text-muted', '#6f6b63');
const COLOR_TEXT   = themeColor('--color-text', '#28251d');
const COLOR_SURFACE = themeColor('--color-surface', '#fbfbf9');
const COLOR_BORDER  = themeColor('--color-border', 'rgba(40,37,29,0.12)');

//Call consts.
const width = 1000;
const height = 600;
const margin = 50;

//Load data.
d3.csv("avgincome-cpi.csv").then(data => {
    const dataset = data.map(d => ({
        year: +d.year,
        avgIncome: +d.avgIncome,
        cpiAnnual: +d.cpiAnnual
    }));

    //Base const for first year in data.
    const base = dataset[0];

    //Array with percentage changed values for income and cpi.
    const newData = dataset.map(d => ({
        year: d.year,
        avgIncome: d.avgIncome,
        cpiAnnual: d.cpiAnnual,
        incomeChange: ((d.avgIncome - base.avgIncome) / base.avgIncome) * 100,
        cpiChange: ((d.cpiAnnual - base.cpiAnnual) / base.cpiAnnual) * 100
    }));

    //Create svg container.
    const svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin}, ${margin})`);

    //Create x and y scales.
    const xScale = d3.scaleLinear()
        .domain([2000, 2024])
        .range([0, width - margin * 2 - 120]);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(newData, d => Math.min(d.incomeChange, d.cpiChange)) - 10,
            d3.max(newData, d => Math.max(d.incomeChange, d.cpiChange))
        ])
        .range([height - margin * 2, 0]);

    //Call x axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin * 2})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    //Call y axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat(d => d + "%"));

    //Create income line
    const incomeLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.incomeChange));

    svg.append("path")
        .datum(newData)
        .attr("fill", "none")
        .attr("stroke", COLOR_INCOME)
        .attr("stroke-width", 2.5)
        .attr("d", incomeLine);

    //Create cpi line
    const cpiLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.cpiChange));

    svg.append("path")
        .datum(newData)
        .attr("fill", "none")
        .attr("stroke", COLOR_CPI)
        .attr("stroke-width", 2.5)
        .attr("d", cpiLine);
        
    //Create box tooltip to float with cursor
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", COLOR_SURFACE)
        .style("color", COLOR_TEXT)
        .style("border", "1px solid " + COLOR_BORDER)
        .style("border-radius", "0.75rem")
        .style("box-shadow", "0 10px 28px rgba(40,37,29,0.12)")
        .style("padding", "8px 12px")
        .style("font-size", "14px")
        .style("font-family", "'Satoshi','Inter',sans-serif")
        .style("display", "none");

    //Creates bisector for scrubber
    const bisect = d3.bisector(d => d.year).left;

    //Creates a line to scrub across the chart
    const scrubber = svg.append("line")
        .attr("y1", 0)
        .attr("y2", height - margin * 2)
        .attr("stroke", COLOR_MUTED)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("display", "none");

    //Income dot
    const incomeDot = svg.append("circle")
        .attr("r", 4)
        .attr("fill", COLOR_INCOME)
        .style("display", "none");

    //CPI dot
    const cpiDot = svg.append("circle")
        .attr("r", 4)
        .attr("fill", COLOR_CPI)
        .style("display", "none");

    //Invisible rectangle to capture mouse movement
    svg.append("rect")
        .attr("width", width - margin * 2 - 120)
        .attr("height", height - margin * 2)
        .attr("fill", "transparent")

        //This occurs when the mouse moves inside the chart
        .on("mousemove", (event) => {
            //Finds the year nearest to the mouse cursor
            const [mouseX] = d3.pointer(event);
            const year = Math.round(xScale.invert(mouseX));
            const d = newData.find(p => p.year === year);
            
            //Displays scrubber and dots at the correct positions
            scrubber.style("display", "block").attr("x1", xScale(d.year)).attr("x2", xScale(d.year));
            incomeDot.style("display", "block").attr("cx", xScale(d.year)).attr("cy", yScale(d.incomeChange));
            cpiDot.style("display", "block").attr("cx", xScale(d.year)).attr("cy", yScale(d.cpiChange));
            
            //Displays a rectangle tooltip with text inside. Displays with scrubber.
            tooltip.style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                //Text to display inside tooltip.
                .html(`
                    <strong>${d.year}</strong><br>
                    Income: ${d.incomeChange.toFixed(1)}% / $${d.avgIncome.toLocaleString()}<br>
                    CPI: ${d.cpiChange.toFixed(1)}% / ${d.cpiAnnual}
                `);
        })
        //Hides all tooltips and dots
        .on("mouseout", () => {
            scrubber.style("display", "none");
            incomeDot.style("display", "none");
            cpiDot.style("display", "none");
            tooltip.style("display", "none");
        });

        const last = newData[newData.length - 1];

    //Create final income dot
    svg.append("circle")
        .attr("cx", xScale(last.year))
        .attr("cy", yScale(last.incomeChange))
        .attr("r", 4)
        .attr("fill", COLOR_INCOME);

    //Create final cpi dot
    svg.append("circle")
        .attr("cx", xScale(last.year))
        .attr("cy", yScale(last.cpiChange))
        .attr("r", 4)
        .attr("fill", COLOR_CPI);

    //Show income and cpi legend text with 2024 percentage change
    svg.append("text")
        .attr("x", xScale(last.year))
        .attr("y", yScale(last.incomeChange) -10)
        .attr("text-anchor", "middle")
        .attr("fill", COLOR_INCOME)
        .attr("font-size", "16px")
        .attr("font-weight", "700")
        .text("Avg Income: " + " +" + last.incomeChange.toFixed(1) + "%");

    svg.append("text")
        .attr("x", xScale(last.year))
        .attr("y", yScale(last.cpiChange) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", COLOR_CPI)
        .attr("font-size", "16px")
        .attr("font-weight", "700")
        .text("CPI: " + " +" + last.cpiChange.toFixed(1) + "%");
});