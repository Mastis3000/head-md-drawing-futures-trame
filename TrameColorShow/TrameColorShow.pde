import processing.serial.*;

Serial myPort;  // Create object from Serial class
int val;      // Data received from the serial port
int lf = 10;    // Linefeed in ASCII
String myString = null;
PFont font;
String text = "Et Haromie cherche sa prochaine couleur pour colorer le monde";
String currentColor = "";

void setup() {
  fullScreen();
  noCursor();
  setupSerial();
  font = loadFont("Baskerville-48.vlw");
  textFont(font);
  saySomething(text);
}

void setupSerial() {

  //String portName = Serial.list()[1];
  String portName = "/dev/cu.usbmodem8301";
  //print(Serial.list());
  myPort = new Serial(this, portName, 9600);

  // Throw out the first reading, in case we started reading
  // in the middle of a string from the sender.
  myString = myPort.readStringUntil(lf);
  myString = null;
}

void draw() {

  background(255, 255, 255);
  fill(0);
  textSize(height*0.1);
  textAlign(CENTER, CENTER);

  checkSerialPort();

  showText();
}

void showText() {

  text(text, 5, 5, width-5, height-5);
}


void saySomething(String sentence) {

  Runtime rt = Runtime.getRuntime();
  try {
    rt.exec("say '" + sentence + "'");
  }
  catch (IOException e) {
    e.printStackTrace();
  }
}

void checkSerialPort() {
  while (myPort.available() > 0) {
    myString = myPort.readStringUntil(lf);
    if (myString != null) {
      String[] list = split(myString, '\t');
      if (list.length > 1 && list[0].indexOf("color") > -1) {
        currentColor = list[1];
        text = "Et Harmonie prend la couleur " + currentColor;
        saySomething(text);
      } // if
    } // if(myString)
  } // while
} // void
