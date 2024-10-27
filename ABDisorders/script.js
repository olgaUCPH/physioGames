/// MAIN FUNCTIONALITIES

// - Click and Drag of labels 
// - Generating and managing clickable labels
// - Managing sliders and updating values accordingly
// - Verification & Scoring
// - Visual instructions

/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} //For asynchronous functions

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
} //Useless for now

document.addEventListener("DOMContentLoaded", function() {
  highScore = localStorage.getItem('Game3_highScore') || 0;
  document.getElementById('highScore').textContent = highScore;
});//Get stored highscore value

function removeAllEventListeners(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
} //Removes all event listener from a element by cloning and replacing it

/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

const allLabels = document.querySelectorAll('.label');                          //All labels in arsenal
const checkButton = document.getElementById('checkButton');                     //Big bottom-left check button
const body = document.body;                                                     //Document body
const arsenal = document.getElementById('arsenalContainer');                    //Arsenal container
let gridRectangles = document.querySelectorAll('.rectangle');                   //All diagram rectangles for labels to be placed

var pHrange = document.getElementById('pHrange');                               //pH slider
var BErange = document.getElementById('BErange');                               //BE slider
var PCrange = document.getElementById('PCrange');                               //PCO² slider

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////

let bool_slide = true;                                                          //Should the sliding visual instruction be displayed ?

//Solutions for the diagram
let solutions = ['lab00', 'lab20', 'lab10', 'lab21', 'lab30', 'lab31', 'lab30', 'lab31', 'lab40', 'lab41', 'lab40', 'lab41']
let truePH = 7.4;                                                               //Correct pH threshold
let trueBE = 0;                                                                 //Correct BE threshold
let truePC = 40;                                                                //Correct PC threshold

var userX = 0;                                                                  //User horizontal position
var userY = 0;                                                                  //User vertical position

let lastTrigger = 0;                                                            //Last time the click & drag was activated (bug fix)

//SCORING VARIABLES

let attempt = 0;                                                                //Attempt number (diminishing scoring)
let currentScore = -10;                                                         //Start at -10 to compensate for the first pre-filled rectangle
let highScore = 0;                                                              //Define highscore (is updated when DOM Content is loaded)

let checkSign = [true, true, true, true, true, true, true, true];               //Boolean of whether signs of inequalities should be checked (should only be checked once)
let checkPH = true;                                                             //Boolean of whether pH threshold should be checked (should only be checked once)
let checkBE = true;                                                             //Boolean of whether BE threshold should be checked (should only be checked once)
let checkPC = true;                                                             //Boolean of whether PCO² threshold should be checked (should only be checked once)

var signs = ['??','??','??','??','??','??','??','??'];                          //Hidden record of which signs are currently displayed (in reading order on the page)
var verifySigns = ['<','>','>','<','<','>','>','<'];                            //Correct signs, for verification


/// EVENT LISTENERS //////////////////////////////////////////////////////////////////////////

allLabels.forEach(label => {                                                    //Add click and drag to all labels
  label.onmousedown = dragFunction(label);                                      //Add listener (mouse click)
  label.addEventListener('touchstart', dragFunction(label));                    //Add listener (touchscreen)    
  label.ondragstart = function() {return false;};                               //Remove native undesirable image drag
})

checkButton.addEventListener('click',verifyGrid);                               //Grid verification trigger

pHrange.addEventListener('input', updatepH, false);                             //Update values when pH slider is being slid
pHrange.addEventListener('change', updatepH, false);                            //Update values when pH slider has been released
BErange.addEventListener('input', updateBE, false);                             //Update values when BE slider is being slid
BErange.addEventListener('change', updateBE, false);                            //Update values when BE slider has been released
PCrange.addEventListener('input', updatePC, false);                             //Update values when pCO² slider is being slid
PCrange.addEventListener('change', updatePC, false);                            //Update values when pCO² slider has been released

/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////

