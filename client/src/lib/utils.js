// Minimal cn() shim — joins class names, filtering out falsy values
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
