const allLabels = document.querySelectorAll('.label');
const arsenal = document.getElementById('arsenalContainer');
const gridRectangles = document.querySelectorAll(".toFill");
const checkButton = document.getElementById("checkButton");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// CASE SELECTION /////////////////////////////////////////////////////////////////////////////

let caseContainer = document.getElementById("case");
allLabels.forEach(lab=> lab.style.display = "none");
caseContainer.style.display = "none";

function startCase(i){
  document.getElementById("caseSelectionScreen").style.display = "none";
  allLabels.forEach(lab=> lab.style.display = "");
  caseContainer.style.display = "";
  calculatePositions();
}

/// PART 1 - CLICK AND DRAG ///////////////////////////////////////////////////////////

let lastTrigger = Date.now();

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

    const newElement = element.cloneNode(true);

    document.body.appendChild(newElement);
    newElement.style.pointerEvents = "none";
    newElement.style.position = "fixed";
    newElement.style.zIndex = 1000;
    document.body.classList.add('no-select');
    moveAt(userX, userY);
  
    function moveAt(pageX, pageY) {
        newElement.style.left = pageX - shiftX + 'px';
        newElement.style.top = pageY - shiftY + 'px';
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
      newElement.style.pointerEvents = "auto";
      newElement.onmouseup = null;
      gridRectangles.forEach(rectangle => {
      const rect = rectangle.getBoundingClientRect();
      if (userX >= rect.left && userX <= rect.right && userY >= rect.top && userY <= rect.bottom) {
        if (rectangle != newElement.parentNode){
          addLabel(rectangle, newElement);
          newElement.remove();
        }
        newElement.style.position = "absolute";
        newElement.style.zIndex = 999;
        newElement.style.left = "";
        newElement.style.top = "";
        boolean = false;
      }
      });
      newElement.remove();
    };
  }
}

function addLabel(rectangle, element){
    rectangle.textContent = element.textContent;
}

consistent = false;

function consistencyCheck(){
  consistent = true;
  let bool = true;
  const kTtext = document.getElementById("kTtext");
  kTtext.innerHTML = "Your results are inconsistent.</br>";
  if (parseFloat(gridRectangles[0].textContent) + parseFloat(gridRectangles[3].textContent) != parseFloat(gridRectangles[6].textContent)){
    consistent = false;
    document.getElementById("volumeTrue").style.display = "none";
    document.getElementById("volumeFalse").style.display = "block";
    kTtext.innerHTML += "Hint (Volume): TBW = ECV + ICV</br>";
  }
  else{
    document.getElementById("volumeFalse").style.display = "none";
    document.getElementById("volumeTrue").style.display = "block";
  }
  if (parseFloat(gridRectangles[1].textContent) != parseFloat(gridRectangles[4].textContent) || parseFloat(gridRectangles[4].textContent) != parseFloat(gridRectangles[7].textContent)){
    consistent = false;
    document.getElementById("concentrationTrue").style.display = "none";
    document.getElementById("concentrationFalse").style.display = "block";
    kTtext.innerHTML += "Hint (Concentration): Remember osmosis!</br>";
  }
  else{
    document.getElementById("concentrationFalse").style.display = "none";
    document.getElementById("concentrationTrue").style.display = "block";
  }
  if (parseFloat(gridRectangles[2].textContent.replace(' ','')) + parseFloat(gridRectangles[5].textContent.replace(' ','')) != parseFloat(gridRectangles[8].textContent.replace(' ',''))){
    consistent = false;
    document.getElementById("totalTrue").style.display = "none";
    document.getElementById("totalFalse").style.display = "block";
  }
  else{
    document.getElementById("totalFalse").style.display = "none";
    document.getElementById("totalTrue").style.display = "block";
  }
  if (Math.abs(parseFloat(gridRectangles[0].textContent) * parseFloat(gridRectangles[1].textContent) - parseFloat(gridRectangles[2].textContent.replace(' ',''))) > 20){
    consistent = false;
    document.getElementById("ecvTrue").style.display = "none";
    document.getElementById("ecvFalse").style.display = "block";
    if(bool){kTtext.innerHTML += "Hint: Total mosmol = Volume * Concentration</br>";}
    bool = false;
  }
  else{
    document.getElementById("ecvFalse").style.display = "none";
    document.getElementById("ecvTrue").style.display = "block";
  }
  if (Math.abs(parseFloat(gridRectangles[3].textContent) * parseFloat(gridRectangles[4].textContent) - parseFloat(gridRectangles[5].textContent.replace(' ',''))) > 20){
    consistent = false;
    document.getElementById("icvTrue").style.display = "none";
    document.getElementById("icvFalse").style.display = "block";
    if(bool){kTtext.innerHTML += "Hint: Total mosmol = Volume * Concentration</br>";}
    bool = false;
  }
  else{
    document.getElementById("icvFalse").style.display = "none";
    document.getElementById("icvTrue").style.display = "block";
  }
  if (Math.abs(parseFloat(gridRectangles[6].textContent) * parseFloat(gridRectangles[7].textContent) - parseFloat(gridRectangles[8].textContent.replace(' ',''))) > 20){
    consistent = false;
    document.getElementById("tbwTrue").style.display = "none";
    document.getElementById("tbwFalse").style.display = "block";
    if(bool){kTtext.innerHTML += "Hint: Total mosmol = Volume * Concentration</br>";}
    bool = false;
  }
  else{
    document.getElementById("tbwFalse").style.display = "none";
    document.getElementById("tbwTrue").style.display = "block";
  }
}