function dragFunction(element){                                                 //Creates a drag function for the given element
    return function(event){

      const parent = element.parentNode;                                        //Get parent element

      userX = event.clientX || event.targetTouches[0].pageX;                    //Get user position (x)
      userY = event.clientY || event.targetTouches[0].pageY;                    //Get user position (y)
      let shiftX = userX - element.getBoundingClientRect().left;                //Get user position relative to clicked element (x)
      let shiftY = userY - element.getBoundingClientRect().top;                 //Get user position relative to clicked element (y)

    if (parent == arsenal){                                                     //If element was in arsenal, duplicate and leave a copy behind
      const newElement = element.cloneNode(true);                               //Duplicate element
      addToArsenal(newElement);                                                 //Add duplicate element to arsenal where element was
      newElement.onmousedown = dragFunction(newElement);                        //Add click and drag listener (mouse)
      newElement.addEventListener('touchstart', dragFunction(newElement));      //Add click and drag listener (touchscreen)
      newElement.ondragstart = function() {return false;};                      //Disable native undesirable image drag
    }

    document.body.appendChild(element);                                         //Extract element from the hierachy
    element.style.pointerEvents = "none";                                       //Disable click-through
    element.style.position = "fixed";                                           //Fixed position for pixel precision
    element.style.zIndex = 1000;                                                //Bring to the top
    document.body.classList.add('no-select');                                   //Disable text selection
    moveAt(userX, userY);                                                       //Ensure position is correct
  
    function moveAt(pageX, pageY) {                                             //Move element to given position
      element.style.left = pageX - shiftX + 'px';                               //Set x position accounting for shift
      element.style.top = pageY - shiftY + 'px';                                //Set y position accounting for shift
    }
  
    function onMouseMove(event) {                                               //Function for drag listener
      userX = event.clientX || event.targetTouches[0].pageX;                    //Get user x position
      userY = event.clientY || event.targetTouches[0].pageY;                    //Get user y position
      moveAt(userX, userY);                                                     //Move element to mouse position
    }

    document.addEventListener('mousemove', onMouseMove);                        //Create drag listener (mouse)
    document.addEventListener('touchmove', onMouseMove);                        //Create drag listener (touchscreen)
    document.addEventListener('mouseup', onMouseUp);                            //Create release listener (mouse)
    document.addEventListener('touchend', onMouseUp);                           //Create release listener (touchscreen)
  
    function onMouseUp(event) {
      document.removeEventListener('mousemove', onMouseMove);                   //Remove drag listener (mouse)
      document.removeEventListener('mouseup',onMouseUp);                        //Remove release listener (mouse)
      document.removeEventListener('touchmove', onMouseMove);                   //Remove drag listener (touchscreen)
      document.removeEventListener('touchend',onMouseUp);                       //Remove release listener (touchscreen)
      if (Date.now() - lastTrigger > 10){                                       //Avoid double triggering (bug fix)
        parent.appendChild(element);                                            //Return element to previous parent (for easy switch)
        let boolean = true;                                                     //Was the element dropped in the middle of nowhere ?
        lastTrigger = Date.now();                                               //Record last trigger (bug fix)
        document.body.classList.remove('no-select');                            //Return text selection
        element.style.pointerEvents = "auto";                                   //Return click through
        gridRectangles.forEach(rectangle => {                                   //Check rectangles for collision
          const rect = rectangle.getBoundingClientRect();
          if (userX >= rect.left-10 && userX <= rect.right+10 && userY >= rect.top-10 && userY <= rect.bottom+10) {   //If mouse is on a rectangle
            if (rectangle != element.parentNode){                               //If rectangle is not previous parent
              addLabel(rectangle, element);                                     //Add label to this rectangle
            }
            boolean = false;                                                    //Disable label removal
          }
        });
        if (boolean){                                                           //If element was not dropped on a rectangle
          element.remove();                                                     //Remove it
        }
      };
      }}
  }

/// ADDING LABELS TO RECTANGLES //////////////////////////////////////////////////////////////

function addLabel(container, element) {                                         //Add given element to given rectangle
  if (container.children.length > 0){                                           //If rectangle contains a label already
    if (!container.firstChild.classList.contains('correctRectangle')){          //But label has not been validated yet
      let child = container.firstChild;                                         //Get preexisting label
      if (element.parentNode == arsenal){                                       //If element was dragged from arsenal
        child.remove();                                                         //Remove preexisting label (a copy is always in the arsenal)
      }
      else{
        element.parentNode.appendChild(child);                                  //If element was dragged from another rectangle, swap places
        let newChild = removeAllEventListeners(child);                          //Reset listeners
        newChild.onmousedown = dragFunction(newChild);                          //Add click and drag listeners
        newChild.addEventListener('touchstart', dragFunction(newChild));
        newChild.ondragstart = function() {return false;};
      }
      
    }
    else{
      element.remove();                                                         //If previous label had been validated, remove dragged element
    }
  }
  if (container.children.length == 0){                                          //If rectangle had no previous label
    container.appendChild(element);                                             //Add element to rectangle
    element.style.position = "absolute";                                        //Absolute position to fill rectangle
    element.style.zIndex = 999;                                                 //Pull it down
    element.style.left = "";                                                    //Reset positioning
    element.style.top = "";                                                     //Reset positioning
    let newElement = removeAllEventListeners(element);                          //Reset listener
    newElement.onmousedown = dragFunction(newElement);                          //Add click and drag listeners
    newElement.addEventListener('touchstart', dragFunction(newElement));
    newElement.ondragstart = function() {return false;};
  }

}

