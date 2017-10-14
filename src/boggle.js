const readline = require('readline')
const fs = require('fs')
const Dice = require('./dice')

class Boggle {

  constructor (size) {

    this.size = size || 4
    this.dice = new Dice()
    this.words = []
    this.totalScore = 0
    this.board = []
    this.tableMap = {}
    this.tableLookUp = []
    this.solveStartTime = null

    this.fileReader = readline.createInterface({
      input: fs.createReadStream(__dirname + '/words.txt')
    })

    this
      .buildBoard()
      .buildTableMap()
      .buildTableLookUp()
  }

/*
  @returns [
    [ 'A', 'U', 'E', 'I' ],
    [ 'B', 'I', 'Z', 'I' ],
    [ 'A', 'E', 'O', 'F' ],
    [ 'Y', 'H', 'I', 'W' ]
  ] 2D array representation of board
*/
  buildBoard () {

    // y-axis
    for (var rowIdx = 0; rowIdx < this.size; ++rowIdx) {
      var row = []

      // x-axis
      for (var colIdx = 0; colIdx < this.size; ++colIdx) {
        row.push(this.dice.roll().toUpperCase())
      }

      this.board.push(row)
    }

    return this
  }

/*
  @returns {
    A: [ [ 0, 0 ], [ 2, 0 ] ],
    U: [ [ 0, 1 ] ],
    E: [ [ 0, 2 ], [ 2, 1 ] ],
    I: [ [ 0, 3 ], [ 1, 1 ], [ 1, 3 ], [ 3, 2 ] ],
    B: [ [ 1, 0 ] ],
    Z: [ [ 1, 2 ] ],
    O: [ [ 2, 2 ] ],
    F: [ [ 2, 3 ] ],
    Y: [ [ 3, 0 ] ],
    H: [ [ 3, 1 ] ],
    W: [ [ 3, 3 ] ]
  } Hash with every letter on the board and the respective coordinates for each letter.
*/
  buildTableMap () {

    // y-axis
    this.tableMap = this.board.reduce((map, row, rowIdx) => {

      // x-axis
      row.forEach((letter, colIdx) => {

        map[letter] = map[letter] || []
        map[letter].push([rowIdx, colIdx])
      })

      return map
    }, {})

    return this
  }

/*
  @returns [
    [
      { U: [ [ 0, 1 ] ], I: [ [ 1, 1 ] ], B: [ [ 1, 0 ] ] },
      { E: [ [ 0, 2 ] ], Z: [ [ 1, 2 ] ], I: [ [ 1, 1 ] ], B: [ [ 1, 0 ] ], A: [ [ 0, 0 ] ] },
      { I: [ [ 0, 3 ], [ 1, 1 ], [ 1, 3 ] ], Z: [ [ 1, 2 ] ], U: [ [ 0, 1 ] ] },
      { I: [ [ 1, 3 ] ], Z: [ [ 1, 2 ] ], E: [ [ 0, 2 ] ] }
    ]
  ] 2D array representing adjacent letters for each letter on the board
  (Example shown here for a first row)
*/
  buildTableLookUp () {

    // y-axis
    for (var rowIdx = 0; rowIdx < this.size; ++rowIdx) {
      var row = []

      // x-axis
      for (var colIdx = 0; colIdx < this.size; ++colIdx) {
        var adjacentCoordinates = [
          [rowIdx - 1, colIdx], // top
          [rowIdx - 1, colIdx + 1], // top right
          [rowIdx, colIdx + 1], // right
          [rowIdx + 1, colIdx + 1], // bottom right
          [rowIdx + 1, colIdx], // bottom
          [rowIdx + 1, colIdx -1], // bottom left
          [rowIdx, colIdx - 1], // left
          [rowIdx - 1, colIdx - 1] // top left
        ]

        var adjacentLetters = adjacentCoordinates.reduce((map, location) => {

          var letterRowIdx = location[0]
          var letterColIdx = location[1]

          var row = this.board[letterRowIdx]

          if (!row) {
            return map
          }

          var letter = row[letterColIdx]

          if (!letter) {
            return map
          }

          map[letter] = map[letter] || []
          map[letter].push([letterRowIdx, letterColIdx])

          return map
        }, {})

        row.push(adjacentLetters)
      }

      this.tableLookUp.push(row)
    }

    return this
  }

