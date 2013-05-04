module.exports = {read: read, create: create}

var binary = require('bops')

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
    , keybuf
    , blen
    , buf

  for(var key in this._attrs) {
    keybuf = binary.from(key+' ', 'utf8')

    for(var i = 0, len = this._attrs[key].length; i < len; ++i) {
      buffers.push(keybuf)
      buf = binary.from(this._attrs[key][i]+'\n', 'utf8')
      buffers.push(buf) 
    }
  }

  buf = binary.from('\n'+this._message, 'utf8')
  buffers.push(buf)

  return binary.join(buffers)
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
    _char = buf[idx++]
    if(current.length === 1 && _char === 10) {
      --raw_header.length
      break
    } else if(current.length === 1 && _char === 32) {
      current[current.length] = idx - 1
    } else if(_char === 10) {
      current[current.length] = idx - 1

      attr = binary.to(binary.subarray(buf, current[0], current[1]), 'utf8')
      val = binary.to(binary.subarray(buf, current[1] + 1, current[2]), 'utf8')

      attrs[attr] = attrs[attr] || []
      attrs[attr].push(val)

      current = raw_header[raw_header.length] = [idx]
    }
    _last = _char
  } while(idx < len)

  message = binary.to(binary.subarray(buf, idx), 'utf8')

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
