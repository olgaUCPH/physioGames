const allLabels = document.querySelectorAll('.label');
const checkButton = document.getElementById('checkButton');
const body = document.body;
const arsenal = document.getElementById('arsenalContainer');

let bool_slide = true;

let gridRectangles = document.querySelectorAll('.rectangle');

let solutions = ['lab00', 'lab20', 'lab10', 'lab21', 'lab30', 'lab31', 'lab30', 'lab31', 'lab40', 'lab41', 'lab40', 'lab41']

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", function() {
  highScore = localStorage.getItem('Game3_highScore') || 0;
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
})

function dragFunction(element){
    return function(event){

      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;

    if (element.parentNode == arsenal){
      const newElement = element.cloneNode(true);
      addToArsenal(newElement);
      newElement.onmousedown = dragFunction(newElement);
      newElement.addEventListener('touchstart', dragFunction(newElement));
      newElement.ondragstart = function() {return false;};
    }

    const parent = element.parentNode;
    document.body.appendChild(element);
    element.style.pointerEvents = "none";
    element.style.position = "fixed";
    element.style.zIndex = 1000;
    document.body.classList.add('no-select');
    moveAt(userX, userY);
  
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
          element.remove();
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
      if (element.parentNode == arsenal){
        child.remove();
      }
      else{
        element.parentNode.appendChild(child);
        let newChild = removeAllEventListeners(child);
        newChild.onmousedown = dragFunction(newChild);
        newChild.addEventListener('touchstart', dragFunction(newChild));
        newChild.ondragstart = function() {return false;};
      }
      
    }
    else{
      element.remove();
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

function addToArsenal(element){
  const children = arsenal.children;
  if (children.length == 0){
    arsenal.appendChild(element);
  }
  else{
    for (let i = 0; i < children.length; i+=1) {
      if (element.id < children[i].id){
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
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
}

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

checkButton.addEventListener('click',verifyGrid);

let attempt = 0;
let currentScore = -10;
let highScore = 0;

let checkSign = [true, true, true, true, true, true, true, true];
let checkPH = true;
let checkBE = true;
let checkPC = true;

async function verifyGrid() {
  attempt += 1;
  let allGood = true;
  let signError = false;
  let valueError = false;
  gridRectangles.forEach((rectangle,i) => {
    if (rectangle.children.length == 0){
      rectangle.style.animation = '';
      void rectangle.offsetWidth;
      rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
      allGood = false;
    }
    else{
      if (rectangle.firstChild.id == solutions[i]){
        removeAllEventListeners(rectangle.firstChild);
        if (!rectangle.firstChild.classList.contains('correctRectangle')){
          currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1));
          rectangle.firstChild.classList.add('correctRectangle');
        }
      }
      else{
        rectangle.style.animation = '';
        rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
        rectangle.firstChild.remove();
        allGood = false;
      }
    }
  });
  for (let i = 0; i < 8; i++){
    if (signs[i] == verifySigns[i]){
      if (checkSign[i]){
        currentScore += (attempt == 1? 5: (attempt == 2? 2 : 1));
        checkSign[i] = false;
      }
    }
    else{
      allGood = false;
      signError = true;
    }

  }
  if (pHrange.value == 7.4){if(checkPH){currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1)); checkPH = false;}}
  else{allGood = false;valueError = true;}
  if (BErange.value == 0){if(checkBE){currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1)); checkBE = false;}}
  else{allGood = false;valueError = true;}
  if (PCrange.value == 40){if(checkPC){currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1)); checkPC = false;}}
  else{allGood = false;valueError = true;}

  document.getElementById('currentScore').textContent = highScore;
  if (currentScore > highScore){
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;
    localStorage.setItem('Game3_highScore',highScore);
  }
  if (allGood){
    gameOver();
  }
  else{
    keepTrying(signError, valueError);
  }
}



/// LEVELS ////////////////////////////////////////////////////////////////////////////////

function keepTrying(signError, valueError){
  const ktWindow = document.getElementById("ktWindow");
  ktWindow.addEventListener('animationend', function () {ktWindow.style.display = "none";})
  void ktWindow.offsetWidth;
  document.getElementById('signError').style.display = signError ? "flex" : "none";
  document.getElementById('valueError').style.display = valueError ? "flex" : "none";
  ktWindow.style.display = "flex";
}

function gameOver(){
  const goWindow = document.getElementById("gameOverWindow");
  document.getElementById('gameOverScore').textContent = ' '+currentScore+' ';
  document.getElementById('gameOverPercent').textContent = ' '+Math.round(currentScore/180*100)+' ';
  goWindow.addEventListener('animationend', function () {goWindow.style.display = "none";});
  goWindow.style.display = "flex";
}