  solve () {

    this.solveStart = new Date()

    this.fileReader.on('line', line => {

      var letters, firstLetter, coordinatesOfFirstLetters

      if (line.length < 3) {
        return null
      }

      letters = line.toUpperCase().split('')
      firstLetter = letters[0]
      coordinatesOfFirstLetters = this.checkIfLetterIsOnBoard(firstLetter)

      if (!coordinatesOfFirstLetters) {
        return null
      }

      coordinatesOfFirstLetters.forEach((coordinatesOfFirstLetter) => {

        if (this.checkIfWordIsOnBoard(coordinatesOfFirstLetter, 1, letters, [])) {
          this.words.push(line.toUpperCase())
        }
      })
    })

    this.fileReader.on('close', () => {

      this
        .setSolveDuration()
        .formatSolutions()
        .score()
        .printSolutions()
        .printSolveTime()
        .printScore()
    })
  }

  checkIfLetterIsOnBoard (letter) {

    var coordinatesOfLetter = this.tableMap[letter]

    if (!coordinatesOfLetter) {
      return null
    }

    return coordinatesOfLetter
  }

  checkIfWordIsOnBoard (coordinatesOfLetter, letterIdx, letters, dirtyCoordinates) {

    var nextLetter = letters[letterIdx]

    if (!nextLetter) {
      return true
    }

    var letterRowIdx = coordinatesOfLetter[0]
    var letterColIdx = coordinatesOfLetter[1]

    dirtyCoordinates[letterRowIdx] = dirtyCoordinates[letterRowIdx] || []
    dirtyCoordinates[letterRowIdx][letterColIdx] = 1

    var coordinatesOfNextLettersInWord = this.tableLookUp[letterRowIdx][letterColIdx][nextLetter]

    if (!coordinatesOfNextLettersInWord) {
      return false
    }

    return coordinatesOfNextLettersInWord
      .filter(
        (coordinatesOfNextLetter) => {

          var nextLetterRowIdx = coordinatesOfNextLetter[0]
          var nextLetterColIdx = coordinatesOfNextLetter[1]

          dirtyCoordinates[nextLetterRowIdx] = dirtyCoordinates[nextLetterRowIdx] || []
          return !dirtyCoordinates[nextLetterRowIdx][nextLetterColIdx]
        }
      )
      .some(
        (coordinatesOfNextLetter) => {

          var dirtyCoordinatesCopy = JSON.parse(JSON.stringify(dirtyCoordinates))
          return this.checkIfWordIsOnBoard(coordinatesOfNextLetter, letterIdx + 1, letters, dirtyCoordinatesCopy)
        }
      )
  }

  score () {

    var scoreMap = {
      3: 1,
      4: 1,
      5: 2,
      6: 3,
      7: 5
    }

    this.totalScore = this.words.reduce((score, word) => {

      var length = word.length
      score += (length >= 8) ? 11 : (scoreMap[length] || 0)

      return score
    }, 0)

    return this
  }

  formatSolutions () {

    this.words = [...new Set( this.words )]
    return this
  }

  setSolveDuration () {

    this.solveEnd = new Date()
    this.solveDuration = Math.abs((this.solveStart.getTime() - this.solveEnd.getTime()) / 1000)

    return this
  }

  print (title, value) {

    console.log(title)

    if (value) {
      console.log(value)
    }

    return this
  }

  printBoard () {

    return this.print('Boggle Board!', this.board)
  }

  printSolutions () {

    return this.print('Solutions!', this.words)
  }

  printScore () {

    return this.print(`Final Score: ${this.totalScore}`)
  }

  printSolveTime () {

    return this.print(`Found ${this.words.length} solutions in ${this.solveDuration} seconds`)
  }
}

module.exports = Boggle
