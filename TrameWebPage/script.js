let paragraph;
let typeDelay = 40;
let text = "";
let subtext = "";
let lastPhrase = "";
let started = false;
let story = {};

function start() {

    // get the story element
    paragraph = document.getElementById("paragraph");

    loadStory();

    text = "Et Harmonie chercha sa prochaine couleur pour recolorier le monde."
    raconter(text, true);

}


function loadStory() {

    fetch('./story.json')
        .then(response => response.json())
        .then(data => story = data)
        .catch(error => console.log(error));

}


function startSpeech() {
    // type out next text with the new text
    typeText(text, false);
    // speak it
    speak(text);

}


// reveal the text like a typewriter
function typeText(newText, append=false) {

    // empty out previous text
    if (!append) {
        paragraph.innerHTML = "";
    }

    let i = 0;
    let interval = setInterval(function() {
        paragraph.innerHTML += newText.charAt(i);
        i++;
        if (i > newText.length) {
            clearInterval(interval);
        }
    }, typeDelay);
}


// use Chrome Text-To-Speech to read the text
function speak(newText, newSubtext = "") {

    text = newText;
    subtext = newSubtext;

    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.addEventListener("end", (event) => {
        console.log(
          speakSupplement(),
        );
      });
    speechSynthesis.speak(utterance);

}



function speakSupplement() {

    if (subtext) {
        let utterance = new SpeechSynthesisUtterance(subtext);
        utterance.lang = "fr-FR";
        speechSynthesis.speak(utterance);
    }

}




// get keypress events
document.addEventListener("keypress", (event) => {

    if (!started) return;
    
    // if 'r' is pressed, red color
    if (event.key === "r") {
        action("rouge");
    } else if (event.key === "v") {
        // if 'v' is pressed, green color
        action("vert");
    } else if (event.key === "b") {
        // if 'b' is pressed, blue color
        action("bleu");
    } else if (event.key === "m") {
        // if 'm' is pressed, magenta color
        action("magenta");
    } else if (event.key === "j") {
        // if 'y' is pressed, yellow color
        action("jaune");
    }

});


document.addEventListener("click", () => {

    if (started) return;
    start();
    started = true;

  });