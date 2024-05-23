const allRectangles = document.querySelectorAll('.rectangle');
const allLabels = document.querySelectorAll('.label');
const checkButton = document.getElementById('checkButton');
const body = document.body;
const arsenal = document.getElementById('arsenalContainer');

let level = 0;
let gridRectangles = document.querySelectorAll('.rectangle.lvl'+level.toString());


function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

document.addEventListener("DOMContentLoaded", function() {
  highScore1 = localStorage.getItem('highScore1') || 0;
  highScore2 = localStorage.getItem('highScore2') || 0;
  highScore = highScore1;
  let themeId = localStorage.getItem('themeId') || 0;
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
})

function dragFunction(element){
    return function(event){
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;
    const parent = element.parentNode;
    document.body.appendChild(element);
    element.style.pointerEvents = "none";
    element.style.position = "fixed";
    element.style.zIndex = 1000;
    document.body.classList.add('no-select');
    moveAt(userX, userY);
    const startTime = Date.now();
  
    function moveAt(pageX, pageY) {
      element.style.left = pageX - shiftX + 'px';
      element.style.top = pageY - shiftY + 'px';
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
        document.body.classList.remove('no-select');
        element.style.pointerEvents = "auto";
        element.onmouseup = null;
        gridRectangles.forEach(rectangle => {
          const rect = rectangle.getBoundingClientRect();
          if (userX >= rect.left-10 && userX <= rect.right+10 && userY >= rect.top-10 && userY <= rect.bottom+10) {
            if (rectangle != element.parentNode){
              addLabel(rectangle, element);
            }
            element.style.position = "absolute";
            element.style.zIndex = 999;
            element.style.left = "";
            element.style.top = "";
            boolean = false;
          }
        });
        if (boolean){
          addToArsenal(element, userX);
        }
      };
      }
      }
  }

/// ADDING TRANSPORTERS TO RECTANGLES //////////////////////////////////////////////////////////////

let counter = 0;

function addLabel(container, element) {
  if (container.children.length > 0){
    if (!container.firstChild.classList.contains('correctRectangle')){
      let child = container.firstChild;
      element.parentNode.appendChild(child);
      if (element.parentNode == arsenal){
        child.style.position = "relative";
      }
      let newChild = removeAllEventListeners(child);
      newChild.onmousedown = dragFunction(newChild);
      newChild.addEventListener('touchstart', dragFunction(newChild));
      newChild.ondragstart = function() {return false;};
    }
    else{
      addToArsenal(element, element.getBoundingClientRect().left);
    }
  }
  if (container.children.length == 0){
    container.appendChild(element);
    element.style.position = "absolute";
    element.style.zIndex = 999;
    element.style.left = "";
    element.style.top = "";
    let newElement = removeAllEventListeners(element);
    newElement.onmousedown = dragFunction(newElement);
    newElement.addEventListener('touchstart', dragFunction(newElement));
    newElement.ondragstart = function() {return false;};
  }

}

function addToArsenal(element, x){
  const children = arsenal.children;
  if (children.length == 0){
    arsenal.appendChild(element);
  }
  else{
    for (let i = 0; i < children.length; i+=1) {
      if (x < (children[i].getBoundingClientRect().left + children[i].getBoundingClientRect().right)/2){
        arsenal.insertBefore(element, children[i]);
        break;
      }
      if (i == children.length - 1){
        arsenal.appendChild(element);
      }
    }
  }
  
  element.style.position = "";
  element.style.zIndex = 999;
  element.style.left = "";
  element.style.top = "";
  let label = removeAllEventListeners(element);
  label.onmousedown = dragFunction(label);
  label.ontouchstart = dragFunction(label);
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
}

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
        addToArsenal(rectangle.firstChild, rectangle.getBoundingClientRect().left);
        allGood = false;
      }
    }
  });
  display(currentScore);
  if (allGood){
    attempt = 0;
    loadLevel(level+1);
  }
}



/// LEVELS ////////////////////////////////////////////////////////////////////////////////

function congratulations(){
  const cong = document.getElementById("congratulations");
  cong.addEventListener('animationend', function () {cong.style.display = "none";})
  void cong.offsetWidth;
  cong.style.display = "block";
}

const rec00 = document.getElementById("rec00");
const rec01 = document.getElementById("rec01");
const rec02 = document.getElementById("rec02");

//const position00 = [[rec00.offsetTop+'px',offsetRight(rec00) + 'px',offsetBottom(rec00) + 'px',"10vw"], ["","","18vh","1vw"]];
//const position01 = [[rec01.offsetTop+'px',offsetRight(rec01) + 'px',offsetBottom(rec01) + 'px',rec01.offsetLeft+'px'], ["","2vw","18vh",""]];
//const position02 = [[rec02.offsetTop+'px',offsetRight(rec02) + 'px',offsetBottom(rec02) + 'px',rec02.offsetLeft+'px'], ["","2vw","0.5vh",""]];

let position00 = [];
let position01 = [];
let position02 = [];

baseRecPosition(rec00,["","","","10vw"]);
baseRecPosition(rec01,["","","",""]);
baseRecPosition(rec02,["","10vw","",""]);

position00.push([offsetTop(rec00)+'px',offsetRight(rec00) + 'px',offsetBottom(rec00) + 'px', offsetLeft(rec00)+'px']);
position01.push([offsetTop(rec01)+'px',offsetRight(rec01) + 'px',offsetBottom(rec01) + 'px', offsetLeft(rec01)+'px']);
position02.push([offsetTop(rec02)+'px',offsetRight(rec02) + 'px',offsetBottom(rec02) + 'px', offsetLeft(rec02)+'px']);

