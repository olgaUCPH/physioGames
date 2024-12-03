function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


document.getElementById("moreGames").classList.add(document.querySelectorAll(".gameWrapper").length % 2 == 0 ? "moreGamesBig" : "moreGamesSmall");
document.getElementById("colorButton").removeEventListener("click", colorChange);
document.addEventListener("DOMContentLoaded", function() {
    let transP = parseInt(localStorage.getItem('trans_highScore1'))+parseInt(localStorage.getItem('trans_highScore2')) || 0;
    document.getElementById("transportersPercent").textContent = Math.round(transP/250*100)+"%";
    let RAAS1P = parseInt(localStorage.getItem('RAAS_highScore'))|| 0;
    document.getElementById("raasPercent").textContent = Math.round(RAAS1P/180*100)+"%";
    let RAAS2P = parseInt(localStorage.getItem('RAAS2_highScore'))|| 0;
    document.getElementById("raas2Percent").textContent = Math.round(RAAS2P/280*100)+"%";
    let Game3P = parseInt(localStorage.getItem('Game3_highScore'))|| 0;
    document.getElementById("game3Percent").textContent = Math.round(Game3P/180*100)+"%";
});

function resetScores(){
    localStorage.setItem("trans_highScore1", 0);
    localStorage.setItem("trans_highScore2", 0);
    localStorage.setItem("RAAS_highScore", 0);
    localStorage.setItem("RAAS2_highScore", 0);
    localStorage.setItem("Game3_highScore", 0);
    location.reload();
}

/// OSMOLARITY ANIMATION ///////////////////////////////////////////////////////////////////////////////

const canvas = document.getElementById("fullGraph");                        //Where the curve should be drawn
let cPcoords = [];                                                          //Array containing coordinates of all control points
let cP = Array.from(document.querySelectorAll('.controlPoint'));            //Points controlled by the user to define the curve
let curve = document.createElementNS("http://www.w3.org/2000/svg", 'svg');  //Create curve for further modification
let graph = document.getElementById('fullGraph');

function getPosition(element){                                              //Gets the X/Y position of an element relative to the canvas
    let rec = element.getBoundingClientRect();
    let x = rec.left + rec.width/2 - canvas.getBoundingClientRect().left;   //Get X position of center of element
    let y = rec.top + rec.height/2 - canvas.getBoundingClientRect().top;    //Get Y position of center of element
    return [x,y];
}

function getPoints(){                                                       //Gets X/Y coordinates of all the control points
    cPcoords = [];                                                          
    cP.forEach(point => cPcoords.push(getPosition(point)));
}

const svgPath = (points, color) => {                                               //Writes the svg path from given point coordinates
    const d = points.reduce((acc, point, i, a) => 
      i == 0 ? `M ${point[0]},${point[1]}` :                                //If first element, simply move there
      `${acc} ${bezierCommand(point, i, a)}`                              //Otherwise, write the accumulated string & the next bezier control point
    , '')
    return `<path d="${d}" fill="none" stroke="${color}" />`     
  }

const line = (pointA, pointB) => {                                          //Compute a line between two given points
    const lengthX = pointB[0] - pointA[0]                                   //X length
    const lengthY = pointB[1] - pointA[1]                                   //Y length
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),       //Total length
      angle: Math.atan2(lengthY, lengthX)                                   //Angle
    }
}

const controlPoint = (current, previous, next, reverse) => {                
    //Computes the bezier control point to be used to join smoothly previous, current and next point using bezier burves
    //Code inspired by https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
    const p = previous || current                                           //For first control point, previous does not exist
    const n = next || current                                               //For last control point, next does not exist
    const smoothing = 0.15                                                  //Working value: 0 is linear, 1 is weird
    const o = line(p, n)                                                    //Properties of the opposed line
    const angle = o.angle + (reverse ? Math.PI : 0)                         //If current is last point, add pi to reverse angle
    const length = o.length * smoothing                                     //Smooth
    const x = current[0] + Math.cos(angle) * length                         //Compute control point x position
    const y = current[1] + Math.sin(angle) * length                         //Compute control point y position
    return [x, y]
  }  

