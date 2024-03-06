type CommonItem = {
	text: string
};
type UrlBase = { url: string };
type ImageIcon = { type: "image" } & UrlBase;
type SpriteIcon = {
	type: "sprite",
	resourceSize: number[],
	x: number,
	y: number
} & UrlBase;
type FontIcon = {
	type: "font",
	font: string,
	character: string | number
}
type IconItem = {
	icon?: ImageIcon | SpriteIcon | FontIcon
} & CommonItem;
type MenuItem = {
	type: "item",
	onclick: () => any;
} & IconItem;
type CheckItem = {
	type: "check-item",
	state: boolean,
	onclick: (toState: boolean) => any;
}
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
declare function showMenu(list: ListItemsTypes[], anchor, darkStyle = false): void;