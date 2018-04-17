"use strict";

const should = require('should');

describe('FauxI2C', () => {

    const FauxI2C = require('../FauxI2C');

    describe('constructor', () => {

        it('should instantiate with no options', () => {
            const i2c = new FauxI2C();
            should(i2c.onRead).be.exactly(null);
            should(i2c.onWrite).be.exactly(null);
        });

        it('should instantiate with options', () => {
            const onRead = function() {};
            const onWrite = function() {};
            const i2c = new FauxI2C({
                onRead,
                onWrite
            });

            i2c.onRead.should.be.exactly(onRead);
            i2c.onWrite.should.be.exactly(onWrite);
        });

    });

    describe('read', () => {

        it('should callback if no onRead handler defined', (done) => {
            const i2c = new FauxI2C();
            i2c.read(1, 2, 3, (err, buffer) => {
                should(err).not.be.ok();
                should(buffer).be.ok();
                buffer.length.should.be.exactly(3);
                done();
            });
        });

        it('should allow interception with the onRead handler', (done) => {

            let readCalled = false;
            const onRead = (address, register, byteCount, callback) => {
                readCalled = true;
                address.should.be.exactly(1);
                register.should.be.exactly(2);
                byteCount.should.be.exactly(3);
                callback(null, Buffer.from([0x01, 0x02, 0x03]));
            };

            const i2c = new FauxI2C({
                onRead
            });
            i2c.read(1, 2, 3, (err, buffer) => {
                should(err).not.be.ok();
                should(buffer).be.ok();
                buffer.length.should.be.exactly(3);
                buffer[0].should.be.exactly(0x01);
                buffer[1].should.be.exactly(0x02);
                buffer[2].should.be.exactly(0x03);
                readCalled.should.be.exactly(true);
                done();
            });
        });

    });

    describe('write', () => {

        it('should callback if no onWrite handler defined', (done) => {
            const i2c = new FauxI2C();
            i2c.write(1, 2, Buffer.from([0x00, 0x01]), (err) => {
                should(err).not.be.ok();
                done();
            });
        });

        it('should allow interception with the onWwrite handler', (done) => {

            let writeCalled = false;
            const onWrite = (address, register, buffer, callback) => {
                writeCalled = true;
                address.should.be.exactly(1);
                register.should.be.exactly(2);

                should(buffer).be.ok();
                buffer.length.should.be.exactly(3);
                buffer[0].should.be.exactly(0x01);
                buffer[1].should.be.exactly(0x02);
                buffer[2].should.be.exactly(0x03);

                callback(null);
            };

            const i2c = new FauxI2C({
                onWrite
            });
            i2c.write(1, 2, Buffer.from([0x01, 0x02, 0x03]), (err) => {
                should(err).not.be.ok();

                writeCalled.should.be.exactly(true);
                done();
            });
        });

    });

});

