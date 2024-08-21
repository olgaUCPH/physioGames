let allLabels = document.querySelectorAll('.label');
const checkButton = document.getElementById('checkButton');
const gridContainer = document.getElementById('gridContainer');
const body = document.body;
const arrowInstruction = document.getElementById("arrowInstruction");

let arrows = [];
let connections = [];
let buttons = [];
let buttonsUpdate = [];

let connectionsVerif = [[["lab00", "lab01"], ["lab01", "lab02"]]];
connectionsVerif.push([["lab00", "lab10"], ["lab00", "lab14"], ["lab10", "lab11"], ["lab10", "lab12"], ["lab10", "lab13"], ["lab11", "lab01"], ["lab13", "lab16"], ["lab12", "lab15"], ["lab14", "lab15"], ["lab14", "lab17"], ["lab15", "lab16"], ["lab16", "lab01"], ["lab17", "lab01"], ["lab01", "lab02"]]);
connectionsVerif.push([["lab00", "lab01"], ["lab01", "lab20"], ["lab20", "lab21"], ["lab20", "lab22"], ["lab20", "lab23"], ["lab21", "lab23"], ["lab22", "lab24"], ["lab23", "lab24"], ["lab24", "lab02"], ["lab20", "lab25"], ["lab25", "lab26"], ["lab26", "lab02"]]);

let level = 0;
let maxLevel = 0;
let themeId = 0;

let arrowMode = false;

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

document.addEventListener("DOMContentLoaded", function() {
  highScore = localStorage.getItem('RAAS2_highScore') || 0;
  themeId = parseInt(localStorage.getItem('themeId')) || 0;
  setColor(themeId);
  document.getElementById('highScore').textContent = highScore;
});


/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////

var userX = 0;
var userY = 0;

let lastTrigger = 0;

let lastCreation = Date.now();

function removeAllEventListeners(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}

allLabels.forEach(label => {
  label.onmousedown = dragFunction(label);
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
  label.addEventListener("click", arrowCandidateFunction(label));
})

function dragFunction(element){
    return function(event){
      if (arrowMode){
        return 0;
      }
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;
    const parent = element.parentNode;
    if (parent != body){parent.style.zIndex = 0};
    document.body.appendChild(element);
    element.style.pointerEvents = "none";
    element.style.position = "fixed";
    element.style.zIndex = 5;
    moveAt(userX, userY);
    const startTime = Date.now();
  
    function moveAt(pageX, pageY) {
      element.style.left = pageX - shiftX + 'px';
      element.style.top = pageY - shiftY + 'px';
      if (arrows.length > 0) {
        arrows.forEach(line => {
          let A = line.start;
          let B = line.end;
          line.path =  d(A,B) < 1.5*A.getBoundingClientRect().width ? "straight" : "fluid";
          line.position()});
        buttonsUpdate.forEach(f => f());
      }
    }
  
    function onMouseMove(event) {
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      moveAt(userX, userY);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
  
    function onMouseUp(event) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend',onMouseUp);
      if (Date.now() - lastTrigger > 0){
        body.appendChild(element);
        let boolean = true;
        lastTrigger = Date.now();
        element.style.pointerEvents = "auto";
        element.onmouseup = null;
        if (element.getBoundingClientRect().left < gridContainer.getBoundingClientRect().left){
          element.style.left = gridContainer.getBoundingClientRect().left + "px";
        }
        if (element.getBoundingClientRect().top < gridContainer.getBoundingClientRect().top){
          element.style.top = gridContainer.getBoundingClientRect().top + "px";
        }
        if (element.getBoundingClientRect().right > gridContainer.getBoundingClientRect().right){
          element.style.left = element.getBoundingClientRect().left - (element.getBoundingClientRect().right - gridContainer.getBoundingClientRect().right + 50) + "px";
        }
        if (element.getBoundingClientRect().bottom > gridContainer.getBoundingClientRect().bottom){
          element.style.top = element.getBoundingClientRect().top - (element.getBoundingClientRect().bottom - gridContainer.getBoundingClientRect().bottom + 50) + "px";
        }
        if (arrows.length > 0) {
          arrows.forEach(line => {
            let A = line.start;
            let B = line.end;
            line.path =  d(A,B) < 1.5*A.getBoundingClientRect().width ? "straight" : "fluid";
            line.position()});
          buttonsUpdate.forEach(f => f());
        }
      }
      }
      }
  }

