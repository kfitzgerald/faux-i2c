# Faux I2C

[![Build Status](https://travis-ci.org/kfitzgerald/faux-i2c.svg?branch=master)](https://travis-ci.org/kfitzgerald/faux-i2c) [![Coverage Status](https://coveralls.io/repos/github/kfitzgerald/faux-i2c/badge.svg?branch=master)](https://coveralls.io/github/kfitzgerald/faux-i2c?branch=master)

This module provides a mock i2c interface for unit testing. It allows intercepting and testing of device i/o.

It isn't blackmagic. It just lets you emulate I2C manually in tests, so you can confirm that the data being 
sent and received by your device library is working as expected.

FauxI2C is modeled after [Raspi-I2C](https://github.com/nebrius/raspi-i2c).

## Installation

NPM:
```sh
npm install --save-dev faux-i2c
```

Yarn:
```sh
yarn add --dev faux-i2c
```

## Usage

Replace the I2C interface in your device library with an instance of FauxI2C. 

Then, you can set the `onRead` and `onWrite` handlers to intercept those processes.

For example:

```js
"use strict";

/**
 * Example I2C-enabled device class that reads and writes something over I2C
 */
class Device {

    constructor(options) {
        this.i2c = options.i2c;
        this.address = 0x42;
    }

    readSomething(callback) {
        const register = 0x01;
        const bytes = 2;
        this.i2c.read(this.address, register, bytes, (err, buffer) => {
            // Do something with the returned bytes
            callback(err, buffer);
        });
    }

    writeSomething(bytes, callback) {
        const register = 0x01;
        const buffer = Buffer.from(bytes);
        this.i2c.write(this.address, register, buffer, (err) => {
            // Do something after the write
            callback(err);
        });
    }
}

describe('Device', () => {

    const FauxI2C = require('faux-i2c');

    it('should do some reading', (done) => {
        let readCalled = false;
        const onRead = (address, register, byteCount, callback) => {
            readCalled = true;
            
            // Here, you can confirm your device is requesting what it should be
            // then send back emulated data, letting you test every scenario
            
            address.should.be.exactly(0x42);
            register.should.be.exactly(0x01);
            byteCount.should.be.exactly(2);
            callback(null, Buffer.from([0x01, 0x02]));
        };

        const i2c = new FauxI2C({ onRead });
        const device = new Device({ i2c });

        device.readSomething((err, buffer) => {
            should(err).not.be.ok();
            should(buffer).be.ok();
            buffer.length.should.be.exactly(2);
            buffer[0].should.be.exactly(0x01);
            buffer[1].should.be.exactly(0x02);
            readCalled.should.be.exactly(true);
            done();
        });
    });

    it('should do some writing', (done) => {
        let writeCalled = false;
        const onWrite = (address, register, buffer, callback) => {
            writeCalled = true;
            
            // Here, you can confirm your device is sending what it should be
            
            address.should.be.exactly(0x42);
            register.should.be.exactly(0x01);
            buffer.length.should.be.exactly(2);
            buffer[0].should.be.exactly(0x01);
            buffer[1].should.be.exactly(0x02);
            callback(null, Buffer.from([0x01, 0x02]));
        };

        const i2c = new FauxI2C({ onWrite });
        const device = new Device({ i2c });

        device.writeSomething([0x01, 0x02], (err) => {
            should(err).not.be.ok();
            writeCalled.should.be.exactly(true);
            done();
        });
    });

});
```


## Contributing

If you find a bug or have suggestions, please open a pull request. Contributions are greatly appreciated.

To maintain standards, please ensure that contributions pass unit tests and has complete code coverage.

To run the tests:
```sh
npm run report
``` 

This script will run the unit tests, code quality and show code coverage. If you are lacking coverage, please
see `coverage/index.html` to narrow down where your coverage is lacking.

## License
TL;DR? see: http://www.tldrlegal.com/license/mit-license

```text
The MIT License (MIT)
Copyright (c) 2018 Kevin M. Fitzgerald

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```