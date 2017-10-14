const Boggle = require('./boggle')

var boggleBoard = new Boggle(process.argv[2])
boggleBoard.printBoard()
boggleBoard.solve()