/// ARROW MODE /////////////////////////////////////////////////////////////////////////////////////

const newArrow = document.getElementById('newArrow');
newArrow.addEventListener("click",startArrowMode);

const trashButton = document.getElementById("trashButton");
trashButton.addEventListener("click",clickTrash);

document.getElementById("newArrowLabel").style.opacity = 0.9;

document.getElementById("arrowWrap").style.animation = "highlight 2s ease-in-out 0s infinite";

function startArrowMode(){
  let label = document.getElementById("newArrowLabel");
  if(label.style.opacity == 0.9){label.style.opacity = ""};
  label.textContent = "Leave arrow mode";
  document.getElementById("arrowWrap").style.animation = "";
  arrowMode = true;
  newArrow.removeEventListener("click", startArrowMode);
  newArrow.addEventListener("click",endArrowMode);
  document.getElementById("AMOverlay").style.display = "block";
  document.getElementById("BMOverlay").style.display = "none";
}

let arrowStart = "none";
arrowInstruction.textContent = "← Select arrow starting point →";

function arrowCandidateFunction(element){
  return function () {
    if (!arrowMode){
      return 0;
    }
    if (arrowStart == "none"){
      arrowStart = element;
      arrowStart.classList.add("selected");
      arrowInstruction.textContent = "→ Select arrow end point ←";
    }
    else{
      if (!contains(connections,[arrowStart.id, element.id]) && arrowStart != element){
        createArrow(arrowStart, element);
      }
      arrowStart.classList.remove("selected");
      arrowStart = "none";
      arrowInstruction.textContent = "← Select arrow starting point →";
    }
  }
}

function contains(a,x){
  for (let i = 0; i < a.length; i++){
    if (a[i][0] == x[0] && a[i][1] == x[1]){
      return true;
    }
  }
  return false;
}

function d(A,B){
  return Math.sqrt(Math.pow(A.getBoundingClientRect().left - B.getBoundingClientRect().left,2) + Math.pow(A.getBoundingClientRect().top - B.getBoundingClientRect().top,2));
}

let firstTime = true;

async function createArrow(A,B){
  path =  d(A,B) < 1.5*A.getBoundingClientRect().width ? "straight" : "fluid";
  var line =  new LeaderLine(A,B,{color:"var(--pseudo-black)", size: 5, hide: true, path: path});
  line.show("draw", {duration: 500});
  arrows.push(line);
  let connector = [A.id, B.id];
  connections.push(connector);
  let i = arrows.length - 1;
  await delay(510);
  buttons.push(deleteButton(line, connector));
  if (firstTime){
    firstTime = false;
    document.getElementById("trashButtonLabel").style.opacity = 0.9;
  }
}


function endArrowMode(){
  document.getElementById("newArrowLabel").textContent = "Enter arrow mode";
  arrowMode = false;
  newArrow.removeEventListener("click", endArrowMode);
  newArrow.addEventListener("click", startArrowMode);
  document.getElementById("AMOverlay").style.display = "none";
  document.getElementById("BMOverlay").style.display = "block";
  if (arrowStart != "none") {arrowStart.classList.remove("selected");}
  arrowStart = "none";
  arrowInstruction.textContent = "← Select arrow starting point →";
}

function clickTrash(){
  document.querySelectorAll('.deleteElement').forEach(element => {element.style.display = (trashButton.style.opacity == 1) ? "none" : "block";});
  document.getElementById("trashButtonLabel").textContent = (trashButton.style.opacity == 1) ? "Show removal buttons" : "Hide removal buttons";
  trashButton.style.opacity = (trashButton.style.opacity == 1) ? 0.5 : 1;
  buttonsUpdate.forEach(f => f());
  if(document.getElementById("trashButtonLabel").style.opacity == 0.9){document.getElementById("trashButtonLabel").style.opacity = ""};
}

