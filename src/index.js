'use strict';

const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const grpc = require('grpc');
const axios = require('axios');

module.exports = {
    file_exists,
    upload_file,
    download_file,
    delete_file,
    publish_to_topic
};

let storage = null, pubsub = null;

function get_storage(config) {
    if (storage) {
        return storage;
    }
    storage = new Storage({grpc: grpc, keyFilename: config.get('key_filepath')});
    return storage;
}

function get_pubsub(config) {
    if (pubsub) {
        return pubsub;
    }
    pubsub = new PubSub({grpc: grpc, keyFilename: config.get('key_filepath')});
    return pubsub;
}

async function file_exists(config, bucket_name, pathname) {
    const bucket = get_storage(config).bucket(bucket_name);
    const [files] = await bucket.getFiles({ prefix: pathname });
    if (files.length === 0) {
        return false;
    } else {
        for (let file of files) {
            if (file.name === pathname) {
                return true;
            }
        }
        return false;
    }
}

async function publish_to_topic(config, topic, data) {
    if (topic.startsWith('http://localhost')) {          // to support local test
        try {
            const headers = {'Content-Type': 'application/json'};
            return await axios({method: 'post', url: topic, headers, data});
        } catch(err) {
            console.error(err);
        }    
    } else {
        const buffer = Buffer.from(JSON.stringify(data));
        return await get_pubsub(config).topic(topic).publish(buffer);
    }
}

async function upload_file(config, local_file_pathname, bucket_name, pathname, metadata = null) {
    try {
        const bucket = get_storage(config).bucket(bucket_name);
        const options = {destination: pathname, resumable: false};
        if (metadata) {
            options.metadata = metadata;
        }
        await bucket.upload(local_file_pathname, options);
        return true;
    } catch(err) {
        return err.message;
    }
}

async function download_file(config, local_file_pathname, bucket_name, pathname) {
    try {
        const bucket = get_storage(config).bucket(bucket_name);
        const options = {destination: local_file_pathname, resumable: false};
        await bucket.file(pathname).download(options);
        return true;
    } catch(err) {
        console.error(err);
        return err.message;
    }
}

async function delete_file(config, bucket_name, pathname) {
    try {
        const bucket = get_storage(config).bucket(bucket_name);
        await bucket.file(pathname).delete();
        return true;
    } catch(err) {
        return err.message;
    }
}
