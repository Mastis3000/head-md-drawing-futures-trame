#include <Wire.h>
#include "Adafruit_TCS34725.h"

const size_t colorCount = 5;

int colorValues[colorCount][4] = { // {hue low, hue high, saturation low, saturation high}
  {2,35,40,85},     // rouge 
  {60,74,50,80},    // jaune
  {120,150,30,75},  // vert
  {165,195,45,80},  // bleu
  {315,359,15,70},  // fuchsia
};

String colorNames[colorCount] = {
  "rouge",
  "jaune",
  "vert",
  "bleu",
  "fuchsia",
};

const String unknown = "unknown";

String currentColor = unknown;
String lastColor = unknown;


/* Initialise with specific int time and gain values */
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_614MS, TCS34725_GAIN_1X);

float hsb[3] = {0,0,0};

#define FILTER_WINDOW_SIZE  5
int filterIndex = 0;
float filterValue = 0;
float filterSum = 0;
float filterReadings[FILTER_WINDOW_SIZE];
float filterHue = 0;


void setup(void) {
  Serial.begin(9600);

  if (tcs.begin()) {
    Serial.println("Found sensor");
  } else {
    Serial.println("No TCS34725 found ... check your connections");
    while (1);
  }

}


void setColorName(float hue, float saturation) {

  // pas encore trouve
  int index= -1;

  for(int i=0; i < colorCount; i++) {

    // si trop petit ou trop grand, passer au suivant
    if (hue < colorValues[i][0] || hue > colorValues[i][1] || saturation < colorValues[i][2] || saturation > colorValues[i][3]) {
      continue;
    }

    // ok, on est dedans
    index = i;

    // sortir du for()
    break;

  } // for(i)

  if (index < 0) {
    lastColor = currentColor;
    currentColor = unknown;
  } else {
    lastColor = currentColor;
    currentColor = colorNames[index];
  }

  if (currentColor != lastColor && lastColor != unknown) {
    printLastColor();
  }

}


void printLastColor() {

Serial.print("color\t"); Serial.print(lastColor); Serial.print("\n");

}



void loop(void) {

  uint16_t r_raw, g_raw, b_raw, c, colorTemp, lux;
  float r_pct, g_pct, b_pct;

  tcs.getRGB(&r_pct, &g_pct, &b_pct);
  tcs.getRawData(&r_raw, &g_raw, &b_raw, &c);
  // convert our RGB values into HSB
  rgb2hsv(r_pct, g_pct, b_pct, hsb);
  // colorTemp = tcs.calculateColorTemperature(r, g, b);
  colorTemp = tcs.calculateColorTemperature_dn40(r_raw, g_raw, b_raw, c);
  lux = tcs.calculateLux(r_raw, g_raw, b_raw);

  float hue_360 = hsb[0] * 360.0f;
  float saturation_100 = hsb[1] * 100.0f;
  float brightness = hsb[2];

  filterSum = filterSum - filterReadings[filterIndex];  // Remove the oldest entry from the sum
  filterValue = hue_360;                                // Read the next sensor value
  filterReadings[filterIndex] = filterValue;            // Add the newest reading to the window
  filterSum = filterSum + filterValue;                  // Add the newest reading to the sum
  filterIndex = (filterIndex + 1) % FILTER_WINDOW_SIZE; // Increment the index, and wrap to 0 if it exceeds the window size
  filterHue = filterSum / FILTER_WINDOW_SIZE;      // Divide the sum of the window by the window size for the result

  setColorName(hue_360, saturation_100);

  Serial.print("filterHue="); Serial.print(filterHue); Serial.print("\t");
  Serial.print("hue_360="); Serial.print(hue_360); Serial.print("\t");
  Serial.print("saturation="); Serial.print(saturation_100, 2); Serial.print("\t");
  Serial.print("bright="); Serial.print(brightness, 2); Serial.print("\t");
  Serial.print("lux="); Serial.print(lux, DEC); Serial.print("\t");
  Serial.print("current="); Serial.print(currentColor); Serial.print("\t");
  Serial.print("\n");

}




// thanx Toxi ;-)
// cf. https://gist.github.com/postspectacular/2a4a8db092011c6743a7

// HSV->RGB conversion based on GLSL version
// expects hsv channels defined in 0.0 .. 1.0 interval
float fract(float x) { return x - int(x); }

float mix(float a, float b, float t) { return a + (b - a) * t; }

float step(float e, float x) { return x < e ? 0.0 : 1.0; }

float* hsv2rgb(float h, float s, float b, float* rgb) {
  rgb[0] = b * mix(1.0, constrain(abs(fract(h + 1.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0), s);
  rgb[1] = b * mix(1.0, constrain(abs(fract(h + 0.6666666) * 6.0 - 3.0) - 1.0, 0.0, 1.0), s);
  rgb[2] = b * mix(1.0, constrain(abs(fract(h + 0.3333333) * 6.0 - 3.0) - 1.0, 0.0, 1.0), s);
  return rgb;
}


float* rgb2hsv(float r, float g, float b, float* hsv) {
  float s = step(b, g);
  float px = mix(b, g, s);
  float py = mix(g, b, s);
  float pz = mix(-1.0, 0.0, s);
  float pw = mix(0.6666666, -0.3333333, s);
  s = step(px, r);
  float qx = mix(px, r, s);
  float qz = mix(pw, pz, s);
  float qw = mix(r, px, s);
  float d = qx - min(qw, py);
  hsv[0] = abs(qz + (qw - py) / (6.0 * d + 1e-10));
  hsv[1] = d / (qx + 1e-10);
  hsv[2] = qx;
  return hsv;
}


