/// MAIN FUNCTIONALITIES

// - Case Selection
// - Random Case Generation
// - Label Click & Drag
// - General scoring
// - Diagram Animation
// - Questions handling


/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", function() {
  highScore_0 = parseInt(localStorage.getItem('FB_highScore_0')) || 0;      //Case 0 high-score
  highScore_1 = parseInt(localStorage.getItem('FB_highScore_1')) || 0;      //Case 1 high-score
  highScore_2 = parseInt(localStorage.getItem('FB_highScore_2')) || 0;      //Case 2 high-score
  highScore_3 = parseInt(localStorage.getItem('FB_highScore_3')) || 0;      //Case 3 high-score
}); //Get stored values

function round_1(x){  
  //Rounds to one decimal point
  return Math.round(x*10)/10;
}

function shuffleArray(array) {
  //Randomly shuffles a given array
  for (let i = array.length - 1; i > 0; i--) {
    //Starting from the last element, swap it with a previous element
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randRange(min, max, step) {
  //Generate a random number between min and max with a given step
  const steps = Math.floor((max - min) / step) + 1;         //Number of possible steps between min and max
  const randomStep = Math.floor(Math.random() * steps);     //Get a random integer number of steps to take from min
  return round_1(min + randomStep * step);                  //Generate number
}


/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

const allLabels = document.querySelectorAll('.label');                //All labels for click & drag
const arsenal = document.getElementById('arsenalContainer');          //Arsenal
const checkButton = document.getElementById("checkButton");           //Big check button

const allRectangles = document.querySelectorAll(".rectangle");        //All rectangles from both tables
let gridRectangles = document.querySelectorAll(".toFill");            //All rectangles from study table
let toFill = document.querySelectorAll(".toFill");                    //All rectangles to fill (for tutorial consistency checks, not all rectangles can be filled)
const referenceRectangles = Array.from(document.querySelectorAll(".rectangle")).slice(0,9);   //Rectangles from reference grid = first 9 cells

let caseContainer = document.getElementById("case");                  //Case container (to hide & display case)

let tables = document.querySelectorAll(".table");                     //Reference and study tables

const TBW1_Container = document.getElementById("TBW1_X_Container");   //Study diagram X container
const ECV_Shadow = document.getElementById("ECV_Shadow");             //ECV rectangle shadow, for nice-looking animations
const ICV_Shadow = document.getElementById("ICV_Shadow");             //ICV rectangle shadow, for nice-looking animations

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////

let currentScore = 0;                                                 //Current score
let highScore = 0;                                                    //High score for current case

let highScore_0 = 0;                                                  //Case 0 high-score
let highScore_1 = 0;                                                  //Case 1 high-score
let highScore_2 = 0;                                                  //Case 2 high-score
let highScore_3 = 0;                                                  //Case 3 high-score

let attempt = 0;                                                      //Attempt number (for diminishing scoring)
let firstConsistent = true;                                           //Boolean to score only the first time table is consistent

let caseID = -1;                                                      //Chosen case (initialize at -1 because no case)

let answersRectangles = [];                                           //Something

let lastTrigger = Date.now();                                         //Last time click & drag was triggered (bug fix)

let consistent = false;                                               //Boolean to check if study grid is consistent

let table0 = [];                                                      //Stores positions of reference table (step 1 & step 2)
let table1 = [];                                                      //Stores positions of study table (step 1 & step 2)

let ECV_scaleX = 1;                                                   //ECV Diagram horizontal stretch factor
let ICV_scaleX = 1;                                                   //ICV Diagram vertical stretch factor
let ECV_scaleY = 1;                                                   //ECV Diagram horizontal stretch factor
let ICV_scaleY = 1;                                                   //ICV Diagram vertical stretch factor

let currentQ = 1;                                                     //ID of the currently displayed question
let maxQ = 1;                                                         //ID of the max question reached by user

let questions = [];                                                   //Array containing all questions of chosen case
let answers = [];                                                     //Array containing all possible answers of chosen case
let correctAnswers = [];                                              //Array containing ID of correct answer from each question

let userAnswers = [];                                                 //Array to be filled with the answers of the user

let firstEnd = true;                                                  //Boolean to keep track of the first time the last question is reached, to display return window

/// EVENT LISTENERS //////////////////////////////////////////////////////////////////////////

allLabels.forEach(label => {
  label.onmousedown = dragFunction(label);                            //Add click & drag listener to labels (mouse)
  label.addEventListener('touchstart', dragFunction(label));          //Add click & drag listener to labels (touchscreen)
  label.ondragstart = function() {return false;};                     //Disable undesirable native click & drag
})

/// CASE SELECTION /////////////////////////////////////////////////////////////////////////////

function startCase(i){
  //Function triggers from case selection screen buttons. Removes selection screen and initialize chosen case
  caseID = i;                                                                                         //Keep track of chosen case
  document.getElementById("caseSelectionScreen").style.display = "none";                              //Hide case selection screen
  allLabels.forEach(lab=> lab.style.display = "");                                                    //Display all labels
  caseContainer.style.display = "";                                                                   //Display case
  if (i==0){                                                                                          //If case 0 is chosen,
    case_0();                                                                                         //Simply start case 0 (very different from 1-2-3)
  }
  else{
    calculatePositions();                                                                             //Else, dynamically calculate positions of tables
    document.getElementById("caseDescription").style.display = "flex";                                //Show case description
    let reference_values = [];                                                                        //Initialize reference table values
    let labels = [];                                                                                  //Initialize labels values
    [reference_values, answersRectangles, labels] = (i==1)? case_1(): (i==2)? case_2() : case_3();    //Get randomly generated values
    referenceRectangles.forEach((rec, i) => rec.textContent = reference_values[i]);                   //Display reference table values
    allLabels.forEach((lab,i) => lab.textContent = labels[i]);                                        //Display label values
  }
  checkButton.addEventListener("click", verifyGrid);                                                  //Enable check button
}

/// CASE 0 /////////////////////////////////////////////////////////////////////////////

function case_0(){

  document.getElementById("topDescription").innerHTML = `<b style='font-weight: 700'>Case 0</b>:  Training! Drag & Drop the correct values to make the table internally consistent! (Values do not have any physiological significance)`;
  document.getElementById('topDescription').style.display = "flex";                                 //Display short-hand description
  document.getElementById('topDescription').style.top = "4dvh";                                 //Ajust style
  //Generates random values and creates case 0

  highScore = highScore_0;                                                    //Get correct highscore
  document.getElementById('highScore').textContent = highScore;               //Display highscore

  tables[0].style.display = "none";                                           //Hide reference table (irrelevant)
  tables[1].style.position = "relative";                                      //Position study table to the center
  tables[1].style.right = "";
  tables[1].style.top = "";

  const weight = randRange(50,80,1);                                          //Choose realistic weight
  const water_ratio = 0.6;                                                    //Male water ratio

  E_ratio = randRange(0.25,0.35,0.01);                                        //ECV/TBW ratio

  const concentration_0 = Math.round(randRange(280,330,5));                   //Overall concentration

  //Compute correct values
  const TBW_0 = round_1(water_ratio*weight);                                  

  const TBM_0 = Math.round(TBW_0*concentration_0);
  const ECM_0 = Math.round(TBM_0*E_ratio);
  const ICM_0 = Math.round(TBM_0*(1-E_ratio));

  const ECV_0 = round_1(TBW_0*ECM_0/TBM_0);
  const ICV_0 = round_1(TBW_0*ICM_0/TBM_0);
  //Store correct values
  let reference = [ECV_0, concentration_0, ECM_0, ICV_0, concentration_0, ICM_0, TBW_0, concentration_0, TBM_0];

  //Generate a pattern to partially fill the grid
  let pattern = randPattern();
  
  //Write the pattern values
  pattern.forEach(i => gridRectangles[i].textContent = reference[i]);

  //Filter out written values from expected answers
  answers = reference.filter((_, index) => !pattern.includes(index));
  //Filter out written cells from cells that can be filled
  toFill = Array.from(toFill).filter((_, index) => !pattern.includes(index));

  //Randomly generate other labels

  let V_labels = [TBW_0, ECV_0, ICV_0].concat(generateLabels(ECV_0, TBW_0, 10, round_1));
  let C_labels = [concentration_0].concat(generateLabels(concentration_0/2, concentration_0*1.5, 9, Math.round));
  let M_labels = [TBM_0, ECM_0, ICM_0].concat(generateLabels(ECM_0, TBM_0, 9, Math.round));
  let labels = [...shuffleArray(V_labels), ...shuffleArray(C_labels), ...shuffleArray(M_labels)];

  //Write labels
  allLabels.forEach((lab,i) => lab.textContent = labels[i]);
  
}

/// PATTERN GENERATION

function isValid(triplet) {
  //Checks if a given triplet is sufficient to fill the whole table
  const [a, b, c] = triplet;
  const rowCheck = !(Math.floor(a / 3) === Math.floor(b / 3) && Math.floor(b / 3) === Math.floor(c / 3));   //Are all three not on the same row ?
  const columnCheck = !(a % 3 === b % 3 && a % 3 === c % 3);                                                //Are all three not on the same column ?
  const middleColumnCheck = [1, 4, 7].filter(index => triplet.includes(index)).length <= 1;                 //Is there at most one concentration given ?
  
  //If there is something in the middle column, make sure the other two are not on the same line
  const containsMiddleColumn = triplet.some(index => [1, 4, 7].includes(index));                            
  let noSameRowIfMiddleColumn = true;
  if (containsMiddleColumn) {
    const [d,e] = triplet.filter(index => ![1, 4, 7].includes(index));
    noSameRowIfMiddleColumn = !(Math.floor(d / 3) === Math.floor(e / 3));
    }
  return rowCheck && columnCheck && middleColumnCheck && noSameRowIfMiddleColumn;
}

function randPattern() {
  //Generates a random triplet of cells, then checks if they are a valid triplet
  const gridIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let validTriplet = [];
  while (true) {
      const shuffled = gridIndices.sort(() => Math.random() - 0.5);
      const triplet = shuffled.slice(0, 3);
      if (isValid(triplet)) {
          validTriplet = triplet;
          break;
      }
  }
  return validTriplet;
}

function generateLabels(A,B,n, round_fn){
  //Generate n random label between 0.75*A and 1.25*B 
  let lab = [];
  for (let i = 0; i < n; i++){
    lab.push(round_fn(randRange(0.75*A,1.25*B,(B-A)/20)));
  }
  return lab;
}

/// OTHER CASES //////////////////////////////////////////////////////////////////:

function case_1(){

  // Generates values for case 1, dehydrated senior
  // Straight loss of water: TBW goes down, mosmol stays the same; recalculate ECV & ICV, and concentration

  highScore = highScore_1;                                              //Get highscore value
  document.getElementById('highScore').textContent = highScore;         //Display it
  
  const weight = randRange(48,66,3);                                    //Generate realistic weight
  const water_ratio = 0.46;                                             //Senior woman water ratio (?)
  const lost_water = randRange(1.5, 3.9, 0.3);                          //Generate random amount of lost water

  //Generate case description
  //Title
  let h1 = document.createElement("h1");          
  h1.innerHTML = "Case 1 : Dehydrated Ingrid";
  //First paragraph
  let p = document.createElement("p");
  p.innerHTML = `Ingrid is an elderly 65 year-old woman living alone. She usually weights ${weight} kg when healthy, but has stopped drinking water over the weekend and has lost ${lost_water} L of water.`;
  //Second paragraph
  let p2 = document.createElement("p");
  p2.innerHTML = "Her usual fluid balance is reported on the top table. Calculate her fluid balance at the end of the weekend.";
  //Write to description
  let desc = document.getElementById("caseDescription");
  desc.appendChild(h1);
  desc.appendChild(p);
  desc.appendChild(p2);
  //Generate short-hand description for second part
  document.getElementById("topDescription").innerHTML = `<b style='font-weight: 700'>Case 1 Summary</b>:  Ingrid | F | 65 years old | ${weight} kg healthy | Stopped drinking | ${lost_water} L of water lost`;


  //Generate reference values from case description
  const concentration_0 = 290;

  const TBW_0 = round_1(water_ratio*weight);

  const TBM_0 = Math.round(TBW_0*concentration_0);
  const ECM_0 = Math.round(TBM_0/3);
  const ICM_0 = Math.round(2*TBM_0/3);

  const ECV_0 = round_1(TBW_0*ECM_0/TBM_0);
  const ICV_0 = round_1(TBW_0*ICM_0/TBM_0);

  let reference = [ECV_0, concentration_0, ECM_0, ICV_0, concentration_0, ICM_0, TBW_0, concentration_0, TBM_0];

  //Generate answer values from case description
  const TBW_1 = round_1(TBW_0 - lost_water);

  const TBM_1 = TBM_0;
  const ECM_1 = ECM_0;
  const ICM_1 = ICM_0;

  const concentration_1 = Math.round(TBM_1/TBW_1);

  const ECV_1 = round_1(TBW_1*ECM_1/TBM_1);
  const ICV_1 = round_1(TBW_1*ICM_1/TBM_1);

  let table_answers = [ECV_1, concentration_1, ECM_1, ICV_1, concentration_1, ICM_1, TBW_1, concentration_1, TBM_1];

  //Generate label options, with common error paths
  let V_labels = [TBW_0, TBW_1, ECV_0, ECV_1, ICV_0, ICV_1];
  V_labels.push(round_1(TBW_0 - lost_water*water_ratio), round_1((TBW_0 - lost_water*water_ratio)/3), round_1(2*(TBW_0 - lost_water*water_ratio)/3));
  V_labels.push(round_1(ECV_0 - lost_water), round_1(ICV_0 - lost_water), round_1(ECV_0 - lost_water/2), round_1(ICV_0 - lost_water/2));

  let C_labels = [concentration_0, concentration_1];
  C_labels.push(Math.round(TBM_1/round_1(TBW_0 - lost_water*water_ratio)));
  C_labels.push(Math.round(TBW_1*concentration_0/TBW_0));
  C_labels.push(Math.round(ECM_0/(ECV_0 - lost_water)), Math.round(ICM_0/(ICV_0 - lost_water)), Math.round(ECM_0/(ECV_0 - lost_water/2)), Math.round(ICM_0/(ICV_0 - lost_water/2)));
  C_labels.push(Math.round(1.1*concentration_0), Math.round(0.9*concentration_0));

  let M_labels = [TBM_0, ECM_0, ICM_0];
  M_labels.push(Math.round(TBW_1*concentration_0),Math.round(ECV_1*concentration_0),Math.round(ICV_1*concentration_0));
  M_labels.push(Math.round(TBW_0*concentration_1),Math.round(ECV_0*concentration_1),Math.round(ICV_0*concentration_1));
  M_labels.push(Math.round(ECM_0 - lost_water*concentration_0), Math.round(ICM_0 - lost_water*concentration_0), Math.round(ECM_0 - lost_water*concentration_0/2));

  //Shuffle and concatenate labels
  let labels = [...shuffleArray(V_labels), ...shuffleArray(C_labels), ...shuffleArray(M_labels)];

  //Generate questions, multiple choice answers and correct answer
  questions.push("In the reference table, Ingrid's TBW is 45% of her body weight. Which of the following statements is true ?");
  answers.push(["Ingrid is dehydrated", "Ingrid's TBW is normal for her weight and age", "Ingrid's ECV is reduced"]);
  correctAnswers.push(2);

  questions.push("What determines the distribution of fluid between the ECV and the ICV ?");
  answers.push(["The osmolarity", "The amount of osmoles in the two compartments", "The amount of total body water"]);
  correctAnswers.push(2);

  questions.push("What determines the osmolarity of the body fluids ?");
  answers.push(["The amount of total body water", "The amount of osmoles and total body water", "The amount of osmoles"]);
  correctAnswers.push(2);

  return [reference, table_answers, labels]
}

function case_2(){
  
  // Generates values for case 2, athletic Hanne
  // Loss of sweat and perspiration insensibilis: compute TBW, then mosmol loss (only sweat causes loss, in ECV), then ECV & ICV & concentration

  highScore = highScore_2;                                                                    //Get highscore
  document.getElementById('highScore').textContent = highScore;                               //Display highscore

  const weight = randRange(55,70,1);                                                          //Generate weight
  const water_ratio = 0.55;                                                                   //Young woman water ratio
  
  const total_water_loss = randRange(0.5, 1.5, 0.1);                                          //Generate total water lost
  const ip_loss = randRange(round_1(total_water_loss/5), round_1(total_water_loss/3), 0.1);   //Generate perspiration insensibilis loss
  const sw_concentration = 100;                                                               //Sweat concentration

  const new_weight = weight - total_water_loss;                                               //Compute new weight after water loss
  const sw_loss = total_water_loss - ip_loss;                                                 //Compute sweat water
  const mosm_loss = sw_loss*sw_concentration;                                                 //Compute total mosmol loss

  //Generate case description
  //Title
  let h1 = document.createElement("h1"); 
  h1.innerHTML = "Case 2 : Athletic Hanne";
  //First Paragraph
  let p = document.createElement("p");
  p.innerHTML = `Hanne is studying medicine and is very interested in kidney physiology. One day she decides to measure how free water clearance looks after 2 hours of spinning. Hanne weighs ${weight} kg after emptying her bladder just before the start of the workout.`;
  //Second Paragraph
  let p2 = document.createElement("p");
  p2.innerHTML = `After training, Hanne weighs ${new_weight} kg. She has lost ${ip_loss} L of fluid via perspiration insensibilis, the rest is sweat. The osmolarity of the sweat is ${sw_concentration} mosmol/L.`;
  //Write to description
  let desc = document.getElementById("caseDescription");
  desc.appendChild(h1);
  desc.appendChild(p);
  desc.appendChild(p2);
  //Generate short-hand description for second part
  document.getElementById("topDescription").innerHTML = `<b style='font-weight: 700'>Case 2 Summary</b>:  Hanne | F | ${weight} kg | ${new_weight} kg after workout | ${ip_loss} L loss via perspiration insensibilis, rest is sweat | ${sw_concentration} mosmol/L sweat osmolarity`;

  //Compute values for reference table
  const concentration_0 = 290;

  const TBW_0 = round_1(water_ratio*weight);

  const TBM_0 = Math.round(TBW_0*concentration_0);
  const ECM_0 = Math.round(TBM_0/3);
  const ICM_0 = Math.round(2*TBM_0/3);

  const ECV_0 = round_1(TBW_0*ECM_0/TBM_0);
  const ICV_0 = round_1(TBW_0*ICM_0/TBM_0);

  let reference = [ECV_0, concentration_0, ECM_0, ICV_0, concentration_0, ICM_0, TBW_0, concentration_0, TBM_0];
  
  //Compute answers for study table
  const TBW_1 = round_1(TBW_0 - total_water_loss);

  const ECM_1 = round_1(ECM_0 - mosm_loss);
  const ICM_1 = ICM_0;
  const TBM_1 = Math.round(ECM_1+ICM_1);

  const concentration_1 = Math.round(TBM_1/TBW_1);

  const ECV_1 = round_1(TBW_1*ECM_1/TBM_1);
  const ICV_1 = round_1(TBW_1*ICM_1/TBM_1);

  let table_answers = [ECV_1, concentration_1, ECM_1, ICV_1, concentration_1, ICM_1, TBW_1, concentration_1, TBM_1];

  //Generate label options, with common error paths
  let V_labels = [TBW_0, TBW_1, ECV_0, ECV_1, ICV_0, ICV_1];
  V_labels.push(round_1((ICM_0 - mosm_loss)/TBM_1*TBW_1),round_1(ECM_0/TBM_1*TBW_1));
  V_labels.push(round_1(new_weight*water_ratio));
  V_labels.push(round_1((ECM_0 - (total_water_loss*water_ratio-0.2)*sw_concentration)/(TBM_0 - (total_water_loss*water_ratio-0.2)*sw_concentration)*new_weight*water_ratio));
  V_labels.push(round_1(ICM_1/(TBM_0 - (total_water_loss*water_ratio-0.2)*sw_concentration)*new_weight*water_ratio));
  V_labels.push(round_1(ECV_0 - total_water_loss));
  V_labels.push(round_1(ICV_0 - total_water_loss));

  let C_labels = [concentration_0, concentration_1];
  C_labels.push(Math.round((TBM_0 - total_water_loss*sw_concentration)/TBW_1));
  C_labels.push(Math.round((TBM_1)/(TBW_0 - sw_loss)));
  C_labels.push(Math.round((TBM_0 - total_water_loss*sw_concentration)/(TBW_0 - sw_loss)));
  C_labels.push(Math.round(TBM_1/TBW_0));
  C_labels.push(Math.round(TBM_0/TBW_1));
  C_labels.push(Math.round((TBM_0 - (total_water_loss*water_ratio-0.2)*sw_concentration)/(new_weight*water_ratio)));
  C_labels.push(Math.round(ECM_1/ECV_0), Math.round(ECM_0/ECV_1));

  //Case 2 has a chance to generate duplicate values for concentration. In this case, replace duplicates with random values
  const replaceDuplicates = (list) => {
    const uniqueNumbers = new Set();
    const min = Math.min(...list), max = Math.max(...list);
    return list.map(value => uniqueNumbers.has(value) 
        ? (uniqueNumbers.add(value = randRange(Math.round(min * 0.9), Math.round(max * 1.1), 1)), value) 
        : (uniqueNumbers.add(value), value));
  };  

  C_labels = replaceDuplicates(C_labels);

  let M_labels = [TBM_0, ECM_0, ICM_0, TBM_1, ECM_1];
  M_labels.push(Math.round(TBM_0 - total_water_loss*sw_concentration), Math.round(ECM_0 - total_water_loss*sw_concentration));
  M_labels.push(Math.round(ICM_0 - mosm_loss));
  M_labels.push(Math.round(ECM_0/TBM_0*TBM_1),Math.round(ICM_0/TBM_0*TBM_1));
  M_labels.push(Math.round(TBM_0 - (total_water_loss*water_ratio-0.2)*sw_concentration), Math.round(ECM_0 - (total_water_loss*water_ratio-0.2)*sw_concentration));
  
  //Shuffle and concatenate labels
  let labels = [...shuffleArray(V_labels), ...C_labels, ...shuffleArray(M_labels)];

  //Generate questions, multiple choice answers and correct answer
  questions.push("What would you expect happens with the osmolarity of Hannes urine after the spinning?");
  answers.push(["It is increased", "It is unchanged", "It is decreased"]);
  correctAnswers.push(1);

  questions.push("Why is the number of osmoles in ICV unchanged?");
  answers.push(["The loss of intracellular Na+ is compensated by a similar cellular uptake of K+", "The osmoles (NaCl) lost in the sweat are all derived from the ECV", "The losses from ICV are isosmolar"]);
  correctAnswers.push(2);

  questions.push("What is the osmolarity of the perspiration insensibilis?");
  answers.push(["It is isosmolar with plasma", "It is hyposmolar", "The osmolarity is 0 mosm/L"]);
  correctAnswers.push(3);

  return [reference, table_answers, labels];
}

function case_3(){
  
  // Generates values for case 3, Jakob at the Friday Bar
  // Straight loss of water: TBW goes down, mosmol stays the same; recalculate ECV & ICV, and concentration

  highScore = highScore_3;                                            //Get highscore value
  document.getElementById('highScore').textContent = highScore;       //Display highscore

  const weight = randRange(65,80,2);                                  //Generate weight
  const beers = randRange(2,5,1);                                     //Generate random number of drunk beers (pints)
  const crisps = 250;                                                 //Amount of crisps eaten
  const salt_concentration = randRange(0.6,1.1,0.1);                  //Generate random salt concentration for crisps

  const mol_weight = 58.45;                                           //NaCl molecular weight
  const water_ratio = 0.6;                                            //Young man water ratio
  
  const water_drunk = beers*0.5;                                      //Amount of water drunk
  const salt_weight = salt_concentration*crisps/100;                  //Weight of salt ingested
  const salt_mol = salt_weight/mol_weight;                            //Quantity of salt ingested
  const salt_mosmol = salt_mol * 2000;                                //Mosmols ingested

  //Generate case description
  //Title
  let h1 = document.createElement("h1"); 
  h1.innerHTML = "Case 3 : Jakob at the Friday Bar";
  //First paragraph
  let p = document.createElement("p");
  p.innerHTML = `Jakob (${weight} kg) is thirsty and hungry after lugging crates of beer in the Friday bar. He quickly consumes ${beers} large 1⁄2 L draft beers and a ${crisps} g bag of crisps.`;
  //Second paragraph
  let p2 = document.createElement("p");
  p2.innerHTML = `The crisps contain ${salt_concentration}% salt (NaCl), which has a molecular weight of ${mol_weight} g/mol. Other osmotically active substances in the crisps and beer as well as alcohol in the beer are ignored.`;
  //Write to description
  let desc = document.getElementById("caseDescription");
  desc.appendChild(h1);
  desc.appendChild(p);
  desc.appendChild(p2);
  //Generate short-hand case description for second part
  document.getElementById("topDescription").innerHTML = `<b style='font-weight: 700'>Case 3 Summary</b>:  Jakob | M | ${weight} kg | ${beers} 1⁄2 L beers | ${crisps} g crisps, ${salt_concentration}% salt | NaCl:  ${mol_weight} g/mol`;

  //Generate reference values from case description
  const concentration_0 = 290;

  const TBW_0 = round_1(water_ratio*weight);

  const TBM_0 = Math.round(TBW_0*concentration_0);
  const ECM_0 = Math.round(TBM_0/3);
  const ICM_0 = Math.round(2*TBM_0/3);

  const ECV_0 = round_1(TBW_0*ECM_0/TBM_0);
  const ICV_0 = round_1(TBW_0*ICM_0/TBM_0);

  let reference = [ECV_0, concentration_0, ECM_0, ICV_0, concentration_0, ICM_0, TBW_0, concentration_0, TBM_0];
  
  //Generate answer values from case description
  const TBW_1 = round_1(TBW_0 + water_drunk);
  
  const ECM_1 = Math.round(ECM_0 + salt_mosmol);
  const ICM_1 = ICM_0;
  const TBM_1 = Math.round(ECM_1+ICM_1);

  const concentration_1 = Math.round(TBM_1/TBW_1);

  const ECV_1 = round_1(TBW_1*ECM_1/TBM_1);
  const ICV_1 = round_1(TBW_1*ICM_1/TBM_1);

  let table_answers = [ECV_1, concentration_1, ECM_1, ICV_1, concentration_1, ICM_1, TBW_1, concentration_1, TBM_1];
  console.log(answers);
  let V_labels = [TBW_0, TBW_1, ECV_0, ECV_1, ICV_0, ICV_1];
  V_labels.push(round_1((ECM_0 + salt_mosmol/2)/(TBM_0 + salt_mosmol/2)*TBW_1), round_1((ICM_0 + salt_mosmol/2)/(TBM_0 + salt_mosmol/2)*TBW_1));
  V_labels.push(round_1((ECM_0)/(TBM_1)*TBW_1), round_1((ICM_0 + salt_mosmol)/(TBM_1)*TBW_1));
  V_labels.push(round_1((ECM_0)/(TBM_0 + salt_mosmol/2)*TBW_1), round_1((ICM_0)/(TBM_0 + salt_mosmol/2)*TBW_1));
  V_labels.push(round_1(TBW_0 + water_ratio*water_drunk));

  let C_labels = [concentration_0, concentration_1];
  C_labels.push(Math.round((TBM_0 + salt_mosmol/2)/TBW_1));
  C_labels.push(Math.round((TBM_0 + salt_mosmol/2)/TBW_0));
  C_labels.push(Math.round(TBM_1/TBW_0), Math.round(TBM_0/TBW_1));
  C_labels.push(Math.round((TBM_0 + crisps/mol_weight*2000)/TBW_1), Math.round((TBM_0 + crisps/mol_weight*2000)/TBW_0));
  C_labels.push(Math.round(1.1*concentration_0), Math.round(0.9*concentration_0));

  let M_labels = [TBM_0, ECM_0, ICM_0, TBM_1, ECM_1];
  M_labels.push(Math.round(TBM_0 + salt_mosmol/2), Math.round(ECM_0 + salt_mosmol/2));
  M_labels.push(Math.round(ICM_0 + salt_mosmol), Math.round(ICM_0 + salt_mosmol/2));
  M_labels.push(Math.round(concentration_0 * TBW_1), Math.round(TBM_0 + crisps/mol_weight*2000), Math.round(ECM_0 + crisps/mol_weight*2000));
  
  //Shuffle and concatenate labels
  let labels = [...shuffleArray(V_labels), ...shuffleArray(C_labels), ...shuffleArray(M_labels)];

  //Generate questions, multiple choice answers and correct answer
  questions.push("Why is the osmolarity decreasing?");
  answers.push(["The loss of NaCl exceeds the loss of water", "Because of hypotonic volume expansion", "Because of hypertonic volume expansion"]);
  correctAnswers.push(2);

  questions.push("What happens to Jakob’s free water clearance after drinking beer and eating crisps?");
  answers.push(["It is decreased", "It is unchanged", "It is increased"]);
  correctAnswers.push(3);

  questions.push("Why is the relative increase in ECV greater than that of the ICV?");
  answers.push(["Because of a loss of intracellular osmoles", "Because of an osmotically induced water flow from ICV to ECV", "Because of an increase in the number of extracellular osmoles"]);
  correctAnswers.push(3);

  questions.push("If Jakob does not eat the crisps, but has the same intake of water");
  answers.push(["The relative increase in ICV would be greater than the relative increase in ECV", "The relative increase in the volumes of ECV and ICV would be equal", "The relative increase in ICV would be less than the relative increase in ECV"]);
  correctAnswers.push(2);

  return [reference, table_answers, labels];  
}

/// CLICK AND DRAG ///////////////////////////////////////////////////////////

function dragFunction(element){
    return function(event){

      userX = event.clientX || event.targetTouches[0].pageX;            //Get mouse x position
      userY = event.clientY || event.targetTouches[0].pageY;            //Get mouse y position
      let shiftX = userX - element.getBoundingClientRect().left;        //Get mouse x position relative to the clicked element
      let shiftY = userY - element.getBoundingClientRect().top;         //Get mouse y position relative to the clicked element

    const newElement = element.cloneNode(true);                         //Clone element, leave duplicate in arsenal

    document.body.appendChild(newElement);                              //Add cloned element to page
    newElement.style.pointerEvents = "none";                            //Disable click-through (bug fix)
    newElement.style.position = "fixed";                                //Fixed position for exact positioning
    newElement.style.zIndex = 1000;                                     //Pull to the top
    document.body.classList.add('no-select');                           //Disable text selection 
    moveAt(userX, userY);                                               //Move element to position (bug fix)
  
    function moveAt(pageX, pageY) {
        newElement.style.left = pageX - shiftX + 'px';                  //Move element to mouse position (x)
        newElement.style.top = pageY - shiftY + 'px';                   //Move element to mouse position (y)
    }
  
    function onMouseMove(event) {
      userX = event.clientX || event.targetTouches[0].pageX;            //On mouse move, get mouse position (x)
      userY = event.clientY || event.targetTouches[0].pageY;            //On mouse move, get mouse position (y)
      moveAt(userX, userY);                                             //Move
    }

    document.addEventListener('mousemove', onMouseMove);                //Add drag listener (mouse)
    document.addEventListener('touchmove', onMouseMove);                //Add drag listener (touchscreen)
    document.addEventListener('mouseup', onMouseUp);                    //Add release listener (mouse)
    document.addEventListener('touchend', onMouseUp);                   //Add release listener (touchscreen)
  
    function onMouseUp(event) {
      document.removeEventListener('mousemove', onMouseMove);           //Remove drag listener (mouse)
      document.removeEventListener('mouseup',onMouseUp);                //Remove release listener (mouse)
      document.removeEventListener('touchmove', onMouseMove);           //Remove drag listener (touchscreen)
      document.removeEventListener('touchend',onMouseUp);               //Remove release listener (touchscreen)
      newElement.style.pointerEvents = "auto";                          //Bug fix
      toFill.forEach(rectangle => {                                     //Check for collision on drop
      const rect = rectangle.getBoundingClientRect();
      if (userX >= rect.left && userX <= rect.right && userY >= rect.top && userY <= rect.bottom) {
        addLabel(rectangle, newElement);                                //Add label (by modifying text content)
      }});
      newElement.remove();                                              //Remove dragged label (useless now)
    };
  }
}

function addLabel(rectangle, element){
    rectangle.textContent = element.textContent;                        //Add dropped label to rectangle by changing text content
}

/// VERIFICATION AND SCORING ///////////////////////////////////////////////////////////

function consistencyCheck(){

  //Check consistency of the study table (gridRectangles)

  consistent = true;                                          //Boolean to check if table is consistent
  let bool = true;                                            //Boolean to check if one of the lines is wrong (avoid duplicate error messages)
  const kTtext = document.getElementById("kTtext");           //Get end window text element
  kTtext.innerHTML = "Your results are inconsistent.</br>";   //Initialize text
  if (round_1(parseFloat(gridRectangles[0].textContent) + parseFloat(gridRectangles[3].textContent)) != parseFloat(gridRectangles[6].textContent)){
    //If first column is inconsistent (volume does not sum)
    consistent = false;
    document.getElementById("volumeTrue").style.display = "none";         //Hide "correct" checkmark from first column
    document.getElementById("volumeFalse").style.display = "block";       //Show "wrong" checkmark from first column
    kTtext.innerHTML += "Hint (Volume): TBW = ECV + ICV</br>";            //Write hint to end window text
  }
  else{
    document.getElementById("volumeFalse").style.display = "none";        //Hide "wrong" checkmark from first column
    document.getElementById("volumeTrue").style.display = "block";        //Show "correct" checkmark from first column
  }
  if (parseFloat(gridRectangles[1].textContent) != parseFloat(gridRectangles[4].textContent) || parseFloat(gridRectangles[4].textContent) != parseFloat(gridRectangles[7].textContent)){
    //If second column is inconsistent (concentration is not constant)
    consistent = false;
    document.getElementById("concentrationTrue").style.display = "none";  //Hide "correct" checkmark from second column
    document.getElementById("concentrationFalse").style.display = "block";//Show "wrong" checkmark from second column
    kTtext.innerHTML += "Hint (Concentration): Remember osmosis!</br>";   //Write hint to end window text
  }
  else{
    document.getElementById("concentrationFalse").style.display = "none"; //Hide "wrong" checkmark from second column
    document.getElementById("concentrationTrue").style.display = "block"; //Show "correct" checkmark from second column
  }
  if (round_1(parseFloat(gridRectangles[2].textContent) + parseFloat(gridRectangles[5].textContent)) != parseFloat(gridRectangles[8].textContent)){
    //If third column is inconsistent (mosmol does not sum)
    consistent = false;
    document.getElementById("totalTrue").style.display = "none";          //Hide "correct" checkmark from third column
    document.getElementById("totalFalse").style.display = "block";        //Show "wrong" checkmark from third column
  }
  else{
    document.getElementById("totalFalse").style.display = "none";         //Hide "wrong" checkmark from third column
    document.getElementById("totalTrue").style.display = "block";         //Show "correct" checkmark from third column
  }
  if (Math.abs(parseFloat(gridRectangles[0].textContent) * parseFloat(gridRectangles[1].textContent) - parseFloat(gridRectangles[2].textContent.replace(' ',''))) > 20){
    //If first row is inconsistent (V*C != mosmol)
    consistent = false;
    document.getElementById("ecvTrue").style.display = "none";          //Hide "correct" checkmark from first row
    document.getElementById("ecvFalse").style.display = "block";        //Show "wrong" checkmark from first row
    if(bool){kTtext.innerHTML += "Hint: Total mosmol = Volume * Concentration</br>";} //Write hint to end window text if not done before
    bool = false;                                                       //Disable further duplicate texts
  }
  else{
    document.getElementById("ecvFalse").style.display = "none";         //Hide "wrong" checkmark from first row
    document.getElementById("ecvTrue").style.display = "block";         //Show "correct" checkmark from first row
  }
  if (Math.abs(parseFloat(gridRectangles[3].textContent) * parseFloat(gridRectangles[4].textContent) - parseFloat(gridRectangles[5].textContent.replace(' ',''))) > 20){
    //If second row is inconsistent (V*C != mosmol)
    consistent = false;
    document.getElementById("icvTrue").style.display = "none";          //Hide "correct" checkmark from first row
    document.getElementById("icvFalse").style.display = "block";        //Show "wrong" checkmark from first row
    if(bool){kTtext.innerHTML += "Hint: Total mosmol = Volume * Concentration</br>";} //Write hint to end window text if not done before
    bool = false;                                                       //Disable further duplicate texts
  }
  else{
    document.getElementById("icvFalse").style.display = "none";         //Hide "wrong" checkmark from first row
    document.getElementById("icvTrue").style.display = "block";         //Show "correct" checkmark from first row
  }
  if (Math.abs(parseFloat(gridRectangles[6].textContent) * parseFloat(gridRectangles[7].textContent) - parseFloat(gridRectangles[8].textContent.replace(' ',''))) > 20){
    //If third row is inconsistent (V*C != mosmol)
    consistent = false;
    document.getElementById("tbwTrue").style.display = "none";          //Hide "correct" checkmark from first row
    document.getElementById("tbwFalse").style.display = "block";        //Show "wrong" checkmark from first row
    if(bool){kTtext.innerHTML += "Hint: Total mosmol = Volume * Concentration</br>";} //Write hint to end window text if not done before
    bool = false;                                                       //Disable further duplicate texts
  }
  else{
    document.getElementById("tbwFalse").style.display = "none";         //Hide "wrong" checkmark from first row
    document.getElementById("tbwTrue").style.display = "block";         //Show "correct" checkmark from first row
  }
}

function verifyGrid(){
  //Checks if filled table is correct and computes score
  attempt += 1;                                                                         //Increase attempt number
  consistencyCheck();                                                                   //Check if table is consistent
  const cong = document.getElementById("congratulations");                              //Get success end window
  const kT = document.getElementById("keepTrying");                                     //Get error end window
  const kTtext = document.getElementById("kTtext");                                     //Get error text
  const returnW = document.getElementById("return");                                    //Get return window
  if (consistent){                                                                      //If inconsistent, no need to check the rest
    let allGood = true;                                                                 //Boolean that stays true if there are no mistakes
    setScore(currentScore + firstConsistent ? Math.max(6 - attempt, 1) * 10 : 0);       //If first time the table is consistent: add score (between 50 and 10 depending on attempt)
    firstConsistent = false;                                                            //Disable scoring for consistency
    for (let i = 0; i<9; i++){
      allGood = allGood && gridRectangles[i].textContent == answersRectangles[i];       //Check if rectangle values are correct
      console.log(allGood);
      ///allGood = allGood && true;
    }
    if (caseID == 0){                                                                   //Handle Case 0 differently, because there is no step 2
      returnW.style.animationDuration = '0s';                                           //Immediately display return window
      returnW.style.display = "flex";                                                   //Display return window
    }
    else{
      if (allGood){                                                                     //For other cases, if everything is correct
        setScore(currentScore + Math.max(6 - attempt, 1) * 10);                         //Increase Score (50 - 10, depending on number of attempts)
        cong.addEventListener('animationend', function () {cong.style.display = "none"; transition_01();})    //After end window dissapears, transition to step 2
        void cong.offsetWidth;                                                          //Reset congratulations animation
        cong.style.display = "flex";                                                    //Display congratulations end window
      }
      else{                                                                             //If consistent but incorrect results
        kTtext.textContent = "Your results are consistent, but the values are not the ones we are looking for. Keep looking !";
        kT.addEventListener('animationend', function () {kT.style.display = "none";})   //Display "keep trying" window
        void kT.offsetWidth;
        kT.style.display = "flex";
      }
    }}
    else{
      kT.addEventListener('animationend', function () {kT.style.display = "none";})     //If inconsistent results, keep trying window should have correct text
      void kT.offsetWidth;
      kT.style.display = "flex";                                                        //Display keep trying window
    }
    }


function setScore(n){
  //Sets the score to given value, and update highscore if necessary
  currentScore = n;                                                                     //Update current score
  if (currentScore > highScore){
    highScore = currentScore;                                                           //Update highscore if necessary
  }
  document.getElementById('currentScore').textContent = currentScore;                   //Display current score
  document.getElementById('highScore').textContent = highScore;                         //Display high score
  localStorage.setItem('FB_highScore_'+caseID.toString(), highScore)                    //Store high score locally
}

/// PART 2 - GRAPHICAL VISUALIZATION /////////////////////////////////////////////////


function offsetLeft(element){                                         //Compute the exact x position (from the left)
  return element.offsetLeft;
}

function offsetTop(element){                                          //Compute the exact y position (from the top)
  return element.offsetTop;
}
async function calculatePositions(){

  //Dynamically calculate where tables should be positioned, for smooth transition between step 1 & 2
  //This function executes in milliseconds after case selection, by placing the tables using relative positioning,
  //and storing their absolute position in pixels

  table0.push([offsetLeft(tables[0]),offsetTop(tables[0])]);          //Get initial position of reference table (step 1)
  table1.push([offsetLeft(tables[1]),offsetTop(tables[1])]);          //Get initial position of study table (step 1)

  tables[0].style.left = "3vw";                                       //Set reference table x position to step 2
  tables[0].style.top  = "9dvh";                                      //Set reference table y position to step 2

  tables[1].style.right = "1vw";                                      //Set study table x position to step 2
  tables[1].style.top  = "9dvh";                                      //Set study table y position to step 2

  table0.push([offsetLeft(tables[0]),offsetTop(tables[0])]);          //Get second position of reference table (step 2)
  table1.push([offsetLeft(tables[1]),offsetTop(tables[1])]);          //Get second position of study table (step 2)

  tables[0].style.position = "absolute";                              //Set absolute positioning for pixel positioning (reference table)
  tables[1].style.position = "absolute";                              //Set absolute positioning for pixel positioning (study table)

  tables[0].style.left = table0[0][0]+'px';                           //Position reference table for step 1 (x)
  tables[0].style.top  = table0[0][1]+'px';                           //Position reference table for step 1 (y)

  tables[1].style.left = table1[0][0]+'px';                           //Position study table for step 1 (x)
  tables[1].style.right = "";                                         //Reset undesirable "right" positioning
  tables[1].style.top  = table1[0][1]+'px';                           //Position study table for step 1 (y)

  await delay(1);                                                     //Make sure tables are back to step 1
  tables[0].classList.add("smoothTransitions");                       //Add smooth transition to reference table
  tables[1].classList.add("smoothTransitions");                       //Add smooth transition to study table
}

async function transition_01 (){

  //Handles the transition between steps 1 & 2, including animations

  document.getElementById('caseDescription').style.display = "none";                                //Hide case description
  tables[0].style.left = table0[1][0]+'px';                                                         //Move reference table laterally
  tables[1].style.left = table1[1][0]+'px';                                                         //Move study table laterally
  await delay(500);                                                                                 //Wait until end of move
  document.querySelectorAll(".checkWrapper").forEach(element => element.style.display = "none");    //Hide consistency checks
  tables[0].style.top  = table0[1][1]+'px';                                                         //Move reference table vertically
  tables[1].style.top  = table1[1][1]+'px';                                                         //Move study table vertically
  await delay(500);                                                                                 //Wait until end of move
  document.getElementById("diagramContainer").style.opacity = 1;                                    //Display diagrams
  document.getElementById('arsenalContainer').style.backgroundColor="var(--light-highlight)";       //Change arsenal container (from tiles to full)
  allLabels.forEach(lab => lab.style.opacity = 0);                                                  //Hide labels
  document.querySelectorAll('.tileTitle').forEach(lab => lab.style.opacity = 0);                    //Hide tile titles
  document.querySelectorAll('.arsenalTile').forEach(element => element.style.width = "33.33334%");  //Widen tiles (animation)
  await delay(500);                                                                                 //Wait until end of animation
  document.querySelectorAll('.arsenalTile').forEach(element => element.style.display = "none");     //Remove tile (and labels it contains)
  document.getElementById('arsenalContainer').style.boxShadow = "3px 3px 5px black";                //Add shadow to arsenal container
  document.getElementById('topDescription').style.display = "flex";                                 //Display short-hand description
  getScales();                                                                                      //Diagram animation: get animation values
  ECV_animation();                                                                                  //Start ECV animation
  ICV_animation();                                                                                  //Start ICV animation

  document.getElementById("questionStart").style.display = "flex";                                  //Display questions block
  setQuestion(currentQ);                                                                            //Set first question
}

function getScales(){
  ECV_scaleX = parseFloat(allRectangles[9].textContent)/parseFloat(allRectangles[0].textContent);   //Get how much ECV should stretch horizontally
  ECV_scaleY = parseFloat(allRectangles[10].textContent)/parseFloat(allRectangles[1].textContent);  //Get how much ECV should stretch vertically

  ICV_scaleX = parseFloat(allRectangles[12].textContent)/parseFloat(allRectangles[3].textContent);  //Get how much ICV should stretch horizontally
  ICV_scaleY = parseFloat(allRectangles[13].textContent)/parseFloat(allRectangles[4].textContent);  //Get how much ICV should stretch vertically
}

async function ECV_animation(){
  //Controls the stretch animation of ECV rectangle
  const ECV = document.getElementById("ECV1");                              //Get ECV rectangle
  ECV.style.transform = `scaleX(${ECV_scaleX}) scaleY(${ECV_scaleY})`;      //Transform using stretch factors
  await delay (8000);                                                       //Wait for a long time in deformed state
  ECV.style.transform = `scaleX(1) scaleY(1)`;                              //Return to healthy state
  await delay (2000);                                                       //Wait a bit
  ECV_animation();                                                          //Loop
}

async function ICV_animation(){
  //Controls the stretch animation of ICV rectangle
  const ICV = document.getElementById("ICV1");                              //Get ICV rectangle
  ICV.style.transform = `scaleX(${ICV_scaleX}) scaleY(${ICV_scaleY})`;      //Transform using stretch factors
  await delay (8000);                                                       //Wait a long time in deformed state
  ICV.style.transform = `scaleX(1) scaleY(1)`;                              //Return to healthy state
  await delay (2000);                                                       //Wait a bit
  ICV_animation();                                                          //Loop
}

function x_highlight(id){
  //Animates the extension of a horizontal arrow
  let element = document.getElementById(id);                                //Get arrow                        
  element.style.width = "100%";                                             //Set to full width
  element.offsetHeight;                                                     //Reset animation
  element.style.animation = "xExtend 0.5s forwards";                        //Animate
}

async function x_restore(id){
  //Animates the retraction of a horizontal arrow
  let element = document.getElementById(id);                                //Get arrow
  element.offsetHeight;                                                     //Reset animation
  element.style.width = "10%";                                              //Set to low width
  element.style.animation = "xRetract 0.5s forwards";                       //Animate
}

function y_highlight(id){
  //Animates the extension of a vertical arrow
  let element = document.getElementById(id);                                //Get arrow
  element.style.display = "flex";                                           //Position correctly
  element.style.height = "100%";                                            //Set to full height
  element.offsetHeight;                                                     //Reset animation
  element.style.animation = "yExtend 0.5s forwards";                        //Animate
}

async function y_restore(id){
  //Animates the retraction of a vertical arrow
  let element = document.getElementById(id);                                //Get arrow
  element.offsetHeight;                                                     //Reset animation
  element.style.height = "10%";                                             //Set to low height
  element.style.animation = "yRetract 0.5s forwards";                       //Animate
}

async function diagram_update() {

  //Updates shadows. Purpose of the shadows is to follow the shape of the stretched rectangles but without stretching,
  //allowing for nicer looking arrows

  //Update size and position of total container
  TBW1_Container.style.width = document.getElementById('ECV1').getBoundingClientRect().width + document.getElementById('ICV1').getBoundingClientRect().width +"px";
  TBW1_Container.style.height = Math.max(document.getElementById('ECV1').getBoundingClientRect().height,document.getElementById('ICV1').getBoundingClientRect().height) + "px";
  TBW1_Container.style.left = document.getElementById('ECV1').getBoundingClientRect().left + "px";
  TBW1_Container.style.top = Math.max(document.getElementById('ECV1').getBoundingClientRect().top, document.getElementById('ICV1').getBoundingClientRect().top) + "px";
  //Update size and position of ECV shadow
  ECV_Shadow.style.width = document.getElementById('ECV1').getBoundingClientRect().width+"px";
  ECV_Shadow.style.height = document.getElementById('ECV1').getBoundingClientRect().height + "px";
  ECV_Shadow.style.left = document.getElementById('ECV1').getBoundingClientRect().left + "px";
  ECV_Shadow.style.top = document.getElementById('ECV1').getBoundingClientRect().top + "px";
  //Update size and position of ICV shadow
  ICV_Shadow.style.width = document.getElementById('ICV1').getBoundingClientRect().width+"px";
  ICV_Shadow.style.height = document.getElementById('ICV1').getBoundingClientRect().height + "px";
  ICV_Shadow.style.left = document.getElementById('ICV1').getBoundingClientRect().left + "px";
  ICV_Shadow.style.top = document.getElementById('ICV1').getBoundingClientRect().top + "px";
  await delay(10);            //Wait before looping
  diagram_update();           //Loop
}

diagram_update();             //Start loop

/// PART 3: QUESTIONS /////////////////////////////////////////////////////////

function sendAnswer(n){
  //Function triggered when an answer is chosen. Records the answer, and score
  if (userAnswers.length < currentQ) {                                              //If the question has not been answered yet
    if (n == correctAnswers[userAnswers.length]) {setScore(currentScore + 10)};     //Add score if correct answer
    userAnswers.push(n);                                                            //Record answer
    maxQ = Math.min(maxQ+1,questions.length);                                       //Raise maximum question reached by one (if there is one more)
  }
  setQuestion(currentQ);                                                            //Reset question: the recorded answer will change the display
}

function setQuestion(i){
  //Sets the given question: display correct question and corresponding answers; if question was answered already, show which is correct and which was chosen
  if (i < 1 || i > maxQ ){return 0;}                                                //Impossible to set a question if the number does not exist
  if (userAnswers.length == questions.length && firstEnd){                          //If all question have been answered
    const returnW = document.getElementById("return");                              //Get return window
    returnW.style.animationDuration = '0s';                                         //Immediate display
    returnW.style.display = "flex";                                                 //Display
    firstEnd = false;                                                               //Disable further triggers
  }
  document.querySelectorAll(".singleAnswer > .checkWrapper").forEach(element => element.style.display = "none");          //Hide all checkmarks tied to answers
  document.querySelectorAll(".checkWrapper > img").forEach(element => element.style.display = "none");                    //Hide all checkmarks tied to answers (bug fix)
  currentQ = i;                                                                                                           //Keep track of new question
  //If Question 1: "Previous question" button should be inactive
  if (i==1){document.getElementById("previousQ").classList.add("inactiveButton");document.getElementById("previousQ").classList.remove("activeButton");}
  else{document.getElementById("previousQ").classList.add("activeButton");document.getElementById("previousQ").classList.remove("inactiveButton");}
  //If not the last question reached: "Next question" button should be active
  if (i<maxQ){document.getElementById("nextQ").classList.add("activeButton");document.getElementById("nextQ").classList.remove("inactiveButton");}
  else{document.getElementById("nextQ").classList.add("inactiveButton");document.getElementById("nextQ").classList.remove("activeButton");}
  document.getElementById("qNumber").textContent = "Question "+currentQ;            //Update question number
  document.getElementById("qTitle").textContent = questions[currentQ-1];            //Update question text
  document.getElementById("answer1").textContent = answers[currentQ-1][0];          //Update answer text
  document.getElementById("answer2").textContent = answers[currentQ-1][1];          //Update answer text
  document.getElementById("answer3").textContent = answers[currentQ-1][2];          //Update answer text

  document.getElementById("answer1").classList.remove("selectedButton");            //Reset style
  document.getElementById("answer2").classList.remove("selectedButton");            //Reset style
  document.getElementById("answer3").classList.remove("selectedButton");            //Reset style

  if (i < maxQ || (userAnswers.length == correctAnswers.length)){                  //If the question has been answered (not max reached, or all question answered)
    document.getElementById("answer1").style.backgroundColor = correctAnswers[i-1] == 1 ? "darkgreen" : "maroon";       //Show the correct answer in green, others in red
    document.getElementById("answer2").style.backgroundColor = correctAnswers[i-1] == 2 ? "darkgreen" : "maroon";       //Show the correct answer in green, others in red
    document.getElementById("answer3").style.backgroundColor = correctAnswers[i-1] == 3 ? "darkgreen" : "maroon";       //Show the correct answer in green, others in red
    
    document.getElementById("answer1").classList.remove("activeButton");          //Disable buttons
    document.getElementById("answer2").classList.remove("activeButton");          //Disable buttons
    document.getElementById("answer3").classList.remove("activeButton");          //Disable buttons

    document.querySelectorAll(".singleAnswer > .checkWrapper").forEach(element => element.style.display = "flex");      //Display check marks

    //Display which answer was selected by the user with a white border and larger scale
    if (userAnswers[i-1] == 1){document.getElementById("answer1").classList.add("selectedButton")}
    if (userAnswers[i-1] == 2){document.getElementById("answer2").classList.add("selectedButton")}
    if (userAnswers[i-1] == 3){document.getElementById("answer3").classList.add("selectedButton")}

    //Display which answer is correct with a check mark
    if (correctAnswers[i-1] == 1){document.getElementById("a1True").style.display = "block"; document.getElementById("a2False").style.display = "block"; document.getElementById("a3False").style.display = "block"}
    if (correctAnswers[i-1] == 2){document.getElementById("a1False").style.display = "block"; document.getElementById("a2True").style.display = "block"; document.getElementById("a3False").style.display = "block"}
    if (correctAnswers[i-1] == 3){document.getElementById("a1False").style.display = "block"; document.getElementById("a2False").style.display = "block"; document.getElementById("a3True").style.display = "block"}

  }
  else{
    //If question has not been answered, set backgrounds to black and activate buttons
    document.getElementById("answer1").style.backgroundColor = "var(--pseudo-black)";     
    document.getElementById("answer2").style.backgroundColor = "var(--pseudo-black)";
    document.getElementById("answer3").style.backgroundColor = "var(--pseudo-black)";

    document.getElementById("answer1").classList.add("activeButton");
    document.getElementById("answer2").classList.add("activeButton");
    document.getElementById("answer3").classList.add("activeButton");
  }

};



allLabels.forEach(lab=> lab.style.display = "none");
caseContainer.style.display = "none";