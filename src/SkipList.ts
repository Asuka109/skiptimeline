export const nodeInterval = 2

export type NodeRef = SkipListNode | undefined

export interface RangeIterator {
  next: () => NodeRef
  finish: () => boolean
}

export class SkipListNode {
  up: NodeRef
  down: NodeRef
  prev: NodeRef
  next: NodeRef
  value: number

  constructor (value: number) {
    this.value = value
  }

  findBelow (value: number): SkipListNode {
    let currentNode: SkipListNode = this
    while (currentNode.next && currentNode.next.value < value) {
      currentNode = currentNode.next
    }
    return currentNode.down?.findBelow(value) ?? currentNode
  }

  iterableRange (range: [number, number]): RangeIterator {
    const [min, max] = range
    if (min > max) throw new Error('illegal range.')
    let currentNode = this.findBelow(min).next
    const next = (): NodeRef => {
      if (currentNode && currentNode.value < max) {
        const curr = currentNode
        currentNode = currentNode.next
        return curr
      }
    }
    const finish = (): boolean => !!currentNode
    return { next, finish }
  }

  enhance (): SkipListNode {
    let currentNode: SkipListNode = this
    while (!currentNode.up) {
      if (!currentNode.prev) {
        throw new Error('Can\'t find a previous node which has up node.')
      } else {
        currentNode = currentNode.prev
      }
    }
    const higherPrevNode = currentNode.up
    const higherNextNode = higherPrevNode.next
    const higherNode = Object.assign({}, this)

    this.up = higherNode
    higherNode.up = undefined
    higherNode.down = this
    higherNode.prev = higherPrevNode
    higherNode.next = higherNextNode
    higherPrevNode.next = higherNode
    higherNextNode && (higherNextNode.prev = higherNode)

    return higherNode
  }

  remove (): void {
    let currentNode: NodeRef = this
    while (currentNode) {
      currentNode.prev && (currentNode.prev.next = currentNode.next)
      currentNode.next && (currentNode.next.prev = currentNode.prev)
      currentNode = currentNode.up
    }
  }
}
