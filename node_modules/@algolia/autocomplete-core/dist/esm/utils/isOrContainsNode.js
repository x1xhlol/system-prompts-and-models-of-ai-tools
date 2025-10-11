export function isOrContainsNode(parent, child) {
  return parent === child || parent.contains(child);
}