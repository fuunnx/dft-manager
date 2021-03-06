import {range} from 'ramda'

export function dbReducer (db, action) {
  const dict = {
    PLAN: plan,
    RM_PLANNED: rmPlanned,
    CRAFT: craft,
    BUY: buy,
    RM_STORED: rmStored,
    SELL: sell,
    RM_SOLD: rmSold,
    SET_PRICE: setPrice,
    TOGGLE_FAVORITES: toggleFavorites,
  }
  if(action && action.type in dict) {
    return update(db, dict[action.type], action)
  } else {
    return db
  }
}

function update(db, fn, action) {
  return db.update(action.target, repeat(action.quantity, fn(action)))
}
function repeat (times = 1, reducer) {
  return x => range(0, times)
    .reduce(reducer, x)
}

const min0 = x => Math.max((x || 0), 0)
const add1 = x => (x || 0) + 1
const rm1 = x => (x || 0) - 1
const decrement = x => min0(rm1(x))

export function setPrice ({price, quantity = 1, timestamp}) {
  return prev => {
    if(isNaN(price)) return prev
    else return {
      ...prev,
      latestUpdate: timestamp,
      price: Math.round(price / quantity),
    }
  }
}
export function plan () {
  return (x) => ({
    ...x,
    crafts: add1(x.crafts),
  })
}
export function rmPlanned () {
  return (x) => ({
    ...x,
    crafts: decrement(x.crafts),
  })
}
export function craft () {
  return (x) => ({
    ...x,
    crafts: decrement(x.crafts),
    stocks: add1(x.stocks),
  })
}
export function buy ({price, timestamp}) {
  return (x) => ({
    ...setPrice({price, timestamp})(x),
    stocks: add1(x.stocks),
  })
}
export function rmStored () {
  return (x) => ({
    ...x,
    stocks: decrement(x.stocks),
  })
}
export function sell ({price, timestamp}) {
  return (x) => ({
    ...setPrice({price, timestamp})(x),
    crafts: (!x.stocks) ? decrement(x.crafts) : (x.crafts || 0),
    stocks: decrement(x.stocks),
    sold: add1(x.sold),
  })
}
export function rmSold () {
  return (x) => ({
    ...x,
    sold: decrement(x.sold),
  })
}
export function toggleFavorites () {
  return (x) => ({
    ...x,
    favorites: !x.favorites,
  })
}
