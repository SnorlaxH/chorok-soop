function crs_getEmoji(el) {
    return el.title
}

var crs_copyPaste = setInterval(() => {
    if (window.liveView) {
        $('#write_area').unbind('cut copy paste').bind('cut copy', (e) => {
            e.preventDefault();

            const { currentTarget } = e;
            const cb = [];

            const selection = window.getSelection();
            if(!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const fragments = range.cloneContents();

            fragments.childNodes.forEach((el) => {
                if (el.nodeName === 'IMG') {
                    cb.push(crs_getEmoji(el));
                }
                else if(el.nodeName === '#text') {
                    cb.push(el.nodeValue || '');
                }
            });
            navigator.clipboard.writeText(cb.join(''));
        });
        clearInterval(crs_copyPaste);
    }
}, 500);