const bezierCommand = (point, i, a) => {                                    //Generate two bezier control point to join to next point
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point)            //Start control point
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true)      //End control point
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`  
  }

function initializeCurve(){
    let canvasW = canvas.getBoundingClientRect().width;                     //Canvas width, for curve scaling
    let canvasH = canvas.getBoundingClientRect().height;                    //Canvas height, for curve scaling
    getPoints();                                                            //Compute initial point coordinates
    curve.id = "curve";                                                     //Style curve
    curve.setAttribute("width", canvasW);                                   //Set to canvas width for correct scaling
    curve.setAttribute("height", canvasH);                                  //Set to canvas height for correct scaling
    curve.innerHTML = svgPath(cPcoords, "var(--pseudo-black)");             //Draw path using bezier curves; interpolate(cPcoords,200)
    canvas.appendChild(curve);                                              //Display on webpage
}

function updateCurve(){                                                     //Redraw curve when moving control points
    getPoints();                                                            //Calculate coordinates
    curve.innerHTML = svgPath(cPcoords,"var(--light-highlight)");           //Update curve; interpolate(cPcoords,200)
}

initializeCurve();

let Oanimation = true;
let OstartTime = 0;

function animate_function(time){                                          //Animate curve: a sin wave with delay between each wave
    const elapsed = time -  OstartTime;
    const period = 2500;
    return -Math.sin(2*3.1415*elapsed/period);
  }

async function animate_O(){                                              //Animate movement of one of the points with a sinusoid
    cP[1].style.top = cP[0].getBoundingClientRect().top - graph.getBoundingClientRect().top + 20*animate_function(Date.now())+'px';
    updateCurve();                                                       //Redraw curve
    await delay(15);
    if (Oanimation){animate_O();}                                             //Loop until disabled
    else{cP[1].style.top = ""; initializeCurve();}
  }

document.getElementById("oWrapper").addEventListener("mouseenter", ()=>{OstartTime = Date.now(); Oanimation = true; animate_O();})
document.getElementById("oWrapper").addEventListener("mouseleave", ()=>{Oanimation = false;})

/// CROSSWORDS ANIMATION ///////////////////////////////////////////////////////////////////////////////

let cWcells = document.querySelectorAll('.cwCell:not(.hidden)');
let cWanimate = true;

let word1 = [cWcells[0],cWcells[1],cWcells[2],cWcells[7],cWcells[8],cWcells[9]];
let word2 = [cWcells[3],cWcells[4],cWcells[5],cWcells[6],cWcells[7]];
letters = ["P", "H", "Y", "S", "I", "O", "G", "A", "M", "E", "S"];
document.getElementById("cwWrapper").addEventListener("mouseenter",async function () {
    let i = 0;
    cWanimate = true;
    cWcells.forEach(c => c.style.backgroundColor = "var(--pseudo-white)");
    for (const cell of word1){
        if (!cWanimate){break;}
        word2.forEach(c => c.style.backgroundColor = "var(--pseudo-white)");
        word1.forEach(c => c.style.backgroundColor = "var(--light-highlight)");
        cell.style.backgroundColor = "var(--deep-highlight)";
        cell.style.color = "var(--pseudo-white)";
        cell.textContent = letters[i];
        i += 1;
        await delay(250);
        cell.style.backgroundColor = "var(--light-highlight)";
        cell.style.color = "var(--pseudo-black)";
    }
    if (!cWanimate){return 0};
    cWcells[9].style.backgroundColor = "var(--deep-highlight)";
    cWcells[9].style.color = "var(--pseudo-white)";
    await(delay(500));
    cWcells[9].style.backgroundColor = "var(--pseudo-white)";
    cWcells[9].style.color = "var(--pseudo-black)";
    if (!cWanimate){return 0};
    for (const cell of word2){
        if (!cWanimate){break;}
        word1.forEach(c => c.style.backgroundColor = "var(--pseudo-white)");
        word2.forEach(c => c.style.backgroundColor = "var(--light-highlight)");
        cell.style.backgroundColor = "var(--deep-highlight)";
        cell.style.color = "var(--pseudo-white)";
        cell.textContent = letters[i];
        i += 1;
        await delay(250);
        cell.style.backgroundColor = "var(--light-highlight)";
        cell.style.color = "var(--pseudo-black)";
    }
    if (!cWanimate){return 0};
    cWcells[7].style.backgroundColor = "var(--deep-highlight)";
    cWcells[7].style.color = "var(--pseudo-white)";
    await(delay(500));
    word2.forEach(c => c.style.backgroundColor = "var(--pseudo-white)");
    cWcells[7].style.backgroundColor = "var(--pseudo-white)";
    cWcells[7].style.color = "var(--pseudo-black)";
    if (!cWanimate){return 0};
})

document.getElementById("cwWrapper").addEventListener("mouseleave", async function() {
    cWanimate = false;
    cWcells.forEach(cell =>{
        cell.style.cssText = "";
        cell.textContent = "";
    })
    await delay(300);
    if (!cWanimate){
        cWcells.forEach(cell =>{
            cell.style.cssText = "";
            cell.textContent = "";
        })
    }
})