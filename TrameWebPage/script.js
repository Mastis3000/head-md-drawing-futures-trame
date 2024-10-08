let paragraph;
let typeDelay = 40;
let text = "";
let subtext = "";
let lastPhrase = "";
let started = false;
let story = {};
let serialPort;
let serialReader;
let talking = false;

function start() {

	if ("serial" in navigator) {
		startSerial();
	}

	// get the story element
	paragraph = document.getElementById("paragraph");

	loadStory();

}


async function checkForValidatedSerial() {

	let validatedPorts = await navigator.serial.getPorts();
	if (validatedPorts.length > 0) {
		start();
	}

}

let serialInput = "";


function parseSerialInput(newText) {

	serialInput += newText;

	// if the input contains a newline character, we have a full phrase
	if (serialInput.includes("\n")) {
		let phrases = serialInput.split("\n");
		serialInput = phrases.pop();
		phrases.forEach((phrase) => {
			// if the phrase starts with "color"
			if (phrase.startsWith("color")) {
				// console.log(phrase);
				let color = phrase.split("\t")[1];
				action(color);
			}
		});
	}

}


async function startSerial() {
    if ('serial' in navigator) {
        try {
            let validatedPorts = await navigator.serial.getPorts();
            let port;
            if (validatedPorts.length > 0) {
                port = validatedPorts[0];
            } else { 
                port = await navigator.serial.requestPort();
            }
            await port.open({ baudRate: 9600 });
            const reader = port.readable.getReader();
            
            try {
                while (true) {  // Continuously read from the port
                    const { value, done } = await reader.read(); // read() returns a promise that resolves with an object
                    if (done) {
                        // The readable stream has been closed or reader.releaseLock() called.
                        console.log('Stream closed');
                        break;
                    }
                    if (value) {
						parseSerialInput(new TextDecoder().decode(value));
                        //console.log(new TextDecoder().decode(value)); // Assuming text data, adjust decoding as necessary
                    }
                }
            } catch (error) {
                console.error('Error reading from serial port', error);
            } finally {
                reader.releaseLock();
            }
        } catch (err) {
            console.error('There was an error opening the serial port:', err);
        }
    } else {
        console.error('The Web serial API doesn\'t seem to be enabled in your browser.');
    }
}


async function loadStory() {

	fetch('./story.json')
		.then(response => response.json())
		.then(data => {

			story = data;

			text = "prenez un feutre pour démarrer l'histoire";
			raconter(text, true);
		
			started = true;

		})
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

	talking = true;
	text = newText;
	subtext = newSubtext;

	let utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = "fr-FR";
	utterance.addEventListener("end", (event) => {
		// speakSupplement()
		talkingDone();
		talking = false;
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
		action("fuchsia");
	} else if (event.key === "j") {
		// if 'y' is pressed, yellow color
		action("jaune");
	}

});


var connection;

function startTCP() {

	connection = new WebSocket('ws://10.0.0.1:7003');

	connection.onopen = function () {
		console.log("Connected to Max");
	}

}


function sendMessage(message) {

	try {
		connection.sendTCP(message);
	} catch(e) {
		console.error(e);
	}
}



function onTCPConnected() {
	console.log("connected to Max");
}



function sendTCP() {


}


document.addEventListener("click", () => {

	if (!started) start();

});