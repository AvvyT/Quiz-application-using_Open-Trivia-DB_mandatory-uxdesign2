let body = document.querySelector('body');
let start = document.querySelector('.main__button');
const main = document.querySelector('.main__body');
let divModal = document.querySelector('.my__modal');
let span = document.querySelector('.modal__close');
divModal.style.display = 'none';

//-------addEventListener-------------------
document.querySelector('.re__start').addEventListener('click', startQuiz);
start.addEventListener('click', startQuiz);
let buttonBack = document.querySelector('.back');
buttonBack.addEventListener('click', init);

const questionsContainer = document.createElement('div');
questionsContainer.classList.add('question-Answer__conteiner');
main.appendChild(questionsContainer);
let questions = {};
let correctAnswers = [];
let answers = [];
let qNumber = 0;

//------------------Init-------------------
function init() {
  questionsContainer.style.display = 'none';
  divModal.style.display = 'none';
  start.style.display = 'block';
}

//--------modal__close----------------------
span.onclick = function() {
  divModal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target === divModal) {
    divModal.style.display = 'none';
  }
}

//--------startQuiz------------------
function startQuiz() {
  questionsContainer.style.display = 'block';
  start.style.display = 'none';
  divModal.style.display = 'none';
  correctAnswers = []; // rensa gamla svar
  fetchQuestions();
}

//---------fetch data----------------
function fetchQuestions() {
  questionsContainer.innerHTML = '';
  body.style.background = '#F9F3FC';

  new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();

    req.addEventListener('load', function() {
      resolve(req.response);
    });
    req.open('GET', 'https://opentdb.com/api.php?amount=10');
    req.send();

  }).then(function(result) {
    questions = JSON.parse(result).results;

    renderQuestions();
  });
}

//----------------render QUESTIONS--------
function renderQuestions() {
  qNumber = 0;
  let ul = document.createElement('ul');
  ul.classList.add('question__List');
  questionsContainer.appendChild(ul);

  for (let key of questions) {

    let li = document.createElement('li');
    li.classList.add('question__Item');
    let p = document.createElement('p');
    p.classList.add('question__Text');
    p.textContent = decode(key.question);

    ul.appendChild(li);
    li.appendChild(p);

    answers = key.incorrect_answers;
    let correctAnswer = key.correct_answer;
    answers.push(correctAnswer);

    // spara rätt svar för varje fråga
    correctAnswers.push(correctAnswer);

    li.appendChild(renderRadio(answers, correctAnswer)); // append diven/för varje fråga
  }
  questionsContainer.appendChild(createSubmit());
}

//---------------- radioAnswers--------
function renderRadio(answers, correctAnswer) {
  qNumber++;

  let div = document.createElement('div');
  div.classList.add('question-Answer__Grp');

  answers.sort(function(a, b) {
    return 0.5 - Math.random()
  });
  for (let key of answers) {

    let label = document.createElement('label');
    label.classList.add('answer__Radio');
    let input = document.createElement('input');
    input.setAttribute("type", "radio");
    input.name = "question" + qNumber;
    //lägg en dataset-correct på alla rätta svar
    input.dataset.correct = key === correctAnswer;
    let span = document.createElement('span');
    span.classList.add('answer__text');
    span.textContent = decode(key);

    div.appendChild(label);
    label.appendChild(input);
    label.appendChild(span);
  }
  return div;
}

//---------------- createSubmit-------
function createSubmit() {
  let openModal = document.createElement('button');
  openModal.textContent = 'done_all';
  openModal.style.display = 'block';
  openModal.setAttribute('class', 'material-icons submit__result');
  openModal.addEventListener('click', submit);

  return openModal;
}

//---------------- Submit--------
function submit() {
  divModal.style.display = 'block';

  correctQuiz(answers, correctAnswers);
}

//---------------counterCorrect--------------
function correctQuiz(answers, correctAnswers) {
  console.log(correctAnswers);
  let grattis = document.querySelector('.modal__text');
  grattis.textContent = ''; // så sparas inte sista text när man re-start
  let p = document.querySelector('.text-extra');
  let wrongText = document.querySelector('.wrong-text');
  const answerGroups = document.querySelectorAll('.question-Answer__Grp');
  // div med varje quetion
  let correctCount = 0;

  // kolla om radio är checked o har rätta svar------------
  for (let i = 0; i < answerGroups.length; i++) {

    // The Array.from() method creates a new, shallow-copied Array instance
    const answerIsCorrect = Array.from(answerGroups[i].querySelectorAll('input'))
      .some(x => x.checked && x.dataset.correct === "true");
    // The some() method tests whether at least one element in the array passes the test

    // om inputen inehåller rätta svar då ++
    if (answerIsCorrect) {
      correctCount += 1;
      wrongText.style.display = 'none';
      grattis.textContent = 'Congratulations!!..';
      grattis.style.display = 'block';
      p.style.display = 'block';

    }

    // om alla radios är checkad
    const answerIsChecked = Array.from(answerGroups[i].querySelectorAll('input'))
      .some(x => x.checked);

    if (!answerIsChecked) { // om de är inte
      grattis.style.display = 'none';
      p.style.display = 'none';

      wrongText.style.display = 'block';
      return; // kolla att inte skriva redan rätta tills att alla är checkad
    }
    //------------sluta----------------------

  }
  if (correctCount === 0) {
    wrongText.style.display = 'none';
    grattis.textContent = 'Unfortunately, your answers are wrong!!!';
    grattis.style.display = 'block';
  }
  p.textContent = 'You answered ' + correctCount + '/10 questions correctly!!!';
}

//---------------- chenge the simboler-text--------
function decode(input) {
  let doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}
