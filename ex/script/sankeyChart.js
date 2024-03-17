var margin = {top: 10, right: 10, bottom: 10, left: 10},
width = 600 - margin.left - margin.right,
padding = 100,
height = 300 - margin.top - margin.bottom;
var formatNumber = d3.format(",.0f"), // zero decimal places
format = function(d) { return formatNumber(d); },
color = d3.scaleOrdinal(d3.schemeCategory10);

function initialiseSankey()
{
    

    // append the svg object to the body of the page
    var svg = d3.select(".sankey-chart").append("svg")
                .attr("width", width + margin.left + margin.right+285)
                .attr("height", height + margin.top + margin.bottom+150)
                .append("g") .attr("class","t")
                .attr("transform", 
                        `translate(${margin.left+100},${margin.right})`);
    drawSankey(1);
}

function getGradID(d){ //return the gradient id for a specific link
    var target = d.target.name;
    var source = d.source.name;
    return "linkGrad-" + source.replaceAll(" ","") + "-" + target.replaceAll(" ","");
}

function creatGradient(defs,graph,color) //create definition of linear-gradient
{
   
    function nodeColor(d) { 
        return d.color = color(d.name.replace(/ .*/, ""));
    }

    // create gradients for the links

    var grads = defs.selectAll("linearGradient")
            .data(graph.links, getGradID)
            .enter().append("linearGradient")
            .attr("id", getGradID)
            .attr("gradientUnits", "userSpaceOnUse");


    grads.attr("x1", function(d){return d.source.x0;})
        .attr("y1", function(d){return d.source.y0;})
        .attr("x2", function(d){return d.target.x0;})
        .attr("y2", function(d){return d.target.y0;});



    grads.html("") //erase any existing <stop> elements on update
        .append("stop") //stop from start end
        .attr("offset", "0%")
        .attr("stop-color", function(d){
            return nodeColor( (+d.source.x0 <= +d.target.x0)? 
                            d.source: d.target) ;
        });

    grads.append("stop") // //stop from end end
        .attr("offset", "100%")
        .attr("stop-color", function(d){
            return nodeColor( (+d.source.x0 > +d.target.x0)? 
                            d.source: d.target);
        });

}
function drawSankey(choice) // function to draw initial sankey chart
{
   
    var sankey = d3.sankey() // sankey function
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg g");
    var path = sankey.links(); //path function
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data) {

        //set up graph in same style as original example but empty
        sankeydata = processData(data); //process data to be suitable for sankey diagram
        graph = sankey(sankeydata);
        var defs = svg.append("defs");
        creatGradient(defs,graph,color);
     
      // add in the links
        var link = svg.append("g").attr("class","link-path")
                        .selectAll(".link") 
                        .data(graph.links)
                        .enter().append("path")
                        .attr("class", "link")
                        .attr("d", d3.sankeyLinkHorizontal())
                        .style("opacity", 3.5)
                        .attr("stroke-width", function(d) { return d.width; })
                        .style("stroke", function(d) { 
                            return "url(#" + getGradID(d) + ")"; //linear-gradient
                        })  
        
        // add the link titles
        link.append("title")
            .text(function(d) {
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        
        // add in the nodes
        var node = svg.append("g") .attr("class","node-path")
                        .selectAll(".node")
                        .data(graph.nodes)
                        .enter().append("g")
                        .attr("class", "node")
                        .on('click', function(e,d){
                            focusCountry(d.name,choice); //focus on a specific node for more detail when it gets clicked
                        });
        
        // add the rectangles for the nodes
        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                    return d.color = color(d.name.replace(/ .*/, "")); 
                })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); 
            
            })
        
        node.append("title") //append title for each node
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // add the title for the nodes
        node.append("text")
            .attr("x", function(d) { return d.x0 +25; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; }) //nodes that are source nodes
            .attr("x", function(d) { return -95; });//move it to the left
      });
}

function processData(data) //to process input data to be suitable for sankey chart
{
    sankeydata = {"nodes" : [], "links" : []};
      
    data.forEach(function (d) {
        var value = parseInt(d.value);
        if(value >0) //abort any link that is negative
        {
            sankeydata.nodes.push({ "name": d.source });
            sankeydata.nodes.push({ "name": d.target });
            sankeydata.links.push({ "source": d.source,
                                "target": d.target,
                                "value": +d.value });    
        }
        });
    
    // return only the distinct / unique nodes
    sankeydata.nodes = Array.from(
        d3.group(sankeydata.nodes, d => d.name),
        ([value]) => (value)
    );
    
    // loop through each link replacing the text with its index from node
    sankeydata.links.forEach(function (d, i) {
        sankeydata.links[i].source = sankeydata.nodes
        .indexOf(sankeydata.links[i].source);
        sankeydata.links[i].target = sankeydata.nodes
        .indexOf(sankeydata.links[i].target);
    });
    
    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeydata.nodes.forEach(function (d, i) {
        sankeydata.nodes[i] = { "name": d };
    });
    return sankeydata;
}

