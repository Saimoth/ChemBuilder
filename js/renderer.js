"use strict";

function drawLine(x1, y1, x2, y2, width) {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

function drawBond(current) {
  const dx = current.b.x - current.a.x;
  const dy = current.b.y - current.a.y;
  const distance = Math.hypot(dx,dy) || 1;
  const normalX = -dy / distance * 5.5;
  const normalY = dx / distance * 5.5;
  const isHighlighted = current === highlightedBond && performance.now() < highlightUntil;

  ctx.strokeStyle = isHighlighted ? "#74a8ff" : "#9ca2ad";
  ctx.lineCap = "round";

  if (isHighlighted) {
    ctx.save();
    ctx.shadowColor = "#74a8ff";
    ctx.shadowBlur = 14;
  }

  if (current.order === 1) {
    drawLine(current.a.x,current.a.y,current.b.x,current.b.y,6);
  } else if (current.order === 2) {
    drawLine(current.a.x+normalX,current.a.y+normalY,current.b.x+normalX,current.b.y+normalY,4);
    drawLine(current.a.x-normalX,current.a.y-normalY,current.b.x-normalX,current.b.y-normalY,4);
  } else if (current.order === 3) {
    drawLine(current.a.x,current.a.y,current.b.x,current.b.y,3);
    drawLine(current.a.x+normalX*1.6,current.a.y+normalY*1.6,current.b.x+normalX*1.6,current.b.y+normalY*1.6,3);
    drawLine(current.a.x-normalX*1.6,current.a.y-normalY*1.6,current.b.x-normalX*1.6,current.b.y-normalY*1.6,3);
  }

  if (isHighlighted) ctx.restore();
}

function drawAtom(a) {
  const element = ELEMENTS[a.type];
  const free = Math.max(0, freeValence(a));

  if (free > 0) {
    const linked = [];
    for (const current of bonds) linked.push(current.a === a ? current.b : current.b === a ? current.a : null);
    const real = linked.filter(Boolean);
    const base = real.length ? Math.atan2(a.y-real[0].y, a.x-real[0].x) : -Math.PI/2;

    ctx.strokeStyle = "rgba(255,255,255,.27)";
    ctx.lineWidth = 3;
    for (let i=0; i<free; i++) {
      const angle = base + (i - (free - 1) / 2) * 0.48;
      drawLine(
        a.x + Math.cos(angle) * element.radius * 0.7,
        a.y + Math.sin(angle) * element.radius * 0.7,
        a.x + Math.cos(angle) * (element.radius + 12),
        a.y + Math.sin(angle) * (element.radius + 12),
        3
      );
    }
  }

  ctx.beginPath();
  ctx.arc(a.x,a.y,element.radius,0,Math.PI*2);
  ctx.fillStyle = element.colour;
  ctx.fill();
  ctx.strokeStyle = a === dragged ? "#77aaff" : "#14161a";
  ctx.lineWidth = a === dragged ? 4 : 2;
  ctx.stroke();

  ctx.fillStyle = element.text;
  ctx.font = `800 ${Math.max(13,element.radius*.82)}px -apple-system,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(a.type,a.x,a.y+1);
}

function drawSkeletalBond(x1, y1, x2, y2, order, side=1) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx,dy) || 1;
  const unitX = dx / distance;
  const unitY = dy / distance;
  const normalX = -unitY;
  const normalY = unitX;

  ctx.strokeStyle = "#e4e7ec";
  ctx.lineCap = "round";
  drawLine(x1,y1,x2,y2,order === 1 ? 2.5 : 2.2);
  if (order === 1) return;

  const inset = Math.min(7,distance * 0.18);
  const spread = 2.55;
  const startX = x1 + unitX * inset;
  const startY = y1 + unitY * inset;
  const endX = x2 - unitX * inset;
  const endY = y2 - unitY * inset;

  drawLine(
    startX + normalX * spread * side,
    startY + normalY * spread * side,
    endX + normalX * spread * side,
    endY + normalY * spread * side,
    1.75
  );

  if (order >= 3) {
    drawLine(
      startX - normalX * spread * side,
      startY - normalY * spread * side,
      endX - normalX * spread * side,
      endY - normalY * spread * side,
      1.75
    );
  }
}

function drawSkeletalGraph(types, edges, panelX, panelY, panelW, panelH, title) {
  ctx.save();
  ctx.fillStyle = "rgba(37,40,46,.94)";
  ctx.strokeStyle = "#555c68";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(panelX,panelY,panelW,panelH,13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#9299a5";
  ctx.font = "700 10px -apple-system,sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(title,panelX+14,panelY+13);

  const graph = skeletalDisplayGraph(types,edges);
  const positions = naturalSkeletalLayout(types,graph.edges,graph.nodes);
  if (!graph.nodes.length) {
    ctx.restore();
    return;
  }

  let minX = Math.min(...graph.nodes.map(i => positions.get(i).x));
  let maxX = Math.max(...graph.nodes.map(i => positions.get(i).x));
  let minY = Math.min(...graph.nodes.map(i => positions.get(i).y));
  let maxY = Math.max(...graph.nodes.map(i => positions.get(i).y));
  if (maxX-minX < 0.2) {
    minX -= 0.65;
    maxX += 0.65;
  }
  if (maxY-minY < 0.2) {
    minY -= 0.55;
    maxY += 0.55;
  }

  const inner = {x:panelX+13,y:panelY+27,w:panelW-26,h:panelH-39};
  const scale = Math.min(inner.w/(maxX-minX), inner.h/(maxY-minY));
  const point = i => ({
    x:inner.x + (inner.w - (maxX-minX)*scale)/2 + (positions.get(i).x-minX)*scale,
    y:inner.y + (inner.h - (maxY-minY)*scale)/2 + (positions.get(i).y-minY)*scale
  });

  for (const edge of graph.edges) {
    let a = point(edge.a);
    let b = point(edge.b);
    const dx = b.x-a.x;
    const dy = b.y-a.y;
    const distance = Math.hypot(dx,dy) || 1;
    const unitX = dx/distance;
    const unitY = dy/distance;
    const trimA = types[edge.a] === "C" ? 0 : (graph.hydroxyl.has(edge.a) ? 13 : 9);
    const trimB = types[edge.b] === "C" ? 0 : (graph.hydroxyl.has(edge.b) ? 13 : 9);

    a = {x:a.x+unitX*trimA,y:a.y+unitY*trimA};
    b = {x:b.x-unitX*trimB,y:b.y-unitY*trimB};
    const side = edge.order > 1 ? skeletalAuxiliarySide(edge,graph,point) : 1;
    drawSkeletalBond(a.x,a.y,b.x,b.y,edge.order,side);
  }

  for (const i of graph.nodes) {
    if (types[i] === "C") continue;
    const position = point(i);
    const label = graph.hydroxyl.has(i) ? "OH" : types[i];
    ctx.fillStyle = types[i] === "O" ? "#ff666d" : "#f2f3f5";
    ctx.font = "800 15px -apple-system,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label,position.x,position.y);
  }

  ctx.restore();
}

function drawSkeletalPanel() {
  const panelW = Math.min(154,viewW*0.40);
  const panelH = 122;
  const x = viewW-panelW-9;
  const y = 9;

  if (challengeActive && challengeDifficulty === "easy" && challengeTemplate) {
    drawSkeletalGraph(challengeTemplate.types,challengeTemplate.edges,x,y,panelW,panelH,"TARGET SKELETAL");
    return;
  }

  if (!atoms.length) {
    ctx.save();
    ctx.fillStyle = "rgba(37,40,46,.94)";
    ctx.strokeStyle = "#555c68";
    ctx.beginPath();
    ctx.roundRect(x,y,panelW,panelH,13);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#9299a5";
    ctx.font = "700 10px -apple-system,sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("SKELETAL",x+14,y+13);
    ctx.fillStyle = "#737a86";
    ctx.font = "12px -apple-system,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Build a molecule",x+panelW/2,y+67);
    ctx.restore();
    return;
  }

  const component = components()[0];
  const index = new Map(component.map((a,i) => [a,i]));
  const componentEdges = [];
  for (const current of bonds) {
    if (index.has(current.a) && index.has(current.b)) {
      componentEdges.push({a:index.get(current.a),b:index.get(current.b),order:current.order});
    }
  }

  drawSkeletalGraph(component.map(a => a.type),componentEdges,x,y,panelW,panelH,"SKELETAL");
}

function drawChallengeTarget() {
  if (!challengeActive || challengeDifficulty !== "easy" || !challengeTemplate) return;

  const panelW = Math.min(176,viewW*0.45);
  const panelH = 145;
  const x = 9;
  const y = 196;

  ctx.save();
  ctx.fillStyle = "rgba(37,40,46,.94)";
  ctx.strokeStyle = "#59606d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x,y,panelW,panelH,13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#9299a5";
  ctx.font = "700 10px -apple-system,sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("TARGET SKELETAL",x+10,y+14);

  const template = challengeTemplate;
  const positions = templateLayout(template);
  const heavy = [...positions.keys()];
  if (!heavy.length) {
    ctx.restore();
    return;
  }

  let minX = Math.min(...heavy.map(i => positions.get(i).x));
  let maxX = Math.max(...heavy.map(i => positions.get(i).x));
  let minY = Math.min(...heavy.map(i => positions.get(i).y));
  let maxY = Math.max(...heavy.map(i => positions.get(i).y));
  if (maxX-minX < 0.1) {
    minX -= 0.6;
    maxX += 0.6;
  }
  if (maxY-minY < 0.1) {
    minY -= 0.5;
    maxY += 0.5;
  }

  const inner = {x:x+14,y:y+29,w:panelW-28,h:panelH-40};
  const scale = Math.min(inner.w/(maxX-minX),inner.h/(maxY-minY));
  const point = i => ({
    x:inner.x+(positions.get(i).x-minX)*scale,
    y:inner.y+(positions.get(i).y-minY)*scale
  });

  for (const edge of template.edges) {
    if (positions.has(edge.a) && positions.has(edge.b)) {
      const a = point(edge.a);
      const b = point(edge.b);
      drawSkeletalBond(a.x,a.y,b.x,b.y,edge.order);
    }
  }

  for (const i of heavy) {
    if (template.types[i] === "C") continue;
    const position = point(i);
    let label = template.types[i];
    const hydrogens = template.edges.filter(edge =>
      (edge.a === i && template.types[edge.b] === "H") ||
      (edge.b === i && template.types[edge.a] === "H")
    );
    if (template.types[i] === "O" && hydrogens.length) label = "OH";
    ctx.fillStyle = template.types[i] === "O" ? "#ff666d" : "#f2f3f5";
    ctx.font = "800 15px -apple-system,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label,position.x,position.y);
  }

  ctx.restore();
}

function drawTray() {
  const y = viewH-trayHeight;
  ctx.fillStyle = "#292d34";
  ctx.fillRect(0,y,viewW,trayHeight);
  ctx.strokeStyle = "#4a505c";
  drawLine(0,y,viewW,y,1);
  ctx.fillStyle = "#969daa";
  ctx.font = "11px -apple-system,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DRAG ATOMS UP • DRAG BACK TO DELETE",viewW/2,y+15);

  const centreX = viewW/2;
  const paletteY = y+61;
  for (const item of palette) {
    const element = ELEMENTS[item.type];
    const x = centreX+item.dx;
    ctx.beginPath();
    ctx.arc(x,paletteY,element.radius,0,Math.PI*2);
    ctx.fillStyle = element.colour;
    ctx.fill();
    ctx.strokeStyle = "#14161a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = element.text;
    ctx.font = `800 ${element.radius*.82}px -apple-system,sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(item.type,x,paletteY+1);
  }
}

function frame() {
  physics();
  ctx.clearRect(0,0,viewW,viewH);
  ctx.fillStyle = "#17191d";
  ctx.fillRect(0,0,viewW,viewH);
  drawTray();
  drawSkeletalPanel();
  for (const current of bonds) drawBond(current);
  for (const a of atoms) drawAtom(a);
  requestAnimationFrame(frame);
}
