let storyTimeout;
let chapter = "init";

function action(color) {

	if (!started) return;
	
	// console.log(chapter + "\t" + color);

	if (chapter == "init") {

		let phrase = story["init"];
		raconter(phrase);

	} else {

		// choose one at random
		try {
	
			// choose a random phrase from the story for this color
			let possiblePhrases = story[chapter][color];
			let phrase = possiblePhrases[Math.floor(Math.random() * possiblePhrases.length)];
			raconter(phrase);

		} catch(e) {

			console.log("error", e);

		}
		
	}

	// sendMessage(color);

}


function raconter(phrase) {

	if (talking) return;

	typeText(phrase, false);
	speak(phrase);

	lastPhrase = phrase;

}


function talkingDone() {

	// move to the next chapter
	nextChapter();
	// console.log("talking done");
}


function nextChapter() {

	switch(chapter) {
		case "init":
			chapter = "start";
			break;
		case "start":
			chapter = "intro";
			break;
		case "intro":
			chapter = "montagne";
			break;
		case "montagne":
			chapter = "plaine";
			break;
		case "plaine":
			chapter = "ville";
			break;
		case "ville":
			chapter = "outro";
			break;
		case "outro":
			chapter = "start";
			break;
	}

}