document.onpaste = (evt) => {
    const dT = evt.clipboardData || window.clipboardData;
    const file = dT.files[0];

    const url = URL.createObjectURL(file);
    console.log(url);
    const image = new Image();
    image.addEventListener("load", () => {
        getImage( image );
    });
    image.src = url;
    console.log(file instanceof Blob);
};

/** For Test */
loadImage("./sample.png").then( image => {
    getImage( image );
});

function getImage( image ) {
    cropInfo.image = image;
    dCropImgWarp.querySelector("img")?.remove?.();
    dCropImgWarp.prepend(image);

    imgInfo.naturalWidth = image.naturalWidth;
    imgInfo.naturalHeight = image.naturalHeight;

    imgInfo.w = imgInfo.naturalWidth;
    imgInfo.h = imgInfo.naturalHeight;

    imgInfo.cw = imgInfo.naturalWidth;
    imgInfo.ch = imgInfo.naturalHeight;
}

const dImageCopper = document.querySelector(".image-cropper");
const dCropArea = document.querySelector(".crop-area");

const imgInfo = {
    w: 512,
    h: 512,
    cw: 512,
    ch: 512,
}

const cropInfo = {
    moveStart: false,
    resize: false,

    resizeL: false,
    resizeR: false,
    resizeT: false,
    resizeB: false,

    areaOldX: 0,
    areaOldY: 0,

    oldAreaW: 100,
    oldAreaH: 100,
    areaW: 100,
    areaH: 100,

    areaX: 0,
    areaY: 0,

    startX: null,
    startY: null,

    currentX: null,
    currentY: null,
};

function updateArea() {
    dCropArea.style.transform = `translate(${cropInfo.areaX}px, ${cropInfo.areaY}px)`;
    dCropArea.style.width = `${cropInfo.areaW}px`;
    dCropArea.style.height = `${cropInfo.areaH}px`;
}

dImageCopper.addEventListener("mousedown", e => {

    if (e.target === dCropArea) {
        cropInfo.startX = e.clientX;
        cropInfo.startY = e.clientY;

        cropInfo.moveStart = true;

        cropInfo.areaOldX = cropInfo.areaX;
        cropInfo.areaOldY = cropInfo.areaY;

        return;
    }

    const { target } = e;

    if (target.classList.contains("crop-handle")) {

        dImageCopper.classList.add("resizing");

        cropInfo.startX = e.clientX;
        cropInfo.startY = e.clientY;

        cropInfo.resize = true;

        cropInfo.oldAreaH = cropInfo.areaH;
        cropInfo.oldAreaW = cropInfo.areaW;

        cropInfo.areaOldX = cropInfo.areaX;
        cropInfo.areaOldY = cropInfo.areaY;

        if (target.classList.contains("handle-left") ) {
            cropInfo.resizeL = true;
            dImageCopper.classList.add("resize-left");
        }

        if (target.classList.contains("handle-right") ) {
            cropInfo.resizeR = true;
            dImageCopper.classList.add("resize-right");
        }

        if (target.classList.contains("handle-top") ) {
            cropInfo.resizeT = true;
            dImageCopper.classList.add("resize-top");
        }

        if (target.classList.contains("handle-bottom") ) {
            cropInfo.resizeB = true;
            dImageCopper.classList.add("resize-bottom");
        }
    }
});

