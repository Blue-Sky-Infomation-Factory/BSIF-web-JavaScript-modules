/**
 * @param {ClipboardEvent} event
 */
function handler(event) {
	const selection = document.getSelection(),
		data = event.clipboardData;
	if (!selection || selection.type != "Range") return;
	event.preventDefault();
	if (alwaysCover || !data.types.includes("text/plain"))
		data.setData("text/plain", selection.toString());
}

document.addEventListener("copy", handler);

var enabled = true, alwaysCover = false;

export default {
	get enabled() { return enabled },
	set enabled(value) {
		value = Boolean(value);
		if (value === enabled) return;
		if (enabled = value) {
			document.addEventListener("copy", handler);
		} else {
			document.removeEventListener("copy", handler);
		}
	},
	get alwaysCover() { return alwaysCover },
	set alwaysCover(value) { alwaysCover = Boolean(value) }
};