function deleteButton(line, connector){
  line.middleLabel = LeaderLine.captionLabel("X");
  let cap = document.querySelector('text:not(.deleteElement)');
  let x = parseFloat(cap.getBoundingClientRect().left) + parseFloat(cap.getBoundingClientRect().width)/2;
  let y = parseFloat(cap.getBoundingClientRect().top) + parseFloat(cap.getBoundingClientRect().height)/2;
  let box = document.createElement("div");
  box.classList.add('deleteButton');
  box.style.position = "absolute";
  box.style.left = (x-10)+'px';
  box.style.top = (y-10)+'px';
  box.style.width = 20+'px';
  box.style.height = 20+'px';
  document.body.appendChild(box);
  cap.classList.add('deleteElement');
  box.classList.add('deleteElement');
  document.querySelectorAll('.deleteElement').forEach(element => {element.style.display = (trashButton.style.opacity == 1) ? "block" : "none";});
  let uf = updateFunction(box, cap);
  buttonsUpdate.push(uf);
  box.addEventListener("click",function (){
    line.hide("draw", {duration: 500});
    buttons.splice(buttons.indexOf(box),1);
    box.remove();
    arrows.splice(arrows.indexOf(line),1);
    connections.splice(connections.indexOf(connector),1);
    buttonsUpdate.splice(buttonsUpdate.indexOf(uf),1);
  });
  box.addEventListener("hover", function (){
    line.outlineColor = "white";
  })
  return box;
  
}

function updateFunction(box, cap){
  return function(){
    let x = parseFloat(cap.getBoundingClientRect().left) + parseFloat(cap.getBoundingClientRect().width)/2;
    let y = parseFloat(cap.getBoundingClientRect().top) + parseFloat(cap.getBoundingClientRect().height)/2;
    box.style.left = (x-10)+'px';
    box.style.top = (y-10)+'px';
  }
}

/// ADDING TRANSPORTERS TO RECTANGLES //////////////////////////////////////////////////////////////

let counter = 0;

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

checkButton.addEventListener('click',verifyGrid);

let attempt = 0;
let currentScore = 0;
let highScore = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let wrongConnections = 0;
let missingConnections = 0;
let correctConnections = 0;
let totalCorrect = 0;

async function verifyGrid() {
  attempt += 1;
  let allGood = true;
  connections.forEach((connector,i) => {
    if (contains(connectionsVerif[level], connector)){
      if (buttons[i].classList.contains('deleteElement')){
        correctConnections += 1;
        arrows[i].middleLabel.remove();
      }
      buttons[i].classList.remove("deleteElement");
      buttons[i].style.display = 'none';
      arrows[i].color = "darkgreen";
    }
    else{
      allGood = false;
      arrows[i].color = "maroon";
      wrongConnections += 1;
    }
  })
  connectionsVerif[level].forEach((connector,i) => {
    if (!contains(connections, connector)){
      missingConnections += 1;
      allGood = false;
    }
  })
  currentScore += correctConnections * (attempt == 1 ? 10 : attempt == 2 ? 5 : 1);
  currentScore -= wrongConnections * (attempt == 1 ? 1: attempt == 2 ? 2 : 3);
  currentScore -= missingConnections * (attempt == 1 ? 1: attempt == 2 ? 2 : 3);
  totalCorrect += correctConnections;
  document.getElementById('currentScore').textContent = highScore;
  if (currentScore > highScore){
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;
    localStorage.setItem('RAAS2_highScore',highScore);
  }
  if (allGood){
    attempt = 0;
    if (level < 2){
      congratulations();
      nextButton.style.animation = "shake 2s ease-in-out 0s infinite";
      nextButton.style.scale = 1.5;
      nextButton.addEventListener('click',nextLevel);
      nextButton.classList.add("activeNext");
      nextButton.style.opacity = 1;
      document.querySelectorAll(".lvl"+level.toString()).forEach(div => div.classList.remove("hideColors"));
      document.getElementById("lab00").classList.remove("hideColors");
      document.getElementById("lab01").classList.remove("hideColors");
      document.getElementById("lab02").classList.remove("hideColors");
    }
    else{
      gameOver();
    }
  }
  else {
    keepTrying();
  }
  wrongConnections = 0;
  correctConnections = 0;
  missingConnections = 0;
}



/// LEVELS ////////////////////////////////////////////////////////////////////////////////

