export const state = {
  selectedByContinent: {},
  datumByContinent: {},
  populations: {}
};

export function setPopulationSelection(continentKey, popCode, datum) {
  state.selectedByContinent[continentKey] = popCode;
  state.datumByContinent[continentKey] = datum;
}

export function getSelectedPopulation(continentKey) {
  return state.selectedByContinent[continentKey] || null;
}

export function getSelectedDatum(continentKey) {
  return state.datumByContinent[continentKey] || null;
}