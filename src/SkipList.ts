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

  seek (distance: number): NodeRef {
    if (distance === 0) return this
    let index: number = 0
    let currentNode: NodeRef = this
    while (currentNode && index !== distance) {
      const sign = distance > 0
      currentNode = sign ? currentNode.next : currentNode.prev
      index += sign ? 1 : -1
    }
    return currentNode
  }

  findBelow (value: number): SkipListNode {
    let currentNode: SkipListNode = this
    while (currentNode.next && currentNode.next.value < value) {
      currentNode = currentNode.next
    }
    return currentNode.down?.findBelow(value) ?? currentNode
  }

  iterableRange (range: [number, number] = [-Infinity, Infinity]): RangeIterator {
    const [min, max] = range
    if (min > max) throw new Error('illegal range.')
    let currentNode = this.findBelow(min).next
    const finish = (): boolean => !(currentNode && currentNode.value < max)
    const next = (): NodeRef => {
      if (!finish()) {
        const curr = currentNode
        currentNode = (<SkipListNode>currentNode).next
        return curr
      }
    }
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
    const higherNode = new SkipListNode(this.value)

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

  toArray (): Array<SkipListNode> {
    const { next, finish } = this.iterableRange()
    const result: Array<SkipListNode> = []
    while (!finish()) {
      result.push(next() as SkipListNode)
    }
    return result
  }
}

export class SkipList extends SkipListNode {
  constructor (source?: Array<number>) {
    super(-Infinity)

    if (!source) return
    let currentNode: SkipListNode = this
    source.forEach((v, i) => {
      const node = new SkipListNode(v)
      currentNode.next = node
      node.prev = currentNode
      currentNode = node
    })

    let top: NodeRef = this
    while (top?.seek(nodeInterval)) {
      top.enhance()
      let tempNode: NodeRef = top.seek(nodeInterval)
      while (tempNode) {
        tempNode.enhance()
        tempNode = tempNode.seek(nodeInterval)
      }
      top = top.up
    }
  }

  enhance (): SkipListNode {
    if (!this.prev && !this.next) {
      throw new Error('Can\'t enhance a node with prev or next node.')
    }
    const higher = new SkipList()
    this.up = higher
    higher.down = this
    return higher
  }

  remove (): void {
    let currentNode: NodeRef = this
    while (currentNode) {
      if (!currentNode.next && currentNode.down) {
        currentNode.down.up = undefined
      }
      currentNode = currentNode.up
    }
  }
}
