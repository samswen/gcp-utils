'use strict';

const execSync = require('child_process').execSync;
const { upload_file, download_file } =  require('../src');

const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

describe('test upload_file and download', () => {

    it('verifies it should download the same file', async () => {

        const bucket = 'gcp-utils-test';
        const local_file_pathname = './test/upload_file_test.txt';
        const remote_file_pathname = 'test-subfolder/upload_file_test_with_metadata.txt';

        const result1 = await upload_file(config, local_file_pathname, bucket, remote_file_pathname, {'content-type': 'text/plain; charset=utf-8'});

        assert.isNotNull(result1);
        expect(result1).to.be.an('boolean');
        expect(result1).equals(true);
        
        const saved_file_pathname = '/tmp/download.txt';
        const result2 = await download_file(config, saved_file_pathname, bucket, remote_file_pathname)
        assert.isNotNull(result2);
        expect(result2).to.be.an('boolean');
        expect(result2).equals(true);

        execSync('diff ' + local_file_pathname + ' ' + saved_file_pathname);
    });
});