dImageCopper.addEventListener("mousemove", e => {

    if (cropInfo.moveStart || cropInfo.resize) {
        cropInfo.currentX = e.clientX;
        cropInfo.currentY = e.clientY;

        const dx = cropInfo.currentX - cropInfo.startX;
        const dy = cropInfo.currentY - cropInfo.startY;

        if (cropInfo.moveStart) {
            cropInfo.areaX = cropInfo.areaOldX + dx;
            if( cropInfo.areaX < 0 ) cropInfo.areaX = 0;
            if( cropInfo.areaX + cropInfo.areaW > imgInfo.cw ) {
                cropInfo.areaX = imgInfo.cw - cropInfo.areaW;
            }

            cropInfo.areaY =  cropInfo.areaOldY + dy;

            if( cropInfo.areaY < 0 ) cropInfo.areaY = 0;
            if( cropInfo.areaY + cropInfo.areaH > imgInfo.ch ) {
                cropInfo.areaY = imgInfo.ch - cropInfo.areaH;
            }

            // cropInfo.areaX = cropInfo.areaOldX + dx;
            // cropInfo.areaY = cropInfo.areaOldY + dy;
            updateArea();
        }

        if (cropInfo.resize) {
            if( cropInfo.resizeL ) {
                cropInfo.areaX = cropInfo.areaOldX + dx;
                cropInfo.areaW = cropInfo.oldAreaW - dx;
            }

            if (cropInfo.resizeR) {
                cropInfo.areaW = cropInfo.oldAreaW + dx;
            }

            if (cropInfo.resizeB) {
                cropInfo.areaH = cropInfo.oldAreaH + dy;
            }

            if (cropInfo.resizeT) {
                cropInfo.areaY = cropInfo.areaOldY + dy;
                cropInfo.areaH = cropInfo.oldAreaH - dy;
            }

            updateArea();
        }
    }
});

function resetMouse(e) {
    if (cropInfo.moveStart) {
        // cropInfo.areaX = cropInfo
    }

    cropInfo.moveStart = false;
    cropInfo.resize = false;
    cropInfo.resizeR = false;
    cropInfo.resizeT = false;
    cropInfo.resizeL = false;
    cropInfo.resizeB = false;

    cropInfo.oldAreaH = cropInfo.areaH;
    cropInfo.oldAreaW = cropInfo.areaW;

    dImageCopper.classList.remove("resizing");
    dImageCopper.classList.remove("resize-left");
    dImageCopper.classList.remove("resize-right");
    dImageCopper.classList.remove("resize-top");
    dImageCopper.classList.remove("resize-bottom");
}

dImageCopper.addEventListener("mouseup", resetMouse);
dImageCopper.addEventListener("mouseout", e => {
    if( e.target === dImageCopper ) {
        resetMouse();
    }
});

const dCropButton = document.querySelector("#crop-btn");
const dCropImg = document.querySelector(".img-el");
const dCropImgWarp = document.querySelector(".image-wrap");

function loadImage(src) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = src;
    });
}


dCropButton.addEventListener("click", crop);

function crop() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleFactor = imgInfo.naturalWidth / imgInfo.cw;
    console.log( imgInfo.cw, imgInfo.naturalWidth, scaleFactor);

    let w = cropInfo.areaW, h = cropInfo.areaH;

    w *= scaleFactor;
    h *= scaleFactor;

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(cropInfo.image, cropInfo.areaX *= scaleFactor, cropInfo.areaY *= scaleFactor, cropInfo.areaW *= scaleFactor, cropInfo.areaH *= scaleFactor, 0, 0, w, h);

    canvas.toBlob(blob => {
        // Copy To Clipboard
        const imageData = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([imageData]);

        // Download File
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.target = "_blank";
        a.download = "result.png";
        a.href = url;
        a.click();
    });

}

let factor = 1;

function scale() {
    factor += .25;

    imgInfo.cw = imgInfo.w * factor;
    imgInfo.ch = imgInfo.h * factor;

    cropInfo.image.style.width = `${imgInfo.cw}px`;
    cropInfo.image.style.height = `${imgInfo.ch}px`;

    console.log(cropInfo.image);
}

window.addEventListener("keydown", e => {
    if (e.key === "-" && e.ctrlKey) {
        e.preventDefault();
        console.log(("CTRL+-"));
    }

    if (e.key === "=" && e.ctrlKey) {
        e.preventDefault();
        scale();
    }
});