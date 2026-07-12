"use strict";

const TEMPLATES = [];

function addTemplate(name, atomTypes, edgeList, note="") {
  TEMPLATES.push({
    name,
    note,
    types:[...atomTypes],
    edges:edgeList.map(([a,b,order=1]) => ({a,b,order}))
  });
}

function saturated(name, heavyTypes, heavyEdges, note="") {
  const types = [...heavyTypes];
  const edges = heavyEdges.map(([a,b,order=1]) => ({a,b,order}));
  const valence = {C:4,O:2,H:1};
  const used = types.map(() => 0);

  for (const edge of edges) {
    used[edge.a] += edge.order;
    used[edge.b] += edge.order;
  }

  for (let i=0; i<heavyTypes.length; i++) {
    const missing = valence[types[i]] - used[i];
    for (let h=0; h<missing; h++) {
      const hydrogenIndex = types.length;
      types.push("H");
      edges.push({a:i,b:hydrogenIndex,order:1});
    }
  }

  TEMPLATES.push({name,note,types,edges});
}

function manual(name, types, edges, note="") {
  addTemplate(name, types, edges, note);
}

// Elements and small inorganic molecules
manual("Carbon atom",["C"],[]);
manual("Hydrogen atom",["H"],[]);
manual("Oxygen atom",["O"],[]);
manual("Hydrogen gas",["H","H"],[[0,1,1]]);
manual("Oxygen gas",["O","O"],[[0,1,2]]);
manual("Ozone",["O","O","O"],[[0,1,1],[1,2,2]],"One resonance form");
manual("Water",["O","H","H"],[[0,1,1],[0,2,1]]);
manual("Hydrogen peroxide",["O","O","H","H"],[[0,1,1],[0,2,1],[1,3,1]]);
manual("Carbon monoxide",["C","O"],[[0,1,3]]);
manual("Carbon dioxide",["O","C","O"],[[0,1,2],[1,2,2]]);

