declare const EVENT_LISTENERS: unique symbol,
	OBJECT_PROPERTIES: unique symbol;
type AddDOMEventListenerParameters = [
	keyof HTMLElementEventMap,
	((this: HTMLElement, event: HTMLElementEventMap[keyof HTMLElementEventMap]) => any) | EventListenerObject,
	(boolean | AddEventListenerOptions)?
];
type AddCustomEventListenerParameters = [
	string,
	((this: HTMLElement, event: Event) => any) | EventListenerObject,
	(boolean | AddEventListenerOptions)?
]
type ArrayHTMLElementNode = [
	keyof HTMLElementTagNameMap,
	((ArrayHTMLCollectionContent | ArrayHTMLShadowRootNode)[] | ArrayHTMLNodeContent | Node)?,
	{
		style?: Partial<CSSStyleDeclaration> | string,
		class?: string[] | string,
		[EVENT_LISTENERS]?: (AddDOMEventListenerParameters | AddCustomEventListenerParameters)[],
		[OBJECT_PROPERTIES]?: object,
		[key: string]: any
	}?,
	string?,
	boolean?
];
type ArrayHTMLTextNode = [
	"#comment" | "#text",
	ArrayHTMLNodeContent?,
	void?,
	string?,
	boolean?
];
type ArrayHTMLShadowRootNode = [
	"#shadow",
	ArrayHTMLCollection | ArrayHTMLNodeContent | Node | void,
	ShadowRootInit,
	string?
];
type ArrayHTMLNodeContent = string | boolean | number | bigint;
type ArrayHTMLCollectionContent = ArrayHTMLElementNode | ArrayHTMLTextNode | string | ArrayHTMLNodeContent | Node;
type ArrayHTMLCollection = ArrayHTMLCollectionContent[];
type CaughtNode = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | Comment | Text | ShadowRoot;
type CaughtNodes = { [key: string]: CaughtNode | CaughtNode[] };
declare function serialize(node: Node, onlyChildren?: boolean): ArrayHTMLCollection;
declare function parse(ArrayHTML: ArrayHTMLCollection): DocumentFragment;
declare function parseAndGetNodes(ArrayHTML: ArrayHTMLCollection): {
	documentFragment: DocumentFragment,
	nodes: CaughtNodes
};
declare function parseAndGetNodes(ArrayHTML: ArrayHTMLCollection, appendTo: Node): CaughtNodes;
export { parse, serialize, parseAndGetNodes, EVENT_LISTENERS, OBJECT_PROPERTIES }