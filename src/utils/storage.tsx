export function save(key: string, value: any) {
  localStorage[key] = value;
  chrome.storage?.local.set({ [key]: value });
}
export function get(key: string, cb: Function) {
  chrome.storage?.local.get([key], function (result) {
    cb(result[key]);
  });
}
