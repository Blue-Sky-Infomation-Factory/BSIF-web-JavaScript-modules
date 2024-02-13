import { TypedArray } from "./BinaryOperate.mjs";
type saveTypes = TypedArray | ArrayBuffer | Blob | DataView | string;
const enum readableTypes { TEXT, DATA_URL, ARRAY_BUFFER };
declare function read(file: Blob, readType: readableTypes.TEXT | readableTypes.DATA_URL): Promise<string>;
declare function read(file: Blob, readType: readableTypes.ARRAY_BUFFER): Promise<ArrayBuffer>;
declare function downloadSave(file: Blob, saveName?: string): void;
declare function get<T extends boolean>(options?: openFileOptions<T>): Promise<T extends true ? File[] : File>;
declare function save(data: saveTypes, options?: saveFileOptions): Promise<boolean>;
declare function open<T extends boolean>(options?: openFileOptions<T>): Promise<T extends true ? FileSystemFileHandle[] : FileSystemFileHandle>;
declare function openDirectory(options?: openDirectoryOptions): Promise<FileSystemDirectoryHandle>;
export { get, open, openDirectory, save, downloadSave, read, readableTypes }
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