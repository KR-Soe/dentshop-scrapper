const container = {
  _dependencies: {},
  _factories: {},
  get(dependencyName) {
    if (this._dependencies[dependencyName]) {
      return this._dependencies[dependencyName];
    }

    const factory = this._factories[dependencyName];

    if (!factory) {
      const errorMessage = `there is no depedency or factory called ${dependencyName}`;
      throw new TypeError(errorMessage);
    }

    const dependency = factory();
    this._dependencies[dependencyName] = dependency;

    return this._dependencies[dependencyName];
  },
  add(name, dependency) {
    this._dependencies[name] = dependency;
  },
  register(name, dependency) {
    this._factories[name] = dependency;
  }
};

module.exports = container;
