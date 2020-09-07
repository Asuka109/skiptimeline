# Introduction

A library that provides the implementation of SkipList and SkipTimeline, which you can use to manage discrete time points in continuous time.

# Getting Started

Install from npm:

```shell
yarn add skiptimeline
```

# Usage

```js
const { SkipTimeline } = require('skiptimeline')

const timeList = [0, 10, 235.9, 768.8, 1000]
const callback = () => console.log('callback')
const once = true
const points = timeList.map(time => ({
  time,
  callback,
  once
}))

const tl = new SkipTimeline(points)
tl.trigger(10, 768.8)
```

# License

Distributed under the MIT License. 