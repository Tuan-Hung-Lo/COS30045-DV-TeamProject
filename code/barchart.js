var width = 300;
var height = 200;

// Function to update data based on selected year
function updateData(year) {
    d3.csv("/csv/ages.csv")
        .then(function (data) {
            // Filter data for the selected year
            var filteredData = data.filter(function (d) {
                return +d.Year === year;
            });

            // X scale
            var x = d3.scaleBand()
                .range([0, width])
                .domain(filteredData.map(function (d) { return d.Age; }))
                .padding(0.1);

            // Y scale
            var y = d3.scaleLinear()
                .domain([0, d3.max(filteredData, function (d) { return Math.max(+d.Female, +d.Male); })])
                .range([height, 0]);

            // Select or append SVG elements for female chart
            var svgFemale = d3.select("#svgFemale")
                .attr("width", width)
                .attr("height", height);
            var femaleBars = svgFemale.selectAll(".femaleBar")
                .data(filteredData);

            femaleBars.exit().remove();

            femaleBars.enter()
                .append("rect")
                .attr("class", "femaleBar")
                .merge(femaleBars)
                .transition()
                .duration(1000)
                .attr("x", function (d) { return x(d.Age); })
                .attr("y", function (d) { return y(+d.Female); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(+d.Female); })
                .style("fill", "#435b59");

            // Select or append SVG elements for male chart
            var svgMale = d3.select("#svgMale")
                .attr("width", width)
                .attr("height", height);
            var maleBars = svgMale.selectAll(".maleBar")
                .data(filteredData);

            maleBars.exit().remove();

            maleBars.enter()
                .append("rect")
                .attr("class", "maleBar")
                .merge(maleBars)
                .transition()
                .duration(1000)
                .attr("x", function (d) { return x(d.Age); })
                .attr("y", function (d) { return y(+d.Male); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(+d.Male); })
                .style("fill", "#c99e39");

            // Draw pie chart
            drawPieChart(filteredData);

            // Update X axis for female chart
            svgFemale.select(".x-axis").remove();
            svgFemale.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

        })
        .catch(function (error) {
            console.error("Error loading data:", error);
        });
}

// Function to draw pie chart
function drawPieChart(data) {
    var totalMale = d3.sum(data, function (d) { return +d.Male; });
    var totalFemale = d3.sum(data, function (d) { return +d.Female; });
    var total = totalMale + totalFemale;

    var pieData = [
        { gender: totalMale + " (" + ((totalMale / total) * 100).toFixed(2) + "%)", count: totalMale },
        { gender: totalFemale + " (" + ((totalFemale / total) * 100).toFixed(2) + "%)", count: totalFemale }
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
        .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function (d) { return d.data.gender; });
}

// Initial call to updateData with the default year (2022)
updateData(2022);
