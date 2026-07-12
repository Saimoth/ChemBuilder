"use strict";

function skeletalDisplayGraph(types, edges) {
  const neighbours = Array.from({length:types.length}, () => []);
  for (const edge of edges) {
    neighbours[edge.a].push(edge.b);
    neighbours[edge.b].push(edge.a);
  }

  const hidden = new Set();
  const hydroxyl = new Set();

  for (let i=0; i<types.length; i++) {
    if (types[i] !== "H") continue;
    const attached = neighbours[i];
    if (attached.length !== 1) continue;
    const neighbour = attached[0];

    if (types[neighbour] === "C") hidden.add(i);
    if (types[neighbour] === "O") {
      const oxygenNeighbours = neighbours[neighbour];
      if (oxygenNeighbours.some(index => types[index] === "C")) {
        hidden.add(i);
        hydroxyl.add(neighbour);
      }
    }
  }

  const nodes = types.map((_, i) => i).filter(i => !hidden.has(i));
  const nodeSet = new Set(nodes);
  const visibleEdges = edges.filter(edge => nodeSet.has(edge.a) && nodeSet.has(edge.b));
  return {nodes, edges:visibleEdges, hydroxyl};
}

function naturalSkeletalLayout(types, edges, nodes) {
  const positions = new Map();
  if (!nodes.length) return positions;
  if (nodes.length === 1) {
    positions.set(nodes[0], {x:0,y:0});
    return positions;
  }

  const nodeSet = new Set(nodes);
  const adjacencyMap = new Map(nodes.map(index => [index, []]));
  for (const edge of edges) {
    if (nodeSet.has(edge.a) && nodeSet.has(edge.b)) {
      adjacencyMap.get(edge.a).push(edge.b);
      adjacencyMap.get(edge.b).push(edge.a);
    }
  }

  const simpleRing = edges.length === nodes.length && nodes.every(index => adjacencyMap.get(index).length === 2);
  if (simpleRing) {
    const order = [nodes[0]];
    const seen = new Set(order);
    let previous = -1;
    let current = nodes[0];

    while (order.length < nodes.length) {
      const next = adjacencyMap.get(current).find(index => index !== previous && !seen.has(index));
      if (next === undefined) break;
      order.push(next);
      seen.add(next);
      previous = current;
      current = next;
    }

    const radius = Math.max(1, order.length / (2 * Math.PI));
    order.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * Math.PI * 2 / order.length;
      positions.set(node, {x:Math.cos(angle) * radius, y:Math.sin(angle) * radius});
    });
    return positions;
  }

  function farthest(start) {
    const queue = [start];
    const parent = new Map([[start,-1]]);
    const distance = new Map([[start,0]]);
    let best = start;

    while (queue.length) {
      const node = queue.shift();
      if (distance.get(node) > distance.get(best)) best = node;
      for (const next of adjacencyMap.get(node)) {
        if (!distance.has(next)) {
          distance.set(next, distance.get(node) + 1);
          parent.set(next, node);
          queue.push(next);
        }
      }
    }
    return {best,parent};
  }

  const first = farthest(nodes[0]).best;
  const secondSearch = farthest(first);
  const backbone = [];
  let node = secondSearch.best;

  while (node !== -1) {
    backbone.push(node);
    node = secondSearch.parent.get(node);
  }
  backbone.reverse();

  backbone.forEach((id, i) => positions.set(id, {x:i, y:i % 2 ? 0.42 : 0}));
  const placed = new Set(backbone);

  function placeBranches(parent, from, sign) {
    const children = adjacencyMap.get(parent).filter(index => index !== from && !placed.has(index));
    children.forEach((child, i) => {
      const parentPosition = positions.get(parent);
      const angle = (sign > 0 ? -1.05 : 1.05) + (i - (children.length - 1) / 2) * 0.55;
      positions.set(child, {
        x:parentPosition.x + Math.cos(angle),
        y:parentPosition.y + Math.sin(angle)
      });
      placed.add(child);
      placeBranches(child, parent, -sign);
    });
  }

  backbone.forEach((id, i) => placeBranches(id, i ? backbone[i-1] : -1, i % 2 ? 1 : -1));
  for (const id of nodes) if (!positions.has(id)) positions.set(id, {x:0,y:0});
  return positions;
}

function templateLayout(template) {
  const graph = skeletalDisplayGraph(template.types, template.edges);
  return naturalSkeletalLayout(template.types, graph.edges, graph.nodes);
}

function skeletalEdgeCycleInfo(edge, edges, nodes, pointForNode) {
  const adjacencyMap = new Map(nodes.map(id => [id, []]));
  for (const current of edges) {
    if (current === edge) continue;
    if (!adjacencyMap.has(current.a) || !adjacencyMap.has(current.b)) continue;
    adjacencyMap.get(current.a).push(current.b);
    adjacencyMap.get(current.b).push(current.a);
  }

  const queue = [edge.a];
  const parent = new Map([[edge.a,-1]]);
  while (queue.length) {
    const id = queue.shift();
    if (id === edge.b) break;
    for (const next of adjacencyMap.get(id) || []) {
      if (!parent.has(next)) {
        parent.set(next, id);
        queue.push(next);
      }
    }
  }

  if (!parent.has(edge.b)) return null;

  const cycleNodes = [];
  let id = edge.b;
  while (id !== -1) {
    cycleNodes.push(id);
    if (id === edge.a) break;
    id = parent.get(id);
  }
  if (cycleNodes[cycleNodes.length - 1] !== edge.a) return null;

  let x = 0;
  let y = 0;
  for (const node of cycleNodes) {
    const point = pointForNode(node);
    x += point.x;
    y += point.y;
  }
  return {x:x / cycleNodes.length, y:y / cycleNodes.length};
}

function skeletalAuxiliarySide(edge, graph, pointForNode) {
  const a = pointForNode(edge.a);
  const b = pointForNode(edge.b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const midX = (a.x + b.x) * 0.5;
  const midY = (a.y + b.y) * 0.5;
  const ringCentre = skeletalEdgeCycleInfo(edge, graph.edges, graph.nodes, pointForNode);

  if (ringCentre) {
    return dx * (ringCentre.y - midY) - dy * (ringCentre.x - midX) >= 0 ? 1 : -1;
  }

  let score = 0;
  for (const other of graph.edges) {
    let neighbour = null;
    if (other.a === edge.a && other.b !== edge.b) neighbour = other.b;
    else if (other.b === edge.a && other.a !== edge.b) neighbour = other.a;
    else if (other.a === edge.b && other.b !== edge.a) neighbour = other.b;
    else if (other.b === edge.b && other.a !== edge.a) neighbour = other.a;
    if (neighbour === null) continue;

    const point = pointForNode(neighbour);
    score += dx * (point.y - midY) - dy * (point.x - midX);
  }

  return score < 0 ? -1 : 1;
}
