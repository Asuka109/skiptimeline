export const nodeInterval = 2

export type NodeRef = SkipListNode | undefined

export interface RangeIterator {
  next: () => NodeRef
  finish: () => boolean
  current: () => NodeRef
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

  enhance (): SkipListNode {
    if (this.up) {
      throw new Error('Can\'t enhance a node with up node.')
    }
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
}

export class SkipListHead extends SkipListNode {
  constructor () {
    super(-Infinity)
  }

  enhance (): SkipListNode {
    if (this.up) {
      throw new Error('Can\'t enhance a node with up node.')
    }
    if (!this.prev && !this.next) {
      throw new Error('Can\'t enhance a node without prev or next node.')
    }
    const higher = new SkipListHead()
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

export class SkipList {
  root: SkipListHead
  bottom: SkipListHead
  constructor (source?: Array<number>) {
    this.root = new SkipListHead()
    this.bottom = this.root
    if (!source) return
    let currentNode: SkipListNode = this.root
    source.forEach((v, i) => {
      const node = new SkipListNode(v)
      currentNode.next = node
      node.prev = currentNode
      currentNode = node
    })

    let top: SkipListHead = this.root
    while (top.seek(nodeInterval)) {
      top = top.enhance()
      let tempNode: NodeRef = (<SkipListHead>top.down).seek(nodeInterval)
      while (tempNode) {
        tempNode.enhance()
        tempNode = tempNode.seek(nodeInterval)
      }
    }
    this.root = top
  }

  seek (distance: number): NodeRef {
    return this.bottom.seek(distance)
  }

  findBelow (value: number): SkipListNode {
    let currentNode: SkipListNode = this.root

    while (true) {
      while (currentNode.next && currentNode.next.value < value) {
        currentNode = currentNode.next
      }
      if (currentNode.down) {
        currentNode = currentNode.down
      } else break
    }
    return currentNode
  }

  find (value: number): NodeRef {
    const temp = this.findBelow(value).next
    if (temp?.value === value) return temp
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
    const current = (): NodeRef => currentNode
    return { next, finish, current }
  }

  toArray (): Array<SkipListNode> {
    const { next, finish } = this.iterableRange()
    const result: Array<SkipListNode> = []
    while (!finish()) {
      result.push(next() as SkipListNode)
    }
    return result
  }

  _attemptEnhance (node: SkipListNode): void {
    if (Math.random() < 1 / nodeInterval) {
      const up = node.enhance()
      if (up) this._attemptEnhance(up)
    }
  }

  push (value: number): NodeRef {
    const prevNode = this.findBelow(value)
    const nextNode = prevNode.next
    if (nextNode?.value === value) return
    const tempNode = new SkipListNode(value)
    tempNode.prev = prevNode
    tempNode.next = nextNode
    prevNode.next = tempNode
    nextNode && (nextNode.prev = tempNode)
    this._attemptEnhance(tempNode)
    return tempNode
  }

  delete (target: SkipListNode | number): void {
    const temp = target instanceof SkipListNode ? target : this.find(target)
    if (temp) temp.remove()
  }
}
