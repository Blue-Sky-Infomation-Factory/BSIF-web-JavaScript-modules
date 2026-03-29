const { fromCharCode } = String;

/**
 * Pack binary data to UTF-16 string.
 * @param {ArrayBuffer | Uint8Array | Uint8ClampedArray} buffer
 */
function pack(buffer) {
	if (buffer instanceof ArrayBuffer) {
		buffer = new Uint8Array(buffer);
	} else if (!(buffer instanceof Uint8Array) && !(buffer instanceof Uint8ClampedArray))
		throw new TypeError("Argument 'buffer' must be ArrayBuffer, Uint8Array, or Uint8ClampedArray.");
	const { length } = buffer, pad = length & 1;
	var temp = pad ? fromCharCode(0x0F00 | buffer[0]) : "\u0000";
	for (let i = pad; i < length; i += 2)
		temp += fromCharCode(buffer[i] << 8 | buffer[i + 1]);
	return temp;
}

/**
 * Unpack UTF-16 string to binary data.
 * @param {string} string
 */
function unpack(string) {
	if (typeof string !== "string")
		throw new TypeError("Argument 'string' must be string.");
	const { length } = string;
	if (!length) throw new Error("Empty string.");
	const head = string.charCodeAt(0), type = (head & 0xFF00) >> 8;
	if (type != 0x0F && type != 0x00) throw new Error("Invalid string.");
	var i = type & 1;
	const buffer = new Uint8Array((length - 1) * 2 + i);
	if (type) buffer[0] = head & 0xFF;
	for (let sI = 1; sI < length; ++sI) {
		const unit = string.charCodeAt(sI);
		buffer[i++] = (unit & 0xFF00) >> 8;
		buffer[i++] = unit & 0xFF;
	}
	return buffer;
}

export { pack, unpack };