# gcp-utils

It collects util functions: file_exists, upload_file, download_file, delete_file and publish_to_topic.

# how to install

    npm install @samwen/gcp-utils

# how to use

1. create a service account key file from google console and save as *serviceAccount.json*

2. prepare config.js as following:

<pre>
'use strict';

const config = {
    key_filepath: __dirname + '/serviceAccount.json',
};

module.exports = config;
</pre>

3. code sample:

<pre>
const { file_exists, upload_file, delete_file, publish_to_topic } = require('@samwen/gpc-utils');

const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const bucket = 'gcp-utils-test';
const local_file_pathname = './test/upload_file_test.txt';
const dest_file_pathname = 'test-subfolder/upload_file_test.txt';

const result1 = await upload_file(config, local_file_pathname, bucket, dest_file_pathname);
// return true

const result2 = await file_exists(config, bucket, dest_file_pathname);
// return true

onst result3 = await file_exists(config, bucket, dest_file_pathname);
// return true

const topic = 'gcp-utils-test';
const result = await publish_to_topic(config, topic, {test: 'done'});
//return message id number

</pre>