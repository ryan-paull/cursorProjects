# Chess Game

A beautiful, fully-functional chess game built with HTML, CSS, and JavaScript. Features a modern UI with complete chess rules implementation.

## Features

### ✨ Complete Chess Implementation
- **All Chess Pieces**: King, Queen, Rook, Bishop, Knight, and Pawn with proper movement rules
- **Special Moves**: Pawn promotion (automatically promotes to Queen)
- **Game Rules**: Check, checkmate, and stalemate detection
- **Move Validation**: Prevents illegal moves and moves that would put your own king in check

### 🎮 Interactive Gameplay
- **Click to Select**: Click on a piece to select it and see valid moves
- **Visual Feedback**: 
  - Selected pieces are highlighted in blue
  - Valid moves shown with green circles
  - Capture moves highlighted in red
- **Move History**: Complete game history with algebraic notation
- **Captured Pieces**: Visual display of captured pieces for both sides

### 🎨 Modern UI Design
- **Beautiful Interface**: Modern gradient background with clean card design
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Hover effects and transitions
- **Professional Typography**: Uses Inter font for clean readability

### 🎯 Game Controls
- **New Game**: Start a fresh game at any time
- **Undo Move**: Take back the last move
- **Game Status**: Real-time display of current player and game state

## How to Play

1. **Starting**: White always moves first
2. **Selecting Pieces**: Click on any of your pieces to select it
3. **Making Moves**: 
   - After selecting a piece, valid moves will be highlighted
   - Green circles show empty squares you can move to
   - Red highlights show enemy pieces you can capture
   - Click on a highlighted square to make your move
4. **Special Rules**:
   - You cannot make a move that puts your own king in check
   - If your king is in check, you must get out of check
   - Pawns automatically promote to Queens when reaching the opposite end
   - The game ends in checkmate or stalemate

## Game Rules Implemented

- **Pawn Movement**: Forward one square, two squares from starting position, diagonal captures
- **Rook Movement**: Horizontal and vertical lines
- **Bishop Movement**: Diagonal lines
- **Knight Movement**: L-shaped moves (2+1 squares)
- **Queen Movement**: Combination of rook and bishop
- **King Movement**: One square in any direction
- **Check Detection**: Prevents moves that would expose the king
- **Checkmate**: Game ends when king is in check with no legal moves
- **Stalemate**: Game ends in draw when no legal moves available but not in check

## Technical Details

### Files Structure
- `index.html` - Main HTML structure
- `styles.css` - Modern CSS styling with responsive design
- `chess.js` - Complete chess game logic and rules

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- No external dependencies required

## Getting Started

1. Clone or download the files
2. Open `index.html` in your web browser
3. Start playing immediately!

No installation or setup required - just open and play!

## Screenshots

The game features:
- Clean, modern chess board with proper square coloring
- Unicode chess piece symbols for clear visibility
- Intuitive piece selection and move highlighting
- Real-time game status and move history
- Captured pieces display
- Game over modal with restart option

Enjoy your chess game! ♟️