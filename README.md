# deferred-leveldown <img alt="LevelDB Logo" height="20" src="http://leveldb.org/img/logo.svg" />

> A mock `abstract-leveldown` implementation that queues operations while a real `abstract-leveldown` instance is being opened.

[![level badge][level-badge]](https://github.com/level/awesome)
[![Build Status](https://travis-ci.org/Level/deferred-leveldown.svg?branch=master)](https://travis-ci.org/Level/deferred-leveldown)
[![david](https://img.shields.io/david/level/deferred-leveldown.svg)](https://david-dm.org/level/deferred-leveldown)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/v/deferred-leveldown.svg)](https://www.npmjs.com/package/deferred-leveldown)
[![npm](https://img.shields.io/npm/dm/deferred-leveldown.svg)](https://www.npmjs.com/package/deferred-leveldown)

`deferred-leveldown` implements the basic [abstract-leveldown](https://github.com/Level/abstract-leveldown) API so it can be used as a drop-in replacement where `leveldown` is needed.

`put()`, `get()`, `del()` and `batch()` operations are all queued and kept in memory until the `abstract-leveldown`-compatible object has been opened through `deferred-leveldown`'s `open()` method.

`batch()` operations will all be replayed as the array form. Chained-batch operations are converted before being stored.

```js
const deferred  = require('deferred-leveldown')
const leveldown = require('leveldown')

const db = deferred(leveldown('location'))

db.put('foo', 'bar', function (err) {

})

db.open(function (err) {
  // ...
})
```

Contributing
------------

`deferred-leveldown` is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/Level/levelup/blob/master/CONTRIBUTING.md) file for more details.

### Contributors

`deferred-leveldown` is only possible due to the excellent work of the following contributors:

<table><tbody>
<tr><th align="left">Rod Vagg</th><td><a href="https://github.com/rvagg">GitHub/rvagg</a></td><td><a href="http://twitter.com/rvagg">Twitter/@rvagg</a></td></tr>
<tr><th align="left">John Chesley</th><td><a href="https://github.com/chesles/">GitHub/chesles</a></td><td><a href="http://twitter.com/chesles">Twitter/@chesles</a></td></tr>
<tr><th align="left">Jake Verbaten</th><td><a href="https://github.com/raynos">GitHub/raynos</a></td><td><a href="http://twitter.com/raynos2">Twitter/@raynos2</a></td></tr>
<tr><th align="left">Dominic Tarr</th><td><a href="https://github.com/dominictarr">GitHub/dominictarr</a></td><td><a href="http://twitter.com/dominictarr">Twitter/@dominictarr</a></td></tr>
<tr><th align="left">Max Ogden</th><td><a href="https://github.com/maxogden">GitHub/maxogden</a></td><td><a href="http://twitter.com/maxogden">Twitter/@maxogden</a></td></tr>
<tr><th align="left">Lars-Magnus Skog</th><td><a href="https://github.com/ralphtheninja">GitHub/ralphtheninja</a></td><td><a href="http://twitter.com/ralphtheninja">Twitter/@ralphtheninja</a></td></tr>
<tr><th align="left">David Björklund</th><td><a href="https://github.com/kesla">GitHub/kesla</a></td><td><a href="http://twitter.com/david_bjorklund">Twitter/@david_bjorklund</a></td></tr>
<tr><th align="left">Julian Gruber</th><td><a href="https://github.com/juliangruber">GitHub/juliangruber</a></td><td><a href="http://twitter.com/juliangruber">Twitter/@juliangruber</a></td></tr>
<tr><th align="left">Paolo Fragomeni</th><td><a href="https://github.com/hij1nx">GitHub/hij1nx</a></td><td><a href="http://twitter.com/hij1nx">Twitter/@hij1nx</a></td></tr>
<tr><th align="left">Anton Whalley</th><td><a href="https://github.com/No9">GitHub/No9</a></td><td><a href="https://twitter.com/antonwhalley">Twitter/@antonwhalley</a></td></tr>
<tr><th align="left">Matteo Collina</th><td><a href="https://github.com/mcollina">GitHub/mcollina</a></td><td><a href="https://twitter.com/matteocollina">Twitter/@matteocollina</a></td></tr>
<tr><th align="left">Pedro Teixeira</th><td><a href="https://github.com/pgte">GitHub/pgte</a></td><td><a href="https://twitter.com/pgte">Twitter/@pgte</a></td></tr>
<tr><th align="left">James Halliday</th><td><a href="https://github.com/substack">GitHub/substack</a></td><td><a href="https://twitter.com/substack">Twitter/@substack</a></td></tr>
</tbody></table>

<a name="license"></a>
License &amp; copyright
-------------------

Copyright (c) 2013-2017 `deferred-leveldown` contributors (listed above).

`deferred-leveldown` is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.

[level-badge]: https://img.shields.io/badge/-level-brightgreen.svg?colorA=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8%2BPHN2ZyB3aWR0aD0iMTg4cHgiIGhlaWdodD0iMjQycHgiIHZpZXdCb3g9IjAgMCAxODggMjQyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4gICAgPHRpdGxlPlVudGl0bGVkIDEzPC90aXRsZT4gICAgPGRlc2NyaXB0aW9uPkNyZWF0ZWQgd2l0aCBTa2V0Y2ggKGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCk8L2Rlc2NyaXB0aW9uPiAgICA8ZGVmcz48L2RlZnM%2BICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHNrZXRjaDp0eXBlPSJNU1BhZ2UiPiAgICAgICAgPHBhdGggZD0iTTk0LDU0IEwwLDEwMC40MTAwNDIgTDAsMTk0LjgwMzM0NyBMOTQsMjQyIEwxODgsMTk0LjgwMzM0NyBMMTg4LDEwMC40MTAwNDIgTDk0LDU0IFoiIGlkPSJSZWN0YW5nbGUtMSIgZmlsbD0iI0Q0RUI5NSIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICAgICAgPHBhdGggZD0iTTk0LDM5IEwwLDg1LjQxMDA0MTggTDAsMTc5LjgwMzM0NyBMOTQsMjI3IEwxODgsMTc5LjgwMzM0NyBMMTg4LDg1LjQxMDA0MTggTDk0LDM5IFoiIGlkPSJSZWN0YW5nbGUtMSIgZmlsbD0iIzk2REM3NSIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICAgICAgPHBhdGggZD0iTTk0LDEgTDAsNDcuNDEwMDQxOCBMMCwxNDEuODAzMzQ3IEw5NCwxODkgTDE4OCwxNDEuODAzMzQ3IEwxODgsNDcuNDEwMDQxOCBMOTQsMSBaIiBpZD0iUmVjdGFuZ2xlLTEiIG9wYWNpdHk9IjAuNTUyODQwOTA5IiBmaWxsPSIjMzE3MzQyIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj48L3BhdGg%2BICAgICAgICA8cGF0aCBkPSJNOTQsOTEuMTc3Nzc5MSBMMCw0NyBMMCwxNDEuNjY2NjY3IEw5NCwxODkgTDE4OCwxNDEuNjY2NjY3IEwxODgsNDcgTDk0LDkxLjE3Nzc3OTEgWiIgaWQ9IlJlY3RhbmdsZS0xIiBvcGFjaXR5PSIwLjU1Mjg0MDkwOSIgZmlsbD0iIzM0OTU0QyIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICA8L2c%2BPC9zdmc%2B
