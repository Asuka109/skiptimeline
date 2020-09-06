const { SkipList, nodeInterval } = require('../src/SkipList')

test('SkipList', () => {
  const values = Array.from(Array(10)).map((_, i) => i)
  const skiplist = new SkipList(values)
  const { next, finish } = skiplist.iterableRange([3, 6])
  let exceptedValue = 3
  while (!finish()) {
    const node = next()
    expect(node.value).toBe(exceptedValue++)
  }
  expect(next()).toBeUndefined()
  expect(finish()).toBe(true)
})

test('SkipListNode.seek', () => {
  const values = Array.from(Array(10)).map((_, i) => i)
  const skiplist = new SkipList(values)
  expect(skiplist.root.value).toBe(-Infinity)
  expect(skiplist.seek(3).value).toBe(2)
  expect(skiplist.seek(3).seek(-2).value).toBe(0)
})

test('SkipList enhance', () => {
  const values = Array.from(Array(10)).map((_, i) => i)
  const skiplist = new SkipList(values)
  const { next, finish } = skiplist.iterableRange()
  while (!finish()) {
    const node = next()
    if (node.value % nodeInterval) {
      expect(node.up.value).toBe(node.value)
      expect(node.up.down).toBe(node)
    } else {
      expect(node.up).toBeUndefined()
    }
  }
  expect(skiplist.seek(4).value).toBe(3)
  expect(skiplist.seek(11)).toBeUndefined()
  expect(skiplist.bottom.up).toBeDefined()

  let currentNode = skiplist.root
  const nodes = []
  while (currentNode) {
    nodes.push(currentNode)
    currentNode = currentNode.next
  }
  expect(nodes).toHaveLength(2)
})

test('SkipList push & delete', () => {
  const values = Array.from(Array(10)).map((_, i) => i)
  const skiplist = new SkipList(values)
  Array.from(Array(8)).forEach((_, i) => skiplist.delete(i + 1))
  skiplist.push(20)
  const expectedResult = [0, 9, 20]
  const result = skiplist.toArray().map(node => node.value)
  expect(result).toEqual(expectedResult)
})
