import BufferContext from "../BufferContext.mjs";
import { StreamInfoMetadata } from "./MetadataBlock.mjs";
const enum subFrameTypes { CONSTANT, VERBATIM, FIXED, LPC }
type FrameHeader = {
	readonly blockingStrategy: 0 | 1;
	readonly id: number;
	readonly blockSize: number;
	readonly sampleRate: number;
	readonly sampleSize: number;
	readonly channels: number;
	readonly CRC8: number;
}
declare class SubFrame {
	readonly type: subFrameTypes;
	readonly typeName: string;
	readonly wastedBits: number;
}
declare class ConstantSubFrame extends SubFrame {
	constructor(context: BufferContext, sampleSize: number, wastedBits: number);
	readonly type: subFrameTypes.CONSTANT;
	readonly typeName: "CONSTANT";
	readonly sample: bigint;
}
declare class VerbatimSubFrame extends SubFrame {
	constructor(context: BufferContext, sampleSize: number, wastedBits: number, blockSize: number);
	readonly type: subFrameTypes.VERBATIM;
	readonly typeName: "VERBATIM";
	readonly samples: bigint[];
}
declare class PredictorSubFrame extends SubFrame {
	readonly order: number;
	readonly warmUpSamples: BigInt64Array;
	readonly residual: Int32Array;
}
declare class FixedSubFrame extends PredictorSubFrame {
	constructor(context: BufferContext, sampleSize: number, wastedBits: number, blockSize: number, order: number);
	readonly type: subFrameTypes.FIXED;
	readonly typeName: "FIXED";
}
declare class LPCSubFrame extends PredictorSubFrame {
	constructor(context: BufferContext, sampleSize: number, wastedBits: number, blockSize: number, order: number);
	readonly type: subFrameTypes.LPC;
	readonly typeName: "LPC";
	readonly coefficientsShift: bigint;
	readonly coefficients: BigInt64Array;
}
declare class Frame {
	readonly header: FrameHeader;
	readonly subFrames: SubFrame[];
	readonly CRC16: number;
	decode(): Int32Array[];
	verify(): boolean;
}
declare function extractFrames(context: BufferContext, streamInfo: StreamInfoMetadata): Frame[];
declare function extractFrame(context: BufferContext, streamInfo: StreamInfoMetadata): Frame;
export { extractFrames, extractFrame, ConstantSubFrame, VerbatimSubFrame, FixedSubFrame, LPCSubFrame, SubFrame, Frame, subFrameTypes }