let answersRectangles = ["7.4", "329", "2 446", "14.9", "329", "4 891", "22.3", "329", "7 337"];

function verifyGrid(){
  consistencyCheck();
  const cong = document.getElementById("congratulations");
  const kT = document.getElementById("keepTrying");
  const kTtext = document.getElementById("kTtext");
  if (consistent){
    let allGood = true;
    for (let i = 0; i<9; i++){
      allGood = allGood && gridRectangles[i].textContent == answersRectangles[i];
      console.log(allGood);
      ///allGood = allGood && true;
    }
    if (allGood){
      cong.addEventListener('animationend', function () {cong.style.display = "none"; transition_01();})
      void cong.offsetWidth;
      cong.style.display = "flex";
    }
    else{
      kTtext.textContent = "Your results are consistent, but the values are not the ones we are looking for. Keep looking !";
      kT.addEventListener('animationend', function () {kT.style.display = "none";})
      void kT.offsetWidth;
      kT.style.display = "flex";
    }
  }
  else{
    kT.addEventListener('animationend', function () {kT.style.display = "none";})
    void kT.offsetWidth;
    kT.style.display = "flex";
  }
}


/// PART 2 - GRAPHICAL VISUALIZATION /////////////////////////////////////////////////

let tables = document.querySelectorAll(".table");

let table0 = [];
let table1 = [];

function offsetLeft(element){
  return element.offsetLeft;
}

function offsetTop(element){
  return element.offsetTop;
}
function calculatePositions(){
  table0.push([offsetLeft(tables[0]),offsetTop(tables[0])]);
  table1.push([offsetLeft(tables[1]),offsetTop(tables[1])]);

  tables[0].style.left = "3vw";
  tables[0].style.top  = table0[0][1]+'px';

  tables[1].style.right = "1vw";
  tables[1].style.top  = table0[0][1]+'px';

  table0.push([offsetLeft(tables[0]),table0[0][1]]);
  table1.push([offsetLeft(tables[1]),table0[0][1]]);

  tables[0].style.position = "absolute";
  tables[1].style.position = "absolute";

  tables[0].style.left = table0[0][0]+'px';
  tables[0].style.top  = table0[0][1]+'px';

  tables[1].style.left = table1[0][0]+'px';
  tables[1].style.right = "";
  tables[1].style.top  = table1[0][1]+'px';


  async function aux(){
    await delay(1);
    tables[0].classList.add("smoothTransitions");
    tables[1].classList.add("smoothTransitions");
  }

  aux();
}
  

async function transition_01 (){

  tables[0].style.left = table0[1][0]+'px';
  tables[1].style.left = table1[1][0]+'px';
  await delay(500);
  document.querySelectorAll(".checkWrapper").forEach(element => element.style.display = "none");
  tables[0].style.top  = table0[1][1]+'px';
  tables[1].style.top  = table1[1][1]+'px';
  document.getElementById("caseDescription").style.display = "none";
  await delay(500);
  document.getElementById("diagramContainer").style.opacity = 1;
  document.getElementById('arsenalContainer').style.backgroundColor="var(--light-highlight)";
  allLabels.forEach(lab => lab.style.opacity = 0);
  document.querySelectorAll('.tileTitle').forEach(lab => lab.style.opacity = 0);
  document.querySelectorAll('.arsenalTile').forEach(element => element.style.width = "33.33334%");
  await delay(500);
  document.querySelectorAll('.arsenalTile').forEach(element => element.style.display = "none");
  document.getElementById('arsenalContainer').style.boxShadow = "3px 3px 5px black";
  getScales();

  ECV_animation();
  ICV_animation();

  document.getElementById("questionStart").style.display = "flex";
}


