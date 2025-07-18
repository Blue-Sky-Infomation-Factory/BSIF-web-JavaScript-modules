import { TypedArray } from "./binary_operate.mjs";
const readableTypes = Object.freeze({ TEXT: 0, DATA_URL: 1, ARRAY_BUFFER: 2 }), readFunctions = [
	FileReader.prototype.readAsText,
	FileReader.prototype.readAsDataURL,
	FileReader.prototype.readAsArrayBuffer
];
function read(file, readType) {
	if (arguments.length < 2) throw new TypeError("Failed to execute 'read': 2 arguments required, but only " + arguments.length + " present.");
	if (!(file instanceof Blob)) throw new TypeError("Failed to execute 'read': Argument 'file' is not a binary object.");
	if (!(readType in readFunctions)) throw new Error("Failed to execute 'read': Argument 'readtype' is not one of FileIO.readableTypes.");
	return new Promise(function (resolve) {
		var Operator = new FileReader;
		Operator.addEventListener("load", function () { resolve(Operator.result) });
		readFunctions[readType].apply(Operator, [file]);
	});
}
function fileHandleMap(item) { return item.getFile() }
async function get(options) {
	const temp = await Promise.all((await showOpenFilePicker(options)).map(fileHandleMap));
	return options?.multiple ? temp : temp[0];
}
function inputGet(multiple = false, accept = "") {
	const input = document.createElement("input");
	input.type = "file";
	input.multiple = multiple;
	input.accept = accept;
	const { promise, resolve } = Promise.withResolvers();
	input.click();
	input.addEventListener("change", function () { resolve(multiple ? Array.from(this.files) : this.files[0]) })
	return promise;
}
async function open(options) {
	const result = await showOpenFilePicker(options);
	return options?.multiple ? result : result[0];
}
const openDirectory = window.showDirectoryPicker?.bind(window);
async function save(data, options) {
	if (arguments.length < 1) throw new TypeError("Failed to execute 'save': 1 argument required, but only 0 present.");
	if (!(data instanceof TypedArray || data instanceof Blob || data instanceof DataView || data instanceof ArrayBuffer || typeof data == "string")) throw new TypeError("Failed to execute 'save': Argument 'data' is not valid type.");
	if (arguments.length > 1 && !(options instanceof Object)) throw new TypeError("Failed to execute 'save': Argument 'options' is not an object.");
	try {
		const operator = await (await showSaveFilePicker(options)).createWritable();
		await operator.write(data);
		await operator.close();
		return true;
	} catch (error) {
		if (error instanceof TypeError) throw error;
		return false;
	}
}
function downloadSave(file, saveName) {
	const objectURL = URL.createObjectURL(file), address = document.createElement("a");
	address.href = objectURL;
	address.download = typeof saveName == "string" ? saveName : "";
	address.dispatchEvent(new MouseEvent("click"));
	URL.revokeObjectURL(objectURL);
}
export { get, inputGet, open, openDirectory, save, downloadSave, read, readableTypes }