function sortCountry(data,country) //get data just for a specific node
{
    sankeydata = {"nodes" : [], "links" : []};
    data.forEach(function (d) {
       var value = parseInt(d.value);
       if(value >0) //abort any link that is negative
       {
        if(d.source == country)
        {
            sankeydata.nodes.push({ "name": d.source });
            sankeydata.nodes.push({ "name": d.target });
            sankeydata.links.push({ "source": d.source,
                                "target": d.target,
                                "value": +d.value });
        }
        else if(d.target == country)
        {
            sankeydata.nodes.push({ "name": d.source });
            sankeydata.nodes.push({ "name": d.target });
            sankeydata.links.push({ "source": d.source,
                                "target": d.target,
                                "value": +d.value });
        }
       }
       
        });
    
    // return only the distinct / unique nodes
    sankeydata.nodes = Array.from(
        d3.group(sankeydata.nodes, d => d.name),
        ([value]) => (value)
    );
    
    // loop through each link replacing the text with its index from node
    sankeydata.links.forEach(function (d, i) {
        sankeydata.links[i].source = sankeydata.nodes
        .indexOf(sankeydata.links[i].source);
        sankeydata.links[i].target = sankeydata.nodes
        .indexOf(sankeydata.links[i].target);
    });
    
    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeydata.nodes.forEach(function (d, i) {
        sankeydata.nodes[i] = { "name": d };
    });
    return sankeydata;
}

function updateSankey(choice){ //update sankey based on one of the 3 periods
    var sankey = d3.sankey()
                    .nodeWidth(20)
                    .nodePadding(20)
                    .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg g");
    svg.selectAll("defs").remove(); //remove all old def for linear-gradient

    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data){
        sankeydata = processData(data);
        graph = sankey(sankeydata);

        var defs = svg.append("defs"); //create new linear-gradient
        creatGradient(defs,graph,color)

        // add in the links
        var link = svg.selectAll("g .link")
            .data(graph.links)
            .transition()       
            .ease(d3.easePoly)
            .duration(1000)
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke", function(d) { 
                return "url(#" + getGradID(d) + ")";
            })  
            .style("opacity", 3.5)
            .attr("stroke-width", function(d) { return d.width; });  
        
        // add the link titles
        link.select("title")
            .text(function(d) {
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        
        // add in the nodes
        var node = svg.selectAll("g .node")
            .data(graph.nodes)
            .on('click', function(e,d){
                focusCountry(d.name,choice); //focus on a specific country when it gets clicked
            });
       
        
        // add the rectangles for the nodes
        node.select("rect")
            .transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                    return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); });
        
        node.select("title") // add in the title for the nodes
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // append name of the node
        node.select("text")
            .transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("x", function(d) { return d.x0 +25; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; }) //nodes that are the source nodes
            .attr("x", function(d) { return -95; }) //move it to the left 

    })
}


function focusCountry(country,choice){ //focus on a specific node
    var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg g");
    svg.selectAll("defs").remove(); //remove all old defs for linear-gradient
    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data){
        sankeydata = sortCountry(data,country);
        graph = sankey(sankeydata);

        var defs = svg.append("defs"); //create new linear-gradient color
        creatGradient(defs,graph,color)

        var link = svg.selectAll("g .link") //remove abundant links
                        .data(graph.links);
        link.exit() 
            .remove();

        var node = svg.selectAll("g .node") //remove abundant nodes
                        .data(graph.nodes);
        node.exit()
            .remove();

       
        link.transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke", function(d) { 
                return "url(#" + getGradID(d) + ")"; //gradient color
            })  
            .style("opacity", 3.5)
            .attr("stroke-width", function(d) { return d.width; });  
        
        // add the link titles
        link.select("title")
            .data(graph.links)
            .text(function(d) {
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        // add the rectangles for the nodes
        node.select("rect")
            .transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                    return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); });
        
        node.select("title") //add titles for nodes
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // add names for the nodes
        node.select("text")
            .transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("x", function(d) { return d.x0 +25; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; })//nodes that are the source nodes
            .attr("x", function(d) { return -95; }) //move it to the left
        var node = svg.selectAll("g .node")
                    .data(graph.nodes)
                    .on('click', function(e,d){
                        restore(choice); //when a specific node is focused, if it gets clicked, the chart to return to the normal state which has all nodes
                    });
    })
}

function restore(choice)
{
    var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);

    var svg = d3.select(".sankey-chart svg .t");
    svg.selectAll("defs").remove(); //remove all old defs for linear-gradient 

    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data){
        sankeydata = processData(data);
        graph = sankey(sankeydata);
        var defs = svg.append("defs"); //create new defs for gradient color
        creatGradient(defs,graph,color)

        linkPath = svg.select(".link-path");
        var link = linkPath.selectAll(".link")
                        .data(graph.links);
        link.enter() //append links that were removed while being focus
            .append("path")
            .attr("class", "link")
            .merge(link)
            .transition()      
            .ease(d3.easePoly)
            .duration(1000)
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke", function(d) { 
                return "url(#" + getGradID(d) + ")";
            })  
            .style("opacity", 3.5)
            .attr("stroke-width", function(d) { return d.width; });  

        link.selectAll("title") // remove old titles
            .remove();
        link = linkPath.selectAll(".link") //append new titles
            .data(graph.links);
        link.append("title")     
            .text(function(d) {
                    
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        
        nodePath = d3.select(".node-path");
        var node = nodePath.selectAll(".node")
                            .data(graph.nodes);

        node.enter() //append nodes that were removed while being focus
            .append("g")
            .attr("class", "node")
            .merge(node);
        
        node.selectAll("rect") //remove old elements
            .remove();
        node.selectAll("text")
            .remove();
        node.selectAll("title")
            .remove();

        node = nodePath.selectAll(".node")
                        .data(graph.nodes)
                        .on('click', function(e,d){
                            focusCountry(d.name,choice); //focus on a specific node when it gets clicked
                        });
       
                        
        
        node.append("rect") //append new rect
            .transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                    return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); });
        
       
            
        node.append("title") //append new titles
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // add names for the nodes
        node.append("text")
            .attr("x", function(d) { return d.x0 +25; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; }) //filter source nodes
            .attr("x", function(d) { return -95; })//move it to the left

    })


}