checkButton.addEventListener("click", verifyGrid);

const allRectangles = document.querySelectorAll(".rectangle");

function getScales(){
  ECV_scaleX = parseFloat(allRectangles[9].textContent)/parseFloat(allRectangles[0].textContent);
  ECV_scaleY = parseFloat(allRectangles[10].textContent)/parseFloat(allRectangles[1].textContent);

  ICV_scaleX = parseFloat(allRectangles[12].textContent)/parseFloat(allRectangles[3].textContent);
  ICV_scaleY = parseFloat(allRectangles[13].textContent)/parseFloat(allRectangles[4].textContent);
}

let ECV_scaleX = 1;
let ICV_scaleX = 1;
let ECV_scaleY = 1;
let ICV_scaleY = 1;

let animate_ECV = true;
let animate_ICV = true;

async function ECV_animation(){
  const ECV = document.getElementById("ECV1");
  ECV.style.transform = `scaleX(${ECV_scaleX}) scaleY(${ECV_scaleY})`;
  await delay (8000);
  ECV.style.transform = `scaleX(1) scaleY(1)`;
  await delay (2000);
  if (animate_ECV){ECV_animation();}
}

async function ICV_animation(){
  const ICV = document.getElementById("ICV1");
  ICV.style.transform = `scaleX(${ICV_scaleX}) scaleY(${ICV_scaleY})`;
  await delay (8000);
  ICV.style.transform = `scaleX(1) scaleY(1)`;
  await delay (2000);
  if (animate_ICV){ICV_animation();}
}

function x_highlight(id){
  let element = document.getElementById(id);
  element.style.width = "100%";
  element.offsetHeight;
  element.style.animation = "xExtend 0.5s forwards";
}

async function x_restore(id){
  let element = document.getElementById(id);
  element.offsetHeight;
  element.style.width = "10%";
  element.style.animation = "xRetract 0.5s forwards";
}

function y_highlight(id){
  let element = document.getElementById(id);
  element.style.display = "flex";
  element.style.height = "100%";
  element.offsetHeight;
  element.style.animation = "yExtend 0.5s forwards";
}

async function y_restore(id){
  let element = document.getElementById(id);
  element.offsetHeight;
  element.style.height = "10%";
  element.style.animation = "yRetract 0.5s forwards";
}

const TBW1_Container = document.getElementById("TBW1_X_Container");
const ECV_Shadow = document.getElementById("ECV_Shadow");
const ICV_Shadow = document.getElementById("ICV_Shadow");

async function diagram_update() {
  TBW1_Container.style.width = document.getElementById('ECV1').getBoundingClientRect().width + document.getElementById('ICV1').getBoundingClientRect().width +"px";
  TBW1_Container.style.height = Math.max(document.getElementById('ECV1').getBoundingClientRect().height,document.getElementById('ICV1').getBoundingClientRect().height) + "px";
  TBW1_Container.style.left = document.getElementById('ECV1').getBoundingClientRect().left + "px";
  TBW1_Container.style.top = Math.max(document.getElementById('ECV1').getBoundingClientRect().top, document.getElementById('ICV1').getBoundingClientRect().top) + "px";

  ECV_Shadow.style.width = document.getElementById('ECV1').getBoundingClientRect().width+"px";
  ECV_Shadow.style.height = document.getElementById('ECV1').getBoundingClientRect().height + "px";
  ECV_Shadow.style.left = document.getElementById('ECV1').getBoundingClientRect().left + "px";
  ECV_Shadow.style.top = document.getElementById('ECV1').getBoundingClientRect().top + "px";
  
  ICV_Shadow.style.width = document.getElementById('ICV1').getBoundingClientRect().width+"px";
  ICV_Shadow.style.height = document.getElementById('ICV1').getBoundingClientRect().height + "px";
  ICV_Shadow.style.left = document.getElementById('ICV1').getBoundingClientRect().left + "px";
  ICV_Shadow.style.top = document.getElementById('ICV1').getBoundingClientRect().top + "px";
  await delay(10);
  diagram_update();
}

diagram_update();

/// PART 3: QUESTIONS /////////////////////////////////////////////////////////

let currentQ = 1;
let maxQ = 1;

let questions = [];
let answers = [];
let correctAnswers = [];

let userAnswers = [];

