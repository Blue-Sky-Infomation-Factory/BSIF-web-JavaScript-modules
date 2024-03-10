import BufferContext from "../BufferContext.mjs";
import { allMetadataBlock, metadataBlockTypes } from "./MetadataBlock.mjs";
import { extractFrames as extractFramesFunction } from "./Frame.mjs"
const headValue = [102, 76, 97, 67], { STREAMINFO } = metadataBlockTypes;
function checkHead(data) {
	for (let i = 0; i < 4; ++i) if (data[i] != headValue[i]) throw new Error("Invalid data");
	return new BufferContext(data, 4);
}
class FLAC {
	constructor(context, metadataBlocks, frames) {
		this.context = context;
		this.metadataBlocks = metadataBlocks;
		this.frames = frames;
	}
	static { Object.defineProperty(this.prototype, Symbol.toStringTag, { value: this.name, configurable: true }) }
}
function findStreamInfo(item) { return item.type == STREAMINFO }
function extract(data, extractFrames = false) {
	if (!(data instanceof Uint8Array)) throw new TypeError("Failed to execute 'decode': Argument 'data' is not a Uint8Array.");
	if (typeof extractFrames != "boolean") throw new TypeError("Failed to execute 'decode': Argument 'extractFrames' is not a boolean.");
	const context = checkHead(data),
		metadataBlocks = allMetadataBlock(context);
	return new FLAC(context, metadataBlocks, extractFrames ? extractFramesFunction(context, metadataBlocks.find(findStreamInfo)?.decodeData() ?? console.warn("Cannot find stream info metadata!")) : null);
}
export { extract }