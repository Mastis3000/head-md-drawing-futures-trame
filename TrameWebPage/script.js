
let story;
let typeDelay = 10;
let text = "Et Harmonie chercha sa prochaine couleur pour recolorier le monde.";

function start() {

    story = document.getElementById("story");
    // type out next text with the new text
    typeText(text, false);
    // speak it
    speak(text);

}


// reveal the text like a typewriter
function typeText(newText, append=false) {

    // empty out previous text
    if (!append) {
        story.innerHTML = "";
    }

    let i = 0;
    let interval = setInterval(function() {
        story.innerHTML += text.charAt(i);
        i++;
        if (i > newText.length) {
            clearInterval(interval);
        }
    }, typeDelay);
}


// use Chrome Text-To-Speech to read the text
function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    speechSynthesis.speak(utterance);
}


// get access to serial port
function getSerialPort() {
    // request serial port access
    navigator.serial.requestPort().then((port) => {
        console.log("Serial port opened: " + port.getInfo().usbProductId);
    }).catch((err) => {
        console.error("Error opening serial port: " + err);
    });
}