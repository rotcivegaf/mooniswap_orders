const redis = require('redis');
const { promisify } = require('util');
const utils = require('./utils.js');

module.exports = class RedisClient {
  async init () {
    this.client = await this.getClient();

    this.existsAsync = promisify(this.client.exists).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.getKeysAsync = promisify(this.client.keys).bind(this.client); // TODO: USE SCAN
    this.mgetAsync = promisify(this.client.mget).bind(this.client);
    this.hgetAsync = promisify(this.client.hget).bind(this.client);
    this.lrangeAsync = promisify(this.client.lrange).bind(this.client);

    this.rpushAsync = promisify(this.client.rpush).bind(this.client);
    this.lremAsync = promisify(this.client.lrem).bind(this.client);

    this.clearAllData = promisify(this.client.flushdb).bind(this.client);

    return this;
  }

  async setAsync (key, data) {
    const setAsync = promisify(this.client.set).bind(this.client);
    if (typeof data !== 'string') { data = data.toString(); }

    return setAsync(key, data);
  }

  async hsetAsync (key, field, data) {
    const hsetAsync = promisify(this.client.hset).bind(this.client);
    if (typeof data !== 'string') { data = data.toString(); }

    return hsetAsync(key, field, data);
  }

  async arrayUniquePush (key, element) {
    if ((await this.existsAsync(key)) !== 0) { await this.lremAsync(key, 0, element); }

    await this.rpushAsync(key, element);
  }

  async getClient () {
    const client = redis.createClient(process.configDefault.redisUrl);

    const _this = this;
    client.on('connect', function () {
      console.log('Connected to Redis');
      _this.ready = true;
    });

    // Wait for redis connect
    while (!this.ready) {
      await utils.sleep(500);
      console.log('Wait: ' + 500 + ' ms for redis');
    }

    return client;
  }

  async getValues (key) {
    if (typeof key !== 'string') { key = key.join(':'); }

    const keys = await process.redis.getKeysAsync(key);

    if (keys.length === 0) { return []; }

    try {
      const m = await process.redis.mgetAsync(keys);

      return m.map((obj, i) => {
        obj = JSON.parse(obj);
        obj.id = keys[i].slice(4);
        return obj;
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getValue (key) {
    if (typeof key !== 'string') { key = key.join(':'); }

    try {
      return process.redis.getAsync(key);
    } catch (error) {
      console.log(error);
      return error;
    }
  }
};
