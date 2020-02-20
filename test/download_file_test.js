'use strict';

const execSync = require('child_process').execSync;
const { upload_file, download_file } =  require('../src');

const { statSync } = require("fs");
const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const bucket = config.get('bucket');

describe('test upload_file and download', () => {

    it('verifies it should download the same file', async () => {

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

describe('test download an existing file', () => {

    it('verifies it should no zero size file', async () => {
        
        const remote_file_pathname = 'upload_file_test.txt';
        const saved_file_pathname = '/tmp/test.txt';
        const result1 = await download_file(config, saved_file_pathname, bucket, remote_file_pathname)
        assert.isNotNull(result1);
        expect(result1).to.be.an('boolean');
        expect(result1).equals(true);

        const stats = statSync(saved_file_pathname);
        expect(stats.size).greaterThan(0);
    });
});

describe('test download a non-existing file', () => {

    it('verifies it should return the message', async () => {
        
        const remote_file_pathname = 'upload_file_test_non-existing.txt';
        const saved_file_pathname = '/tmp/test.txt';
        const result1 = await download_file(config, saved_file_pathname, bucket, remote_file_pathname)
        //console.log(result1);
        assert.isNotNull(result1);
        assert.isTrue(result1.startsWith('No such object: '));
    });
});
