const allRectangles = document.querySelectorAll('.rectangle');
let allLabels = document.querySelectorAll('.label');
const checkButton = document.getElementById('checkButton');
const gridContainer = document.getElementById('gridContainer');
const body = document.body;


let arrows = [];
let connections = [];
let buttons = [];
let buttonsUpdate = [];

let connectionsVerif = [["lab00", "lab01"], ["lab01", "lab02"]];

let level = 0;
let maxLevel = 0;
let gridRectangles = document.querySelectorAll('.rectangle.lvl'+level.toString());
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

function display(text){
  document.getElementById('currentScore').textContent = text;
}

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
    document.body.appendChild(element);
    element.style.pointerEvents = "none";
    element.style.position = "fixed";
    element.style.zIndex = 1000;
    console
    moveAt(userX, userY);
    const startTime = Date.now();
  
    function moveAt(pageX, pageY) {
      element.style.left = pageX - shiftX + 'px';
      element.style.top = pageY - shiftY + 'px';
      if (arrows.length > 0) {
        arrows.forEach(line => line.position());
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
        parent.appendChild(element);
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
      }
      }
      }
  }

/// ARROW MODE /////////////////////////////////////////////////////////////////////////////////////

const newArrow = document.getElementById('newArrow');
newArrow.addEventListener("click",startArrowMode);

const trashButton = document.getElementById("trashButton");
trashButton.addEventListener("click",clickTrash);

function startArrowMode(){
  arrowMode = true;
  newArrow.removeEventListener("click", startArrowMode);
  newArrow.addEventListener("click",endArrowMode);
  document.getElementById("AMOverlay").style.display = "block";
}

let arrowStart = "none";

function arrowCandidateFunction(element){
  return function () {
    if (!arrowMode){
      return 0;
    }
    if (arrowStart == "none"){
      arrowStart = element;
    }
    else{
      if (!contains(connections,[arrowStart.id, element.id]) && arrowStart != element){
        createArrow(arrowStart, element);
      }
      arrowStart = "none";
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

async function createArrow(A,B){
  var line =  new LeaderLine(A,B,{color:"var(--pseudo-black)", size: 5, hide: true});
  line.show("draw", {duration: 500});
  arrows.push(line);
  let connector = [A.id, B.id];
  connections.push(connector);
  console.log(connections);
  let i = arrows.length - 1;
  await delay(510);
  buttons.push(deleteButton(line, connector));
}


function endArrowMode(){
  arrowMode = false;
  newArrow.removeEventListener("click", endArrowMode);
  newArrow.addEventListener("click", startArrowMode);
  document.getElementById("AMOverlay").style.display = "none";
  arrowStart = "none";
}

function clickTrash(){
  document.querySelectorAll('.deleteElement').forEach(element => {element.style.display = (trashButton.style.opacity == 1) ? "none" : "block";});
  trashButton.style.opacity = (trashButton.style.opacity == 1) ? 0.5 : 1;
  buttonsUpdate.forEach(f => f());
}

function deleteButton(line, connector){
  console.log("Check");
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
    if (contains(connectionsVerif, connector)){
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
  connectionsVerif.forEach((connector,i) => {
    if (!contains(connections, connector)){
      missingConnections += 1;
      allGood = false;
    }
  })
  currentScore += correctConnections * (attempt == 1 ? 10 : attempt == 2 ? 5 : 1);
  currentScore -= wrongConnections * (attempt == 1 ? 1: attempt == 2 ? 2 : 3);
  currentScore -= missingConnections * (attempt == 1 ? 1: attempt == 2 ? 2 : 3);
  totalCorrect += correctConnections;
  display(currentScore);
  if (currentScore > highScore){
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;
    localStorage.setItem('RAAS2_highScore',highScore);
  }
  if (allGood){
    attempt = 0;
    congratulations();
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
  document.getElementById('gameOverPercent').textContent = ' '+Math.round(currentScore/180*100)+' ';
  goWindow.addEventListener('animationend', function () {goWindow.style.display = "none";});
  goWindow.style.display = "flex";
}



/// SIDE BAR ///////////////////////////////////////////////////////////////////////////

const previousButton = document.getElementById('previousLevelButton');
const nextButton = document.getElementById('nextLevelButton');


function previousLevel(){
  loadLevel(level - 1);
  previousButton.removeEventListener('click', previousLevel);
  previousButton.classList.remove("activePrevious");
}

function nextLevel(){
  nextButton.style.animation = '';
  nextButton.style.scale = '';
  nextButton.removeEventListener('click', nextLevel);
  loadLevel(level + 1);
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

