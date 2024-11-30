const copyPaste = setInterval(() => {
    if (window.liveView) {
        $('#write_area').unbind('cut copy paste');
        clearInterval(copyPaste);
    }
}, 500);