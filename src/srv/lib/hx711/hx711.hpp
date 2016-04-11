// HX711.hpp
#ifndef HX711_HPP
#define HX711_HPP

#include <node.h>
#include <node_object_wrap.h>
#include <bcm2835.h>

namespace coffeepot {

class HX711 : public node::ObjectWrap {
    public:
        static void Init(v8::Local<v8::Object> exports);

    private:
        explicit HX711();
        ~HX711();

        // node.js wrapper methods
        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void GetValue(const v8::FunctionCallbackInfo<v8::Value>& args);
        static v8::Persistent<v8::Function> constructor;

        RPiGPIOPin SCK; // clock pin
        RPiGPIOPin DATA; // data pin
        uint8_t GAIN; // amplification factor (and channel select)
        uint8_t SCK_HIGH_TIME;
        uint8_t SCK_LOW_TIME;
        uint8_t DATA_DELAY_TIME;

        int32_t getValue();
        int32_t convertToSigned(uint32_t uint);
        uint32_t getRawBits();
};

} // namespace coffeepot

#endif /* HX711_HPP */
