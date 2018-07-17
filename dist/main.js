// ==UserScript==
// @name         Bandcamp Volume Bar
// @version      1.1.2
// @author       Redcrafter
// @description  Adds a volume bar to Bandcamp
// @match        *://*.bandcamp.com/album/*
// @match        *://*.bandcamp.com/track/*
// @run-at       document-start
// @grant        GM_addStyle
// @namespace https://greasyfork.org/users/126269
// ==/UserScript==

var font = document.createElement("link");
font.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
font.rel = "stylesheet";
document.head.appendChild(font);
GM_addStyle(".volumeControl{align-items:center;display:flex;height:52px;margin-top:1em}.volumeControl .thumb{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.volumeControl>.speaker{background:#fff;border:1px solid #d9d9d9;border-radius:2px;color:#000;cursor:pointer;font-size:32px;height:54px;line-height:54px;position:relative;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;width:54px}");

var dragWidth = 226;
var dragging = false;
var dragPos = 0;
var percentage = localStorage.getItem("volume") || 0.5;
var speaker, volumeInner, audio, volume;

window.addEventListener("load", function() {
    audio = document.getElementsByTagName("audio")[0];
    updateVolume();

    var container = document.createElement("div");
    container.classList.add("volumeControl");

    speaker = document.createElement("i");
    speaker.classList.add("material-icons", "speaker");
    speaker.addEventListener("click", function () {
        audio.muted = !audio.muted;
        updateHtml();
    });
    container.appendChild(speaker);

    var volume = document.createElement("div");
    volume.classList.add("progbar");
    container.appendChild(volume);

    var fill = document.createElement("div");
    fill.classList.add("progbar_empty");
    fill.style.width = "248px";
    volume.appendChild(fill);

    volumeInner = document.createElement("div");
    volumeInner.classList.add("thumb");
    
    volumeInner.addEventListener("mousedown", function (e) {
        dragging = true;
        dragPos = e.offsetX;
    });
    fill.appendChild(volumeInner);
    
    document.getElementsByClassName("inline_player ")[0].appendChild(container);

    updateHtml();

    document.addEventListener("mouseup", function () {
        if (dragging) {
            localStorage.setItem("volume", percentage);
            dragging = false;
        }
    });
    document.addEventListener("mousemove", function (e) {
        if (dragging) {
            var pos = volume.getBoundingClientRect();

            audio.muted = false;
            percentage = clamp(((e.pageX - pos.x) - dragPos) / dragWidth, 0, 1);
            updateVolume();
            updateHtml();
        }
    });
});

function updateVolume() {
    audio.volume = (Math.exp(percentage) - 1) / (Math.E - 1);
}

function updateHtml() {
    if (audio.muted) {
        speaker.innerText = "volume_off";
        volumeInner.style.left = "0%";
    } else {
        if (percentage <= 0) {
            speaker.innerText = "volume_mute";
        } else if (percentage < 0.6) {
            speaker.innerText = "volume_down";
        } else {
            speaker.innerText = "volume_up";
        }
        volumeInner.style.left = dragWidth * percentage + 'px';
    }
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}