// Hydrocarbons
saturated("Methane",["C"],[]);
saturated("Ethane",["C","C"],[[0,1,1]]);
saturated("Ethene (ethylene)",["C","C"],[[0,1,2]]);
saturated("Ethyne (acetylene)",["C","C"],[[0,1,3]]);
saturated("Propane",["C","C","C"],[[0,1,1],[1,2,1]]);
saturated("Propene",["C","C","C"],[[0,1,2],[1,2,1]]);
saturated("Propyne",["C","C","C"],[[0,1,3],[1,2,1]]);
saturated("Cyclopropane",["C","C","C"],[[0,1,1],[1,2,1],[2,0,1]]);
saturated("n-Butane",["C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1]]);
saturated("Isobutane (2-methylpropane)",["C","C","C","C"],[[0,1,1],[0,2,1],[0,3,1]]);
saturated("But-1-ene",["C","C","C","C"],[[0,1,2],[1,2,1],[2,3,1]]);
saturated("But-2-ene",["C","C","C","C"],[[0,1,1],[1,2,2],[2,3,1]],"Cis/trans geometry is not distinguished");
saturated("2-Methylpropene",["C","C","C","C"],[[0,1,2],[1,2,1],[1,3,1]]);
saturated("But-1-yne",["C","C","C","C"],[[0,1,3],[1,2,1],[2,3,1]]);
saturated("But-2-yne",["C","C","C","C"],[[0,1,1],[1,2,3],[2,3,1]]);
saturated("Cyclobutane",["C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,0,1]]);
saturated("n-Pentane",["C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1]]);
saturated("Isopentane (2-methylbutane)",["C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[1,4,1]]);
saturated("Neopentane (2,2-dimethylpropane)",["C","C","C","C","C"],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]);
saturated("Cyclopentane",["C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,0,1]]);
saturated("n-Hexane",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1]]);
saturated("Cyclohexane",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]]);
saturated("Benzene",["C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1]],"One Kekulé structure");

// Oxygen-containing organics
saturated("Methanol",["C","O"],[[0,1,1]]);
saturated("Formaldehyde (methanal)",["C","O"],[[0,1,2]]);
saturated("Formic acid (methanoic acid)",["C","O","O"],[[0,1,2],[0,2,1]]);
saturated("Ethanol",["C","C","O"],[[0,1,1],[1,2,1]]);
saturated("Dimethyl ether",["C","O","C"],[[0,1,1],[1,2,1]]);
saturated("Ethanal (acetaldehyde)",["C","C","O"],[[0,1,1],[1,2,2]]);
saturated("Ethylene oxide (oxirane)",["C","C","O"],[[0,1,1],[1,2,1],[2,0,1]]);
saturated("Ethylene glycol",["O","C","C","O"],[[0,1,1],[1,2,1],[2,3,1]]);
saturated("Acetic acid (ethanoic acid)",["C","C","O","O"],[[0,1,1],[1,2,2],[1,3,1]]);
saturated("Propane-1-ol",["C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1]]);
saturated("Propan-2-ol (isopropanol)",["C","C","C","O"],[[0,1,1],[0,2,1],[0,3,1]]);
saturated("Methoxyethane",["C","O","C","C"],[[0,1,1],[1,2,1],[2,3,1]]);
saturated("Propanal",["C","C","C","O"],[[0,1,1],[1,2,1],[2,3,2]]);
saturated("Acetone (propanone)",["C","C","C","O"],[[0,1,1],[1,2,1],[1,3,2]]);

// Unsaturated and oxygen-containing rings
saturated("Oxirene",["C","C","O"],[[0,1,2],[1,2,1],[2,0,1]],"Also called oxacyclopropene");
saturated("Cyclopropene",["C","C","C"],[[0,1,2],[1,2,1],[2,0,1]]);
saturated("Cyclobutene",["C","C","C","C"],[[0,1,2],[1,2,1],[2,3,1],[3,0,1]]);
saturated("Cyclopentene",["C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,1],[3,4,1],[4,0,1]]);
saturated("Cyclohexene",["C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]]);
saturated("Oxetane",["O","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,0,1]]);
saturated("Tetrahydrofuran",["O","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,0,1]]);
saturated("Tetrahydropyran",["O","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]]);
saturated("1,3-Dioxolane",["O","C","O","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,0,1]]);
saturated("1,4-Dioxane",["O","C","C","O","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]]);
saturated("Propylene oxide",["C","C","O","C"],[[0,1,1],[1,2,1],[2,0,1],[1,3,1]]);

// Dienes, cumulenes and alkynes
saturated("Propadiene (allene)",["C","C","C"],[[0,1,2],[1,2,2]]);
saturated("Buta-1,3-diene",["C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2]]);
saturated("Buta-1,2-diene",["C","C","C","C"],[[0,1,2],[1,2,2],[2,3,1]]);
saturated("Penta-1,3-diene",["C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1]]);
saturated("Penta-1,4-diene",["C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,1],[3,4,2]]);
saturated("Pent-1-yne",["C","C","C","C","C"],[[0,1,3],[1,2,1],[2,3,1],[3,4,1]]);
saturated("Pent-2-yne",["C","C","C","C","C"],[[0,1,1],[1,2,3],[2,3,1],[3,4,1]]);
saturated("Hex-1-yne",["C","C","C","C","C","C"],[[0,1,3],[1,2,1],[2,3,1],[3,4,1],[4,5,1]]);
saturated("Hex-2-yne",["C","C","C","C","C","C"],[[0,1,1],[1,2,3],[2,3,1],[3,4,1],[4,5,1]]);
saturated("Hex-3-yne",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,3],[3,4,1],[4,5,1]]);

// Branched and longer alkanes
saturated("2-Methylpentane",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[1,5,1]]);
saturated("3-Methylpentane",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[2,5,1]]);
saturated("2,2-Dimethylbutane",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[1,4,1],[1,5,1]]);
saturated("2,3-Dimethylbutane",["C","C","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[1,4,1],[2,5,1]]);
saturated("n-Heptane",Array(7).fill("C"),[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,6,1]]);
saturated("n-Octane",Array(8).fill("C"),[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,6,1],[6,7,1]]);
saturated("n-Nonane",Array(9).fill("C"),[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,6,1],[6,7,1],[7,8,1]]);
saturated("n-Decane",Array(10).fill("C"),[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,6,1],[6,7,1],[7,8,1],[8,9,1]]);

// Alcohols and polyols
saturated("Butan-1-ol",["C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1]]);
saturated("Butan-2-ol",["C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[1,4,1]]);
saturated("2-Methylpropan-1-ol (isobutanol)",["C","C","C","C","O"],[[0,1,1],[1,2,1],[1,3,1],[0,4,1]]);
saturated("2-Methylpropan-2-ol (tert-butanol)",["C","C","C","C","O"],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]);
saturated("Pentan-1-ol",["C","C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1]]);
saturated("Pentan-2-ol",["C","C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[1,5,1]]);
saturated("Pentan-3-ol",["C","C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[2,5,1]]);
saturated("Propane-1,2-diol",["C","C","C","O","O"],[[0,1,1],[1,2,1],[0,3,1],[1,4,1]]);
saturated("Propane-1,3-diol",["O","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1]]);
saturated("Glycerol",["C","C","C","O","O","O"],[[0,1,1],[1,2,1],[0,3,1],[1,4,1],[2,5,1]]);

// Ethers
saturated("Ethoxyethane (diethyl ether)",["C","C","O","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1]]);
saturated("1-Methoxypropane",["C","O","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1]]);
saturated("2-Methoxypropane",["C","O","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[2,4,1]]);
saturated("Methyl tert-butyl ether",["C","O","C","C","C","C"],[[0,1,1],[1,2,1],[2,3,1],[2,4,1],[2,5,1]]);

// Aldehydes and ketones
saturated("Butanal",["C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,2]]);
saturated("2-Methylpropanal",["C","C","C","C","O"],[[0,1,1],[1,2,1],[1,3,1],[0,4,2]]);
saturated("Pentanal",["C","C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,2]]);
saturated("Butan-2-one",["C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[1,4,2]]);
saturated("Pentan-2-one",["C","C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[1,5,2]]);
saturated("Pentan-3-one",["C","C","C","C","C","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[2,5,2]]);
saturated("Glyoxal (ethanedial)",["C","C","O","O"],[[0,1,1],[0,2,2],[1,3,2]]);
saturated("Glycolaldehyde",["C","C","O","O"],[[0,1,1],[0,2,1],[1,3,2]]);

// Carboxylic acids
saturated("Propionic acid (propanoic acid)",["C","C","C","O","O"],[[0,1,1],[1,2,1],[2,3,2],[2,4,1]]);
saturated("Butyric acid (butanoic acid)",["C","C","C","C","O","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,2],[3,5,1]]);
saturated("Isobutyric acid (2-methylpropanoic acid)",["C","C","C","C","O","O"],[[0,1,1],[1,2,1],[1,3,1],[0,4,2],[0,5,1]]);
saturated("Valeric acid (pentanoic acid)",["C","C","C","C","C","O","O"],[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,2],[4,6,1]]);
saturated("Oxalic acid",["C","C","O","O","O","O"],[[0,1,1],[0,2,2],[0,3,1],[1,4,2],[1,5,1]]);
saturated("Malonic acid",["C","C","C","O","O","O","O"],[[0,1,1],[1,2,1],[0,3,2],[0,4,1],[2,5,2],[2,6,1]]);
saturated("Succinic acid",["C","C","C","C","O","O","O","O"],[[0,1,1],[1,2,1],[2,3,1],[0,4,2],[0,5,1],[3,6,2],[3,7,1]]);

// Esters
saturated("Methyl formate",["C","O","O","C"],[[0,1,2],[0,2,1],[2,3,1]]);
saturated("Ethyl formate",["C","O","O","C","C"],[[0,1,2],[0,2,1],[2,3,1],[3,4,1]]);
saturated("Methyl acetate",["C","C","O","O","C"],[[0,1,1],[1,2,2],[1,3,1],[3,4,1]]);
saturated("Ethyl acetate",["C","C","O","O","C","C"],[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[4,5,1]]);
saturated("Methyl propionate",["C","C","C","O","O","C"],[[0,1,1],[1,2,1],[2,3,2],[2,4,1],[4,5,1]]);
saturated("Propyl acetate",["C","C","O","O","C","C","C"],[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[4,5,1],[5,6,1]]);

// Aromatic hydrocarbons and oxygen derivatives; one Kekulé form is used
saturated("Toluene",["C","C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1]],"One Kekulé structure");
saturated("Ethylbenzene",["C","C","C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,1]],"One Kekulé structure");
saturated("Styrene",["C","C","C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,2]],"One Kekulé structure");
saturated("o-Xylene",["C","C","C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[1,7,1]],"One Kekulé structure");
saturated("m-Xylene",["C","C","C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[2,7,1]],"One Kekulé structure");
saturated("p-Xylene",["C","C","C","C","C","C","C","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[3,7,1]],"One Kekulé structure");
saturated("Phenol",["C","C","C","C","C","C","O"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1]],"One Kekulé structure");
saturated("Anisole (methoxybenzene)",["C","C","C","C","C","C","O","C"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,1]],"One Kekulé structure");
saturated("Benzyl alcohol",["C","C","C","C","C","C","C","O"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,1]],"One Kekulé structure");
saturated("Benzaldehyde",["C","C","C","C","C","C","C","O"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,2]],"One Kekulé structure");
saturated("Benzoic acid",["C","C","C","C","C","C","C","O","O"],[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,2],[6,8,1]],"One Kekulé structure");
