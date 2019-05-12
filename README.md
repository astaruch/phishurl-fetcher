# Utility for updating phishing URLs database from Phishtank

This program has 2 functions:
1. Initialize database with prepared data from Phishtank
2. Run as deamon and regularly query online Phishtank database and update our

## Setup the project

1. Run `docker-compose up -d` to start a database.
1. Run `npm install` command to install all dependencies.
1. Prepare database `npm run migrate`


#### Initialising the database
If this is first run of a program, we can initialize database as following:

> `pino-pretty` is for formatting logging messages

    $ node src/index.js -i -p CSV_DIRECTORY | pino-pretty


#### Running as a deamon

> TODO: fetch request


