console.log('Executing Lambda function.');

const email = (cb) => {
  console.log('Sending email.');
  cb(null);
};

const tweet = (cb) => {
  console.log('Tweeting tweet.');
  cb(null);
};

const strobe = (cb) => {
  console.log('Strobing lights.');
  cb(null);
};

exports.handle = (e, ctx, cb) => {
  console.log('Processing Lambda event: %j', e);

  switch (e.clickType) {
    case 'SINGLE':
      return email(cb);
    case 'DOUBLE':
      return tweet(cb);
    case 'LONG':
      return strobe(cb);
  }
}
