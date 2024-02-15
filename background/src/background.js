import * as idb from "idb";

const IDB_STORE_NAME = "keyValStore";

/**
 * Generate a blob of random data
 *
 * @param size Size of the blob in bytes (default 10 MB)
 * @returns Generated blob
 */
function generateBlob(size = 10 * 1024 * 1024) {
    const blob = new Blob([new Uint8Array(size)]);
    return blob;
}

async function openDB() {
    return idb.openDB(IDB_STORE_NAME, 1, {
        upgrade(db) {
            // create a store
            db.createObjectStore(IDB_STORE_NAME);
        },
    });
}

chrome.runtime.onInstalled.addListener(async function () {
    console.log("Extension Installed");

    await chrome.storage.local.set({ foo: "bar" });

    // open the database
    const db = await openDB();

    // set counter to 0
    await db.put(IDB_STORE_NAME, 0, "count");

    // write some binary data
    console.log("Writing binary data...");
    await db.put(IDB_STORE_NAME, new Uint8Array([0, 1, 2, 3]), "binary");

    // get binary data
    const binary = await db.get(IDB_STORE_NAME, "binary");
    console.log("Binary data from IDB:", binary);

    // measure how much time it takes to write 10 MB of data
    const blob = generateBlob(); // generation takes some time, so we do it before measuring
    let start = performance.now();
    await db.put(IDB_STORE_NAME, blob, "blob");
    let end = performance.now();
    console.log("Time to write 10 MB Blob:", end - start, "ms");

    // measure how much time it takes to read 10 MB of data that was written before
    start = performance.now();
    const blobFromIdb = await db.get(IDB_STORE_NAME, "blob");
    end = performance.now();
    console.log("Time to read 10 MB Blob:", end - start, "ms");
    console.log("Blob from IDB:", blobFromIdb);

    // print the size of the database
    const estimate = await navigator.storage.estimate();
    // print usage in MB
    console.log("Usage:", estimate.usage / 1024 / 1024, "MB");
    // print quota in GB
    console.log("Quota:", estimate.quota / 1024 / 1024 / 1024, "GB");

    // // store some data in the browser.storage.local
    // // await chrome.storage.local.set({ key: "yay" });
    // // await chrome.storage.local.set({ key: new Uint8Array([0, 1, 2, 3]) });
    // await chrome.storage.local.set({ key: new Blob(new Uint8Array([0, 1, 2, 3])) });
    // // get the data
    // const value = await chrome.storage.local.get("key", (result) => {
    //     // console.log("Value from browser.storage.local:", result.key);
    //     console.log("Value from browser.storage.local:", new Uint8Array(result.key));
    //     // console.log("Value from browser.storage.local:", new Blob(new Uint8Array(result.key)));
    // });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log("Message received", message);
    // sendResponse({ count: 42 });

    (async () => {
        if (message?.type == "incrementCount") {
            console.log("Incrementing count");

            // try to get foo from browser.storage.local
            await chrome.storage.local.get("foo", (result) => {
                console.log("Value from browser.storage.local:", result.foo);
            });

            const db = await openDB();
            let count = await db.get(IDB_STORE_NAME, "count");
            console.log("Count from IDB:", count);
            count++;
            await db.put(IDB_STORE_NAME, count, "count");
            console.log("Count written to IDB:", count);
            sendResponse({ count });
        } else if (message?.type == "getCount") {
            console.log("Getting count");

            const db = await openDB();
            const count = await db.get(IDB_STORE_NAME, "count");
            console.log("Count from IDB:", count);
            sendResponse({ count });
        }
    })();

    return true;
});
