function crs_getEmoji(el) {
    return el.title
}

function fn_crsCopyPaste() {
    var crs_copyPaste = setInterval(() => {
        if (window.liveView) {
            $('#write_area, #auqa_voice_textarea, #adb_auqa_voice_textarea').unbind('cut copy paste').bind('cut copy', (e) => {
                e.preventDefault();

                const { currentTarget } = e;
                const cb = [];

                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                const fragments = range.cloneContents();

                fragments.childNodes.forEach((el) => {
                    if (el.nodeName === 'IMG') {
                        cb.push(crs_getEmoji(el));
                    }
                    else if (el.nodeName === '#text') {
                        cb.push(el.nodeValue || '');
                    }
                });
                navigator.clipboard.writeText(cb.join('')).then(() => {
                    if (e.type === 'cut') {
                        range.deleteContents();
                    }
                });
            });
            clearInterval(crs_copyPaste);
        }
    }, 500);
}

function fn_crsAutoPlayVod() {
    window.liveView.aContainer[1].autoPlayVodBanner = null;
}

window.addEventListener('message', (event) => {
    console.log(event);
    if (event.source !== window || !event.data || event.data.source !== 'from-extension') return;

    if (event.data.action === 'crs_copyPaste') {
        fn_crsCopyPaste();
    }

    if (event.data.action === 'crs_autoPlayVod') {
        fn_crsAutoPlayVod();
    }
})