const { SkipTimeline } = require('../src/SkipTimeline')

test('skiptimeline trigger', () => {
  const timeList = [0, 10, 235.9, 768.8, 1000]
  const callback = jest.fn()
  const once = true
  const points = timeList.map(time => ({
    time,
    callback,
    once
  }))
  const tl = new SkipTimeline(points)
  tl.trigger(10, 768.8)
  expect(callback.mock.calls.length).toBe(2)
  tl.trigger(10, 768.8)
  expect(callback.mock.calls.length).toBe(2)
  tl.trigger(10, 768.9)
  expect(callback.mock.calls.length).toBe(3)
})

test('skiptimeline extend', () => {
  const timeList = [0, 10, 235.9, 768.8, 1000]
  const _timeList = [11, 768.8, 2000]
  const callback = jest.fn()
  const once = true
  const points = timeList.map(time => ({ time, callback: () => callback(time), once }))
  const _points = _timeList.map(time => ({ time, callback: () => callback(time), once }))
  const tl = new SkipTimeline(points)
  tl.trigger(10, 768.8)
  expect(callback.mock.calls.length).toBe(2)
  tl.extend(_points)
  tl.trigger(0, 2000)
  expect(callback.mock.calls.length).toBe(7)
})
