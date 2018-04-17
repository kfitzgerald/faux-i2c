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

    // const FauxI2C = require('faux-i2c');
    const FauxI2C = require('../FauxI2C');

    it('should do some reading', (done) => {
        let readCalled = false;
        const onRead = (address, register, byteCount, callback) => {
            readCalled = true;
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