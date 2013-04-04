module.exports = {read: read, create: create}

function Commit(message, attrs, _raw, _raw_header) {
  this._attrs = attrs
  this._raw = _raw
  this._message = message
  this._header = _raw_header 
}

var cons = Commit
  , proto = cons.prototype

proto.type = 1 
proto.looseType = 'commit'

proto.author = function() {
  return (this._attrs.author || [])[0]
}

proto.authors = function() {
  return this._attrs.author || []
}

proto.committer = function() {
  return (this._attrs.committer || [])[0]
}

proto.committers = function() {
  return this._attrs.committer || []
}

proto.parent = function() {
  return (this._attrs.parent || [])[0]
}

proto.parents = function() {
  return this._attrs.parent || []
}

proto.tree = function() {
  return (this._attrs.tree || [])[0]
}

proto.trees = function() {
  return this._attrs.tree || []
}

proto.message = function() {
  return this._message
}

proto.attr = function(attr) {
  return (this._attrs[attr] || []).slice()
}

proto.serialize = function() {
  if(this._raw) {
    return this._raw
  }

  var buffers = []
    , size = 0
    , keybuf
    , blen
    , buf

  for(var key in this._attrs) {
    keybuf = new Buffer(key+' ', 'utf8')

    for(var i = 0, len = this._attrs[key].length; i < len; ++i) {
      buffers.push(keybuf)
      size += keybuf.length
      buf = new Buffer(this._attrs[key][i]+'\n', 'utf8')
      size += buf.length
      buffers.push(buf) 
    }
  }

  buf = new Buffer('\n'+this._message, 'utf8')
  buffers.push(buf)
  size += buf.length

  return Buffer.concat(buffers, size)
}

function read(buf) {
  var idx = 0
    , len = buf.length
    , _char
    , _last

  var raw_header = [[0]]
    , current = raw_header[0]
    , current_len = 1
    , attrs = {}
    , message
    , attr
    , val

  do {
    _char = buf.readUInt8(idx++)
    if(current.length === 1 && _char === 10) {
      --raw_header.length
      break
    } else if(current.length === 1 && _char === 32) {
      current[current.length] = idx - 1
    } else if(_char === 10) {
      current[current.length] = idx - 1

      attr = buf.slice(current[0], current[1]).toString('utf8')
      val = buf.slice(current[1] + 1, current[2]).toString('utf8')

      attrs[attr] = attrs[attr] || []
      attrs[attr].push(val)

      current = raw_header[raw_header.length] = [idx]
    }
    _last = _char
  } while(idx < len)

  message = buf.slice(idx).toString('utf8')

  return new Commit(message, attrs, buf, raw_header) 
}

function create(author, tree, message, parent, committer, attrs) {
  attrs = attrs || {}
  committer = committer || author
  parents = parents || []
  message = message || ''

  attrs.author = Array.isArray(author) ? author : [author]
  attrs.tree = Array.isArray(tree) ? tree : [tree]
  attrs.parent = Array.isArray(parent) ? parent : [parent]
  attrs.committer = Array.isArray(committer) ? committer : [committer]

  return new Commit(message, attrs)
}
