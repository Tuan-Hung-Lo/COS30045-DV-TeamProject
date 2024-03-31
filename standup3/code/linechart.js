document.addEventListener("DOMContentLoaded", function () {
    // Define the dimensions and margins for the SVG
    var margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    var svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load the data
    var data = [
        {
            year: 2018, values: [
                { continent: "Africa", value: 64999 },
                { continent: "Asia", value: 275822 },
                { continent: "Europe", value: 71483 },
                { continent: "North America", value: 277822 },
                { continent: "Oceania", value: 3794 },
                { continent: "South America", value: 67934 }
            ]
        },
        {
            year: 2019, values: [
                { continent: "Africa", value: 85014 },
                { continent: "Asia", value: 327434 },
                { continent: "Europe", value: 81051 },
                { continent: "North America", value: 276969 },
                { continent: "Oceania", value: 4311 },
                { continent: "South America", value: 68687 }
            ]
        },
        {
            year: 2020, values: [
                { continent: "Africa", value: 66450 },
                { continent: "Asia", value: 246215 },
                { continent: "Europe", value: 57410 },
                { continent: "North America", value: 204269 },
                { continent: "Oceania", value: 3393 },
                { continent: "South America", value: 50442 }
            ]
        },
        {
            year: 2021, values: [
                { continent: "Africa", value: 76009 },
                { continent: "Asia", value: 295224 },
                { continent: "Europe", value: 77085 },
                { continent: "North America", value: 288431 },
                { continent: "Oceania", value: 4304 },
                { continent: "South America", value: 72701 }
            ]
        },
        {
            year: 2022, values: [
                { continent: "Africa", value: 106094 },
                { continent: "Asia", value: 361176 },
                { continent: "Europe", value: 92242 },
                { continent: "North America", value: 324409 },
                { continent: "Oceania", value: 5260 },
                { continent: "South America", value: 79982 }
            ]
        }
    ];

    // Define scales and axes
    var xScale = d3.scaleLinear()
        .domain([2018, 2022])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d3.max(d.values, function (d) {
                return d.value;
            });
        })])
        .range([height, 0]);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    // Add X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add Y axis
    svg.append("g")
        .call(yAxis);

    // Define line generator
    var line = d3.line()
        .x(function (d) { return xScale(d.year); })
        .y(function (d) { return yScale(d.value); });

    // Add lines
    svg.selectAll(".line")
        .data(data)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", function (d) { return line(d.values); })
        .style("stroke", function (d, i) { return d3.schemeCategory10[i]; });

    // Add legend
    var continents = data[0].values.map(function (d) { return d.continent; });
    var legend = svg.selectAll(".legend")
        .data(continents)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) { return d3.schemeCategory10[i]; });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; });
});
