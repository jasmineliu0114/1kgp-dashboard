export const CONTINENTS = [
    {
        key: "SP",
        title: "Superpopulations",
        eulerJson: "assets/euler/superpop_euler_ellipses.json"
    },
    {
        key: "AMR",
        title: "Americas",
        eulerJson: "assets/euler/amr_euler_ellipses.json"
    },
    {
        key: "AFR",
        title: "Africa",
        eulerJson: "assets/euler/afr_euler_ellipses.json"
    },
    {
        key: "EAS",
        title: "East Asia",
        eulerJson: "assets/euler/eas_euler_ellipses.json"
    },
    {
        key: "EUR",
        title: "Europe",
        eulerJson: "assets/euler/eur_euler_ellipses.json"
    },
    {
        key: "SAS",
        title: "South Asia",
        eulerJson: "assets/euler/sas_euler_ellipses.json"
    }
];

export const PANEL1_OPTIONS = [
    { value: "unique_pca", label: "Population only common variants · PCA" },
    { value: "unique_pca_cont", label: "Population only common variants within continent group · PCA" },
    { value: "unique_pca_cont_animated", label: "Population only common variants within continent group vs random subsamples · PCA" }
];

export const PANEL2_OPTIONS = [
    { value: "unique_umap", label: "Population only common variants · UMAP" },
    { value: "unique_umap_cont", label: "Population only common variants within continent group · UMAP" },
    { value: "unique_umap_cont_animated", label: "Population only common variants within continent group vs random subsamples· UMAP" }
];

export const GLOBAL_MODES = [
  { value: "base", label: "Base" },
  { value: "stability", label: "With stability markers" },
  { value: "contour", label: "With contours" },
  { value: "contour_centroid", label: "With centroid contours" }
];
