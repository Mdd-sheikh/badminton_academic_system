// Tiny IndexedDB layer (no dependencies) + live-updating React hook
import { useEffect, useState } from "react";
export * from "./util";

const NAME = "smashpoint-academy";
export const STORES = ["coaches", "batches", "players", "attendance", "performance", "teams", "tournaments", "matches", "meta"];

let dbp;
export function openDB() {
    if (!dbp) {
        dbp = new Promise((res, rej) => {
            const r = indexedDB.open(NAME, 1);
            r.onupgradeneeded = () => {
                STORES.forEach((s) => { if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s, { keyPath: "id" }); });
            };
            r.onsuccess = () => res(r.result);
            r.onerror = () => rej(r.error);
        });
    }
    return dbp;
}

function run(store, mode, fn) {
    return openDB().then((d) => new Promise((res, rej) => {
        const t = d.transaction(store, mode);
        const r = fn(t.objectStore(store));
        t.oncomplete = () => res(r && "result" in r ? r.result : undefined);
        t.onerror = t.onabort = () => rej(t.error);
    }));
}

export const getAll = (s) => run(s, "readonly", (st) => st.getAll());
export const putMany = (s, arr) => run(s, "readwrite", (st) => { arr.forEach((o) => st.put(o)); });
export const clear = (s) => run(s, "readwrite", (st) => st.clear());

const subs = new Set();
export const emit = () => subs.forEach((f) => f());

export const save = async (s, o) => { await putMany(s, [o]); emit(); return o; };
export const saveMany = async (s, a) => { await putMany(s, a); emit(); };
export const remove = async (s, id) => { await run(s, "readwrite", (st) => { st.delete(id); }); emit(); };
export const removeMany = async (s, ids) => { await run(s, "readwrite", (st) => { ids.forEach((i) => st.delete(i)); }); emit(); };

export function useStore(store) {
    const [rows, setRows] = useState([]);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let live = true;
        const load = () => getAll(store).then((r) => { if (live) { setRows(r); setReady(true); } });
        load();
        subs.add(load);
        return () => { live = false; subs.delete(load); };
    }, [store]);
    return [rows, ready];
}
