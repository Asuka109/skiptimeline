import { SkipList, SkipListNode } from '~SkipList'

export interface TimePointCallback {
  (...args: any[]): any
}

export interface TimePoint {
  time: number
  callback: TimePointCallback
  once: boolean
}

export interface TimePointBuckets {
  [time: number]: TimePoint[] | undefined
}

export class SkipTimeline {
  buckets: TimePointBuckets
  skiplist: SkipList

  constructor (source?: TimePoint[]) {
    const timePoints = source ?? []
    this.buckets = {}
    timePoints.forEach(point => {
      const time = point.time
      if (this.buckets[time] instanceof Array) {
        (this.buckets[time] as TimePoint[]).push(point)
      } else {
        this.buckets[time] = [point]
      }
    })

    this.skiplist = new SkipList(timePoints.map(p => p.time))
  }

  get (time: number): TimePoint[] | undefined {
    return this.buckets[time]
  }

  delete (timePoint: TimePoint): void {
    const time = timePoint.time
    const points = this.buckets[time]
    const index = points instanceof Array && points.indexOf(timePoint)
    if (index && points) {
      points.splice(index, 1)
      if (points.length) {
        this.buckets[time] = points
      } else {
        delete this.buckets[time]
        this.skiplist.delete(time)
      }
    }
  }

  between (start: number, end: number): TimePoint[] | undefined {
    const { next, current } = this.skiplist.iterableRange([start, end])
    const result: TimePoint[] = []
    while (next()) {
      const time = (<SkipListNode>current()).value
      result.push(...(this.buckets[time] as TimePoint[]))
    }
    return result
  }

  trigger (start: number, end: number, ...args: any[]): number {
    if (start >= end) throw new Error('illegal arguments.')
    const { next, current } = this.skiplist.iterableRange([start, end])
    let count = 0
    while (next()) {
      const node = <SkipListNode>current()
      const time = node.value
      let points = this.buckets[time] as TimePoint[]
      points = points.filter((p, i) => {
        p.callback.call(this.skiplist, ...args)
        if (p.once) return false
        else return true
      })
      if (points.length) {
        this.buckets[time] = points
      } else {
        delete this.buckets[time]
        this.skiplist.delete(time)
      }
      count++
    }
    return count
  }
}