/// ARROWS ////////////////////////////////////////////////////////////////////////////::

new LeaderLine(document.getElementById('rec00'),document.getElementById('rec10'),{color:"var(--pseudo-black)", path: "straight"});

let arrow1020 = new LeaderLine(document.getElementById('rec10'),document.getElementById('rec20'),{color:"var(--pseudo-black)", path: "straight", startLabel: LeaderLine.captionLabel('< 7')});
let arrow1021 = new LeaderLine(document.getElementById('rec10'),document.getElementById('rec21'),{color:"var(--pseudo-black)", path: "straight", startLabel: LeaderLine.captionLabel('> 7')});

let arrow2030 = new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec20'), {x: 0, y: 0.85*document.getElementById('rec20').clientHeight}),document.getElementById('rec30'),{color:"var(--pseudo-black)", path: "magnet", startSocket: "left", endSocket: "top", middleLabel: LeaderLine.captionLabel('BE ?? 0 mM',{lineOffset: 30})});
let arrow2031 = new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec20'), {x: document.getElementById('rec20').clientWidth+parseFloat(getComputedStyle(document.getElementById('rec20')).borderLeftWidth), y: 0.85*document.getElementById('rec20').clientHeight}),document.getElementById('rec31'),{color:"var(--pseudo-black)", path: "magnet", startSocket: "right", endSocket: "top", middleLabel: LeaderLine.captionLabel('PCO₂ ?? 0 mmHg',{lineOffset: 30})});
let arrow2132 = new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec21'), {x: 0, y: 0.85*document.getElementById('rec21').clientHeight}),document.getElementById('rec32'),{color:"var(--pseudo-black)", path: "magnet", startSocket: "left", endSocket: "top", middleLabel: LeaderLine.captionLabel('BE ?? 0 mM',{lineOffset: 30})});
let arrow2133 = new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec21'), {x: document.getElementById('rec21').clientWidth+parseFloat(getComputedStyle(document.getElementById('rec21')).borderLeftWidth), y: 0.85*document.getElementById('rec21').clientHeight}),document.getElementById('rec33'),{color:"var(--pseudo-black)", path: "magnet", startSocket: "right", endSocket: "top", middleLabel: LeaderLine.captionLabel('PCO₂ ?? 0 mmHg',{lineOffset: 30})});

new LeaderLine(document.getElementById('rec30'),document.getElementById('rec40'),{color:"var(--pseudo-black)", path: "straight"});
new LeaderLine(document.getElementById('rec31'),document.getElementById('rec41'),{color:"var(--pseudo-black)", path: "straight"});
new LeaderLine(document.getElementById('rec32'),document.getElementById('rec42'),{color:"var(--pseudo-black)", path: "straight"});
new LeaderLine(document.getElementById('rec33'),document.getElementById('rec43'),{color:"var(--pseudo-black)", path: "straight"});


/// SLIDERS ////////////////////////////////////////////////////////////////////////////::

var pHrange = document.getElementById('pHrange');
var BErange = document.getElementById('BErange');
var PCrange = document.getElementById('PCrange');

var signs = ['??','??','??','??','??','??','??','??'];
var verifySigns = ['<','>','>','<','<','>','>','<'];

function updatepH(){
  bool_slide = false;
  let pHvalue = document.getElementById("pHvalue");
  pHvalue.textContent = pHrange.value;
  arrow1020.startLabel = LeaderLine.captionLabel(pHrange.value + " >");
  arrow1021.startLabel = LeaderLine.captionLabel("> "+pHrange.value);
}
function updateBE(){
  bool_slide = false;
  let BEvalue = document.getElementById("BEvalue");
  BEvalue.textContent = BErange.value;
  arrow2030.middleLabel = LeaderLine.captionLabel("BE "+signs[0]+' '+BErange.value+" mM",{lineOffset: 30});
  arrow2132.middleLabel = LeaderLine.captionLabel("BE "+signs[2]+' '+BErange.value+" mM",{lineOffset: 30});
  document.getElementById('BE1').textContent = "BE "+signs[5]+' '+BErange.value+" mM";
  document.getElementById('BE2').textContent = "BE "+signs[7]+' '+BErange.value+" mM";
  clickableCaptions();
}
function updatePC(){
  bool_slide = false;
  let PCvalue = document.getElementById("PCvalue");
  PCvalue.textContent = PCrange.value;
  arrow2031.middleLabel = LeaderLine.captionLabel("PCO₂ "+signs[1]+' '+PCrange.value+" mmHg",{lineOffset: 30});
  arrow2133.middleLabel = LeaderLine.captionLabel("PCO₂ "+signs[3]+' '+PCrange.value+" mmHg",{lineOffset: 30});
  document.getElementById('PC1').textContent = "PCO₂ "+signs[4]+' '+PCrange.value+" mmHg";
  document.getElementById('PC2').textContent = "PCO₂ "+signs[6]+' '+PCrange.value+" mmHg";
  clickableCaptions();
}
pHrange.addEventListener('input', updatepH, false);
pHrange.addEventListener('change', updatepH, false);
BErange.addEventListener('input', updateBE, false);
BErange.addEventListener('change', updateBE, false);
PCrange.addEventListener('input', updatePC, false);
PCrange.addEventListener('change', updatePC, false);

