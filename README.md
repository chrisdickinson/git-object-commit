# git-object-commit

git commit objects as javascript objects.

commit objects are immutable once created.

```javascript
var Buffer = require('buffer').Buffer
  , commit = require('git-object-commit')

var b = commit.create(new Buffer(...))

b = commit.read(<some git buffer>)

```

## API

#### commit.read(<git buffer>) -> Commit

read a commit from some git buffer data.

#### commit.create(author, tree, message, parent[, committer][, attrs]) -> Commit

create a commit from some source data.

all fields (save for message) may be arrays.

#### Commit methods

* author() -> string | undefined
* authors() -> [string, ...] | []
* committer() -> string | undefined
* committers() -> [string, ...] | []
* parent() -> string | undefined
* parents() -> [string, ...] | []
* tree() -> string | undefined
* trees() -> [string, ...] | []
* message() -> string
* attr(attribute) -> [string, ...] | []

## License

MIT
