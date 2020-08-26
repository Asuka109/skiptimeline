const { SkipListNode } = require('../src/SkipList')

test('adds 1 + 2 to equal 3', () => {
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
