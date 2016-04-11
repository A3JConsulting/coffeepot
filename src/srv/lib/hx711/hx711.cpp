// hx711.cpp

#include <bcm2835.h>
#include <stdio.h>
#include <sstream>

#include "hx711.hpp"

namespace coffeepot {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

Persistent<Function> HX711::constructor;

HX711::HX711() {
    DATA_L = RPI_GPIO_P1_15;    // GPIO 22
    SCK_L = RPI_GPIO_P1_11;     // GPIO 17

    DATA_R = RPI_GPIO_P1_16;    // GPIO 23
    SCK_R = RPI_GPIO_P1_12;     // GPIO 18

    GAIN_L = 3;                 // 1: channel A gain 128,
                                // 2: channel B gain 32,
                                // 3: channel A gain 64
    GAIN_R = 3;

    SCK_HIGH_TIME = 1;      // (after data read) microseconds
    SCK_LOW_TIME = 1;       // microseconds
    DATA_DELAY_TIME = 1;    // microseconds

    printf("before init\n");
    uint8_t success = bcm2835_init();
    printf("init success: %d\n", success);

    // Set DATA pins to input
    bcm2835_gpio_fsel(DATA_L, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(DATA_R, BCM2835_GPIO_FSEL_INPT);

    //  with a pull-down resistor
    bcm2835_gpio_set_pud(DATA_L, BCM2835_GPIO_PUD_DOWN);
    bcm2835_gpio_set_pud(DATA_R, BCM2835_GPIO_PUD_DOWN);

    // Set the SCK pins to output
    bcm2835_gpio_fsel(SCK_L, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(SCK_R, BCM2835_GPIO_FSEL_OUTP);

    // Set clock low from beginning
    bcm2835_gpio_write(SCK_L, LOW);
    bcm2835_gpio_write(SCK_R, LOW);
}

HX711::~HX711() {
    bcm2835_close();
}

void HX711::Init(Local<Object> exports) {
    Isolate* isolate = exports->GetIsolate();

    // Prepare constructor template
    Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
    tpl->SetClassName(String::NewFromUtf8(isolate, "HX711"));
    tpl->InstanceTemplate()->SetInternalFieldCount(1); // TODO: wtf?

    // Prototype
    NODE_SET_PROTOTYPE_METHOD(tpl, "getValues" , GetValues);

    constructor.Reset(isolate, tpl->GetFunction());
    exports->Set(
        String::NewFromUtf8(isolate, "HX711"),
        tpl->GetFunction()
    );
}

void HX711::New(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();

    if (args.IsConstructCall()) {
      // Invoked as constructor: `new HX711(...)`
      HX711* obj = new HX711();
      obj->Wrap(args.This());
      args.GetReturnValue().Set(args.This());
    } else {
      // Invoked as plain function `HX711(...)`, turn into construct call.
      const int argc = 0;
      Local<Value> argv[argc] = { };
      Local<Function> cons = Local<Function>::New(isolate, constructor);
      args.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
}

void HX711::GetValues(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();

    HX711* obj = ObjectWrap::Unwrap<HX711>(args.Holder());
    int32_t left  = obj->getLeftValue();
    int32_t right = obj->getRightValue();

    std::ostringstream retStringStream;
    retStringStream << left << ", " << right;
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, retStringStream.str().c_str()));
}

// private methods:

int32_t HX711::getLeftValue() {
    uint32_t bits = getRawBits(SCK_L, DATA_L, GAIN_L);
    return convertToSigned(bits);
}

int32_t HX711::getRightValue() {
    uint32_t bits = getRawBits(SCK_R, DATA_R, GAIN_R);
    return convertToSigned(bits);
}

int32_t HX711::convertToSigned(uint32_t uint){
    // 24bit 2s complement to 32 bit signed conversion
    if (uint & 0x800000){
        return uint - 0x1000000;
    }
    return uint;
}

uint32_t HX711::getRawBits(RPiGPIOPin SCK, RPiGPIOPin DATA, uint8_t GAIN)
{
    uint32_t data = 0;
    uint8_t bit = 0;

    printf("Waiting for data to be ready...\n");
    while(bcm2835_gpio_lev(DATA)); // wait until data is ready
    printf("reading!\n");

    int b;
    for (b=0; b<24; b++){
        // Clock up
        bcm2835_gpio_write(SCK, HIGH);
        bcm2835_delayMicroseconds(DATA_DELAY_TIME);
        // read
        data = data << 1;
        bit = bcm2835_gpio_lev(DATA);
        if (bit){
            data++;
        }
        bcm2835_delayMicroseconds(SCK_HIGH_TIME);
        // Clock down
        bcm2835_gpio_write(SCK, LOW);
        bcm2835_delayMicroseconds(SCK_LOW_TIME);
    }

    for (b=0; b<GAIN; b++){
        // Clock up
        bcm2835_gpio_write(SCK, HIGH);
        bcm2835_delayMicroseconds(DATA_DELAY_TIME);
        bcm2835_delayMicroseconds(SCK_HIGH_TIME);
        // Clock down
        bcm2835_gpio_write(SCK, LOW);
        bcm2835_delayMicroseconds(SCK_LOW_TIME);
    }

    return data;
}

} // namespace coffeepot
