function crs_getEmoji(el) {
    return el.title
}

var crs_copyPaste = setInterval(() => {
    if (window.liveView) {
        $('#write_area').unbind('cut copy paste').bind('cut copy', (e) => {
            const { currentTarget } = e;
            const cb = [];
            console.log(e);
            currentTarget.childNodes.forEach((el) => {
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