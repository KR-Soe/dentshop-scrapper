const wrapper = (() => {
  const objects = {};

  return {
    add(key, value) {
      objects[key] = value;
    },
    get(key) {
      return objects[key];
    }
  }
})();


module.exports = wrapper;