questions.push("What is the first letter of the alphabet ?");
answers.push(["D", "A", "Q"]);
correctAnswers.push(2);

questions.push("What is 7×8 ?");
answers.push(["56", "55", "54"]);
correctAnswers.push(1);

questions.push("Which is the correct expression ?");
answers.push(["It's raining chairs and tables.", "It's raining apples and oranges.", "It's raining cats and dogs."]);
correctAnswers.push(3);

questions.push("Which of these sports was not at the Paris Olympics ?");
answers.push(["Breakdance", "Baseball", "Golf"]);
correctAnswers.push(2);

questions.push("Which of these is not a type of french cheese ?");
answers.push(["Morbier", "Saint Marcellin", "Clairette de Die"]);
correctAnswers.push(3);

function sendAnswer(n){
  if (userAnswers.length < currentQ) {
    userAnswers.push(n);
    maxQ = Math.min(maxQ+1,questions.length);
  }
  setQuestion(currentQ);
}

function setQuestion(i){
  if (i < 1 || i > maxQ){return 0;}
  document.querySelectorAll(".singleAnswer > .checkWrapper").forEach(element => element.style.display = "none");
  document.querySelectorAll(".checkWrapper > img").forEach(element => element.style.display = "none");
  currentQ = i;
  if (i==1){document.getElementById("previousQ").classList.add("inactiveButton");document.getElementById("previousQ").classList.remove("activeButton");}
  else{document.getElementById("previousQ").classList.add("activeButton");document.getElementById("previousQ").classList.remove("inactiveButton");}
  if (i<maxQ){document.getElementById("nextQ").classList.add("activeButton");document.getElementById("nextQ").classList.remove("inactiveButton");}
  else{document.getElementById("nextQ").classList.add("inactiveButton");document.getElementById("nextQ").classList.remove("activeButton");}
  document.getElementById("qNumber").textContent = "Question "+currentQ;
  document.getElementById("qTitle").textContent = questions[currentQ-1];
  document.getElementById("answer1").textContent = answers[currentQ-1][0];
  document.getElementById("answer2").textContent = answers[currentQ-1][1];
  document.getElementById("answer3").textContent = answers[currentQ-1][2];

  document.getElementById("answer1").classList.remove("selectedButton");
  document.getElementById("answer2").classList.remove("selectedButton");
  document.getElementById("answer3").classList.remove("selectedButton");

  if (i < maxQ || (i == maxQ && userAnswers.length == correctAnswers.length)){
    document.getElementById("answer1").style.backgroundColor = correctAnswers[i-1] == 1 ? "darkgreen" : "maroon";
    document.getElementById("answer2").style.backgroundColor = correctAnswers[i-1] == 2 ? "darkgreen" : "maroon";
    document.getElementById("answer3").style.backgroundColor = correctAnswers[i-1] == 3 ? "darkgreen" : "maroon";
    
    document.getElementById("answer1").classList.remove("activeButton");
    document.getElementById("answer2").classList.remove("activeButton");
    document.getElementById("answer3").classList.remove("activeButton");

    document.querySelectorAll(".singleAnswer > .checkWrapper").forEach(element => element.style.display = "flex");

    if (userAnswers[i-1] == 1){document.getElementById("answer1").classList.add("selectedButton")}
    if (userAnswers[i-1] == 2){document.getElementById("answer2").classList.add("selectedButton")}
    if (userAnswers[i-1] == 3){document.getElementById("answer3").classList.add("selectedButton")}

    if (correctAnswers[i-1] == 1){document.getElementById("a1True").style.display = "block"; document.getElementById("a2False").style.display = "block"; document.getElementById("a3False").style.display = "block"}
    if (correctAnswers[i-1] == 2){document.getElementById("a1False").style.display = "block"; document.getElementById("a2True").style.display = "block"; document.getElementById("a3False").style.display = "block"}
    if (correctAnswers[i-1] == 3){document.getElementById("a1False").style.display = "block"; document.getElementById("a2False").style.display = "block"; document.getElementById("a3True").style.display = "block"}

  }
  else{
    document.getElementById("answer1").style.backgroundColor = "var(--pseudo-black)";
    document.getElementById("answer2").style.backgroundColor = "var(--pseudo-black)";
    document.getElementById("answer3").style.backgroundColor = "var(--pseudo-black)";

    document.getElementById("answer1").classList.add("activeButton");
    document.getElementById("answer2").classList.add("activeButton");
    document.getElementById("answer3").classList.add("activeButton");
  }

};

