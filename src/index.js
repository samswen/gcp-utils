'use strict';

const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const axios = require('axios');

module.exports = {
    file_exists,
    upload_file,
    download_file,
    delete_file,
    publish_to_topic,
    pull_from_subscription
};

let storage = null, pubsub = null;

function get_storage(config) {
    if (storage) {
        return storage;
    }
    storage = new Storage({keyFilename: config.get('key_filepath')});
    return storage;
}

function get_pubsub(config) {
    if (pubsub) {
        return pubsub;
    }
    pubsub = new PubSub({keyFilename: config.get('key_filepath')});
    return pubsub;
}

async function file_exists(config, bucket_name, pathname, retries = 3) {
    const bucket = get_storage(config).bucket(bucket_name);
    for (let i = 0; i < retries; i++) {
        try {
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
        } catch(err) {
            console.error(err.message);
            if (err && err.code) {
                if  (err.code === 404) {
                    return false;
                }
                if (err.code === 408 || err.code === 429 || err.code >= 500) {
                    const tries = i + 1;
                    if (tries < retries) {
                        const secs = tries * 30;
                        console.log('will retry, after ' + secs + ' secs');
                        await sleep(secs * 1000);
                        continue;
                    }
                }
            }
            return false;
        }
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

function pull_from_subscription(config, name, timeout = 3000, limit = 2048) {
    return new Promise((resolve) => {
        const options = {flowControl: { maxMessages: limit }};
        const pubsub = get_pubsub(config);
        const subscription = pubsub.subscription(name, options);
        const messages = [];
        subscription.on('message', (message) => {
            try {
                messages.push(JSON.parse(message.data.toString()));
            } catch(err) {
                console.error(err);
            } finally {
                message.ack();
            }
        });
        let i = 0;
        const timer = setInterval(() => {
            if (i >= timeout || messages.length >= limit) {
                subscription.close();
                resolve(messages);
                clearInterval(timer);
            }
            i += 500;
        }, 500);
    });
}

async function upload_file(config, local_file_pathname, bucket_name, pathname, metadata = null, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const bucket = get_storage(config).bucket(bucket_name);
            const options = {destination: pathname, resumable: false};
            if (metadata) {
                options.metadata = metadata;
            }
            await bucket.upload(local_file_pathname, options);
            return true;
        } catch(err) {
            console.error(err.message);
            if (err && err.code) {
                if  (err.code === 404) {
                    return false;
                }
                if (err.code === 408 || err.code === 429 || err.code >= 500) {
                    const tries = i + 1;
                    if (tries < retries) {
                        const secs = tries * 30;
                        console.log('will retry, after ' + secs + ' secs');
                        await sleep(secs * 1000);
                        continue;
                    }
                }
            }
            return err.message;
        }
    }
}

async function download_file(config, local_file_pathname, bucket_name, pathname, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const bucket = get_storage(config).bucket(bucket_name);
            const options = {destination: local_file_pathname, resumable: false};
            await bucket.file(pathname).download(options);
            return true;
        } catch(err) {
            console.error(err.message);
            if (err && err.code) {
                if  (err.code === 404) {
                    return err.message;
                }
                if (err.code === 408 || err.code === 429 || err.code >= 500) {
                    const tries = i + 1;
                    if (tries < retries) {
                        const secs = tries * 30;
                        console.log('will retry, after ' + secs + ' secs');
                        await sleep(secs * 1000);
                        continue;
                    }
                }
            }
            return err.message;
        }
    }
}

async function delete_file(config, bucket_name, pathname, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const bucket = get_storage(config).bucket(bucket_name);
            await bucket.file(pathname).delete();
            return true;
        } catch(err) {
            console.error(err.message);
            if (err && err.code) {
                if (err && err.code && err.code === 404) {
                    return true;
                }
                if (err.code === 408 || err.code === 429 || err.code >= 500) {
                    const tries = i + 1;
                    if (tries < retries) {
                        const secs = tries * 30;
                        console.log('will retry, after ' + secs + ' secs');
                        await sleep(secs * 1000);
                        continue;
                    }
                }
            }
            return err.message;
        }
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
