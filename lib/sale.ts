export function isSaleName(name?: string | null) {
  return (name || "").trim().toUpperCase() === "SALE";
}

export function getPricing(regularRaw: unknown, saleRaw: unknown) {
  const regular = Number(regularRaw) || 0;

  const sale =
    saleRaw === null || saleRaw === undefined || saleRaw === ""
      ? null
      : Number(saleRaw);

  const onSale =
    sale !== null &&
    Number.isFinite(sale) &&
    sale > 0 &&
    sale < regular;

  return {
    price: regular,
    salePrice: onSale ? (sale as number) : null,
    finalPrice: onSale ? (sale as number) : regular,
    onSale,
    discountPercent: onSale
      ? Math.round(((regular - (sale as number)) / regular) * 100)
      : 0,
  };
}

/* Shop / category page filter:
   ALL = shob, SALE = shudhu sale product, onnogulo = nijer category */
export function matchesCategory(
  product: { category: string; onSale: boolean },
  selected: string
) {
  if (selected === "ALL COLLECTION") return true;
  if (isSaleName(selected)) return product.onSale;
  return product.category === selected;
}