function addToArsenal(element){
  //Return the label to the arsenal, in its correct position
  const children = arsenal.children;                                                  //Get all labels still in arsenal (for relative positioning)
  if (children.length == 0){                                                          //If there are none, just add it there
    arsenal.appendChild(element);
  }
  else{                                                                               //Else, insert it using the element id to sort 
    for (let i = 0; i < children.length; i+=1) {
      if (element.id < children[i].id){                                               //As soon as the next element has bigger id,
        arsenal.insertBefore(element, children[i]);                                   //Add element to arsenal
        break;
      }
      if (i == children.length - 1){                                                  //If element is the one with highest id
        arsenal.appendChild(element);                                                 //Add it at the end
      }
    }
  }
  
  element.style.position = "";                                                        //Return native positioning
  element.style.zIndex = "";
  element.style.left = "";
  element.style.top = "";
  let label = removeAllEventListeners(element);                                       //Reset positioning
  label.onmousedown = dragFunction(label);
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
}
/// VERIFICATION & SCORING ////////////////////////////////////////////////////////////////////////////////////

async function verifyGrid() {
  attempt += 1;                                                                 //Increase attempt number
  let allGood = true;                                                           //Are all answers correct (boolean)
  let signError = false;                                                        //Is there a sign error (for feedback)
  let valueError = false;                                                       //Is there a threshold value error (for feedback)
  gridRectangles.forEach((rectangle,i) => {                                     //Check every diagram rectangles
    if (rectangle.children.length == 0){                                        //If rectangle has no label
      rectangle.style.animation = '';                                           //Error animation
      void rectangle.offsetWidth;
      rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
      allGood = false;                                                          //Record error
    }
    else{
      if (rectangle.firstChild.id == solutions[i]){                             //If labelis correct
        removeAllEventListeners(rectangle.firstChild);                          //Disable click and drag for label
        if (!rectangle.firstChild.classList.contains('correctRectangle')){      //If first time this is correct
          currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1));            //Add score
          rectangle.firstChild.classList.add('correctRectangle');               //Note that this label should not score again
        }
      }
      else{
        rectangle.style.animation = '';                                         //Otherwise, error animation
        rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
        rectangle.firstChild.remove();                                          //Remove label
        allGood = false;                                                        //Record error
      }
    }
  });
  for (let i = 0; i < 8; i++){                                                  //Check all inequalities
    if (signs[i] == verifySigns[i]){                                            //If inequality is correct
      if (checkSign[i]){                                                        //If inequality can be scored
        currentScore += (attempt == 1? 5: (attempt == 2? 2 : 1));               //Add score
        checkSign[i] = false;                                                   //Disable further scoring
      }
    }
    else{ 
      allGood = false;                                                          //Otherwise, record error
      signError = true;                                                         //Give feedback
    }

  }
  //If threshold is correct, and is correct for the first time: score and disable further scoring
  if (pHrange.value == truePH){if(checkPH){currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1)); checkPH = false;}}
  else{allGood = false;valueError = true;}
  if (BErange.value == trueBE){if(checkBE){currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1)); checkBE = false;}}
  else{allGood = false;valueError = true;}
  if (PCrange.value == truePC){if(checkPC){currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1)); checkPC = false;}}
  else{allGood = false;valueError = true;}

  document.getElementById('currentScore').textContent = currentScore;         //Display score
  if (currentScore > highScore){                                              //Record new highscore if applicable
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;             //Display new highscore if applicable
    localStorage.setItem('Game3_highScore',highScore);
  }
  if (allGood){                                                               //If all answer are correct
    gameOver();                                                               //Display game over window
  }
  else{
    keepTrying(signError, valueError);                                        //Otherwise, display keep trying window with proper feedback
  }
}

/// END WINDOWS ////////////////////////////////////////////////////////////////////////////////

