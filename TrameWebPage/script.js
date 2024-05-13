let paragraph;
let typeDelay = 40;
let text = "";
let subtext = "";
let lastPhrase = "";
let started = false;
let story = {};
let serialPort;
let serialReader;

function start() {

	if ("serial" in navigator) {
		startSerial();
	}

	// get the story element
	paragraph = document.getElementById("paragraph");

	loadStory();

	// startTCP();

	text = "Et Harmonie chercha sa prochaine couleur pour recolorier le monde."
	raconter(text, true);

	started = true;

}


async function checkForValidatedSerial() {

	let validatedPorts = await navigator.serial.getPorts();
	if (validatedPorts.length > 0) {
		start();
	}

}


async function startSerial() {
	
	try {

		let validatedPorts = await navigator.serial.getPorts();

		if (validatedPorts.length == 0) {

			navigator.serial.requestPort().then((selectedPort) => {
				serialPort = selectedPort;
				console.log("validated serial port: " + serialPort);
			});

		} else {

			serialPort = validatedPorts[0];
			console.log(serialPort);

		}

		if (serialPort) {
			serialPort.onconnect = serialConnected();
			serialPort.open({ baudRate: 9600 });
		}

	} catch(e) {

		console.error(e);

	}

}


async function serialConnected() {

	reader = serialPort.readable.getReader();
	console.log("serial connected");

	// Listen to data coming from the serial device.
	while (true) {
		const { value, done } = await reader.read();
		if (done) {
			// Allow the serial port to be closed later.
			reader.releaseLock();
			break;
		}
		// value is a Uint8Array.
		console.log(value);
	}

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
		speakSupplement()
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