const { SkipTimeline } = require('../src/SkipTimeline')

test('skiptimeline trigger', () => {
  const fn = jest.fn()
  const timeList = [0, 10, 235.9, 768.8, 1000]
  const points = timeList.map(time => ({
    time,
    callback: () => fn(time),
    once: true
  }))
  const tl = new SkipTimeline(points)
  tl.trigger(10, 768.8)
  expect(fn.mock.calls.length).toBe(2)
  tl.trigger(10, 768.8)
  expect(fn.mock.calls.length).toBe(2)
  tl.trigger(10, 768.9)
  expect(fn.mock.calls.length).toBe(3)
})
