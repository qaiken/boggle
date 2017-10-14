const _dice = [
  ['A', 'E', 'A', 'N', 'E', 'G'],
  ['W', 'N', 'G', 'E', 'E', 'H'],
  ['A', 'H', 'S', 'P', 'C', 'O'],
  ['L', 'N', 'H', 'N', 'R', 'Z'],
  ['A', 'S', 'P', 'F', 'F', 'K'],
  ['T', 'S', 'T', 'I', 'Y', 'D'],
  ['O', 'B', 'J', 'O', 'A', 'B'],
  ['O', 'W', 'T', 'O', 'A', 'T'],
  ['I', 'O', 'T', 'M', 'U', 'C'],
  ['E', 'R', 'T', 'T', 'Y', 'L'],
  ['R', 'Y', 'V', 'D', 'E', 'L'],
  ['T', 'O', 'E', 'S', 'S', 'I'],
  ['L', 'R', 'E', 'I', 'X', 'D'],
  ['T', 'E', 'R', 'W', 'H', 'V'],
  ['E', 'I', 'U', 'N', 'E', 'S'],
  ['N', 'U', 'I', 'H', 'M', 'A']
]

class Dice {

  constructor () {

    this._dice = this.shuffle(_dice)
  }

  shuffle (collection) {

    var primaryIdx, valueToSwap
    var secondaryIdx = collection.length

    while (secondaryIdx) {

      primaryIdx = this.getRandomValueBelow(secondaryIdx)
      --secondaryIdx

      valueToSwap = collection[secondaryIdx]
      collection[secondaryIdx] = collection[primaryIdx]
      collection[primaryIdx] = valueToSwap
    }

    return collection
  }

  getRandomValueBelow (value) {

    return Math.floor(Math.random() * value)
  }

  getRandomValueFromCollection (collection) {

    return collection[this.getRandomValueBelow(collection.length)]
  }

  roll () {

    const die = this.getRandomValueFromCollection(this._dice)
    return this.getRandomValueFromCollection(die)
  }
}

module.exports = Dice
