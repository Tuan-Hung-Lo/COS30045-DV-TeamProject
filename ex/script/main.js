function timelinePlay(){ //update when timeline is change
    playButton = document.querySelector(".play")
    if (playButton.classList.contains("bi-play-fill")) { //toggle the button
        playButton.classList.remove("bi-play-fill");
        playButton.classList.add("bi-pause-fill"); //change icon for play button 

        year = document.querySelector("#year");
        if (year.value == 2021) {
            year.value = 2004;
            document.querySelector("#yearLabel").innerText = year.value;
        }
        let loopTimeout = function(i, max, interval, func) {
            if (i > max) { // End Of Timeline
              playButton.classList.remove("bi-pause-fill");
              playButton.classList.add("bi-play-fill");
              return;
            }
      
            func(i); // Call Update Function
            i++; // Increment Control Variable
            setTimeout(function() { loopTimeout(i, max, interval, func) }, interval);
        };

        loopTimeout(parseInt(year.value), 2021, 1200, (yearVal) => {
            year.value = yearVal;
            firstChartUpdate();
          });
    } 
    else{
        playButton.classList.remove("bi-pause-fill");
        playButton.classList.add("bi-play-fill"); //change icon for play button 
        let timeoutIDs = setTimeout(function() {}, 0); //cancel all current running timeline
        while (timeoutIDs--) clearTimeout(timeoutIDs);
    }
}
function timelineUpdate(){
    yearLabel = document.querySelector("#yearLabel");
    yearLabel.innerText = document.querySelector("#year").value;
}
function firstChartUpdate(){ //update the choropleth
   
    method = document.querySelector('.select-map').value //get the method
    year = document.querySelector("#year"); //get the year selected
    mapTitle = document.querySelector(".title-map"); //update title
    if(method =="Arrivals")
    {
        mapTitle.innerText = `${method} to Australia in ${year.value}`;
    }
    else{
        mapTitle.innerText = `${method} from Australia in ${year.value}`;
    }
    drawMap( year.value,method); //re-draw the map
    focusBar();
    timelineUpdate();

}
function sankeyUpdate(choice){ //update sankey chart based on the choice button
    button = document.querySelector(`.sankey-${choice}`);
    if(!button.classList.contains("active")){ // only re-render the sankey chart if the button has not been selected
        buttons = document.querySelectorAll(".sankey-btn");
        buttons.forEach(function(d){ //de-active every other buttons
            d.classList.remove("active");
        })        
        updateSankey(choice); //re draw snakey chart
        button.classList.add("active"); //make the button active
    }
    title = document.querySelector(".title-sankey");
    year = "2016 to 2021";
    if(choice==1)
    {
        year = "2004 to 2009";
    }
    else if(choice == 2)
    {
        year = "2010 to 2015"
    }
    title.innerText = `Top 10 countries migration to Australia from ${year}`; //update title
    nodes =  document.querySelectorAll(`.node`);
    if(nodes.length == 9 || nodes.length == 11) // if the user is focusing on a specific nodes
    {
        restore(choice); //restore the whole graph
    }
}

function LineChartUpdate(){ //update the line chart when user select different state
    title = document.querySelector(".title-line");
    state = document.querySelector('.select-state').value; 
    title.innerText = `Total Arrivals to ${state} based on types of visa holders from 2004 to 2021`; //update the new title
    updateLine(state); //update the line chart
}

function init(){
    var selectState = document.querySelector('.select-state'); //add event lisenter to select dropdown of line chart
    selectState.onchange = (event) => {
        LineChartUpdate();
    }
    var selectMap = document.querySelector('.select-map');//add event lisenter to select dropdown of choropleth
    selectMap.onchange = (event) => {
        var inputText = event.target.value;
        var title = document.querySelector('.title-map');
        var year= document.querySelector("#year").value;
        if(inputText =="Arrival")
        {
            title.innerText = `${inputText}s to Australia in ${year}`;
        }
        else{
           
            title.innerText = `${inputText}s from Australia in ${year}`;
        }
        drawMap(`${year}`,inputText);
    }
    initializeMap();
    initiliazeLine();
    initialiseBar();
    initialiseSankey();
}
window.onload = init();