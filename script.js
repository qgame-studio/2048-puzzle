class GameComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Game state
    this.grid = [];
    this.score = 0;
    this.bestScore = 0;
    this.moves = 0;
    this.gameActive = false;
    this.animationsInProgress = 0;
    this.difficultyLevel = 'medium';
    this.gridSize = 4; // Default 4x4 grid
    this.winningTile = 2048;
    this.gameWon = false;
    this.continuePlaying = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Render the component
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #3b82f6;
          --primary-dark: #2563eb;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
          --background: #f8fafc;
          --card-bg: #ffffff;
          --text-color: #1e293b;
          --text-light: #64748b;
          --border-color: #e2e8f0;
          --radius: 12px;
          --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: var(--background);
          padding: 24px;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
          color: var(--text-color);
        }

        h1 {
          margin-bottom: 16px;
          font-size: 28px;
          font-weight: 700;
          color: var(--primary-color);
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 12px;
          background-color: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .game-header div {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .game-header span:first-child {
          font-size: 14px;
          color: var(--text-light);
          margin-bottom: 4px;
        }

        .game-header span:last-child {
          font-weight: 600;
          font-size: 18px;
        }

        .grid-container {
          background-color: var(--border-color);
          padding: 12px;
          border-radius: var(--radius);
          display: inline-block;
          position: relative;
          margin-bottom: 20px;
          touch-action: none;
        }

        .grid {
          display: grid;
          grid-gap: 12px;
          position: relative;
        }

        .grid-4 {
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
        }

        .grid-5 {
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(5, 1fr);
        }

        .grid-6 {
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(6, 1fr);
        }

        .cell {
          width: 80px;
          height: 80px;
          background-color: var(--card-bg);
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-color);
          position: relative;
          transition: transform 0.15s ease;
        }

        .cell.size-5 {
          width: 65px;
          height: 65px;
          font-size: 24px;
        }

        .cell.size-6 {
          width: 55px;
          height: 55px;
          font-size: 20px;
        }

        .tile {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 28px;
          font-weight: 700;
          color: #FFFFFF;
          background-color: var(--primary-color);
          transition: all 0.15s ease;
          animation: appear 0.2s;
          z-index: 10;
        }

        .tile.size-5 {
          width: 65px;
          height: 65px;
          font-size: 24px;
        }

        .tile.size-6 {
          width: 55px;
          height: 55px;
          font-size: 20px;
        }

        .tile.merged {
          animation: pop 0.2s;
        }

        .tile-2 {
          background-color: #eee4da;
          color: #776e65;
        }

        .tile-4 {
          background-color: #ede0c8;
          color: #776e65;
        }

        .tile-8 {
          background-color: #f2b179;
        }

        .tile-16 {
          background-color: #f59563;
        }

        .tile-32 {
          background-color: #f67c5f;
        }

        .tile-64 {
          background-color: #f65e3b;
        }

        .tile-128 {
          background-color: #edcf72;
          font-size: 24px;
        }

        .tile-256 {
          background-color: #edcc61;
          font-size: 24px;
        }

        .tile-512 {
          background-color: #edc850;
          font-size: 24px;
        }

        .tile-1024 {
          background-color: #edc53f;
          font-size: 20px;
        }

        .tile-2048 {
          background-color: #edc22e;
          font-size: 20px;
        }

        .tile-4096 {
          background-color: #3c3a32;
          font-size: 20px;
        }

        .tile-8192 {
          background-color: #2c2a22;
          font-size: 20px;
        }

        @keyframes appear {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .game-over-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(238, 228, 218, 0.8);
          z-index: 20;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: var(--radius);
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }

        .game-over-overlay.active {
          opacity: 1;
          transform: scale(1);
        }

        .game-over-message {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .win-message {
          color: var(--success-color);
        }

        .lose-message {
          color: var(--error-color);
        }

        .buttons-container {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        button {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          border-radius: var(--radius);
          background-color: var(--primary-color);
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        button:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
        }

        button:active {
          transform: translateY(0);
        }

        button:disabled {
          background-color: var(--text-light);
          cursor: not-allowed;
          transform: none;
        }

        .setup-container {
          margin-bottom: 24px;
        }

        .difficulty-selector, .size-selector {
          margin-bottom: 16px;
        }

        .difficulty-selector h3, .size-selector h3 {
          margin-bottom: 12px;
          color: var(--text-color);
        }

        .option-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .option-button {
          padding: 8px 16px;
          background-color: var(--border-color);
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--text-color);
        }

        .option-button.active {
          background-color: var(--primary-color);
          color: white;
        }

        .game-over {
          background-color: var(--card-bg);
          border-radius: var(--radius);
          padding: 24px;
          margin-top: 24px;
          box-shadow: var(--shadow);
        }

        .game-over h2 {
          color: var(--primary-color);
          margin-bottom: 16px;
        }

        .game-over p {
          margin: 8px 0;
          font-size: 18px;
        }

        .game-over .highlight {
          font-weight: 700;
          color: var(--primary-color);
        }

        .instructions {
          background-color: rgba(59, 130, 246, 0.1);
          border-left: 4px solid var(--primary-color);
          padding: 12px;
          margin: 16px 0;
          text-align: left;
          border-radius: 0 var(--radius) var(--radius) 0;
        }

        .result-message {
          font-size: 18px;
          font-weight: 600;
          margin: 16px 0;
          min-height: 27px;
          transition: all 0.3s ease;
        }

        .success {
          color: var(--success-color);
        }

        .error {
          color: var(--error-color);
        }

        .continue-btn {
          background-color: var(--success-color);
        }

        .new-game-btn {
          background-color: var(--warning-color);
        }

        @media (max-width: 500px) {
          .cell, .tile {
            width: 65px;
            height: 65px;
            font-size: 22px;
          }

          .cell.size-5, .tile.size-5 {
            width: 55px;
            height: 55px;
            font-size: 20px;
          }
          
          .cell.size-6, .tile.size-6 {
            width: 45px;
            height: 45px;
            font-size: 16px;
          }
        }

        @media (max-width: 400px) {
          .cell, .tile {
            width: 55px;
            height: 55px;
            font-size: 20px;
          }

          .cell.size-5, .tile.size-5 {
            width: 45px;
            height: 45px;
            font-size: 18px;
          }
          
          .cell.size-6, .tile.size-6 {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
        }
      </style>

      <div class="container">
        <div id="setup-screen" style="display: block;">
          <h1>2048 Puzzle Game</h1>
          
          <div class="setup-container">
            <div class="difficulty-selector">
              <h3>Select Difficulty</h3>
              <div class="option-buttons">
                <button class="option-button" data-difficulty="easy">Easy</button>
                <button class="option-button active" data-difficulty="medium">Medium</button>
                <button class="option-button" data-difficulty="hard">Hard</button>
              </div>
            </div>
            
            <div class="size-selector">
              <h3>Select Grid Size</h3>
              <div class="option-buttons">
                <button class="option-button active" data-size="4">4x4</button>
                <button class="option-button" data-size="5">5x5</button>
                <button class="option-button" data-size="6">6x6</button>
              </div>
            </div>
          </div>
          
          <button id="start-game-btn">Start Game</button>
          
          <div class="instructions">
            <h3>How to Play:</h3>
            <p>Use arrow keys or swipe to move tiles. When two tiles with the same number touch, they merge into one! Try to reach the 2048 tile.</p>
            <p>Difficulty affects starting tiles and winning number:<br>
              • Easy: Start with 2 tiles, win at 1024<br>
              • Medium: Start with 2 tiles, win at 2048<br>
              • Hard: Start with 1 tile, win at 4096</p>
          </div>
        </div>
        
        <div id="game-screen" style="display: none;">
          <h1>2048 Puzzle Game</h1>
          
          <div class="game-header">
            <div>
              <span>Score</span>
              <span id="score">0</span>
            </div>
            <div>
              <span>Best</span>
              <span id="best-score">0</span>
            </div>
            <div>
              <span>Moves</span>
              <span id="moves">0</span>
            </div>
          </div>
          
          <div class="grid-container" id="grid-container">
            <div class="grid grid-4" id="grid"></div>
            
            <div class="game-over-overlay" id="game-over-overlay">
              <div class="game-over-message" id="game-over-message"></div>
              <div class="buttons-container">
                <button id="continue-btn" class="continue-btn">Continue</button>
                <button id="new-game-btn" class="new-game-btn">New Game</button>
              </div>
            </div>
          </div>
          
          <div class="result-message" id="result-message"></div>
          
          <div class="buttons-container">
            <button id="restart-btn">Restart Game</button>
            <button id="back-to-setup-btn">Change Settings</button>
          </div>
        </div>
        
        <div id="game-over-screen" style="display: none;">
          <h2>Game Over!</h2>
          <p>Your final score: <span id="final-score" class="highlight">0</span></p>
          <p>Highest tile reached: <span id="highest-tile" class="highlight">0</span></p>
          <p>Total moves: <span id="total-moves" class="highlight">0</span></p>
          
          <button id="play-again-btn" style="margin-top: 20px;">Play Again</button>
        </div>
      </div>
    `;

    // Bind methods to the component
    this.initGrid = this.initGrid.bind(this);
    this.addStartTiles = this.addStartTiles.bind(this);
    this.addRandomTile = this.addRandomTile.bind(this);
    this.updateGrid = this.updateGrid.bind(this);
    this.renderGrid = this.renderGrid.bind(this);
    this.renderTile = this.renderTile.bind(this);
    this.startGame = this.startGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.move = this.move.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.checkGameOver = this.checkGameOver.bind(this);
    this.checkGameWon = this.checkGameWon.bind(this);
    this.endGame = this.endGame.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setDifficulty = this.setDifficulty.bind(this);
    this.setGridSize = this.setGridSize.bind(this);
    this.getHighestTile = this.getHighestTile.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    // Setup event listeners for difficulty and grid size selection
    const difficultyButtons = this.shadowRoot.querySelectorAll('.difficulty-selector .option-button');
    difficultyButtons.forEach(button => {
      button.addEventListener('click', () => {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.setDifficulty(button.getAttribute('data-difficulty'));
      });
    });

    const sizeButtons = this.shadowRoot.querySelectorAll('.size-selector .option-button');
    sizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.setGridSize(parseInt(button.getAttribute('data-size')));
      });
    });

    // Add event listeners for game controls
    this.shadowRoot.getElementById('start-game-btn').addEventListener('click', this.startGame);
    this.shadowRoot.getElementById('restart-btn').addEventListener('click', this.restartGame);
    this.shadowRoot.getElementById('back-to-setup-btn').addEventListener('click', () => {
      this.shadowRoot.getElementById('game-screen').style.display = 'none';
      this.shadowRoot.getElementById('setup-screen').style.display = 'block';
    });
    this.shadowRoot.getElementById('play-again-btn').addEventListener('click', () => {
      this.shadowRoot.getElementById('game-over-screen').style.display = 'none';
      this.shadowRoot.getElementById('setup-screen').style.display = 'block';
    });
    this.shadowRoot.getElementById('continue-btn').addEventListener('click', () => {
      this.continuePlaying = true;
      this.shadowRoot.getElementById('game-over-overlay').classList.remove('active');
      this.gameActive = true;
    });
    this.shadowRoot.getElementById('new-game-btn').addEventListener('click', this.restartGame);
  }

  // Set difficulty level
  setDifficulty(level) {
    this.difficultyLevel = level;

    // Adjust game parameters based on difficulty
    switch (level) {
      case 'easy':
        this.startTiles = 2;
        this.winningTile = 1024;
        break;
      case 'medium':
        this.startTiles = 2;
        this.winningTile = 2048;
        break;
      case 'hard':
        this.startTiles = 1;
        this.winningTile = 4096;
        break;
    }
  }

  // Set grid size
  setGridSize(size) {
    this.gridSize = size;
  }

  // Initialize the grid
  initGrid() {
    this.grid = [];

    // Create a 2D array filled with zeros
    for (let i = 0; i < this.gridSize; i++) {
      const row = [];
      for (let j = 0; j < this.gridSize; j++) {
        row.push(0);
      }
      this.grid.push(row);
    }
  }

  // Add initial tiles
  addStartTiles() {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }

  // Add a random tile to the grid
  addRandomTile() {
    if (this.checkAvailableCells()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      let row, col;

      do {
        row = Math.floor(Math.random() * this.gridSize);
        col = Math.floor(Math.random() * this.gridSize);
      } while (this.grid[row][col] !== 0);

      this.grid[row][col] = value;
      this.renderTile(row, col, value, true);
    }
  }

  // Check if there are available cells
  checkAvailableCells() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Check for possible moves
  checkPossibleMoves() {
    // Check for empty cells
    if (this.checkAvailableCells()) {
      return true;
    }

    // Check for possible merges
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const value = this.grid[i][j];

        // Check right and down
        if (j < this.gridSize - 1 && value === this.grid[i][j + 1]) return true;
        if (i < this.gridSize - 1 && value === this.grid[i + 1][j]) return true;
      }
    }

    return false;
  }

  // Update the grid display
  updateGrid() {
    const gridElement = this.shadowRoot.getElementById('grid');
    gridElement.innerHTML = '';

    // Create empty cells
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const cell = document.createElement('div');
        cell.className = `cell size-${this.gridSize}`;
        cell.setAttribute('data-row', i);
        cell.setAttribute('data-col', j);
        gridElement.appendChild(cell);
      }
    }
  }

  // Render the current grid state
  renderGrid() {
    const gridContainer = this.shadowRoot.getElementById('grid-container');

    // Clear existing tiles
    const existingTiles = gridContainer.querySelectorAll('.tile');
    existingTiles.forEach(tile => {
      if (!tile.classList.contains('new') && !tile.classList.contains('merged')) {
        tile.remove();
      }
    });

    // Add new tiles
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] !== 0) {
          this.renderTile(i, j, this.grid[i][j], false);
        }
      }
    }

    // Remove animation classes after animations complete
    setTimeout(() => {
      const tiles = gridContainer.querySelectorAll('.tile');
      tiles.forEach(tile => {
        tile.classList.remove('new');
        tile.classList.remove('merged');
      });
    }, 200);
  }

  // Render a single tile
  renderTile(row, col, value, isNew) {
    const gridContainer = this.shadowRoot.getElementById('grid-container');
    const tileElement = document.createElement('div');

    // Calculate position
    const cellSize = this.gridSize === 4 ? 80 : this.gridSize === 5 ? 65 : 55;
    const gapSize = 12;

    const left = col * (cellSize + gapSize) + 12;
    const top = row * (cellSize + gapSize) + 12;

    // Set tile properties
    tileElement.className = `tile tile-${value} size-${this.gridSize}`;
    if (isNew) tileElement.classList.add('new');

    tileElement.style.left = `${left}px`;
    tileElement.style.top = `${top}px`;
    tileElement.textContent = value;

    // Add to the grid
    gridContainer.appendChild(tileElement);
  }

  // Start a new game
  startGame() {
    this.score = 0;
    this.moves = 0;
    this.gameActive = true;
    this.gameWon = false;
    this.continuePlaying = false;

    // Update UI
    this.shadowRoot.getElementById('score').textContent = this.score;
    this.shadowRoot.getElementById('moves').textContent = this.moves;
    this.shadowRoot.getElementById('best-score').textContent = this.bestScore;
    this.shadowRoot.getElementById('result-message').textContent = '';

    // Setup grid
    const gridElement = this.shadowRoot.getElementById('grid');
    gridElement.className = `grid grid-${this.gridSize}`;

    // Initialize the game
    this.initGrid();
    this.updateGrid();
    this.addStartTiles();

    // Switch to game screen
    this.shadowRoot.getElementById('setup-screen').style.display = 'none';
    this.shadowRoot.getElementById('game-screen').style.display = 'block';
    this.shadowRoot.getElementById('game-over-screen').style.display = 'none';
    this.shadowRoot.getElementById('game-over-overlay').classList.remove('active');

    // Add keyboard event listener
    document.addEventListener('keydown', this.handleKeyDown);

    // Add touch event listeners for mobile
    const gridContainer = this.shadowRoot.getElementById('grid-container');
    gridContainer.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    gridContainer.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  // Restart the current game
  restartGame() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);

    const gridContainer = this.shadowRoot.getElementById('grid-container');
    gridContainer.removeEventListener('touchstart', this.handleTouchStart);
    gridContainer.removeEventListener('touchend', this.handleTouchEnd);

    // Start a new game with the same settings
    this.startGame();
  }

  // Handle keyboard input
  handleKeyDown(event) {
    if (!this.gameActive || this.animationsInProgress > 0) return;

    let moved = false;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moved = this.moveUp();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moved = this.moveDown();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        moved = this.moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        moved = this.moveRight();
        break;
    }

    if (moved) {
      this.shadowRoot.getElementById('moves').textContent = ++this.moves;
      setTimeout(() => {
        this.addRandomTile();

        if (this.checkGameWon() && !this.gameWon && !this.continuePlaying) {
          this.gameWon = true;
          this.showGameOverMessage('You Win!', 'win-message');
          this.gameActive = false;
        } else if (!this.checkPossibleMoves()) {
          this.showGameOverMessage('Game Over!', 'lose-message');
          this.gameActive = false;
          this.endGame();
        }
      }, 150);
    }
  }

  // Handle touch events for swipe gesture
  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchEnd(event) {
    if (!this.gameActive || this.animationsInProgress > 0) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const diffX = touchEndX - this.touchStartX;
    const diffY = touchEndY - this.touchStartY;

    let moved = false;

    // Determine swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 30) {
        moved = this.moveRight();
      } else if (diffX < -30) {
        moved = this.moveLeft();
      }
    } else {
      // Vertical swipe
      if (diffY > 30) {
        moved = this.moveDown();
      } else if (diffY < -30) {
        moved = this.moveUp();
      }
    }

    if (moved) {
      this.shadowRoot.getElementById('moves').textContent = ++this.moves;
      setTimeout(() => {
        this.addRandomTile();

        if (this.checkGameWon() && !this.gameWon && !this.continuePlaying) {
          this.gameWon = true;
          this.showGameOverMessage('You Win!', 'win-message');
          this.gameActive = false;
        } else if (!this.checkPossibleMoves()) {
          this.showGameOverMessage('Game Over!', 'lose-message');
          this.gameActive = false;
          this.endGame();
        }
      }, 150);
    }
  }

  // Define the move method
  move(direction) {
    switch (direction) {
      case 'up':
        return this.moveUp();
      case 'down':
        return this.moveDown();
      case 'left':
        return this.moveLeft();
      case 'right':
        return this.moveRight();
      default:
        return false;
    }
  }

  // Move tiles up
  moveUp() {
    let moved = false;
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 1; row < this.gridSize; row++) {
        if (this.grid[row][col] !== 0) {
          let currentRow = row;
          while (currentRow > 0 && this.grid[currentRow - 1][col] === 0) {
            this.grid[currentRow - 1][col] = this.grid[currentRow][col];
            this.grid[currentRow][col] = 0;
            currentRow--;
            moved = true;
          }
          if (currentRow > 0 && this.grid[currentRow - 1][col] === this.grid[currentRow][col]) {
            this.grid[currentRow - 1][col] *= 2;
            this.score += this.grid[currentRow - 1][col];
            this.grid[currentRow][col] = 0;
            moved = true;
          }
        }
      }
    }
    if (moved) {
      this.renderGrid();
    }
    return moved;
  }

  // Move tiles down
  moveDown() {
    let moved = false;
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = this.gridSize - 2; row >= 0; row--) {
        if (this.grid[row][col] !== 0) {
          let currentRow = row;
          while (currentRow < this.gridSize - 1 && this.grid[currentRow + 1][col] === 0) {
            this.grid[currentRow + 1][col] = this.grid[currentRow][col];
            this.grid[currentRow][col] = 0;
            currentRow++;
            moved = true;
          }
          if (currentRow < this.gridSize - 1 && this.grid[currentRow + 1][col] === this.grid[currentRow][col]) {
            this.grid[currentRow + 1][col] *= 2;
            this.score += this.grid[currentRow + 1][col];
            this.grid[currentRow][col] = 0;
            moved = true;
          }
        }
      }
    }
    if (moved) {
      this.renderGrid();
    }
    return moved;
  }

  // Move tiles left
  moveLeft() {
    let moved = false;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 1; col < this.gridSize; col++) {
        if (this.grid[row][col] !== 0) {
          let currentCol = col;
          while (currentCol > 0 && this.grid[row][currentCol - 1] === 0) {
            this.grid[row][currentCol - 1] = this.grid[row][currentCol];
            this.grid[row][currentCol] = 0;
            currentCol--;
            moved = true;
          }
          if (currentCol > 0 && this.grid[row][currentCol - 1] === this.grid[row][currentCol]) {
            this.grid[row][currentCol - 1] *= 2;
            this.score += this.grid[row][currentCol - 1];
            this.grid[row][currentCol] = 0;
            moved = true;
          }
        }
      }
    }
    if (moved) {
      this.renderGrid();
    }
    return moved;
  }

  // Move tiles right
  moveRight() {
    let moved = false;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = this.gridSize - 2; col >= 0; col--) {
        if (this.grid[row][col] !== 0) {
          let currentCol = col;
          while (currentCol < this.gridSize - 1 && this.grid[row][currentCol + 1] === 0) {
            this.grid[row][currentCol + 1] = this.grid[row][currentCol];
            this.grid[row][currentCol] = 0;
            currentCol++;
            moved = true;
          }
          if (currentCol < this.gridSize - 1 && this.grid[row][currentCol + 1] === this.grid[row][currentCol]) {
            this.grid[row][currentCol + 1] *= 2;
            this.score += this.grid[row][currentCol + 1];
            this.grid[row][currentCol] = 0;
            moved = true;
          }
        }
      }
    }
    if (moved) {
      this.renderGrid();
    }
    return moved;
  }

  // Define the checkGameOver method
  checkGameOver() {
    // Check if there are no available moves left
    if (!this.checkPossibleMoves()) {
      this.showGameOverMessage('Game Over!', 'lose-message');
      this.gameActive = false;
      this.endGame();
      return true;
    }
    return false;
  }

  // Check if the game is won
  checkGameWon() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === this.winningTile) {
          return true;
        }
      }
    }
    return false;
  }

  // Show game over message
  showGameOverMessage(message, className) {
    const gameOverOverlay = this.shadowRoot.getElementById('game-over-overlay');
    const gameOverMessage = this.shadowRoot.getElementById('game-over-message');

    gameOverMessage.textContent = message;
    gameOverMessage.className = `game-over-message ${className}`;
    gameOverOverlay.classList.add('active');
  }

  // End the game
  endGame() {
    this.gameActive = false;
    this.bestScore = Math.max(this.bestScore, this.score);
    this.shadowRoot.getElementById('best-score').textContent = this.bestScore;

    // Update final score and stats
    this.shadowRoot.getElementById('final-score').textContent = this.score;
    this.shadowRoot.getElementById('highest-tile').textContent = this.getHighestTile();
    this.shadowRoot.getElementById('total-moves').textContent = this.moves;

    // Switch to game over screen
    this.shadowRoot.getElementById('game-screen').style.display = 'none';
    this.shadowRoot.getElementById('game-over-screen').style.display = 'block';
  }

  // Get the highest tile value
  getHighestTile() {
    let highest = 0;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] > highest) {
          highest = this.grid[i][j];
        }
      }
    }
    return highest;
  }
}

// Define the custom element
customElements.define('game-component', GameComponent);
