/**
 * https://core.trac.wordpress.org/browser/tags/3.9.1/src/wp-includes/class-phpass.php
 */
var crypto = require('crypto');

var itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

module.exports = PasswordHash;

function PasswordHash(iteration_count_log2) {

  if (iteration_count_log2 < 4 || iteration_count_log2 > 31) {
    iteration_count_log2 = 8;
  }
  this.iteration_count_log2 = iteration_count_log2;
}

/**
 * Encode the buffer as itoa64
 * @param input
 * @param count
 * @returns {string}
 */
function encode64(input, count) {
  var output = '';
  var i = 0;
  do {
    var value = input[i++];
    output += itoa64.charAt(value & 0x3f);
    if (i < count) {
      value |= input[i] << 8;
    }
    output += itoa64.charAt((value >> 6) & 0x3f);
    if (i++ >= count) {
      break;
    }
    if (i < count) {
      value |= input[i] << 16;
    }
    output += itoa64.charAt((value >> 12) & 0x3f);
    if (i++ >= count) {
      break;
    }
    output += itoa64.charAt((value >> 18) & 0x3f);
  } while (i < count);

  return output;
}

PasswordHash.prototype._gensalt = function (input) {
  var output = '$P$';
  output += itoa64.charAt(Math.min(this.iteration_count_log2 +
    5, 30));
  output += encode64(input, 6);

  return output;
};

function md5(data) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(data);
  return md5sum.digest();
}

function crypt(password, setting) {
  var output = '*0';
  if (setting.substring(0, 2) === output) {
    output = '*1';
  }

  var id = setting.substring(0, 3);
  // We use "P", phpBB3 uses "H" for the same thing
  if (id !== '$P$' && id !== '$H$') {
    return output;
  }

  var count_log2 = itoa64.indexOf(setting.charAt(3));
  if (count_log2 < 7 || count_log2 > 30) {
    return output;
  }

  var count = 1 << count_log2;

  var salt = setting.substring(4, 12);
  if (salt.length !== 8) {
    return output;
  }

  var buf = new Buffer(salt + password);
  var hash = md5(buf);
  do {
    buf = Buffer.concat([hash, new Buffer(password)]);
    hash = md5(buf);
  } while (--count);

  output = setting.substring(0, 12);
  output += encode64(hash, 16);

  return output;
}

PasswordHash.prototype.hashPassword = function (password) {
  var random = '';

  if (random.length < 6) {
    random = crypto.randomBytes(6);
  }
  var hash = crypt(password, this._gensalt(random));
  if (hash.length === 34) {
    return hash;
  }

  // Returning '*' on error is safe here, but would _not_ be safe
  // in a crypt(3)-like function used _both_ for generating new
  // hashes and for validating passwords against existing hashes.
  return '*';
};

PasswordHash.prototype.checkPassword = function (password, stored_hash) {
  var hash = crypt(password, stored_hash);

  return hash === stored_hash;
};

/*
 var p = new PasswordHash(8, true);
 console.log(p.checkPassword('abcd', '$P$B12345678teLEc8YuMR264MwvdiMxe.'));
 */


