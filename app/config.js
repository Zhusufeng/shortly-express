var path = require('path');
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../db/shortly.sqlite')
  },
  useNullAsDefault: true
});
var db = require('bookshelf')(knex);

db.knex.schema.hasTable('urls').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('urls', function (link) {
      link.increments('id').primary();
      link.integer('userId').references('users.id');
      link.string('url', 255);
      link.string('baseUrl', 255);
      link.string('code', 100);
      link.string('title', 255);
      link.integer('visits');
      link.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

db.knex.schema.hasTable('clicks').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('clicks', function (click) {
      click.increments('id').primary();
      click.integer('linkId');
      click.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

/************************************************************/
// Add additional schema definitions below
/************************************************************/
db.knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('users', function (link) {
      link.increments('id').primary();
      link.string('username', 30);
      link.string('password', 100);  // hashedpassword
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

// JOIN TABLE
db.knex.schema.hasTable('users_urls').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('users_urls', function (link) {
      link.increments('id').primary();
      link.integer('user_id').references('users.id');
      link.integer('urls_id').references('urls.id');
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});
// table: users_links
// userid, link id
// 1       amazon
// 1        google
// 1        walmart
// 1        cnn
// 2        ebay
// 2        paypal

module.exports = db;
