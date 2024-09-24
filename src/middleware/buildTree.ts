import { Node } from "../entity/org-tree";

export function buildTree(nodes: Node[]): Node[] {
    const tree: Node[] = [];
    const map: { [key: number]: Node } = {}; // Map to hold all nodes

    // Create a map to hold all nodes
    nodes.forEach(node => {
        map[node.id] = { ...node, children: [] }; // Initialize each node with an empty children array
    });

    // Build the tree
    nodes.forEach(node => {
        if (node.parentId === null) {
            // If there's no parent, it’s a root node
            tree.push(map[node.id]);
        } else {
            // If there's a parent, add the node to the parent's children
            if (map[node.parentId]) {
                map[node.parentId].children?.push(map[node.id]); // Optional chaining for children
            }
        }
    });

    return tree;
}
