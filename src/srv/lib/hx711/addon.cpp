// addon.cpp
#include <node.h>
#include "hx711.hpp"

namespace coffeepot {

using v8::Local;
using v8::Object;

void InitAll(Local<Object> exports) {
  HX711::Init(exports);
}

NODE_MODULE(addon, InitAll)

} // namespace coffeepot
