export function save(key: string, value: any){
    localStorage[key] = value;
    chrome.storage.sync.set({[key]: value});
}
export function get(key: string, cb: Function){
    chrome.storage.sync.get([key], function(result) {
        cb(result[key]);
    });
}