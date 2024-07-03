let currentQuestionIndex = 0;
let selectedExamQuestions = [];

const examContainer = document.getElementById("exam-container");
const examButtonsContainer = document.getElementById("exam-buttons");
const quizContainer = document.getElementById("quiz-container");
const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const passageElement = document.getElementById("passage");
const answerButtonsElement = document.getElementById("answer-buttons");
const subjectiveAnswerElement = document.getElementById("subjective-answer");
const navigationButtonsElement = document.getElementById("navigation-buttons");
const nextQuestionButton = document.getElementById("next-question");

document.addEventListener("DOMContentLoaded", () => {
  fetchExams();
});

async function fetchExams() {
  try {
    const response = await fetch("/exams.json"); // 전체 시험 목록을 가져오는 JSON 파일
    const exams = await response.json();
    exams.forEach((exam) => {
      const button = document.createElement("button");
      button.classList.add("btn");
      button.innerText = exam.title;
      button.addEventListener("click", () => loadExam(exam.filename));
      examButtonsContainer.appendChild(button);
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
  }
}

async function loadExam(examFilename) {
  try {
    const response = await fetch(`/exams/${examFilename}`);
    const examData = await response.json();
    selectedExamQuestions = shuffleArray(examData.questions);
    currentQuestionIndex = 0;
    examContainer.classList.add("hide");
    quizContainer.classList.remove("hide");
    setNextQuestion();
  } catch (error) {
    console.error("Error loading exam:", error);
  }
}

function setNextQuestion() {
  resetState();
  showQuestion(selectedExamQuestions[currentQuestionIndex]);
}

function showQuestion(question) {
  questionElement.innerText = question.question;

  if (question.passage) {
    passageElement.innerText = question.passage;
    passageElement.classList.remove("hide");
  } else {
    passageElement.classList.add("hide");
  }

  if (question.options.length != 0) {
    subjectiveAnswerElement.classList.add("hide");
    answerButtonsElement.classList.remove("hide");
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.innerText = option;
      button.classList.add("btn");
      button.dataset.correct = (index + 1).toString() === question.answer;
      button.addEventListener("click", () => selectAnswer(button, question));
      answerButtonsElement.appendChild(button);
    });
  } else {
    answerButtonsElement.classList.add("hide");
    subjectiveAnswerElement.classList.remove("hide");
    subjectiveAnswerElement.focus();
    subjectiveAnswerElement.onkeydown = (event) => {
      if (event.key === "Enter") {
        selectSubjectiveAnswer(question);
      }
    };
    nextQuestionButton.onclick = () => selectSubjectiveAnswer(question);
  }
  navigationButtonsElement.classList.add("hide");
}

function resetState() {
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
  subjectiveAnswerElement.value = "";
  subjectiveAnswerElement.onkeydown = null;
  navigationButtonsElement.classList.add("hide");

  const resultItems = document.querySelectorAll(".result");
  resultItems.forEach((item) => item.remove());
}

function selectAnswer(selectedButton, question) {
  Array.from(answerButtonsElement.children).forEach((button) => {
    setStatusClass(button, button.dataset.correct === "true");
  });
  if (selectedButton.dataset.correct === "true") {
    selectedButton.classList.add("correct");
  } else {
    selectedButton.classList.add("wrong");
  }
  navigationButtonsElement.classList.remove("hide");
  nextQuestionButton.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedExamQuestions.length) {
      setNextQuestion();
    } else {
      showExamSelection();
    }
  };
}

function selectSubjectiveAnswer(question) {
  const userAnswer = subjectiveAnswerElement.value.trim();
  const correctAnswer = question.answer;
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  const resultItem = document.createElement("div");
  resultItem.classList.add("result");
  resultItem.innerHTML = `
        <p><strong>Correct answer:</strong> ${correctAnswer}</p>
    `;
  questionContainer.appendChild(resultItem);

  navigationButtonsElement.classList.remove("hide");
  nextQuestionButton.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedExamQuestions.length) {
      setNextQuestion();
    } else {
      showExamSelection();
    }
  };
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add("correct");
  } else {
    element.classList.add("wrong");
  }
}

function clearStatusClass(element) {
  element.classList.remove("correct");
  element.classList.remove("wrong");
}

function showExamSelection() {
  quizContainer.classList.add("hide");
  examContainer.classList.remove("hide");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
