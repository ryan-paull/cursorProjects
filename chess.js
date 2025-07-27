class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.inCheck = { white: false, black: false };
        
        this.pieceSymbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };

        this.initializeGame();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up initial positions
        const initialSetup = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
        ];

        // Place black pieces
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: initialSetup[0][col], color: 'black' };
            board[1][col] = { type: initialSetup[1][col], color: 'black' };
        }

        // Place white pieces
        for (let col = 0; col < 8; col++) {
            board[7][col] = { type: initialSetup[0][col], color: 'white' };
            board[6][col] = { type: initialSetup[1][col], color: 'white' };
        }

        return board;
    }

    initializeGame() {
        this.createBoard();
        this.updateDisplay();
        this.setupEventListeners();
    }

    createBoard() {
        const boardElement = document.getElementById('chessBoard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                
                boardElement.appendChild(square);
            }
        }
    }

    updateDisplay() {
        const squares = document.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.board[row][col];
            
            square.innerHTML = '';
            square.classList.remove('selected', 'valid-move', 'capture-move', 'check-indicator');
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.textContent = this.pieceSymbols[piece.color][piece.type];
                square.appendChild(pieceElement);
            }
        });

        this.updateGameStatus();
        this.updatePlayerInfo();
    }

    handleSquareClick(event) {
        if (this.gameOver) return;

        const row = parseInt(event.currentTarget.dataset.row);
        const col = parseInt(event.currentTarget.dataset.col);
        const clickedPiece = this.board[row][col];

        if (this.selectedSquare) {
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                // Deselect current square
                this.clearSelection();
                return;
            }

            // Try to make a move
            if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.clearSelection();
                this.switchPlayer();
                this.checkGameState();
            } else if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                // Select new piece
                this.selectSquare(row, col);
            } else {
                this.clearSelection();
            }
        } else {
            // Select a piece
            if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                this.selectSquare(row, col);
            }
        }
    }

    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.highlightValidMoves(row, col);
        
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');
    }

    clearSelection() {
        this.selectedSquare = null;
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
    }

    highlightValidMoves(row, col) {
        const validMoves = this.getValidMoves(row, col);
        
        validMoves.forEach(move => {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (this.board[move.row][move.col]) {
                square.classList.add('capture-move');
            } else {
                square.classList.add('valid-move');
            }
        });
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        let moves = [];

        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }

        // Filter out moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures
        [-1, 1].forEach(colOffset => {
            const newRow = row + direction;
            const newCol = col + colOffset;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([rowDir, colDir]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * rowDir;
                const newCol = col + i * colDir;

                if (!this.isInBounds(newRow, newCol)) break;

                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([rowOffset, colOffset]) => {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([rowDir, colDir]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * rowDir;
                const newCol = col + i * colDir;

                if (!this.isInBounds(newRow, newCol)) break;

                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        directions.forEach(([rowOffset, colOffset]) => {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const validMoves = this.getValidMoves(fromRow, fromCol);
        return validMoves.some(move => move.row === toRow && move.col === toCol);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Store move in history
        this.gameHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null,
            player: this.currentPlayer
        });

        // Handle captured piece
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
            this.updateCapturedPieces();
        }

        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
        }

        this.updateMoveHistory();
        this.updateDisplay();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    checkGameState() {
        const kingInCheck = this.isKingInCheck(this.currentPlayer);
        this.inCheck[this.currentPlayer] = kingInCheck;

        if (kingInCheck) {
            if (this.isCheckmate(this.currentPlayer)) {
                this.endGame(`Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
                return;
            }
        } else if (this.isStalemate(this.currentPlayer)) {
            this.endGame('Stalemate! It\'s a draw!');
            return;
        }

        this.updateDisplay();
    }

    isKingInCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition) return false;

        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== color) {
                    const moves = this.getPieceMoves(row, col, piece);
                    if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPieceMoves(row, col, piece) {
        switch (piece.type) {
            case 'pawn': return this.getPawnMoves(row, col, piece.color);
            case 'rook': return this.getRookMoves(row, col);
            case 'knight': return this.getKnightMoves(row, col);
            case 'bishop': return this.getBishopMoves(row, col);
            case 'queen': return this.getQueenMoves(row, col);
            case 'king': return this.getKingMoves(row, col);
            default: return [];
        }
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make temporary move
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;

        const inCheck = this.isKingInCheck(color);

        // Restore board
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;

        return inCheck;
    }

    isCheckmate(color) {
        if (!this.isKingInCheck(color)) return false;
        return this.hasNoValidMoves(color);
    }

    isStalemate(color) {
        if (this.isKingInCheck(color)) return false;
        return this.hasNoValidMoves(color);
    }

    hasNoValidMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMoves(row, col);
                    if (validMoves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    updateGameStatus() {
        const statusElement = document.getElementById('gameStatus');
        
        if (this.gameOver) {
            return;
        }

        if (this.inCheck[this.currentPlayer]) {
            statusElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} is in check!`;
            statusElement.style.color = '#e74c3c';
        } else {
            statusElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} to move`;
            statusElement.style.color = '#2c3e50';
        }
    }

    updatePlayerInfo() {
        const whitePlayer = document.querySelector('.white-player');
        const blackPlayer = document.querySelector('.black-player');
        
        whitePlayer.classList.toggle('active', this.currentPlayer === 'white');
        blackPlayer.classList.toggle('active', this.currentPlayer === 'black');
        
        whitePlayer.querySelector('span').textContent = this.currentPlayer === 'white' ? 'White to move' : 'White';
        blackPlayer.querySelector('span').textContent = this.currentPlayer === 'black' ? 'Black to move' : 'Black';
    }

    updateMoveHistory() {
        const movesList = document.querySelector('.moves-list');
        const lastMove = this.gameHistory[this.gameHistory.length - 1];
        
        if (lastMove) {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-entry';
            
            const fromSquare = String.fromCharCode(97 + lastMove.from.col) + (8 - lastMove.from.row);
            const toSquare = String.fromCharCode(97 + lastMove.to.col) + (8 - lastMove.to.row);
            const pieceSymbol = this.pieceSymbols[lastMove.piece.color][lastMove.piece.type];
            
            moveElement.textContent = `${Math.ceil(this.gameHistory.length / 2)}. ${pieceSymbol} ${fromSquare}-${toSquare}`;
            movesList.appendChild(moveElement);
            movesList.scrollTop = movesList.scrollHeight;
        }
    }

    updateCapturedPieces() {
        const whiteContainer = document.querySelector('.captured-white .pieces-container');
        const blackContainer = document.querySelector('.captured-black .pieces-container');
        
        whiteContainer.innerHTML = '';
        blackContainer.innerHTML = '';
        
        this.capturedPieces.white.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = this.pieceSymbols.white[piece.type];
            whiteContainer.appendChild(pieceElement);
        });
        
        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = this.pieceSymbols.black[piece.type];
            blackContainer.appendChild(pieceElement);
        });
    }

    endGame(message) {
        this.gameOver = true;
        document.getElementById('gameStatus').textContent = message;
        
        // Create game over modal
        const modal = document.createElement('div');
        modal.className = 'game-over';
        modal.innerHTML = `
            <div class="game-over-modal">
                <h2>Game Over</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="game.newGame()">New Game</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    newGame() {
        // Remove game over modal
        const modal = document.querySelector('.game-over');
        if (modal) {
            modal.remove();
        }
        
        // Reset game state
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.inCheck = { white: false, black: false };
        
        // Clear move history
        document.querySelector('.moves-list').innerHTML = '';
        
        // Update display
        this.updateDisplay();
        this.updateCapturedPieces();
    }

    undoMove() {
        if (this.gameHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.gameHistory.pop();
        
        // Restore the board state
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
        
        // Restore captured pieces
        if (lastMove.capturedPiece) {
            const capturedArray = this.capturedPieces[lastMove.capturedPiece.color];
            const index = capturedArray.findIndex(p => 
                p.type === lastMove.capturedPiece.type && 
                p.color === lastMove.capturedPiece.color
            );
            if (index !== -1) {
                capturedArray.splice(index, 1);
            }
        }
        
        // Switch back to previous player
        this.switchPlayer();
        
        // Update display
        this.clearSelection();
        this.updateDisplay();
        this.updateCapturedPieces();
        
        // Update move history display
        const movesList = document.querySelector('.moves-list');
        if (movesList.lastChild) {
            movesList.removeChild(movesList.lastChild);
        }
        
        // Check game state
        this.checkGameState();
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('undoMove').addEventListener('click', () => this.undoMove());
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
});