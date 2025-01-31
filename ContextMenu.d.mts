type CommonItem = {
	text: string,
	id?: any
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
type selectableItem = {
	keys?: KeySet,
	disabled?: boolean
};
type MenuItem = {
	type: "item",
	onSelect?: (id: any) => any
} & IconItem & selectableItem;
type CheckItem = {
	type: "check-item",
	checked: boolean,
	onSelect?: (id: any, toState: boolean) => any
} & CommonItem & selectableItem;
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
type showMenuOptions = {
	/** 菜单被关闭时的回调 */
	onClose?: (selected: boolean) => any,
	/** 是否使用暗黑风格，默认 false 否 */
	darkStyle?: boolean,
	/** 显示菜单后进入键盘操作模式，默认 false 否 */
	keyboardMode?: boolean,
	/** 当屏幕空间不足以使菜单完全展开时，菜单是否应严格遵守指定的定位方法 */
	enforcePositioning?: {
		/** 水平方向，默认 false 否 */
		horizontal?: boolean,
		/** 垂直方向，默认 false 否 */
		vertical?: boolean
	},
	/** 使用纯净列表模式，默认 false 否。纯净列表只能使用普通项，并且会忽略图标与快捷键，同时删除渲染时预留给两者的空间 */
	pureList?: boolean
};
/**
 * 显示一个自定义的上下文菜单，可依据鼠标事件、元素、坐标进行定位。
 * @param list 菜单的内容
 * @param anchor 菜单参考的锚点
 * @param options 选项
 */
declare function showMenu(
	list: ListItemsTypes[],
	anchor?: MouseEvent | ElementAnchor | Point,
	options?: showMenuOptions
): void;
/** 关闭当前菜单 */
declare function closeMenu(): void;
/**
 * 设置菜单字体
 * @param name 字体名称
 */
declare function setFont(name: string): void;
/** 获取当前菜单字体 */
declare function getCurrentFont(): string;
export { showMenu, closeMenu, setFont, getCurrentFont };
export default showMenu;