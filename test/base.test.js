/*
 * @Author: your name
 * @Date: 2020-08-26 15:42:08
 * @LastEditTime: 2020-08-26 16:30:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \skiptimeline\tests\base.test.js
 */
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
  // console.log(skiplist)
  // console.log(skiplist.next)
  // console.log(skiplist.next.next)

  const { next, finish } = skiplist.iterableRange([3, 6])
  // let exceptedValue = 3
  // while (!finish()) {
  //   const node = next()
  //   console.log('node: ', node.value)
  //   expect(node.value).toBe(exceptedValue++)
  // }
  console.log(next().value)
  console.log(next().value)
  expect(next().value).toBe(5)
  expect(next()).toBeUndefined()
})