updatepH();
updateBE();
updatePC();

bool_slide = true;

/// CLICKABLE THRESHOLDS ////////////////////////////////////////////////////////////////////////////::

function clickableCaptions(){
  document.querySelectorAll(".clickBoxAux").forEach(box => box.remove());
  var captions = Array.from(document.querySelectorAll("text")).slice(2,);
  captions.forEach((cap,i) => {
    let x = cap.getBoundingClientRect().left;
    let y = cap.getBoundingClientRect().top;
    let w = cap.getBoundingClientRect().width;
    let h = cap.getBoundingClientRect().height;
    let box = document.createElement("div");
    box.classList.add('clickBox');
    box.classList.add('clickBoxAux');
    box.style.position = "absolute";
    box.style.left = (x-7)+'px';
    box.style.top = (y-0.1*h)+'px';
    box.style.width = w*1.2+'px';
    box.style.height = 1.2*h+'px';
    box.style.zIndex = 1000;
    box.textContent = cap.textContent;
    document.body.appendChild(box);
    box.addEventListener('click', changeSign(cap,box,i));
    box.style.backgroundColor = (signs[i] == "??") ? "var(--deep-highlight)" : "var(--light-highlight)";
    box.style.color = (signs[i] == "??") ? "var(--pseudo-white)" : "var(--pseudo-black)";
  }) 
}

function changeSign(cap,box,i){
  return function(){
    removeClick();
    signs[i] = (signs[i] == '<' ? '>' : '<');
    cap.textContent = cap.textContent.replace('>','??');
    cap.textContent = cap.textContent.replace('<','>');
    cap.textContent = cap.textContent.replace('??','<');
    box.textContent = cap.textContent;
    box.style.backgroundColor = "var(--light-highlight)";
    box.style.color = "var(--pseudo-black)";
  }
}

document.getElementById('PC1').addEventListener("click",changeSign(document.getElementById('PC1'),document.getElementById('PC1'),4));
document.getElementById('BE1').addEventListener("click",changeSign(document.getElementById('BE1'),document.getElementById('BE1'),5));
document.getElementById('PC2').addEventListener("click",changeSign(document.getElementById('PC2'),document.getElementById('PC2'),6));
document.getElementById('BE2').addEventListener("click",changeSign(document.getElementById('BE2'),document.getElementById('BE2'),7));

clickableCaptions();



const slide = document.createElement('div');
const click = document.createElement('div');

slide.classList.add('visualInstruction');
click.classList.add('visualInstruction');

slide.textContent = "Slide !";
click.textContent = "Click !";

document.body.appendChild(slide);
document.body.appendChild(click);

slide.style.left = PCrange.getBoundingClientRect().left - slide.getBoundingClientRect().width/3 + 'px';
slide.style.top = PCrange.getBoundingClientRect().top + 20 + 'px';

async function slide_anim(){
  slide.style.left = PCrange.getBoundingClientRect().left + PCrange.getBoundingClientRect().width - slide.getBoundingClientRect().width/3 + 'px'; 
  if (!bool_slide){slide.style.display = 'none'};
  await delay(1500);
  slide.style.left = PCrange.getBoundingClientRect().left - slide.getBoundingClientRect().width/3 + 'px';
  if (!bool_slide){slide.style.display = 'none'};
  await delay(1500);
  if (bool_slide) {slide_anim();}
  else {slide.style.display = 'none'};
}

click.style.animation = 'click 3s 0.75s infinite forwards';
click.style.top = gridRectangles[1].getBoundingClientRect().top + gridRectangles[1].getBoundingClientRect().height/4 + 'px';
click.style.left = gridRectangles[4].getBoundingClientRect().left + 'px';

let clickarrow = new LeaderLine(click, LeaderLine.pointAnchor(document.querySelectorAll(".clickBoxAux")[0], {x: 0, y: 0}), {color: "black", path: "straight", size: 2});

slide_anim();

function removeClick(){
  click.style.display = "none";
  clickarrow.hide("draw",{duration: 1});
}