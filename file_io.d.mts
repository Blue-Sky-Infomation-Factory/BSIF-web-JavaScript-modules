import { TypedArray } from "./binary_operate.mjs";
type saveTypes = TypedArray | ArrayBuffer | Blob | DataView | string;
const enum ReadType { TEXT, DATA_URL, ARRAY_BUFFER };
declare function read(file: Blob, readType: ReadType.TEXT | ReadType.DATA_URL): Promise<string>;
declare function read(file: Blob, readType: ReadType.ARRAY_BUFFER): Promise<ArrayBuffer>;
declare function downloadSave(file: Blob, saveName?: string): void;
declare function inputGet<T extends boolean>(multiple?: T, accept?: string): Promise<T extends true ? File[] : File>;
declare function get<T extends boolean>(options?: openFileOptions<T>): Promise<T extends true ? File[] : File>;
declare function save(data: saveTypes, options?: saveFileOptions): Promise<boolean>;
declare function open<T extends boolean>(options?: openFileOptions<T>): Promise<T extends true ? FileSystemFileHandle[] : FileSystemFileHandle>;
declare function openDirectory(options?: openDirectoryOptions): Promise<FileSystemDirectoryHandle>;
export { get, inputGet, open, openDirectory, save, downloadSave, read, ReadType }
//dom.d.ts
type acceptType = {
	description?: string,
	accept: {
		/**
		 * key: MIME type string
		 * value: Array of file extensions with dot
		 */
		[key: string]: string[]
	}
}
type fileOptions = {
	excludeAcceptAllOption?: boolean,
	types?: acceptType[]
}
type openFileOptions<T extends boolean> = { multiple?: T } & fileOptions;
type saveFileOptions = { suggestedName?: string } & fileOptions;
type openDirectoryOptions = {
	id?: string,
	mode?: "read" | "readwrite",
	startIn?: FileSystemHandle | string
}