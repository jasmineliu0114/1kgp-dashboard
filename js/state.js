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