function keepTrying(signError, valueError){
  //Display the keep trying window, with appropriate texts
  const ktWindow = document.getElementById("ktWindow");                                     //Get window element
  ktWindow.addEventListener('animationend', function () {ktWindow.style.display = "none";}) //Add listener to remove it after animation
  void ktWindow.offsetWidth;                                                                //Re-trigger animation
  document.getElementById('signError').style.display = signError ? "flex" : "none";         //If there are sign errors, show it
  document.getElementById('valueError').style.display = valueError ? "flex" : "none";       //If there are any value errors, show it
  ktWindow.style.display = "flex";                                                          //Display window
}

function gameOver(){
  //Display the game over window, with final score and performance
  const goWindow = document.getElementById("gameOverWindow");                               //Get window element
  document.getElementById('gameOverScore').textContent = ' '+currentScore+' ';              //Show score
  document.getElementById('gameOverPercent').textContent = ' '+Math.round(currentScore/180*100)+' ';    //Show performance
  goWindow.addEventListener('animationend', function () {goWindow.style.display = "none";});//Add listener to remove it after animation
  goWindow.style.display = "flex";                                                          //Display window
}

/// ARROWS ////////////////////////////////////////////////////////////////////////////::

//Draws arrows for the diagram. Identify some of them by variables,as they will be needed to create and position the inequalities

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

//Handles sliders

function updatepH(){ 
  //Triggers when pH slider is modified
  bool_slide = false;                                                   //Visual instruction: remove the slide instruction
  let pHvalue = document.getElementById("pHvalue");                     //Get value from slider
  pHvalue.textContent = pHrange.value;                                  //Display value from slider
  arrow1020.startLabel = LeaderLine.captionLabel(pHrange.value + " >"); //Update corresponding inequalities
  arrow1021.startLabel = LeaderLine.captionLabel("> "+pHrange.value);   //Update corresponding inequalities
}
function updateBE(){
  //Triggers when BE slider is modified
  bool_slide = false;                                                                                             //Disable visual slide instruction
  let BEvalue = document.getElementById("BEvalue");                                                               //Get value from slider
  BEvalue.textContent = BErange.value;                                                                            //Display value from slider
  arrow2030.middleLabel = LeaderLine.captionLabel("BE "+signs[0]+' '+BErange.value+" mM",{lineOffset: 30});       //Update corresponding inequalities
  arrow2132.middleLabel = LeaderLine.captionLabel("BE "+signs[2]+' '+BErange.value+" mM",{lineOffset: 30});       //Update corresponding inequalities
  document.getElementById('BE1').textContent = "BE "+signs[5]+' '+BErange.value+" mM";                            //Update corresponding inequalities
  document.getElementById('BE2').textContent = "BE "+signs[7]+' '+BErange.value+" mM";                            //Update corresponding inequalities
  clickableCaptions();                                                                                            //Regenerate clickable inequalities (bug fix)
}
function updatePC(){
  //Triggers when PCO² slider is modified
  bool_slide = false;                                                                                             //Disable visual slide instruction
  let PCvalue = document.getElementById("PCvalue");                                                               //Get value from slider
  PCvalue.textContent = PCrange.value;                                                                            //Display value from slider
  arrow2031.middleLabel = LeaderLine.captionLabel("PCO₂ "+signs[1]+' '+PCrange.value+" mmHg",{lineOffset: 30});   //Update corresponding inequalities
  arrow2133.middleLabel = LeaderLine.captionLabel("PCO₂ "+signs[3]+' '+PCrange.value+" mmHg",{lineOffset: 30});   //Update corresponding inequalities
  document.getElementById('PC1').textContent = "PCO₂ "+signs[4]+' '+PCrange.value+" mmHg";                        //Update corresponding inequalities
  document.getElementById('PC2').textContent = "PCO₂ "+signs[6]+' '+PCrange.value+" mmHg";                        //Update corresponding inequalities
  clickableCaptions();                                                                                            //Regenerate clickable inequalities (bug fix)
}

/// CLICKABLE THRESHOLDS ////////////////////////////////////////////////////////////////////////////::

