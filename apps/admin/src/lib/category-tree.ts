import type { Category } from "@/api/types";

export interface CategoryNode {
  cat: Category;
  depth: number;
  children: CategoryNode[];
  path: string[];
}

const byOrder = (a: Category, b: Category) => a.sort_order - b.sort_order || (a.name.ru ?? "").localeCompare(b.name.ru ?? "", "ru");

export function buildTree(cats: Category[]): CategoryNode[] {
  const byParent = new Map<number | null, Category[]>();
  const ids = new Set(cats.map((c) => c.id));
  for (const c of cats) {
    const key = c.parent_id !== null && ids.has(c.parent_id) ? c.parent_id : null;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }
  const walk = (parent: number | null, depth: number, path: string[], seen: Set<number>): CategoryNode[] =>
    (byParent.get(parent) ?? [])
      .sort(byOrder)
      .filter((c) => !seen.has(c.id))
      .map((cat) => {
        const name = cat.name.ru ?? cat.slug;
        const nextSeen = new Set(seen).add(cat.id);
        return { cat, depth, path: [...path, name], children: walk(cat.id, depth + 1, [...path, name], nextSeen) };
      });
  return walk(null, 0, [], new Set());
}

export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  const out: CategoryNode[] = [];
  const visit = (n: CategoryNode) => {
    out.push(n);
    n.children.forEach(visit);
  };
  nodes.forEach(visit);
  return out;
}

/** IDs of a node and all its descendants (can't be chosen as its new parent). */
export function descendantIds(nodes: CategoryNode[], id: number): Set<number> {
  const out = new Set<number>();
  const find = (list: CategoryNode[]): CategoryNode | undefined => {
    for (const n of list) {
      if (n.cat.id === id) return n;
      const f = find(n.children);
      if (f) return f;
    }
    return undefined;
  };
  const root = find(nodes);
  const collect = (n: CategoryNode) => {
    out.add(n.cat.id);
    n.children.forEach(collect);
  };
  if (root) collect(root);
  return out;
}

export function categoryPath(cats: Category[] | undefined, id: number | null | undefined): string {
  if (!cats || id == null) return "";
  const map = new Map(cats.map((c) => [c.id, c]));
  const parts: string[] = [];
  let cur = map.get(id);
  const guard = new Set<number>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    parts.unshift(cur.name.ru ?? cur.slug);
    cur = cur.parent_id != null ? map.get(cur.parent_id) : undefined;
  }
  return parts.join(" / ");
}
