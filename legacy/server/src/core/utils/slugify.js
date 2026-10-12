const slugify = require('slugify');

module.exports = function makeSlug(str) {
  return slugify(str, {
    lower: true,
    strict: true,
    trim: true,
  });
};