function congratulations(){
  const cong = document.getElementById("congratulations");
  cong.addEventListener('animationend', function () {cong.style.display = "none";})
  void cong.offsetWidth;
  cong.style.display = "flex";
}

function keepTrying(){
  const kT = document.getElementById("keepTryingWindow");
  kT.addEventListener('animationend', function () {kT.style.display = "none";})
  void kT.offsetWidth;
  document.getElementById('correct').textContent = totalCorrect;
  document.getElementById('wrong').textContent = wrongConnections;
  document.getElementById('missing').textContent = missingConnections;
  document.getElementById('connector').textContent = (wrongConnections * missingConnections == 0) ? " but " : " and ";
  document.getElementById('wrongGrammar').textContent = wrongConnections == 1 ? " connection is " : " connections are ";
  document.getElementById('missingGrammar').textContent = missingConnections == 1 ? " connection is " : " connections are ";
  kT.style.display = "flex";
}

function gameOver(){
  const goWindow = document.getElementById("gameOverWindow");
  document.getElementById('gameOverScore').textContent = ' '+currentScore+' ';
  document.getElementById('gameOverPercent').textContent = ' '+Math.round(currentScore/280*100)+' ';
  goWindow.addEventListener('animationend', function () {goWindow.style.display = "none";});
  goWindow.style.display = "flex";
}



/// SIDE BAR ///////////////////////////////////////////////////////////////////////////

const nextButton = document.getElementById('nextLevelButton');

async function nextLevel(){
  nextButton.style.animation = '';
  nextButton.style.scale = '';
  nextButton.removeEventListener("click", nextLevel);
  nextButton.style.opacity = '';
  buttons.forEach(button => button.remove());
  arrows.forEach(line => line.hide());
  await delay(500);
  arrows.forEach(line => line.remove());
  document.querySelectorAll(".lvl"+level.toString()).forEach(div => div.style.display = "none");
  document.getElementById("lvl"+level.toString()+"title").classList.remove("currentLvl");
  document.getElementById("lvl"+level.toString()+"title").classList.add("otherLvl");
  level++;
  document.getElementById("lvl"+level.toString()+"title").classList.add("currentLvl");
  document.getElementById("lvl"+level.toString()+"title").classList.remove("otherLvl");
  document.querySelectorAll(".lvl"+level.toString()).forEach(div => div.style.display = "flex");
  arrows = [];
  connections = [];
  buttons = [];
  buttonsUpdate = [];
  attempt = 0;
  nextButton.removeEventListener('click', nextLevel);
  //loadLevel(level + 1);
  nextButton.classList.remove("activeNext");
}

/// COLOR THEMES //////////////////////////////////////////////////////////////////////////
let background     = ["#141e46","#D6E5FA","#1E0342","#92817A","#343A40","#5F8670","#4D2DB7","#3A4D39","#A3D8FF","#DCD6F7"];
let pseudoBlack    = ["#141e46","#141e46","#1E0342","#505050","#343A40","#202020","#0E21A0","#3A4D39","#7952B3","#424874"];
let deepHighlight  = ["#C70039","#D77FA1","#0E46A3","#8DB596","#7952B3","#820300","#9D44C0","#4F6F52","#FF76CE","#424874"];
let lightHighlight = ["#FF7979","#E6B2C6","#9AC8CD","#BEDBBB","#FFC107","#B80000","#EC53B0","#739072","#94FFD8","#A6B1E1"];
let pseudoWhite    = ["#FFF5E0","#FEF6FB","#E1F7F5","#FFF5E0","#E1E8EB","#FF9800","#FFF5E0","#ECE3CE","#FDFFC2","#F4EEFF"];



document.getElementById('colorButton').onclick = colorChange;

const root = document.documentElement;
function colorChange(){
  themeId = (themeId+1)%background.length;
  localStorage.setItem('themeId',themeId);
  setColor(themeId);
}

function setColor(id){
  root.style.setProperty('--background', background[id]);
  root.style.setProperty('--pseudo-black', pseudoBlack[id]);
  root.style.setProperty('--pseudo-white', pseudoWhite[id]);
  root.style.setProperty('--deep-highlight', deepHighlight[id]);
  root.style.setProperty('--light-highlight', lightHighlight[id]);
}

