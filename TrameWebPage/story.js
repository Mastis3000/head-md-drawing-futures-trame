let storyTimeout;

function action(color) {

    // choose a random phrase from the story for this color
    let phrases = story.actions[color];

    // choose one at random
    let phrase = phrases[Math.floor(Math.random() * phrases.length)];

    raconter(phrase);

    // sendMessage(color);

}


function raconter(phrase) {

    typeText(phrase, false);
    speak(phrase);

    lastPhrase = phrase;

}
