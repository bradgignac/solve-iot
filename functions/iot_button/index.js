const assert = require('assert');
const crypto = require('crypto');
const request = require('request');
const AWS = require('aws-sdk');
const Twitter = require('twitter-node-client').Twitter;

console.log('Executing Lambda function');

const email = (cb) => {
  assert(process.env.SNS_TOPIC, 'SNS_TOPIC is required');

  const topic = process.env.SNS_TOPIC;
  const message = 'Hello, Rackspace::Solve San Francisco! #rackspacesolve';
  const sns = new AWS.SNS({ region: 'us-west-2' });

  console.log('Publishing message to SNS topic: topic=%s, message=%s', topic, message);

  sns.publish({ TopicArn: topic, Message: message }, (err, data) => {
    if (err) {
      console.error('Received error while publishing SNS message: err=%j', err);
      cb(err);
    } else {
      console.log('Successfully published SNS message: data=%j', data);
      cb(null, data);
    }
  });
};

const tweet = (cb) => {
  assert(process.env.TWITTER_CONSUMER_KEY, 'TWITTER_CONSUMER_KEY is required');
  assert(process.env.TWITTER_CONSUMER_SECRET, 'TWITTER_CONSUMER_SECRET is required');
  assert(process.env.TWITTER_ACCESS_TOKEN, 'TWITTER_ACCESS_TOKEN is required');
  assert(process.env.TWITTER_ACCESS_TOKEN_SECRET, 'TWITTER_ACCESS_TOKEN_SECRET is required');

  const id = crypto.randomBytes(4).toString('hex');
  const status = 'Hello, Rackspace::Solve San Francisco! #rackspacesolve ' + id;
  const twitter = new Twitter({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

  console.log('Posting tweet to Twitter: status=%s', status);

  twitter.postTweet({ status: status }, (err) => {
    console.error('Received error while posting tweet: err=%j', err);
    cb(err);
  }, (data) => {
    console.log('Successfully posted tweet: data=%j', data);
    cb(null, data);
  });
};

const strobe = (cb) => {
  assert(process.env.IFTTT_EVENT, 'IFTTT_EVENT is required');
  assert(process.env.IFTTT_KEY, 'IFTTT_KEY is required');

  const event = process.env.IFTTT_EVENT;
  const key = process.env.IFTTT_KEY;
  const url = 'https://maker.ifttt.com/trigger/' + event + '/with/key/' + key;

  console.log('Strobing lights via IFTT: webhook=%s', url);

  request.post(url, (err, res, body) => {
    if (err) {
      console.error('Received error while invoking IFTTT recipe: err=%s', err)
      cb(err);
    } else if (res.statusCode !== 200) {
      console.error('Received non-200 status while invoking IFTTT recipe: status=%d, body=%s', res.statusCode, body);
      cb(body);
    } else {
      console.log('IFTTT responded to webhook: status=%s, body=%s', res.statusCode, body);
      cb(null, body);
    }
  });
};

exports.handle = (e, ctx, cb) => {
  console.log('Processing Lambda event: event=%j', e);

  try {
    switch (e.clickType) {
      case 'SINGLE':
        return email(cb);
      case 'DOUBLE':
        return tweet(cb);
      case 'LONG':
        return strobe(cb);
    }
  } catch (err) {
    console.error('Failed to execute Lambda: err=%s', err);
    cb(err);
  }
}