function clickableCaptions(){
  //Regenerates the clickable inequalities with correct shapes and positions
  //Positioning is calculated automatically using the Anseki Leaderline captions,
  //then buttons are generated over them
  document.querySelectorAll(".clickBoxAux").forEach(box => box.remove());                                   //Remove all previous boxes
  var captions = Array.from(document.querySelectorAll("text")).slice(2,);                                   //Get text from captions
  captions.forEach((cap,i) => {                                                                             
    let x = cap.getBoundingClientRect().left;                                                               //Get position from caption
    let y = cap.getBoundingClientRect().top;                                                                //Get position from caption
    let w = cap.getBoundingClientRect().width;                                                              //Get size from caption
    let h = cap.getBoundingClientRect().height;                                                             //Get size from caption
    let box = document.createElement("div");                                                                //Create clickable box
    box.classList.add('clickBox');                                                                          //Style the box
    box.classList.add('clickBoxAux');                                                                       //Style the box
    box.style.position = "absolute";                                                                        //Absolute Positioning to be precise
    box.style.left = (x-7)+'px';                                                                            //Set x position (with slight shift, bug fix)
    box.style.top = (y-0.1*h)+'px';                                                                         //Set y position (with slight shift, bug fix)
    box.style.width = w*1.2+'px';                                                                           //Set width with some padding
    box.style.height = 1.2*h+'px';                                                                          //Set height with some padding
    box.style.zIndex = 1000;                                                                                //Bring to the top
    box.textContent = cap.textContent;                                                                      //Write content
    document.body.appendChild(box);                                                                         //Put in the webpage
    box.addEventListener('click', changeSign(cap,box,i));                                                   //Add click listener
    box.style.backgroundColor = (signs[i] == "??") ? "var(--deep-highlight)" : "var(--light-highlight)";    //If unclicked, use dark color; otherwise light
    box.style.color = (signs[i] == "??") ? "var(--pseudo-white)" : "var(--pseudo-black)";                   //If unclicked, use white text; otherwise dark
  }) 
}

function changeSign(cap,box,i){
  //Click event to change sign of inequality
  return function(){
    removeClick();                                                                                          //Remove click visual instruction
    signs[i] = (signs[i] == '<' ? '>' : '<');                                                               //Change recorded sign
    cap.textContent = cap.textContent.replace('>','??');                                                    //Change text sign
    cap.textContent = cap.textContent.replace('<','>');                                                     //Change text sign
    cap.textContent = cap.textContent.replace('??','<');                                                    //Change text sign
    box.textContent = cap.textContent;                                                                      //Update text
    box.style.backgroundColor = "var(--light-highlight)";                                                   //Change caption style
    box.style.color = "var(--pseudo-black)";                                                                //Change caption style
  }
}

updatepH();                                       //Initialize slider values
updateBE();                                       //Initialize slider values
updatePC();                                       //Initialize slider values

clickableCaptions();                              //Create clickable captions

/// VISUAL INSTRUCTIONS ////////////////////////////////////////////////////////////////////////////

const slide = document.createElement('div');                  //Create slide visual instruction
const click = document.createElement('div');                  //Create click visual instruction

slide.classList.add('visualInstruction');                     //Add style
click.classList.add('visualInstruction');                     //Add style

slide.textContent = "Slide !";                                //Add text
click.textContent = "Click !";                                //Add text

document.body.appendChild(slide);                             //Add to page
document.body.appendChild(click);                             //Add to page

slide.style.left = PCrange.getBoundingClientRect().left - slide.getBoundingClientRect().width/3 + 'px';   //Position slide
slide.style.top = PCrange.getBoundingClientRect().top + 20 + 'px';                                        //Position slide

async function slide_anim(){
  //Function to animate slide: move left and right, until bool_slide = false
  slide.style.left = PCrange.getBoundingClientRect().left + PCrange.getBoundingClientRect().width - slide.getBoundingClientRect().width/3 + 'px'; 
  if (!bool_slide){slide.style.display = 'none'}; 
  await delay(1500);
  slide.style.left = PCrange.getBoundingClientRect().left - slide.getBoundingClientRect().width/3 + 'px';
  if (!bool_slide){slide.style.display = 'none'};
  await delay(1500);
  if (bool_slide) {slide_anim();}
  else {slide.style.display = 'none'};
}

click.style.animation = 'click 3s 0.75s infinite forwards';                                                                   //Click animation
click.style.top = gridRectangles[1].getBoundingClientRect().top + gridRectangles[1].getBoundingClientRect().height/4 + 'px';  //Set position
click.style.left = gridRectangles[4].getBoundingClientRect().left + 'px';                                                     //Set position

//Draw arrow from visual instruction
let clickarrow = new LeaderLine(click, LeaderLine.pointAnchor(document.querySelectorAll(".clickBoxAux")[0], {x: 0, y: 0}), {color: "black", path: "straight", size: 2});

//Start slide animation
slide_anim();

function removeClick(){
  //Function to remove click visual instruction
  click.style.display = "none";
  clickarrow.hide("draw",{duration: 1});
}