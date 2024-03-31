var width = 350;
var height = 300;
var padding = 100;
var m_width = 350;
var f_width = 250;

// Function to update data based on selected year
function updateData(year) {
    d3.csv("./dataused/ages.csv")
        .then(function (data) {
            // Filter data for the selected year
            var filteredData = data.filter(function (d) {
                return +d.Year === year;
            });

            // Add X axis
            const x = d3.scaleLinear()
                .domain([0, d3.max(filteredData, function (d) { return Math.max(+d.Female, +d.Male); })])
                .range([0, 300 - padding]);

            // Add Y axis
            const y = d3.scaleBand()
                .domain(filteredData.map(function (d) { return d.Age; }))
                .range([0, height])
                .padding(0.1);

            // Select or append SVG elements for male chart
            var svgMale = d3.select("#svgMale")
                .attr("width", m_width)
                .attr("height", height);
            var maleBars = svgMale.selectAll(".maleBar")
                .data(filteredData);

            maleBars.exit().remove();

            maleBars.enter()
                .append("rect")
                .attr("class", "maleBar")
                .merge(maleBars)
                .on("mouseover", function (event, d) {
                    var xPosition = parseFloat(d3.select(this).attr("x"));
                    var yPosition = parseFloat(d3.select(this).attr("y"));
                    svgMale.append("text")
                        .attr("class", "tooltip")
                        .attr("pointer-events", "none")
                        .attr("x", xPosition - 20)
                        .attr("y", yPosition + y.bandwidth() / 2)
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("font-size", "11px")
                        .attr("font-weight", "bold")
                        .text(d.Male);
                })
                .on("mouseout", function () {
                    svgMale.selectAll(".tooltip").remove();
                    d3.select(this).attr("fill", "#c99e39");
                })
                .transition()
                .duration(1000)
                .attr("x", function (d) { return m_width - x(+d.Male); })
                .attr("y", function (d) { return y(d.Age); })
                .attr("width", function (d) { return x(+d.Male); })
                .attr("height", y.bandwidth())
                .style("fill", "#c99e39");

            // Select or append SVG elements for female chart
            var svgFemale = d3.select("#svgFemale")
                .attr("width", f_width)
                .attr("height", height);
            var femaleBars = svgFemale.selectAll(".femaleBar")
                .data(filteredData);

            femaleBars.exit().remove();

            femaleBars.enter()
                .append("rect")
                .attr("class", "femaleBar")
                .merge(femaleBars)
                .on("mouseover", function (event, d) {
                    var xPosition = parseFloat(d3.select(this).attr("x"));
                    var yPosition = parseFloat(d3.select(this).attr("y"));
                    svgFemale.append("text")
                        .attr("class", "tooltip")
                        .attr("pointer-events", "none")
                        .attr("x", xPosition + x(+d.Female) + 20)
                        .attr("y", yPosition + y.bandwidth() / 2)
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("font-size", "11px")
                        .attr("font-weight", "bold")
                        .text(d.Female);
                })
                .on("mouseout", function () {
                    svgFemale.selectAll(".tooltip").remove();
                    d3.select(this).attr("fill", "#435b59");
                })
                .transition()
                .duration(1000)
                .attr("x", x(0))
                .attr("y", function (d) { return y(d.Age); })
                .attr("width", function (d) { return x(+d.Female); })
                .attr("height", y.bandwidth())
                .style("fill", "#435b59");

            // Draw pie chart
            drawPieChart(filteredData);

            // Update Y axis for male chart
            svgMale.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + padding + ",0)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("text-anchor", "end");

            var chartHeading = document.querySelector("#full-tornado-chart h3");
            if (chartHeading) {
                chartHeading.textContent = "Comparison of the total immigrants by gender in " + year;
            }

            // Update chart description
            updateChartDescription(year);
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
        });
}

// Function to update chart description
function updateChartDescription(year) {
    var chartDescription = document.querySelector(".chart-description em");
    if (chartDescription) {
        chartDescription.textContent = "This page provides a detailed glimpse into immigration demographics across age groups and genders of " + year + ", enabling viewers to discern trends and disparities in migration patterns.";
    }
}

// Function to draw pie chart
function drawPieChart(data) {
    // Clear existing pie chart
    d3.select("#svgPie").selectAll("*").remove();

    var totalMale = d3.sum(data, function (d) { return +d.Male; });
    var totalFemale = d3.sum(data, function (d) { return +d.Female; });
    var total = totalMale + totalFemale;

    var pieData = [
        { gender: "Male", percent: ((totalMale / total) * 100).toFixed(2), count: totalMale },
        { gender: "Female", percent: ((totalFemale / total) * 100).toFixed(2), count: totalFemale }
    ];

    var radius = Math.min(width, height) / 2;

    var color = d3.scaleOrdinal()
        .domain(pieData.map(function (d) { return d.gender; }))
        .range(["#c99e39", "#435b59"]);

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.pie()
        .sort(null)
        .value(function (d) { return d.count; });

    var svgPie = d3.select("#svgPie")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svgPie.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) { return color(d.data.gender); });

    g.append("text")
        .attr("transform", function (d) {
            var centroid = arc.centroid(d);
            return "translate(" + centroid[0] + "," + centroid[1] + ")";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.data.percent + "%"; });
}

// Initial call to updateData with the default year (2022)
updateData(2022);
