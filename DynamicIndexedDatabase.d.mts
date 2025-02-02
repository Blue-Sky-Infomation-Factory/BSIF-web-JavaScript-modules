import { IndexedDatabase, IndexedDatabaseObjectStore } from "./IndexedDatabase.mjs";
declare class DynamicIndexedDatabase {
	constructor(db: IndexedDatabase);
	static open(name: string): Promise<DynamicIndexedDatabase>;
	initialStore(name: string, configure: Parameters<typeof IndexedDatabase.open>[2]): Promise<IndexedDatabaseObjectStore>;
}
export default DynamicIndexedDatabase;
export { DynamicIndexedDatabase };