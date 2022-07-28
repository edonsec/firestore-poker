# Firestore Poker

```
         ^^
        .~~^.
        :~~~^.
        ^~^~~~.    ::
       .~~~~~~~: .^~~^.        .
       :~~~~~~~~^~~~~~^.    ..::.
       ^~~~~~~~!77!~~~~~. ..::::.
      .~~~~~~~!7777!~~~~^::::::::
      :~~~~~~!777777!~^::::::::::.
      ^~~~~~!777777!~::::::::::::.
     .~~~~~!77777!^:::::::::::::::
     :~~~~!7777!^:::::::::::::::::.
     ^~~~!777!^:::::::::::::::::::.
    .~~~777!^::::::::::::::::::::::
    :~~77!^::::::::::::::::::::::::.
    ^!7!^::::::::::::::::::::::::::.
   .!!^:::::::::::::::::::::::::::::.
   .^:::::::::::::::::::::::::::::::.
      .::::::::::::::::::::::::::.
         ..::::::::::::::::::..
            ...::::::::::...
                ...::...

          [ FireStore Poker ]
```

This tool can be used to probe an existing Firebase Firestore. Allowing testing for common security vulnerabilities, such as weak permissions.

## Installation:

The easiest way to install is to use "n" to install the latest NodeJS:

```
npm install -g n
n latest
yarn install
```

## Usage:

To start with, copy the "config.yaml.dist" and replace the required values with the current project's respective values. To use Firebase, these should be located using static analysis of the application. Collections can be identified using dynamic requests, or otherwise searching the source for "collection". Language specific examples are shown below:

### Javascript:
```
collection(..., <Collection>...)
doc(..., <Collection>...)
```

### Java/Kotlin:
```
collection(<Collection)
```

### Swift/Objective-C:
```
collection(<Collection>)
collectionWithPath:@"<Collection>"
```

### Run:
`yarn start`

### Usage:
```
Usage: index [options]

Interact with Firebase's Firestore

Options:
  -c, --config <config>  Firebase Configuration (default: "config.yaml")
  -h, --help             display help for command
```

### Interactive Commands:
```
Usage:

    <cmd>

Available commands:

    help <cmd>
    collection [options]           Collection commands
    crud [options]                 Commands for Create, Read, Update and Delete on single records
    user [options]                 User commands
    exit [options]
```

#### Collection commands

```
Usage:

    collection [options]

Sub-Commands:

    query [options] <table> [query] [limit] Execute a select query
    dump [options]                          Dump all or single collection(s)
    list [options]                          List defined collections (config)
    discovery [options]                     Discover collections using brute force
    commit [options]                        Commit discovered collections to config.
```

#### Crud commands

```
Usage:

    crud [options]

Sub-Commands:

    create [options] <collection> <json_data>             Create a record
    read [options] <collection> <reference>               Read a record
    update [options] <collection> <reference> <json_data> Create a record
    delete [options] <collection> <reference>             Delete a record
    check [options] <collection> [reference]              Attempt all permissions
```

#### User commmands

```
Usage:

    user [options]

Sub-Commands:

    login [options] <username> <password>
    register [options] <username> <password>
    logout [options]
    dump [options]
```
