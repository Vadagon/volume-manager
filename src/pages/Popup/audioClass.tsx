export class AudioClass {
  currentTabId: number | null;
  currentTab: any;
  storage: any;
  gainNode: GainNode | undefined;

  constructor() {
    this.currentTabId = null;
    this.currentTab = null;
    this.storage = null;
    this.run();

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.fetchWindowId(tabId)
        .then((windowId) => this.fetchWindow(windowId ?? -1))
        .then((windowId) => {
          if (windowId !== undefined) {
            chrome.windows.remove(windowId);
          }
        });
    });
  }

  run(): void {
    this.setGainValue();
  }

  async setGainValue(): Promise<void> {
    await this.fetchCurrentTabId();
    this.audioContextInit(this.currentTabId!);
  }

  fetchWindowId(tabId: number): Promise<number | undefined> {
    return new Promise((resolve) => {
      const key = `popup_${tabId}`;
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  fetchWindow(windowId: number): Promise<number | undefined> {
    return new Promise((resolve) => {
      chrome.windows.get(windowId, (window) => {
        resolve(window?.id);
      });
    });
  }

  async audioContextInit(tabId: number): Promise<void> {
    const currentTab = (await chrome.tabs.getCurrent())?.id;
    console.log('tabId' + tabId);
    chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
      this.fetchStream(streamId).then((stream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        this.gainNode = audioContext.createGain();
        source.connect(this.gainNode!);
        this.gainNode!.connect(audioContext.destination);
      });
    });
  }

  fetchStream(streamId: string): Promise<MediaStream> {
    var audio: any = {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    };
    return new Promise((resolve) => {
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: audio,
        })
        .then((stream) => {
          resolve(stream);
        });
    });
  }

  fetchCurrentTabId(): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true }, (tabs) => {
        if (!chrome.runtime.lastError && tabs.length > 0) {
          this.currentTabId = tabs[0].id!;
          this.currentTab = tabs[0];
          console.log(tabs);
          resolve();
        }
      });
    });
  }

  handleGainChange(value: number): void {
    if (value) {
      if (value > 600 || value < 0) value = 600;
    } else {
      value = 0;
    }
    const tabId = this.currentTabId!;
    const gainValue = value / 100;
    if (this.gainNode) this.gainNode.gain.value = gainValue;
    this.updateBadge(tabId, value);
  }

  updateBadge(tabId: number, value: number): void {
    chrome.action.setBadgeText({ text: `${value}`, tabId });
  }
}
