function showMenu(list, anchor = null, darkStyle = false) {
	if (!Array.isArray(list)) throw new TypeError("Failed to execute 'showMenu': Argument 'list' must be an array.");
	const temp = [];
	var groupHr = false, maxItemWidth = 0;
	for (const item of list) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'showMenu': Elements of list must be objects.");
		switch (item.type) {
			case "item":

			case "check-item":
				break;
			case "group":
				const list = item.list;
				if (!Array.isArray(list)) throw new TypeError("Failed to execute 'showMenu': Property 'list' of item of type 'group' is not an array.");
				if (groupHr) temp.push(["hr"]);
				buildGroup(item, temp);
				break;
			case "sub-list":
				break;
			default:
				throw new TypeError(`Failed to execute 'showMenu': Invalid item type '${item.type}'.`)
		}
		groupHr = true;
	}
}

function buildGroup(data, temp) {
	var maxItemWidth = 0;
	for (const item of data) {
		if (!(item instanceof Object)) throw new TypeError("Failed to execute 'buildGroup': Elements of list must be objects.");
		switch (item.type) {
			case "item":

			case "check-item":
				break;
			case "sub-list":
				break;
			default:
				throw new TypeError(`Failed to execute 'buildGroup': Invalid item type '${item.type}'.`)
		}
	}


	return maxItemWidth;
}



function buildList(arrayHTML, darkStyle) {

}

/*
{
	type: "group" | "item" | "check-item" | "sub-list",
	list: []
}
 */

export {showMenu};
export default showMenu;