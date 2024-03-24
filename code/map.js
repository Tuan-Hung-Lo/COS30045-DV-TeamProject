// Define the dimensions of the SVG container
const width = 800;
const height = 500;

// Declare yearsData as a global variable
let yearsData;

// Define the color scale
const colorScale = d3.scaleSequential(d3.interpolateBlues);

// Append the SVG container to the page
const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

// Load the GeoJSON data
d3.json("../csv/us_states.json").then(function (geojson) {
    console.log("GeoJSON data loaded:", geojson); // Log GeoJSON data

    // Load the dataset
    d3.csv("../csv/state.csv").then(function (data) {
        console.log("CSV data loaded:", data); // Log CSV data
        try {
            // Process the data
            yearsData = processData(data);

            // Set the domain of the color scale
            colorScale.domain([0, d3.max(yearsData, d => d3.max(d.values, d => d.value))]);

            // Draw the map initially for the first year
            drawMap(yearsData[0], svg, geojson);

            // Add legend
            addLegend(colorScale);
        } catch (error) {
            console.error("Error processing data:", error); // Log processing error
        }
    }).catch(function (error) {
        console.error("Error loading CSV:", error); // Log CSV loading error
    });
}).catch(function (error) {
    console.error("Error loading GeoJSON:", error); // Log GeoJSON loading error
});

// Function to process the data
function processData(data) {
    console.log("Processing CSV data:", data);
    // Extract years from data
    const years = Object.keys(data[0]).slice(1);

    // Process data for each year
    const yearsData = years.map(year => ({
        year: +year,
        values: data.map(d => ({
            continent: d.Continent, // Assuming the property name is correct
            value: parseFloat(d[year].replace(",", ""))
        }))
    }));

    return yearsData;
}

// Function to draw the map for a specific year
function drawMap(yearData, svg, geojson) {
    console.log("Drawing map with year data:", yearData);

    // Ensure geojson is defined and has features
    if (!geojson || !geojson.features) {
        console.error("GeoJSON data is missing or invalid.");
        return;
    }

    // Define the projection
    const projection = d3.geoMercator()
        .fitSize([width, height], geojson); // Adjusted to fit size based on geojson data

    // Define the path generator
    const path = d3.geoPath()
        .projection(projection);

    // Draw the map
    svg.selectAll("path").remove(); // Remove existing paths
    svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            // Find the corresponding value for each feature
            const value = yearData.values.find(v => v.continent === d.properties.name)?.value;
            return colorScale(value || 0); // Use 0 if value is not found
        })
        .append("title")
        .text(d => {
            // Display the name and value of each feature
            const value = yearData.values.find(v => v.continent === d.properties.name)?.value || 0;
            return `${d.properties.name}: ${value}`;
        });
}

// Function to add legend
function addLegend(colorScale) {
    console.log("Adding legend...");
    const legend = d3.select(".legend");

    // Define legend items
    const legendData = [
        { value: 0, label: "0" },
        { value: 50000, label: "50K" },
        { value: 100000, label: "100K" },
        { value: 150000, label: "150K" },
        { value: 200000, label: "200K" }
    ];

    // Add legend items
    legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("div")
        .attr("class", "legend-item")
        .html(d => `<span style="background-color: ${colorScale(d.value)}"></span>${d.label}`);
}

// Function to update the map when a year button is clicked
function updateData(year) {
    console.log("Updating map for year:", year);
    const index = year - 2018;
    drawMap(yearsData[index], svg);
}
