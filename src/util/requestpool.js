class Queue {
  constructor() {
    this.list = [];
  }

  enqueue(task) {
    this.list.push(task);
  }

  dequeue() {
    return this.list.shift();
  }

  length() {
    return this.list.length;
  }

  clear() {
    this.list = [];
  }
}

const requestPool = () => {
  const queue = new Queue();
  const DEFAULT_TIMEOUT = 500;
  let finished = true;
  let timer = null;

  const start = () => {
    if (!queue.length()) {
      finished = true;
      return;
    }

    const { fn, resolve, reject } = queue.dequeue();

    fn()
      .then((response) => {
        resolve(response);
        timer = setTimeout(start, DEFAULT_TIMEOUT);
      })
      .catch((error) => {
        reject(error);
        timer = setTimeout(start, DEFAULT_TIMEOUT);
      });
  };

  return {
    add(fn) {
      return new Promise((resolve, reject) => {
        queue.enqueue({ fn, resolve, reject });

        if (finished) {
          finished = false;
          start();
        }
      });
    },
    clear() {
      clearTimeout(timer);
      finished = true;
      queue.clear();
    }
  };
};

module.exports = requestPool();
