/**
 * Observe a node, execute callback when it removed from document.
 * @param node The node to observe.
 * @param callback The function to execute when the node removed from document.
 * @param once Unobserve node once it is removed from document. By default, true.
 */
declare function observe(node: Node, callback: (node: Node) => any, once = true): void;
/**
 * Unobserve a node.
 * @param node The node to unobserve.
 */
declare function unobserve(node: Node): void;
/**
 * @returns An array of the nodes that are being observed.
 */
declare function getObservingNodes(): Node[];
export { observe, unobserve, getObservingNodes }