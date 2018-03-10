function getFilenameFromPath(src) {
  let split = src.split('/');
  let splitLenght = split.length;
  return split[splitLenght-1];
}
module.exports = {
  getFilenameFromPath
}
