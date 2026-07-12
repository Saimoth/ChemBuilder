"use strict";

let challengeActive = false;
let challengeTemplate = null;
let challengeDifficulty = "easy";
let lastChallengeName = "";
let challengeCheckTimer = 0;
let challengeSolved = false;

function challengeFormulaOfTemplate(template) {
  const count = {};
  for (const type of template.types) count[type] = (count[type] || 0) + 1;
  const order = count.C
    ? ["C","H",...Object.keys(count).filter(type => type !== "C" && type !== "H").sort()]
    : Object.keys(count).sort();

  return order
    .filter(type => count[type])
    .map(type => type + (count[type] > 1 ? count[type] : ""))
    .join("");
}

function challengePool() {
  return TEMPLATES.filter(template =>
    template.types.length >= 2 &&
    template.types.length <= 24 &&
    !/atom$/i.test(template.name)
  );
}

function pickChallenge() {
  const pool = challengePool();
  let options = pool.filter(template => template.name !== lastChallengeName);
  if (!options.length) options = pool;

  challengeTemplate = options[Math.floor(Math.random() * options.length)];
  lastChallengeName = challengeTemplate.name;
  challengeSolved = false;
  clearTimeout(challengeCheckTimer);
  document.getElementById("correctFlash").classList.remove("show");
  clearAll();
  document.getElementById("challengeResult").textContent = "";
  updateChallengePrompt();
}

function updateChallengePrompt() {
  if (!challengeTemplate) return;
  challengeDifficulty = document.getElementById("difficulty").value;
  document.getElementById("challengePrompt").textContent = `Build: ${challengeTemplate.name}`;
  document.getElementById("challengeFormula").textContent =
    challengeDifficulty === "hard" ? "" : prettyFormula(challengeFormulaOfTemplate(challengeTemplate));
}

function scheduleChallengeCheck() {
  if (!challengeActive || !challengeTemplate || challengeSolved) return;
  clearTimeout(challengeCheckTimer);
  challengeCheckTimer = setTimeout(checkChallengeAutomatically, 180);
}

function checkChallengeAutomatically() {
  if (!challengeActive || !challengeTemplate || challengeSolved || !atoms.length) return;
  const allComponents = components();
  if (allComponents.length !== 1) return;
  if (!graphIsomorphic(graphForComponent(allComponents[0]), challengeTemplate)) return;

  challengeSolved = true;
  document.getElementById("challengeResult").textContent = "";
  document.getElementById("correctFlash").classList.add("show");
  navigator.vibrate?.([35,45,55]);

  setTimeout(() => {
    if (challengeActive && challengeSolved) pickChallenge();
  }, 1900);
}

const challengePanel = document.getElementById("challengePanel");
const challengeActions = document.getElementById("challengeActions");

document.getElementById("gameBtn").addEventListener("click", () => {
  challengeActive = true;
  challengePanel.classList.add("open");
  challengeActions.classList.add("open");
  if (!challengeTemplate) pickChallenge();
});

document.getElementById("closeChallenge").addEventListener("click", () => {
  challengeActive = false;
  challengeSolved = false;
  clearTimeout(challengeCheckTimer);
  document.getElementById("correctFlash").classList.remove("show");
  challengePanel.classList.remove("open");
  challengeActions.classList.remove("open");
  updateReadout();
});

document.getElementById("difficulty").addEventListener("change", () => {
  updateChallengePrompt();
  scheduleChallengeCheck();
});

document.getElementById("nextChallenge").addEventListener("click", pickChallenge);
