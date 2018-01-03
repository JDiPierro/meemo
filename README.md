# Meemo-Minimal

This image is (probably) not compatible with Cloudron and is best suited for running Meemo on your own server.

Cloudron's base image weighs in at about 2GB. Starting from Alpine linux this end up at 380mb.

The [docker-compose.yml](./docker-compose.yml) starts up meemo pointed at a mongodb instance and uses a local file for user management. After starting the environment you'll need to add users.

There's a [Makefile](./Makefile) with targets for managing the docker-compose environment and users.

---

# Meemo

Meemo is a personal data manager. It lets you simply input any kind of information like notes, thoughts, ideas as well as acts as a bookmarkmanager and todo list.
The user interface resembles a news feed organized with tags. Full text search further allows you to quickly find information in your pile of accumulated data.

For better bookmarking, there are chrome and firefox webextensions available.

Support meemo development: [![Flattr Meemo](https://button.flattr.com/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=cloudron&url=https://cloudron.io&title=Cloudron&tags=opensource&category=software)

[![Build Status](https://travis-ci.org/nebulade/meemo.svg?branch=master)](https://travis-ci.org/nebulade/meemo)

## Installation

[![Install](https://cloudron.io/img/button32.png)](https://cloudron.io/button.html?app=de.nebulon.guacamoly)

or using the [Cloudron command line tooling](https://cloudron.io/references/cli.html)

```
cloudron install --appstore-id de.nebulon.guacamoly
```

To you run Meemo outside a Cloudron environment, those dependencies are required:
```
nodejs  >= 4.1.1
mongodb >= 2.6
```
and the installation consist of:
```
cd meemo
npm i
./node_modules/.bin/gulp
./app.js
```

Possible env variables for configuration are:
```
PORT=3000
BIND_ADDRESS=0.0.0.0
APP_ORIGIN="https://example.com"
MONGODB_URL="mongodb://username:password@127.0.0.1:27017/meemo" # username and password are optional
ATTACHMENT_DIR="./storage"

# using LDAP user management
LDAP_URL="ldap://my.ldap.server"
LDAP_USERS_BASE_DN="ou=users,dc=example"
LDAP_BIND_DN="cn=admin,ou=users,dc=example"
LDAP_BIND_PASSWORD=""

# using local file user management via admin cli tool
LOCAL_AUTH_FILE=".users.json"	# also pass this for the admin tool to find the correct file

# to enable email receiving
MAIL_IMAP_SERVER="my.mail.server"
MAIL_IMAP_PORT=993
MAIL_IMAP_USERNAME=""
MAIL_IMAP_PASSWORD=""
MAIL_DOMAIN="example.com"
```

## Building

The app package can be built using the [Cloudron command line tooling](https://cloudron.io/references/cli.html).

```
cd meemo

cloudron build
cloudron install
```

## Development

The app can also be run locally for development. It depends on a locally running mongodb and optionally on an instance of the [ldap test server](https://github.com/nebulade/ldapjstestserver).

```
cd meemo

npm install

# with LDAP
LDAP_BIND_DN="cn=admin,ou=users,dc=example" LDAP_BIND_PASSWORD="password" LDAP_USERS_BASE_DN="ou=users,dc=example" LDAP_URL="ldap://localhost:3002" ./app.js

# without LDAP
./admin user-add --username test --password test --display-name "Test User"
./app.js
```
