export const state = {
  populations: {},

  superpop: {
    selectedPop: null,
    selectedDatum: null,
    colorScheme: "superpop"
  },

  continentExplorer: {
    selectedContinent: "AFR",
    selectedPop: null,
    selectedDatum: null,
    colorScheme: "subpop"
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

export function setSuperpopColorScheme(colorScheme) {
  state.superpop.colorScheme = colorScheme;
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

export function setContinentColorScheme(colorScheme) {
  state.continentExplorer.colorScheme = colorScheme;
}