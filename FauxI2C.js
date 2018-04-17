"use strict";

/**
 * I2C interface emulator for unit testing and intercepting I2C communication
 */
class FauxI2C {

    /**
     * Creates a new instance of the I2C emulator
     * @param {{onRead:function, onWrite(function}} [options] – constructor options
     */
    constructor(options = {}) {
        this.onRead = options.onRead || null;
        this.onWrite = options.onWrite || null;
    }

    /**
     * Reads data from an I2C channel. If onRead is set, will invoke the handler
     * @param address
     * @param register
     * @param byteCount
     * @param callback
     */
    read(address, register, byteCount, callback) {
        if (this.onRead) {
            this.onRead(address, register, byteCount, callback);
        } else {
            callback(null, Buffer.from((new Array(byteCount)).fill(0x00)));
        }
    }

    /**
     * Writes data to an I2C channel. If onWrite is set, will invoke the handler
     * @param address
     * @param register
     * @param buffer
     * @param callback
     */
    write(address, register, buffer, callback) {
        if (this.onWrite) {
            this.onWrite(address, register, buffer, callback);
        } else {
            callback(null);
        }
    }

}

module.exports = FauxI2C;