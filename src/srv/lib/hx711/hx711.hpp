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
        static void GetValues(const v8::FunctionCallbackInfo<v8::Value>& args);
        static v8::Persistent<v8::Function> constructor;

        RPiGPIOPin SCK_L;  // clock pin left
        RPiGPIOPin SCK_R;  // clock pin right
        RPiGPIOPin DATA_L; // data pin left
        RPiGPIOPin DATA_R; // data pin right
        uint8_t GAIN_L; // amplification factor (and channel select)
        uint8_t GAIN_R; // amplification factor (and channel select)
        uint8_t SCK_HIGH_TIME;
        uint8_t SCK_LOW_TIME;
        uint8_t DATA_DELAY_TIME;

        int32_t getLeftValue();
        int32_t getRightValue();
        int32_t convertToSigned(uint32_t uint);
        uint32_t getRawBits(RPiGPIOPin SCK, RPiGPIOPin DATA, uint8_t GAIN);
};

} // namespace coffeepot

#endif /* HX711_HPP */
