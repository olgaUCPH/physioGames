const allRectangles = document.querySelectorAll('.rectangle');
let allLabels = document.querySelectorAll('.label');
const checkButton = document.getElementById('checkButton');
const gridContainer = document.getElementById('gridContainer');
const body = document.body;


let arrows = [];

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
  highScore = localStorage.getItem('RAAS_highScore') || 0;
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
      if (arrows.length > 0) {arrows.forEach(line => line.position());}
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
      if (Date.now() - lastTrigger > 10){
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
      createArrow(arrowStart, element);
      arrowStart = "none";
    }
  }
}

async function createArrow(A,B){
  var line =  new LeaderLine(A,B,{color:"var(--pseudo-black)", hide:true, size: 5});
  line.show("draw", {duration: 500});
  arrows.push(line);
  delay(500);
  let svgArrow = document.querySelector(".leader-line:last-of-type");
  svgArrow.addEventListener('dblclick',async function (){line.hide("draw", {duration: 500})});
}



function endArrowMode(){
  arrowMode = false;
  newArrow.removeEventListener("click", endArrowMode);
  newArrow.addEventListener("click", startArrowMode);
  document.getElementById("AMOverlay").style.display = "none";
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

async function verifyGrid() {
  attempt += 1;
  let allGood = true;
  gridRectangles.forEach((rectangle,i) => {
    if (rectangle.children.length == 0){
      rectangle.style.animation = '';
      void rectangle.offsetWidth;
      rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
      allGood = false;
    }
    else{
      if (rectangle.firstChild.id == "lab"+level.toString()+i.toString()){
        removeAllEventListeners(rectangle.firstChild);
        if (!rectangle.firstChild.classList.contains('correctRectangle')){
          currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1));
          rectangle.firstChild.classList.add('correctRectangle');
          rectangle.firstChild.classList.remove('hideColors');
        }
      }
      else{
        rectangle.style.animation = '';
        rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
        
        allGood = false;
      }
    }
  });
  display(currentScore);
  if (currentScore > highScore){
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;
    localStorage.setItem('RAAS_highScore',highScore);
  }
  if (allGood){
    attempt = 0;
    maxLevel = Math.min(level+1, 2);
    if (level < 2){
      congratulations();
      nextButton.style.animation = "shake 2s ease-in-out 0s infinite";
      nextButton.style.scale = 1.5;
      nextButton.addEventListener('click',nextLevel);
      nextButton.classList.add("activeNext");
    }
    else{
      gameOver();
    }
  }
}



/// LEVELS ////////////////////////////////////////////////////////////////////////////////

function congratulations(){
  const cong = document.getElementById("congratulations");
  cong.addEventListener('animationend', function () {cong.style.display = "none";})
  void cong.offsetWidth;
  cong.style.display = "flex";
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

