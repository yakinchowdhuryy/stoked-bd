type Props = {
  price: number;
  salePrice: number | null;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
};

export default function PriceDisplay({
  price,
  salePrice,
  size = "md",
  align = "left",
}: Props) {
  const fontSize = { sm: 11, md: 15, lg: 26 }[size];
  const onSale = salePrice !== null && salePrice < price;

  if (!onSale) {
    return (
      <span style={{ fontSize, whiteSpace: "nowrap" }}>
        ৳ {price.toLocaleString()}
      </span>
    );
  }

  const row = size === "lg";

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: row ? "row" : "column",
        alignItems: row
          ? "baseline"
          : align === "right"
          ? "flex-end"
          : "flex-start",
        gap: row ? "12px" : "2px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: Math.round(fontSize * 0.8),
          textDecoration: "line-through",
          opacity: 0.45,
        }}
      >
        ৳ {price.toLocaleString()}
      </span>

      <span
        style={{
          fontSize,
          fontWeight: 600,
          color: "#ff4a4a",
        }}
      >
        ৳ {salePrice!.toLocaleString()}
      </span>
    </span>
  );
}