type IndexedDatabaseTransactionOptions = {
	oncomplete?: () => void,
	onabort?: () => void,
	onerror?: (error: Error) => void,
	durability?: IDBTransactionDurability;
};
interface CRUD {
	add(objectStoreName: string, content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	delete(objectStoreName: string, query: IDBValidKey | IDBKeyRange): Promise<void>;
	clear(objectStoreName: string): Promise<void>;
	update(objectStoreName: string, content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	get(objectStoreName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAll(objectStoreName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
	getAllKeys(objectStoreName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]>;
	getByIndex(objectStoreName: string, indexName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAllByIndex(objectStoreName: string, indexName: string, query: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
}
declare class IndexedDatabase implements CRUD {
	private constructor();
	readonly name: string;
	readonly objectStoreNames: DOMStringList;
	readonly version: number;
	static open(name: string, version?: number, onUpgradeNeeded?: (upgrader: IndexedDatabaseUpgrader) => void, onBlocked?: () => void): Promise<IndexedDatabase>;
	startTransaction(readonly?: boolean, options?: IndexedDatabaseTransactionOptions): void;
	abortTransaction(): void;
	commitTransaction(): void;
	readonly transactionState: IDBTransactionMode | null;
	getObjectStore(objectStoreName: string): IndexedDatabaseObjectStore;
	getObjectStoreDetail(objectStoreName: string): IndexedDatabaseObjectStoreDetail;
	close(): void;
	restart(version?: number, onUpgradeNeeded?: (upgrader: IndexedDatabaseUpgrader) => void, onBlocked?: () => void): Promise<void>;
	add(objectStoreName: string, content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	delete(objectStoreName: string, query: IDBValidKey | IDBKeyRange): Promise<void>;
	clear(objectStoreName: string): Promise<void>;
	update(objectStoreName: string, content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	get(objectStoreName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAll(objectStoreName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
	getAllKeys(objectStoreName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]>;
	getByIndex(objectStoreName: string, indexName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAllByIndex(objectStoreName: string, indexName: string, query: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
}
declare class IndexedDatabaseUpgrader implements CRUD  {
	readonly objectStoreNames: DOMStringList;
	private constructor();
	readonly oldVersion: number;
	readonly newVersion: number;
	hasObjectStore(name: string): boolean;
	createObjectStore(name: string, option?: IDBObjectStoreParameters): IndexedDatabaseObjectStoreUpgrader;
	getObjectStore(objectStoreName: string): IndexedDatabaseObjectStore;
	deleteObjectStore(name: string): void;
	add(objectStoreName: string, content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	delete(objectStoreName: string, query: IDBValidKey | IDBKeyRange): Promise<void>;
	clear(objectStoreName: string): Promise<void>;
	update(objectStoreName: string, content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	get(objectStoreName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAll(objectStoreName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
	getAllKeys(objectStoreName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]>;
	getByIndex(objectStoreName: string, indexName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAllByIndex(objectStoreName: string, indexName: string, query: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
}
declare class IndexedDatabaseObjectStoreDetail {
	constructor(objectStore: IDBObjectStore);
	readonly name: string;
	readonly keyPath: string | string[];
	readonly indexNames: DOMStringList;
	getIndexDetail(indexName: string): IndexedDatabaseIndexDetail;
}
declare class IndexedDatabaseObjectStoreUpgrader extends IndexedDatabaseObjectStoreDetail {
	private constructor();
	createIndex(name: string, keyPath: string | Iterable<string>, options?: IDBIndexParameters): IndexedDatabaseIndexDetail;
	deleteIndex(name: string): void;
}
declare class IndexedDatabaseIndexDetail {
	constructor(objectStore: IDBIndex);
	readonly name: string;
	readonly unique: boolean;
	readonly keyPath: string | string[];
	readonly multiEntry: boolean;
}

declare class IndexedDatabaseObjectStore {
	private constructor();
	readonly indexedDatabase: IndexedDatabase;
	readonly name: string;
	add(content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	delete(query: IDBValidKey | IDBKeyRange): Promise<void>;
	clear(): Promise<void>;
	update(content: any, key?: IDBValidKey): Promise<IDBValidKey>;
	get(key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAll(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
	getAllKeys(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]>;
	getByIndex(indexName: string, key: IDBValidKey | IDBKeyRange): Promise<any>;
	getAllByIndex(indexName: string, query: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]>;
}
export default IndexedDatabase;
export { IndexedDatabase, IndexedDatabaseObjectStore };