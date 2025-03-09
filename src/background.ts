// background.ts
const playerUrl = chrome.runtime.getURL('video.html');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Service worker is installed and active.');
});

chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
    if (req.type === 'm3u8') {
        chrome.tabs.create({ 'url': `${playerUrl}#${req.payload.url}` }, function (_) {
            // chrome.tabs.sendMessage(tab.id, { type: 'title', data: { title: req.payload.title } });
            // document.title = req.payload.title
            chrome.runtime.onConnect.addListener((port) => {
                console.log('포트 연결됨', port.name)
                const data = { action: 'title', ...req.payload }
                port.postMessage(data)
            })
        });
    }

    sendResponse({})
});
