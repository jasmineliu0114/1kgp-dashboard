export const state = {
  populations: {},

  superpop: {
    selectedPop: null,
    selectedDatum: null
  },

  continentExplorer: {
    selectedContinent: "AFR",
    selectedPop: null,
    selectedDatum: null
  },

  global: {
    pcaMode: "base",
    umapMode: "base"
  }
};

export function setSuperpopSelection(popCode, datum) {
  state.superpop.selectedPop = popCode;
  state.superpop.selectedDatum = datum;
}

export function setContinentSelection(continentKey) {
  state.continentExplorer.selectedContinent = continentKey;
  state.continentExplorer.selectedPop = null;
  state.continentExplorer.selectedDatum = null;
}

export function setContinentPopSelection(popCode, datum) {
  state.continentExplorer.selectedPop = popCode;
  state.continentExplorer.selectedDatum = datum;
}


// export const state = {
//   selectedByContinent: {},
//   datumByContinent: {},
//   populations: {}
// };

// export function setPopulationSelection(continentKey, popCode, datum) {
//   state.selectedByContinent[continentKey] = popCode;
//   state.datumByContinent[continentKey] = datum;
// }

// export function getSelectedPopulation(continentKey) {
//   return state.selectedByContinent[continentKey] || null;
// }

// export function getSelectedDatum(continentKey) {
//   return state.datumByContinent[continentKey] || null;
// }