import {Observable as O} from 'rx'

const EXTRA_BLEED = 1 // the bigger the number, the bigger the impact in DOM perf on huge screens (it renders a lot more of elements)
export function model(items$, intents) {
  const rowLength$ = O.combineLatest(
      intents.containerWidth$, intents.itemWidth$,
      (available, width) => Math.round(available / width)
    )

  const visibleCount$ = O.combineLatest(
      intents.screenHeight$, intents.itemHeight$, rowLength$,
      (screenH, itemH, rowLength) =>
        (Math.round(screenH / itemH) + EXTRA_BLEED * 2) * rowLength
    )

  const offset$ = O.combineLatest(
    intents.scrollTop$, intents.containerTop$, intents.itemHeight$, rowLength$,
    (scroll, containerTop, itemHeight, rowLength) =>
      Math.max(0,
        Math.round(((scroll - containerTop) / itemHeight) - EXTRA_BLEED) * rowLength)
    )

  const visibleRange$ = O.combineLatest(
      offset$, visibleCount$,
      (offset, visibleCount) => [offset, offset + visibleCount]
    )
    .distinctUntilChanged()

  const paddingTop$ = O.combineLatest(
      offset$, rowLength$, intents.itemHeight$,
      (offset, rowLength, itemHeight) => offset / rowLength * itemHeight
    )
    .distinctUntilChanged()

  const height$ = O.combineLatest(
      items$, intents.itemHeight$, rowLength$,
      (items, height, rowLength) =>
        Math.ceil(items.length / rowLength) * height,
    )
    .distinctUntilChanged()

  return O.combineLatest(
    visibleRange$, paddingTop$, height$,
    (visibleRange, paddingTop, height) =>
      ({visibleRange, paddingTop, height})
  )
}
