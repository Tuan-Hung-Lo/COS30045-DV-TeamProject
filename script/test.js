function init() {
  // Width and height of the map container
  const width = 800;
  const height = 600;

  // Select the map container
  const mapContainer = d3.select("#heatmap-container");

  // Create SVG element within the map container
  const svg = mapContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Define projection
  const projection = d3
    .geoAlbersUsa() // Using Albers USA projection
    .scale(1000) // Adjust scale as needed
    .translate([width / 2, height / 2]); // Center the map

  // Define path generator
  const path = d3.geoPath().projection(projection);

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Load GeoJSON data
  d3.json("./dataused/us-states.json")
    .then(function (geojson) {
      // Load CSV data
      d3.csv("./dataused/table22.csv")
        .then(function (data) {
          // Define color scale using the provided color scheme
          const colorScale = d3.scaleQuantize().range(["#ffffe5", "#ffffe4", "#feffe2", "#feffe1", "#feffdf", "#feffde", "#fdfedd", "#fdfedb", "#fdfeda", "#fdfed9", "#fcfed7", "#fcfed6", "#fcfed5", "#fbfed3", "#fbfed2", "#fbfdd1", "#fbfdcf", "#fafdce", "#fafdcd", "#f9fdcc", "#f9fdca", "#f9fdc9", "#f8fcc8", "#f8fcc7", "#f7fcc5", "#f7fcc4", "#f6fcc3", "#f6fcc2", "#f5fbc1", "#f5fbc0", "#f4fbbf", "#f4fbbe", "#f3fabd", "#f3fabc", "#f2fabb", "#f1faba", "#f1f9b9", "#f0f9b8", "#eff9b7", "#eff9b6", "#eef8b5", "#edf8b4", "#ecf8b3", "#ebf7b2", "#ebf7b2", "#eaf7b1", "#e9f6b0", "#e8f6af", "#e7f6ae", "#e6f5ae", "#e5f5ad", "#e4f4ac", "#e3f4ab", "#e2f4ab", "#e1f3aa", "#e0f3a9", "#dff2a8", "#def2a8", "#ddf2a7", "#dcf1a6", "#dbf1a6", "#daf0a5", "#d9f0a4", "#d8efa4", "#d6efa3", "#d5eea2", "#d4eea2", "#d3eda1", "#d2eda0", "#d0eca0", "#cfec9f", "#ceeb9e", "#cdeb9e", "#cbea9d", "#caea9c", "#c9e99c", "#c7e89b", "#c6e89a", "#c5e79a", "#c3e799", "#c2e698", "#c1e598", "#bfe597", "#bee496", "#bde496", "#bbe395", "#bae294", "#b8e294", "#b7e193", "#b5e192", "#b4e092", "#b2df91", "#b1df90", "#afde90", "#aedd8f", "#acdd8e", "#abdc8e", "#a9db8d", "#a8db8c", "#a6da8c", "#a5d98b", "#a3d98a", "#a2d88a", "#a0d789", "#9ed788", "#9dd688", "#9bd587", "#9ad586", "#98d486", "#96d385", "#95d284", "#93d284", "#92d183", "#90d082", "#8ed082", "#8dcf81", "#8bce80", "#89cd80", "#88cd7f", "#86cc7e", "#84cb7d", "#83ca7d", "#81ca7c", "#7fc97b", "#7ec87a", "#7cc77a", "#7ac779", "#79c678", "#77c577", "#75c477", "#73c376", "#72c375", "#70c274", "#6ec174", "#6dc073", "#6bbf72", "#69be71", "#68be70", "#66bd6f", "#64bc6f", "#63bb6e", "#61ba6d", "#5fb96c", "#5eb96b", "#5cb86a", "#5ab76a", "#59b669", "#57b568", "#56b467", "#54b366", "#53b265", "#51b164", "#50b064", "#4eaf63", "#4dae62", "#4bad61", "#4aac60", "#48ab5f", "#47aa5e", "#46a95e", "#44a85d", "#43a75c", "#42a65b", "#40a55a", "#3fa459", "#3ea359", "#3da258", "#3ca157", "#3aa056", "#399f55", "#389d55", "#379c54", "#369b53", "#359a52", "#349951", "#339851", "#329750", "#31964f", "#30944e", "#2f934e", "#2e924d", "#2d914c", "#2c904b", "#2a8f4b", "#298e4a", "#288d49", "#278b49", "#268a48", "#258947", "#248847", "#238746", "#228645", "#218545", "#208444", "#1f8344", "#1e8243", "#1d8143", "#1c8042", "#1b7f42", "#1a7e41", "#197d41", "#187c40", "#177b40", "#167a3f", "#15793f", "#14783e", "#13773e", "#12763d", "#11753d", "#10743c", "#10733c", "#0f723c", "#0e723b", "#0d713b", "#0c703a", "#0b6f3a", "#0b6e3a", "#0a6d39", "#096c39", "#086b38", "#086a38", "#076938", "#066837", "#066737", "#056636", "#056536", "#046435", "#046335", "#046235", "#036134", "#036034", "#025f33", "#025e33", "#025d33", "#025c32", "#015b32", "#015a31", "#015931", "#015730", "#015630", "#015530", "#00542f", "#00532f", "#00522e", "#00512e", "#00502d", "#004f2d", "#004e2d", "#004d2c", "#004c2c", "#004a2b", "#00492b", "#00482a", "#00472a", "#004629", "#004529"]);

          function drawLegend(colorScale, minRefugees, maxRefugees, numRanges) {
            // Define the size and margins for the legend
            const legendWidth = 700;
            const legendHeight = 40;
            const legendMargin = { top: 10, right: 10, bottom: 10, left: 10 };

            // Compute the width of each legend item
            const itemWidth = legendWidth / numRanges;

            // Create the legend SVG if it doesn't exist
            let legendSvg = d3.select("#heatmap-container").select(".maplegend");

            if (legendSvg.empty()) {
              legendSvg = d3
                .select("#heatmap-container")
                .append("svg")
                .attr("class", "maplegend")
                .attr("width", legendWidth + legendMargin.left + legendMargin.right)
                .attr("height", legendHeight + legendMargin.top + legendMargin.bottom)
                .append("g")
                .attr(
                  "transform",
                  "translate(" + legendMargin.left + "," + legendMargin.top + ")"
                );
            } else {
              // Clear the existing legend
              legendSvg.selectAll("*").remove();
              legendSvg.attr(
                "transform",
                "translate(" + legendMargin.left + "," + legendMargin.top + ")"
              );
            }

            // Update color scale domain based on the provided range
            colorScale.domain([minRefugees, maxRefugees]);

            // Create a group for each color
            const legendItems = legendSvg
              .selectAll(".maplegend-item")
              .data(d3.range(numRanges))
              .enter()
              .append("g")
              .attr("class", "maplegend-item");

            // Add a rectangle of the appropriate color to each group
            legendItems
              .append("rect")
              .attr("x", function (d, i) {
                return i * itemWidth;
              })
              .attr("y", 0)
              .attr("width", itemWidth)
              .attr("height", legendHeight - legendMargin.bottom)
              .style("fill", function (d, i) {
                const value =
                  minRefugees + (i * (maxRefugees - minRefugees) / (numRanges - 1));
                return colorScale(value);
              });

            // Add a label to each group
            legendItems
              .append("text")
              .attr("x", function (d, i) {
                return i * itemWidth;
              })
              .attr("y", legendHeight - legendMargin.bottom + 20) // Adjust as needed
              .text(function (d, i) {
                const startValue =
                  minRefugees + (i * (maxRefugees - minRefugees) / (numRanges - 1));
                const endValue =
                  minRefugees + ((i + 1) * (maxRefugees - minRefugees) / (numRanges - 1));
                return `${Math.round(startValue)} - ${Math.round(endValue)}`;
              });
          }

          // Define a function to update the heatmap based on the selected year
          function updateHeatmap(year) {
            // Clear existing map elements
            console.log("Updating heatmap for year:", year);

            // Clear existing map elements
            svg.selectAll("path").remove();

            // Filter data by the selected year
            const filteredData = data.filter((d) => +d.Year === year);
            console.log(
              "Filtered data length for year",
              year,
              ":",
              filteredData.length
            );

            // Convert the Refugees values to numbers and log the data
            filteredData.forEach((d) => {
              // Parse Refugees values as numbers
              d.Refugees =
                typeof d.Refugees === "string"
                  ? +d.Refugees.replace(/,/g, "")
                  : +d.Refugees;
            });

            // Compute the maximum value of refugees for color scaling
            const maxRefugees = d3.max(filteredData, (d) => d.Refugees);
            const minRefugees = d3.min(filteredData, (d) => d.Refugees);

            // Define the number of ranges for the legend
            const numRanges = 5; // Adjust as needed

            // Draw legend
            drawLegend(colorScale, minRefugees, maxRefugees, numRanges);

            // Update color scale domain based on the new filtered data
            colorScale.domain([0, maxRefugees]);

            // Bind data to GeoJSON features
            geojson.features.forEach(function (jsonState) {
              const dataState = filteredData.find(
                (d) =>
                  d.State === jsonState.properties.NAME &&
                  d.Year === year.toString()
              );
              if (dataState) {
                // Check if Refugees is a string before calling replace
                if (typeof dataState.Refugees === "string") {
                  jsonState.properties.Refugees = +dataState.Refugees.replace(
                    /,/g,
                    ""
                  );
                } else {
                  jsonState.properties.Refugees = +dataState.Refugees;
                }
              }
            });

            // Draw or update the map based on the updated data
            svg
              .selectAll("path")
              .data(geojson.features)
              .enter()
              .append("path")
              .attr("d", path)
              .style("fill", function (d) {
                const refugees = d.properties.Refugees || 0;
                return colorScale(refugees);
              })
              .style("stroke", "white")
              .style("stroke-width", 1)
              .attr("class", function (d) { return "Country" })
              .style("opacity", .8)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .on("click", function (event, d) {
                // Get state name and number of refugees
                const stateName = d.properties.NAME;

                d3.csv("./dataused/countryOfOrigin.csv")
                  .then(function (data) {
                    // Constants
                    const selectedYear = "2022";
                    const stateName = "Alabama";

                    // Find the data for the selected country and year
                    const countryData = data.find(entry => entry.Year === selectedYear);

                    if (countryData) {
                      // Check if the state name exists in the country data
                      if (stateName in countryData) {
                        // Get the value for the selected state
                        const stateValue = countryData[stateName];
                        console.log("Country Name:", countryData.Country);
                        console.log("Selected Year:", countryData.Year);
                        console.log("Refugees in Alabama:", stateValue);
                      } else {
                        console.log("State not found in the data.");
                      }
                    } else {
                      console.log("Country data not found for the selected year.");
                    }
                  })
                  .catch(function (error) {
                    console.error("Error loading countryOfOrigin.csv:", error);
                  });


              });
          }

          // Initial update based on the default year (2022)
          const defaultYear = 2022;
          updateHeatmap(defaultYear);
          // Set the initial display of the selected year
          document.getElementById("year-display").innerHTML = `<strong>${defaultYear}</strong>`;

          // Add event listener to the year slider input element
          document
            .getElementById("year-slider")
            .addEventListener("input", function (event) {
              // Get the selected year from the slider
              const selectedYear = parseInt(event.target.value);
              document.getElementById("year-display").innerHTML = `<strong>${selectedYear}</strong>`;
              // Update the heatmap based on the selected year
              updateHeatmap(selectedYear);
            });
          // Add zoom behavior
          const zoom = d3.zoom()
            .scaleExtent([1, 8]) // Set the minimum and maximum zoom scale
            .on("zoom", zoomed);

          svg.call(zoom);

          // Define the zoom function
          function zoomed(event) {
            svg.selectAll("path").attr("transform", event.transform);
          }
        })
        .catch(function (error) {
          console.log("Error loading CSV file:", error);
        });
    })
    .catch(function (error) {
      console.log("Error loading GeoJSON file:", error);
    });

  // Define mouseover event handler
  function handleMouseOver(event, d) {
    // Get state name and number of refugees
    console.log("GeoJSON Feature Properties:", d.properties);
    const stateName = d.properties.NAME;
    const refugees = d.properties.Refugees || 0;

    // Display tooltip
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .html(`<strong class="tooltipName">${stateName}</strong><br>Refugees: ${refugees}`)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 28 + "px");
    // Highlight border
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black")
  }

  // Define mouseout event handler
  function handleMouseOut(event, d) {
    // Hide tooltip
    tooltip.transition().duration(500).style("opacity", 0);

    // Remove border highlight
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "white");
  }

}

window.onload = init;