baseRecPosition(rec00,["","","18vh","1vw"]);
baseRecPosition(rec01,["","2vw","18vh",""]);
baseRecPosition(rec02,["","2vw","0.5vh",""]);

position00.push([offsetTop(rec00)+'px',offsetRight(rec00) + 'px',offsetBottom(rec00) + 'px', offsetLeft(rec00)+'px']);
position01.push([offsetTop(rec01)+'px',offsetRight(rec01) + 'px',offsetBottom(rec01) + 'px', offsetLeft(rec01)+'px']);
position02.push([offsetTop(rec02)+'px',offsetRight(rec02) + 'px',offsetBottom(rec02) + 'px', offsetLeft(rec02)+'px']);

baseRecPosition(rec00,position00[0]);
baseRecPosition(rec01,position01[0]);
baseRecPosition(rec02,position02[0]);

function offsetTop(element){
  return element.offsetTop - parseFloat(getComputedStyle(element).borderTopWidth);
}

function offsetRight(element){
  return element.offsetParent.offsetWidth - (element.offsetLeft + element.offsetWidth) - parseFloat(getComputedStyle(element).borderLeftWidth);
}

function offsetBottom(element){
  return element.offsetParent.offsetHeight - (element.offsetTop + element.offsetHeight) - parseFloat(getComputedStyle(element).borderTopWidth);
}

function offsetLeft(element){
  return element.offsetLeft - parseFloat(getComputedStyle(element).borderLeftWidth);
}

function baseRecPosition(rec, position){
  rec.style.top = position[0];
  rec.style.right = position[1];
  rec.style.bottom = position[2];
  rec.style.left = position[3];
}



async function loadLevel(lvl){
  rec00.classList.add('smoothTransitions');
  rec01.classList.add('smoothTransitions');
  rec02.classList.add('smoothTransitions');
  for (const line of allArrows[level])
    {line.hide("draw", {duration: 1000})};
  rec00.classList.remove("rectangle");
  rec01.classList.remove("rectangle");
  rec02.classList.remove("rectangle");
  rec00.classList.remove("lvl0");
  rec01.classList.remove("lvl0");
  rec02.classList.remove("lvl0");
  rec00.firstChild.classList.remove('lvl0');
  rec01.firstChild.classList.remove('lvl0');
  rec02.firstChild.classList.remove('lvl0');
  if (level != 0){await delay(1000);}
  document.querySelectorAll('.lvl'+level.toString()).forEach(element => {
    element.style.display = 'none';
  })
  await delay(1000);
  gridRectangles = document.querySelectorAll('.rectangle.lvl'+lvl.toString());
  baseRecPosition(rec00, position00[lvl]);
  baseRecPosition(rec01, position01[lvl]);
  baseRecPosition(rec02, position02[lvl]);
  if (lvl != 0){await delay(1000);}
  document.querySelectorAll('.lvl'+lvl.toString()).forEach(element => {
    element.style.display = '';
  });
  await delay(1000);
  for (const line of allArrows[lvl])
    {
      line.position();
      line.show("draw", {duration: 1000})};
  level = lvl;
}


/// SIDE BAR ///////////////////////////////////////////////////////////////////////////

const changeButton = document.getElementById('changeButton');
const resetButton = document.getElementById('resetButton');

//resetButton.addEventListener('click', resetGrid);
changeButton.addEventListener('click', switchTables);

function switchTables(){
  if (level == 0){
    level = 1;
    document.querySelectorAll('.lvl1').forEach(element => {
      element.style.display = '';
    });
    document.querySelectorAll('.lvl0').forEach(element => {
      element.style.display = 'none';
    });
  }
  else if (level == 1){
    level = 0;
    document.querySelectorAll('.lvl0').forEach(element => {
      element.style.display = '';
    });
    document.querySelectorAll('.lvl1').forEach(element => {
      element.style.display = 'none';
    });
  }
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


function level0(){
  let arrows = [];
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec01'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
  arrows.push(new LeaderLine(document.getElementById('rec01'),document.getElementById('rec02'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
  for (const line of arrows){
    line.show();
  }
  return arrows;
}

function level1(){
  let arrows = [];
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec10'),{color:"var(--pseudo-black)", startSocket: 'top', endSocket: 'left', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec14'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec17'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec11'),{color:"var(--pseudo-black)", startSocket: 'top', endSocket: 'left', path: 'magnet', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec12'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', path: 'magnet', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec13'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec13'),document.getElementById('rec01'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'top', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec12'),document.getElementById('rec15'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path: "straight", hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec14'),document.getElementById('rec15'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec15'),document.getElementById('rec16'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec16'),document.getElementById('rec01'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec17'),LeaderLine.pointAnchor(document.getElementById('rec01'), {x: 0, y: 0.85*document.getElementById('rec01').clientHeight}),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: 'magnet', hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec01'),document.getElementById('rec02'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path: "straight", hide: true}));
  return arrows;
}

let lvl0Arrows =level0();
let lvl1Arrows = level1();

const allArrows = [lvl0Arrows, lvl1Arrows];

document.querySelectorAll('.lvl1').forEach(element => {
  element.style.display = 'none';
});