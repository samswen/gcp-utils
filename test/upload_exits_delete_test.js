/* eslint-disable no-undef */
'use strict';

const { file_exists, upload_file, delete_file } = require('../src');

const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const bucket = config.get('bucket');

describe('test file_exists', () => {

    it('verifies it should false', async () => {

        const dest_file_pathname = 'file_not_exist.txt';

        const result1 = await file_exists(config, bucket, dest_file_pathname);
        
        assert.isNotNull(result1);
        expect(result1).to.be.an('boolean');
        expect(result1).equals(false);
    });
});

describe('test file_exists', () => {

    it('verifies it should true', async () => {

        const local_file_pathname = './test/upload_file_test.txt';
        const dest_file_pathname = 'test-subfolder/upload_file_test.txt';

        const result1 = await upload_file(config, local_file_pathname, bucket, dest_file_pathname);

        assert.isNotNull(result1);
        assert.isTrue(result1);

        const result2 = await file_exists(config, bucket, dest_file_pathname);

        assert.isNotNull(result2);
        expect(result2).to.be.an('boolean');
        expect(result2).equals(true);
    });
});

describe('test file_exists', () => {

    it('verifies it should false', async () => {

        const dest_file_pathname = 'test-subfolder/upload_file_test.txt';

        const result1 = await delete_file(config, bucket, dest_file_pathname);

        assert.isNotNull(result1);
        assert.isTrue(result1);

        const result2 = await file_exists(config, bucket, dest_file_pathname);

        assert.isNotNull(result2);
        expect(result2).to.be.an('boolean');
        expect(result2).equals(false);
    });
});
