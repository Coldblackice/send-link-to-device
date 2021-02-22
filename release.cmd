@echo off
set VER=1.0.3

sed -i -E "s/\"version\": \".+?\"/\"version\": \"%VER%\"/; s/\"name\": \".+?\"/\"name\": \"send-link-to-device-%VER%\"/" package.json
sed -i -E "s/version>.+?</version>%VER%</; s/download\/.+?\/send-link-to-device-.+?\.xpi/download\/%VER%\/send-link-to-device-%VER%\.xpi/" update.xml

set XPI=send-link-to-device-%VER%.xpi
if exist %XPI% del %XPI%
if exist bootstrap.js del bootstrap.js
if exist install.rdf del install.rdf
call jpm xpi
unzip %XPI% bootstrap.js install.rdf
