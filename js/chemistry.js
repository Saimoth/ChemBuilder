"use strict";

function graphForComponent(component) {
  const index = new Map(component.map((a, i) => [a, i]));
  const edges = [];
  for (const current of bonds) {
    if (index.has(current.a) && index.has(current.b)) {
      edges.push({a:index.get(current.a), b:index.get(current.b), order:current.order});
    }
  }
  return {types:component.map(a => a.type), edges};
}

function adjacency(graph) {
  const result = Array.from({length:graph.types.length}, () => []);
  for (const edge of graph.edges) {
    result[edge.a].push({to:edge.b, order:edge.order});
    result[edge.b].push({to:edge.a, order:edge.order});
  }
  return result;
}

function graphIsomorphic(graph, template) {
  if (graph.types.length !== template.types.length || graph.edges.length !== template.edges.length) return false;

  const graphAdj = adjacency(graph);
  const templateAdj = adjacency(template);
  const signature = (types, adj, i) =>
    types[i] + "|" + adj[i].length + "|" + adj[i].reduce((sum, edge) => sum + edge.order, 0);

  const graphSignatures = graph.types.map((_, i) => signature(graph.types, graphAdj, i));
  const templateSignatures = template.types.map((_, i) => signature(template.types, templateAdj, i));

  if ([...graphSignatures].sort().join(";") !== [...templateSignatures].sort().join(";")) return false;

  const map = Array(graph.types.length).fill(-1);
  const used = Array(template.types.length).fill(false);
  const order = [...graph.types.keys()].sort((i, j) => {
    const iCount = templateSignatures.filter(value => value === graphSignatures[i]).length;
    const jCount = templateSignatures.filter(value => value === graphSignatures[j]).length;
    return iCount - jCount || graphAdj[j].length - graphAdj[i].length;
  });

  function compatible(graphIndex, templateIndex) {
    if (graphSignatures[graphIndex] !== templateSignatures[templateIndex]) return false;
    for (const graphEdge of graphAdj[graphIndex]) {
      const mapped = map[graphEdge.to];
      if (mapped < 0) continue;
      const templateEdge = templateAdj[templateIndex].find(edge => edge.to === mapped);
      if (!templateEdge || templateEdge.order !== graphEdge.order) return false;
    }
    return true;
  }

  function search(depth) {
    if (depth === order.length) return true;
    const graphIndex = order[depth];
    for (let templateIndex=0; templateIndex<template.types.length; templateIndex++) {
      if (!used[templateIndex] && compatible(graphIndex, templateIndex)) {
        map[graphIndex] = templateIndex;
        used[templateIndex] = true;
        if (search(depth + 1)) return true;
        map[graphIndex] = -1;
        used[templateIndex] = false;
      }
    }
    return false;
  }

  return search(0);
}

function identify(component) {
  const graph = graphForComponent(component);
  return TEMPLATES.find(template => graphIsomorphic(graph, template)) || null;
}

function components() {
  const result = [];
  const seen = new Set();

  for (const root of atoms) {
    if (seen.has(root)) continue;
    const component = [];
    const queue = [root];
    seen.add(root);

    while (queue.length) {
      const current = queue.shift();
      component.push(current);
      for (const edge of bonds) {
        const neighbour = edge.a === current ? edge.b : edge.b === current ? edge.a : null;
        if (neighbour && !seen.has(neighbour)) {
          seen.add(neighbour);
          queue.push(neighbour);
        }
      }
    }

    result.push(component);
  }

  return result.sort((a, b) => b.length - a.length);
}

function formulaOf(component) {
  const count = {};
  for (const a of component) count[a.type] = (count[a.type] || 0) + 1;
  const order = count.C
    ? ["C","H",...Object.keys(count).filter(type => type !== "C" && type !== "H").sort()]
    : Object.keys(count).sort();

  return order
    .filter(type => count[type])
    .map(type => type + (count[type] > 1 ? count[type] : ""))
    .join("");
}

function validity(component) {
  const invalid = component.filter(a => usedValence(a) > ELEMENTS[a.type].valence);
  const incomplete = component.filter(a => usedValence(a) < ELEMENTS[a.type].valence);
  return {invalid, incomplete};
}

function updateReadout() {
  if (challengeActive) scheduleChallengeCheck();

  if (!atoms.length) {
    formulaEl.textContent = "Start building";
    nameEl.textContent = "Drag atoms from the tray";
    nameEl.style.color = "#f5f7fa";
    detailsEl.textContent = "Structure-aware compound recognition";
    return;
  }

  const allComponents = components();
  const mainComponent = allComponents[0];
  const formula = formulaOf(mainComponent);
  const match = identify(mainComponent);
  const state = validity(mainComponent);

  formulaEl.textContent = prettyFormula(formula);

  if (match) {
    nameEl.textContent = match.name;
    nameEl.style.color = "var(--good)";
    detailsEl.textContent =
      (allComponents.length > 1 ? `${allComponents.length} separate molecules • ` : "") +
      (match.note || "Structure recognised");
  } else if (state.invalid.length) {
    nameEl.textContent = "Invalid valency";
    nameEl.style.color = "var(--bad)";
    detailsEl.textContent = "One or more atoms have too many bonds";
  } else if (state.incomplete.length) {
    nameEl.textContent = "Incomplete structure";
    nameEl.style.color = "var(--warn)";
    detailsEl.textContent =
      `${state.incomplete.length} atom${state.incomplete.length === 1 ? "" : "s"} still have unused valency`;
  } else {
    nameEl.textContent = "Valid structure — not in library";
    nameEl.style.color = "#c7cad1";
    detailsEl.textContent =
      (allComponents.length > 1 ? `${allComponents.length} separate molecules • ` : "") +
      "Try another isomer";
  }
}
