/* eslint-disable no-undef */
'use strict';

const { publish_to_topic } =  require('../src');

const ConfigUtil = require('@samwen/config-util');
const config = new ConfigUtil(require('./config'));

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const topic = config.get('topic');

describe('test publish_to_topic', () => {

    it('verifies it should send the data to the topic', async () => {

        const result = await publish_to_topic(config, topic, {purpose: 'test'});
        //console.log(result);
        assert.isNotNull(result);
    });
});
