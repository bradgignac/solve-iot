const assert = require('assert');
const request = require('request');

console.log('Executing Lambda function');

const email = (cb) => {
  console.log('Sending email');
  cb(null);
};

const tweet = (cb) => {
  console.log('Tweeting tweet');
  cb(null);
};

const strobe = (cb) => {
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
    assert(process.env.IFTTT_EVENT, 'IFTTT_EVENT is required');
    assert(process.env.IFTTT_KEY, 'IFTTT_KEY is required');

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
