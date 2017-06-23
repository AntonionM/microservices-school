module.exports = {
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  routes: {
    proxy: {
      routes: {
        '/api/1.0/other': 'http://other.example.com'
      }
    }
  },
  mongo: {
    url: 'mongodb://127.0.0.1/recipes'
  },
  store: 'mongo',
  logger: {
    transport: 'bunyan',
    include: [
      'tracer',
      'timestamp',
      'level',
      'message',
      'error.message',
      'error.code',
      'error.stack',
      'request.url',
      'request.headers',
      'request.params',
      'request.method',
      'response.statusCode',
      'response.headers',
      'response.time',
      'process',
      'system',
      'package.name',
      'service'
    ],
    exclude: [
      'password',
      'secret',
      'token',
      'request.headers.cookie',
      'dependencies',
      'devDependencies'
    ]
  },
  rabbitmq: {
    defaults: {},
    vhosts: {
      '/': {
        connection: {
          hostname: '127.0.0.1',
          user: 'rabbitmq',
          password: 'rabbitmq'
        },
        exchanges: [
          'internal',
          'delay',
          'retry',
          'dead_letters'
        ],
        queues: {
          'dead_letters:snoop': {},
          'retry:snoop': {},
          'delay:1ms': {
            options: {
              arguments: {
                'x-message-ttl': 1,
                'x-dead-letter-exchange': 'retry'
              }
            }
          },
          'recipes_api:snoop': {}
        },
        bindings: {
          'delay[delay.#] -> delay:1ms': {},
          'retry -> retry:snoop': {},
          'dead_letters -> dead_letters:snoop': {},
          'internal[recipes_api.v1.notifications.#.#] -> recipes_api:snoop': {}
        },
        subscriptions: {
          dead_letters: {
            queue: 'dead_letters:snoop'
          },
          retries: {
            queue: 'retry:snoop'
          },
          recipes_api: {
            queue: 'recipes_api:snoop',
            contentType: 'application/json'
          }
        },
        publications: {
          conclusions: {
            exchange: 'internal'
          }
        }
      }
    }
  }
};
