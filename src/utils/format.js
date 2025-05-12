export const formatQuantity = (value) => {
  const num = Number(value);
  return num % 1 === 0 ? num.toString() : num.toFixed(3);
};