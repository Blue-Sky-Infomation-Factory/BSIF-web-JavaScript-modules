import { decode as decodeValue } from "../utf-8.mjs";
import { bigEndianToUint, splitBytes } from "../binary_operate.mjs";
import Enum from "../Enum.mjs";
const { defineProperty, defineProperties, freeze } = Object;
function readBits(context, bits) {
	const { array, data } = context;
	var { remain, temp } = data, result = 0;
	while (bits) {
		if (!remain) {
			temp = array[context.current];
			remain = 8;
		}
		if (bits >= remain) {
			bits -= remain;
			result *= 1 << remain;
			result += temp;
			remain = 0;
			++context.current;
		} else {
			result *= 1 << bits;
			result += temp >>> (remain -= bits);
			temp %= 1 << remain;
			break;
		}
	}
	data.remain = remain;
	data.temp = temp;
	return result;
}
const FrameHeader = defineProperty({}, Symbol.toStringTag, { value: "FrameHeader", configurable: true }), frameHeaderSplitter = [15, 1, 4, 4, 4, 3, 1];
function decodeFrameHeader(context, streamInfo) {
	const array = context.array,
		[syncCode, blockingStrategy, blockSizeCode, sampleRateCode, channelCode, sampleSizeCode] = splitBytes(array.subarray(context.current, context.current += 4), frameHeaderSplitter);
	if (syncCode != 32764) throw new Error("Wrong frame starting position.");
	const idStart = context.current, id = decodeValue(context);
	if (!blockingStrategy && context.current - idStart > 6) throw new Error("Unexpected data length.");
	return defineProperties(Object.create(FrameHeader), {
		blockingStrategy: { value: blockingStrategy, enumerable: true },
		id: { value: id, enumerable: true },
		blockSize: { value: getBlockSize(blockSizeCode, context), enumerable: true },
		sampleRate: { value: getSampleRate(sampleRateCode, context, streamInfo), enumerable: true },
		sampleSize: { value: getSampleSize(sampleSizeCode, streamInfo), enumerable: true },
		channels: { value: getChannels(channelCode), enumerable: true },
		CRC8: { value: array[context.current++], enumerable: true }
	});
}
function getBlockSize(code, context) {
	switch (code) {
		case 0: throw new Error("Invalid/not supported block size code.");;
		case 1: return 192;
		case 2: return 576;
		case 3: return 1152;
		case 4: return 2304;
		case 5: return 4608;
		case 6: return bigEndianToUint(context.array.subarray(context.current, context.current += 1)) + 1;
		case 7: return bigEndianToUint(context.array.subarray(context.current, context.current += 2)) + 1;
		case 8: return 256;
		case 9: return 512;
		case 10: return 1024;
		case 11: return 2048;
		case 12: return 4096;
		case 13: return 8192;
		case 14: return 16384;
		case 15: return 32768;
	}
}
function getSampleRate(code, context, streamInfo) {
	switch (code) {
		case 0: return streamInfo.sampleRate;
		case 1: return 88200;
		case 2: return 176400;
		case 3: return 192000;
		case 4: return 8000;
		case 5: return 16000;
		case 6: return 22050;
		case 7: return 24000;
		case 8: return 32000;
		case 9: return 44100;
		case 10: return 48000;
		case 11: return 96000;
		case 12: return context.array[context.current++] * 1000;
		case 13: return bigEndianToUint(context.array.subarray(context.current, context.current += 2));
		case 14: return bigEndianToUint(context.array.subarray(context.current, context.current += 2)) * 10;
		default: throw new Error("Invalid sample rate code.");
	}
}
function getSampleSize(code, streamInfo) {
	switch (code) {
		case 0: return streamInfo.sampleSize;
		case 1: return 8;
		case 2: return 12;
		case 3: throw new Error("Invalid/not supported sample size code.");;
		case 4: return 16;
		case 5: return 20;
		case 6: return 24;
		case 7: return 32;
	}
}
function getChannels(code) {
	switch (code) {
		case 0: return ["mono"];
		case 1: return ["left", "right"];
		case 2: return ["left", "right", "center"];
		case 3: return ["front left", "front right", "back left", "back right"];
		case 4: return ["front left", "front right", "front center", "back left", "back right"];
		case 5: return ["front left", "front right", "front center", "LFE", "back left", "back right"];
		case 6: return ["front left", "front right", "front center", "LFE", "back center", "middle left", "middle right"];
		case 7: return ["front left", "front right", "front center", "LFE", "back left", "back right", "middle left", "middle right"];
		case 8: return ["left", "side"];
		case 9: return ["side", "right"];
		case 10: return ["average", "side"];
		default: throw new Error("Invalid/not supported channels code.");
	}
}
const subFrameTypes = Enum.fromKeys(["CONSTANT", "VERBATIM", "FIXED", "LPC"]);
class SubFrame {
	constructor(wastedBits) { defineProperty(this, "wastedBits", { value: wastedBits, enumerable: true }) }
	get typeName() { return Enum.keyOf(subFrameTypes, this.type) }
	static {
		defineProperties(this.prototype, {
			[Symbol.toStringTag]: { value: this.name, configurable: true },
			type: { get() { throw new TypeError("Illegal invocation") }, enumerable: true }
		});
	}
}
class ConstantSubFrame extends SubFrame {
	constructor(context, sampleSize, wastedBits) {
		super(wastedBits);
		defineProperty(this, "sample", { value: readSignedNumber(context, sampleSize), enumerable: true });
	}
	static {
		defineProperties(this.prototype, {
			[Symbol.toStringTag]: { value: this.name, configurable: true },
			type: { value: subFrameTypes.CONSTANT, enumerable: true }
		});
	}
}
class VerbatimSubFrame extends SubFrame {
	constructor(context, sampleSize, wastedBits, blockSize) {
		super(wastedBits);
		const samples = new Array(blockSize);
		for (let i = 0; i < blockSize; ++i) samples[i] = readSignedNumber(context, sampleSize);
		defineProperty(this, "samples", { value: freeze(samples), enumerable: true });
	}
	static {
		defineProperties(this.prototype, {
			[Symbol.toStringTag]: { value: this.name, configurable: true },
			type: { value: subFrameTypes.VERBATIM, enumerable: true }
		});
	}
}
class PredictionSubFrame extends SubFrame {
	constructor(wastedBits, order, warmUpSamples, residual) {
		super(wastedBits);
		defineProperties(this, {
			order: { value: order, enumerable: true },
			warmUpSamples: { value: warmUpSamples, enumerable: true },
			residual: { value: residual, enumerable: true }
		});
	}
	static {
		defineProperty(this.prototype, Symbol.toStringTag, { value: this.name, configurable: true });
	}
}
function extractRice(context, codingMethod, buffer) {
	var parameter;
	switch (codingMethod) {
		case 0: {
			const temp = readBits(context, 4);
			if (temp != 15) parameter = temp;
			break;
		}
		case 1: {
			const temp = readBits(context, 5);
			if (temp != 31) parameter = temp;
			break;
		}
		default:
			throw new Error("Invalid RICE coding method.");
	}
	const samples = buffer.length;
	if (parameter === undefined) {
		parameter = readBits(context, 5);
		if (!parameter) return;
		const shift = parameter - 1;
		for (let i = 0; i < samples; ++i) {
			const code = readBits(context, parameter);
			buffer[i] = code >> shift ? code | -1 << parameter : code;
		}
	} else {
		for (let i = 0; i < samples; ++i) {
			let n = 0;
			while (!readBits(context, 1)) ++n;
			const value = (n << parameter) | readBits(context, parameter);
			buffer[i] = value & 1 ? ~(value >> 1) : value >> 1;
		}
	}
}
function extractResidual(context, blockSize, predictorOrder) {
	const codingMethod = readBits(context, 2), partitionsNumber = 1 << readBits(context, 4), samplesPerPartition = blockSize / partitionsNumber, samples = new Int32Array(blockSize - predictorOrder);
	var current;
	extractRice(context, codingMethod, samples.subarray(0, current = samplesPerPartition - predictorOrder));
	for (let i = 1; i < partitionsNumber; ++i) extractRice(context, codingMethod, samples.subarray(current, current += samplesPerPartition));
	return samples;
}
class FixedSubFrame extends PredictionSubFrame {
	constructor(context, sampleSize, wastedBits, blockSize, order) {
		const warmUpSamples = new BigInt64Array(order);
		for (let i = 0; i < order; ++i) warmUpSamples[i] = readSignedNumber(context, sampleSize);
		super(wastedBits, order, warmUpSamples, extractResidual(context, blockSize, order));
	}
	static {
		defineProperties(this.prototype, {
			[Symbol.toStringTag]: { value: this.name, configurable: true },
			type: { value: subFrameTypes.FIXED, enumerable: true }
		});
	}
}
class LPCSubFrame extends PredictionSubFrame {
	constructor(context, sampleSize, wastedBits, blockSize, order) {
		const warmUpSamples = new BigInt64Array(order), coefficients = new BigInt64Array(order);
		for (let i = 0; i < order; ++i) warmUpSamples[i] = readSignedNumber(context, sampleSize);
		const coefficientsPrecision = readBits(context, 4) + 1;
		if (coefficientsPrecision == 16) throw new Error("Invalid LPC coefficients precision.");
		const coefficientsShift = readSignedNumber(context, 5);
		for (let i = 0; i < order; ++i) coefficients[i] = readSignedNumber(context, coefficientsPrecision);
		super(wastedBits, order, warmUpSamples, extractResidual(context, blockSize, order));
		defineProperties(this, {
			coefficientsShift: { value: coefficientsShift, enumerable: true },
			coefficients: { value: coefficients, enumerable: true }
		});
	}
	static {
		defineProperties(this.prototype, {
			[Symbol.toStringTag]: { value: this.name, configurable: true },
			type: { value: subFrameTypes.LPC, enumerable: true }
		});
	}
}
function extractSubFrame(context, sampleSize, blockSize) {
	if (readBits(context, 1)) throw new Error("Wrong sub frame starting position.");
	const typeCode = readBits(context, 6), wastedBitsFlag = readBits(context, 1);
	let wastedBits = 0;
	if (wastedBitsFlag) {
		do { if (++wastedBits > sampleSize) throw new Error("Invalid data.") } while (!readBits(context, 1));
		sampleSize -= wastedBits;
	}
	if (typeCode == 0) return new ConstantSubFrame(context, sampleSize, wastedBits);
	if (typeCode == 1) return new VerbatimSubFrame(context, sampleSize, wastedBits, blockSize);
	if (typeCode > 7 && typeCode < 13) return new FixedSubFrame(context, sampleSize, wastedBits, blockSize, typeCode - 8);
	if (typeCode > 31) return new LPCSubFrame(context, sampleSize, wastedBits, blockSize, typeCode - 31);
	throw new Error("Invalid/not supported sub frame type code.");
}
function extractFrame(context, streamInfo) {
	const array = context.array, start = context.current, header = decodeFrameHeader(context, streamInfo), { channels, blockSize, sampleSize } = header, bitOffset = context.data = { remain: 8, temp: array[context.current] };
	let subFrames;
	if (channels.includes("side")) {
		subFrames = channels[0] == "side" ?
			[extractSubFrame(context, sampleSize + 1, blockSize), extractSubFrame(context, sampleSize, blockSize)] :
			[extractSubFrame(context, sampleSize, blockSize), extractSubFrame(context, sampleSize + 1, blockSize)];
	} else {
		const channelsNumber = channels.length;
		subFrames = new Array(channelsNumber);
		for (let i = 0; i < channelsNumber; ++i) subFrames[i] = extractSubFrame(context, sampleSize, blockSize);
	}
	context.data = undefined;
	if (bitOffset.remain) ++context.current;
	return new Frame(header, subFrames, array.subarray(start, context.current), bigEndianToUint(array.subarray(context.current, context.current += 2)));
}
function extractFrames(context, streamInfo) {
	const frames = [];
	while (context.hasNext) frames.push(extractFrame(context, streamInfo));
	return frames;
}
function readSignedNumber(context, size) {
	const code = BigInt(readBits(context, size)), bits = BigInt(size);
	return code >> (bits - 1n) ? code | -1n << bits : code;
}
function predictor(buffer, coefficients, warmUpSamples, residual, shift, wastedBits) {
	const length = buffer.length, order = coefficients.length,
		temp = new BigInt64Array(order);
	for (let i = 0, reverseStart = order - 1; i < order; ++i) buffer[i] = (temp[reverseStart - i] = warmUpSamples[i]) << wastedBits;
	for (let n = order; n < length; ++n) {
		let sum = 0n;
		for (let i = 0; i < order; ++i) sum += temp[i] * coefficients[i];
		temp.copyWithin(1);
		buffer[n] = (temp[0] = (sum >> shift) + BigInt(residual[n - order])) << wastedBits;
	}
}
const fixedCoefficients = [
	[1n],
	[2n, -1n],
	[3n, -3n, 1n],
	[4n, -6n, 4n, -1n]
];
function decodeSubFrame(subFrame, blockSize) {
	switch (Object.getPrototypeOf(subFrame)) {
		case ConstantSubFrame.prototype: {
			const result = new BigInt64Array(blockSize);
			result.fill(subFrame.sample << BigInt(subFrame.wastedBits));
			return result;
		}
		case VerbatimSubFrame.prototype: {
			const result = new BigInt64Array(blockSize), { samples } = subFrame, wastedBits = BigInt(subFrame.wastedBits);
			for (let i = 0; i < blockSize; ++i) result[i] = samples[i] << wastedBits;
			return result;
		}
		case FixedSubFrame.prototype: {
			const { order, warmUpSamples, residual } = subFrame, wastedBits = BigInt(subFrame.wastedBits),
				result = new BigInt64Array(blockSize);
			if (order) {
				predictor(result, fixedCoefficients[order - 1], warmUpSamples, residual, 0n, wastedBits);
			} else for (let i = 0; i < blockSize; ++i) result[i] = BigInt(residual[i]) << wastedBits;
			return result;
		}
		case LPCSubFrame.prototype: {
			const { warmUpSamples, coefficients, coefficientsShift, residual } = subFrame, wastedBits = BigInt(subFrame.wastedBits),
				result = new BigInt64Array(blockSize);
			predictor(result, coefficients, warmUpSamples, residual, coefficientsShift, wastedBits);
			return result;
		}
		default:
			throw new TypeError("Not a valid sub frame.");
	}
}
function bigIntArrayToIntArray(array) {
	const length = array.length, result = new Int32Array(length);
	for (let i = 0; i < length; ++i) result[i] = Number(array[i]);
	return result;
}
class Frame {
	#data;
	constructor(header, subFrames, data, CRC16) {
		defineProperties(this, {
			header: { value: header, enumerable: true },
			subFrames: { value: freeze(subFrames), enumerable: true },
			CRC16: { value: CRC16, enumerable: true }
		});
		this.#data = data;
	}
	decode() {
		const subFrames = this.subFrames, { channels, blockSize } = this.header, subBlocks = new Array(channels.length);
		for (let i in subFrames) subBlocks[i] = decodeSubFrame(subFrames[i], blockSize);
		if (channels.includes("side")) {
			switch (channels[0]) {
				case "left": {
					const result = [bigIntArrayToIntArray(subBlocks[0]), new Int32Array(blockSize)], [left, right] = result, side = subBlocks[1];
					for (let i = 0; i < blockSize; ++i) right[i] = left[i] - Number(side[i]);
					return result;
				}
				case "side": {
					const result = [new Int32Array(blockSize), bigIntArrayToIntArray(subBlocks[1])], [left, right] = result, side = subBlocks[0];
					for (let i = 0; i < blockSize; ++i) left[i] = right[i] + Number(side[i]);
					return result;
				}
				case "average": {
					const result = [new Int32Array(blockSize), new Int32Array(blockSize)], [left, right] = result, [average, side] = subBlocks;
					for (let i = 0; i < blockSize; ++i) {
						const temp1 = side[i], temp2 = average[i] - (temp1 >> 1n);
						left[i] = Number(temp2 + temp1);
						right[i] = Number(temp2);
					}
					return result;
				}
			};
		}
		return subBlocks.map(bigIntArrayToIntArray);
	}
	verify() { return CRC16Check(this.#data) == this.CRC16 }
	static { defineProperties(this.prototype, Symbol.toStringTag, { value: this.name, configurable: true }) }
}
export { extractFrames, extractFrame, ConstantSubFrame, VerbatimSubFrame, FixedSubFrame, LPCSubFrame, SubFrame, Frame, subFrameTypes }