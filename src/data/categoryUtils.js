import categoriesData from "@/data/categories.json";

export function getCategories() {
  return categoriesData.categories || [];
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  return getCategories().find((c) => c.slug === slug) || null;
}

export function getSubcategoryBySlugs(categorySlug, subSlug) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { category: null, subcategory: null };
  const subcategory = (category.subcategories || []).find((s) => s.slug === subSlug) || null;
  return { category, subcategory };
}

export function getCategorySlugFromName(name) {
  if (!name) return null;
  const lower = String(name).toLowerCase();
  const match = getCategories().find((c) => c.name.toLowerCase() === lower);
  return match ? match.slug : slugify(name);
}

export function getSubcategorySlugFromName(categorySlugOrName, subcategoryName) {
  if (!subcategoryName) return null;
  const categorySlug = categorySlugOrName?.includes(" ")
    ? getCategorySlugFromName(categorySlugOrName)
    : categorySlugOrName;
  const cat = getCategoryBySlug(categorySlug);
  const lower = String(subcategoryName).toLowerCase();
  const match = cat?.subcategories?.find((s) => s.name.toLowerCase() === lower);
  return match ? match.slug : slugify(subcategoryName);
}

export function getCategoryNameFromSlug(slug) {
  return getCategoryBySlug(slug)?.name || null;
}

export function getSubcategoryNameFromSlugs(categorySlug, subSlug) {
  return getSubcategoryBySlugs(categorySlug, subSlug).subcategory?.name || null;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

