export function bankersRound(value, decimals = 2) {
  const multiplier = Math.pow(10, decimals);
  const num = value * multiplier;
  const floor = Math.floor(num);
  const diff = num - floor;

  if (diff > 0.5) {
    return (floor + 1) / multiplier;
  } else if (diff < 0.5) {
    return floor / multiplier;
  } else {
    // exactly 0.5 => round to even
    if (floor % 2 === 0) {
      return floor / multiplier;
    } else {
      return (floor + 1) / multiplier;
    }
  }
}
