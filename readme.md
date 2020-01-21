# gcp-utils

It collects util functions: file_exists, upload_file, download_file, delete_file and publish_to_topic.

## how to install

    npm install @samwen/gcp-utils

## how to use

### Step 1) create a service account key file from google console and save as *serviceAccount.json*

### Step 2) prepare config.js as following:

<pre>
'use strict';

const config = {
    key_filepath: __dirname + '/serviceAccount.json',
};

module.exports = config;
</pre>

### Step 3) code sample:

<pre>
const { file_exists, upload_file, download_file, delete_file, publish_to_topic } = require('@samwen/gpc-utils');

const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const bucket = 'gcp-utils-test';
const local_file_pathname = './test/upload_file_test.txt';
const dest_file_pathname = 'test-subfolder/upload_file_test.txt';
await upload_file(config, local_file_pathname, bucket, dest_file_pathname);

const result1 = await file_exists(config, bucket, dest_file_pathname);
// return true

const local_file_pathname2 = './test/upload_file_test2.txt';
const result2 = await download_file(config, local_file_pathname2, bucket, remote_file_pathname)
// return true

await delete_file(config, bucket, dest_file_pathname);

const result3 = await file_exists(config, bucket, dest_file_pathname);
// return false

const topic = 'gcp-utils-test';
await publish_to_topic(config, topic, {test: 'done'});
</pre>