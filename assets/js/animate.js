function scrollToBlk(item) {
    const blk = document.querySelector(`.${item}`).offsetTop;
    console.log(blk);
    window.scrollTo({ top: blk - 30, behavior: "smooth" });
}

function toggleFullScreen(elem) {
    // ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (
        (document.fullScreenElement !== undefined &&
            document.fullScreenElement === null) ||
        (document.msFullscreenElement !== undefined &&
            document.msFullscreenElement === null) ||
        (document.mozFullScreen !== undefined && !document.mozFullScreen) ||
        (document.webkitIsFullScreen !== undefined &&
            !document.webkitIsFullScreen)
    ) {
        document.querySelector(".full_open").classList.toggle("none");
        document.querySelector(".full_close").classList.toggle("none");
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        document.querySelector(".full_open").classList.toggle("none");
        document.querySelector(".full_close").classList.toggle("none");
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}
