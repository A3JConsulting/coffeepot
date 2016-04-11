// hx711.cpp

#include <bcm2835.h>
#include <stdio.h>

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
    DATA = RPI_GPIO_P1_15;   // GPIO 22
    SCK = RPI_GPIO_P1_11;    // GPIO 17
    GAIN = 3;                // 1: channel A gain 128,
                            // 2: channel B gain 32,
                            // 3: channel A gain 64

    SCK_HIGH_TIME = 1;      // (after data read) microseconds
    SCK_LOW_TIME = 1;       // microseconds
    DATA_DELAY_TIME = 1;    // microseconds

    printf("before init\n");
    uint8_t success = bcm2835_init(); // TODO check success and throw exception?
    printf("init success: %d\n", success);

    // Set DATA pin to input
    bcm2835_gpio_fsel(DATA, BCM2835_GPIO_FSEL_INPT);
    //  with a pull-down
    bcm2835_gpio_set_pud(DATA, BCM2835_GPIO_PUD_DOWN);

    // Set the SCK to be an output
    bcm2835_gpio_fsel(SCK, BCM2835_GPIO_FSEL_OUTP);

    // Set clock low from beginning
    bcm2835_gpio_write(SCK, LOW);
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
    NODE_SET_PROTOTYPE_METHOD(tpl, "getValue", GetValue);

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

void HX711::GetValue(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();

    HX711* obj = ObjectWrap::Unwrap<HX711>(args.Holder());
    int32_t result = obj->getValue();

    args.GetReturnValue().Set(Number::New(isolate, result));
}


// private methods:

int32_t HX711::getValue() {
    uint32_t bits = getRawBits();
    return convertToSigned(bits);
}

int32_t HX711::convertToSigned(uint32_t uint){
    // 24bit 2s complement to 32 bit signed conversion
    if (uint & 0x800000){
        return uint - 0x1000000;
    }
    return uint;
}

uint32_t HX711::getRawBits()
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
