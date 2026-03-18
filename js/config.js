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
    { value: "unique_pca", label: "Variants only common in population · PCA" },
    { value: "unique_pca_cont", label: "Variants only common in population within continent subpops · PCA" },
    { value: "unique_pca_cont_animated", label: "Variants only common in population within continent subpops · SNP Subset PCA vs. Random subsamples" }
];

export const PANEL2_OPTIONS = [
    { value: "unique_umap", label: "Variants only common in population · UMAP" },
    { value: "unique_umap_cont", label: "Variants only common in population within continent subpops · UMAP" },
    { value: "unique_umap_cont_animated", label: "Variants only common in population within continent subpops · SNP Subset UMAP vs. Random subsamples" }
];

export const GLOBAL_MODES = [
  { value: "base", label: "Base" },
  { value: "stability", label: "With stability markers" },
  { value: "contour", label: "With contours" },
  { value: "contour_centroid", label: "With centroid contours" }
];
