const { SkipListNode, SkipList, nodeInterval } = require('../src/SkipList')

test('SkipListNode', () => {
  const skiplist = new SkipListNode(0)
  const higher = new SkipListNode(0)
  skiplist.up = higher
  higher.down = skiplist
  let currentNode = skiplist

  Array
    .from(Array(10))
    .map((_, i) => i + 1)
    .forEach(i => {
      const node = new SkipListNode(i)
      currentNode.next = node
      node.prev = currentNode
      currentNode = node
      if (i % 2 === 0) currentNode.enhance()
    })

  const { next, finish } = skiplist.iterableRange([3, 6])
  let exceptedValue = 3
  while (!finish()) {
    const node = next()
    expect(node.value).toBe(exceptedValue++)
  }
  expect(next()).toBeUndefined()
  expect(finish()).toBe(true)
})

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
  expect(skiplist.value).toBe(-Infinity)
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
  expect(skiplist.up).toBeDefined()

  console.log('skiplist: ', skiplist.toArray().map(node => node.value))
  console.log('skiplist.up: ', skiplist.up.toArray().map(node => node.value))
  let currentNode = skiplist.up.up.up
  const nodes = []
  while (currentNode) {
    nodes.push(currentNode)
    currentNode = currentNode.next
  }
  console.log('nodes: ', nodes.map(node => node.value))
})
