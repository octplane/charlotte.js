charlotte.js
============

A simple bookmark manager.

It aims to be a node.js clone for Shaarli with a few twists. Named after shaarli, but with the "share-a-lot" moto in mind.

Envisionned features:

- [nosql](https://github.com/petersirka/nosql) based for low disk footprint
- no-configuration by default (except master password)
- Add link, description, tags, privacy flag
- RSS Feed
- Paginated view for links
- token-based api with simple logging and revocation capability


### Admin Page

- Shown on / at first startup, until a password is set. This will be the administrator password.
- Shows some stats
- Show location of main db file and main configuration file/folder
- Ability to delete the db file
- Ability to insert mock data in the db (for demonstration purpose)
- List API token, last usage, revokattion, creation



