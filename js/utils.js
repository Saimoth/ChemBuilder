"use strict";

const SUB = {"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉"};

function atom(type, x, y) {
  return {id:idCounter++, type, x, y, vx:0, vy:0};
}

function bond(a, b, order=1) {
  return {a, b, order};
}

function prettyFormula(formula) {
  return formula.replace(/\d/g, digit => SUB[digit]);
}
