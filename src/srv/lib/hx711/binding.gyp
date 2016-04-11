{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "addon.cpp", "hx711.cpp" ],
      "libraries": ["-l rt", "-l bcm2835"],
    }
  ]
}
