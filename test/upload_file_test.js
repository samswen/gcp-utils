/* eslint-disable no-undef */
'use strict';

const { upload_file } =  require('../src');

const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const bucket = config.get('bucket');

describe('test upload_file', () => {

    it('verifies it should uploade the file to a subfolder in the bucket', async () => {

        const local_file_pathname = './test/upload_file_test.txt';
        const dest_file_pathname = 'test-subfolder/upload_file_test_with_metadata.txt';

        const result = await upload_file(config, local_file_pathname, bucket, dest_file_pathname, {'content-type': 'text/plain; charset=utf-8'});

        assert.isNotNull(result);
        expect(result).to.be.an('boolean');
        expect(result).equals(true);
    });
});

describe('test upload_file without metadata', () => {

    it('verifies it should uploade the file to a subfolder in the bucket', async () => {

        const local_file_pathname = './test/upload_file_test.txt';
        const dest_file_pathname = 'test-subfolder/upload_file_test.txt';

        const result = await upload_file(config, local_file_pathname, bucket, dest_file_pathname);

        assert.isNotNull(result);
        expect(result).to.be.an('boolean');
        expect(result).equals(true);
    });
});
