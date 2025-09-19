export function pruneEmptyAnyOfInPlace(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      pruneEmptyAnyOfInPlace(item);
    }
    return;
  }

  if (!isPlainObject(node)) return;

  const obj = node as Record<string, unknown>;

  if (Array.isArray(obj.anyOf)) {
    // Remove `{}` members
    obj.anyOf = (obj.anyOf as unknown[]).filter((m) => !(isPlainObject(m) && Object.keys(m as object).length === 0));

    // Recurse into remaining anyOf members
    for (const m of obj.anyOf as unknown[]) {
      pruneEmptyAnyOfInPlace(m);
    }
  }

  // Recurse into other properties
  for (const key of Object.keys(obj)) {
    if (key === 'anyOf') continue;
    pruneEmptyAnyOfInPlace(obj[key]);
  }
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
