type CommonItem = {
	text: string
};
type UrlBase = { url: string };
type ImageIcon = { type: "image" } & UrlBase;
type Point = {
	x?: number,
	y?: number
};
type SpriteIcon = {
	type: "sprite",
	resourceSize: [number, number],
} & UrlBase & Point;
type FontIcon = {
	type: "font",
	font: string,
	character: string | number
}
type IconItem = {
	icon?: ImageIcon | SpriteIcon | FontIcon
} & CommonItem;
type KeySet = {
	key: string,
	ctrl?: boolean,
	shift?: boolean,
	alt?: boolean
}
type MenuItem = {
	type: "item",
	onselect?: () => any,
	keys?: KeySet
} & IconItem;
type CheckItem = {
	type: "check-item",
	checked: boolean,
	id: any,
	onselect?: (toState: boolean, id: any) => any
} & CommonItem;
type ContainerItemTypes = MenuItem | CheckItem | SubList;
type Group = {
	type: "group",
	list: ContainerItemTypes[]
};
type ListItemsTypes = ContainerItemTypes | Group
type SubList = {
	type: "sub-list",
	list: ListItemsTypes[]
} & IconItem;
type ElementAnchor = {
	element: Element,
	marginX?: number,
	marginY?: number
} & Partial<ElementHorizontalAnchor | ElementVerticalAnchor>;
type ElementHorizontalAnchor = {
	side: "left" | "right",
	align: "top" | "bottom"
};
type ElementVerticalAnchor = {
	side: "top" | "bottom",
	align: "left" | "right"
};
/**
 * 显示一个自定义的上下文菜单，可依据鼠标事件、元素、坐标进行定位。
 * @param list 菜单的内容
 * @param anchor 菜单参考的锚点
 * @param onClose 菜单被关闭时的回调
 * @param darkStyle 是否使用暗黑风格
 * @param keyboardMode 显示菜单后进入键盘操作模式
 * @param enforcePositioning 当屏幕空间不足以使菜单完全展开时，菜单是否应严格遵守指定的定位方法
 */
declare function showMenu(
	list: ListItemsTypes[],
	anchor: MouseEvent | ElementAnchor | Point,
	onClose?: () => any,
	darkStyle = false,
	keyboardMode = false,
	enforcePositioning?: { horizontal?: boolean, vertical?: boolean }
): void;
export { showMenu };
export default showMenu;