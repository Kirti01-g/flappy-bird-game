# Flappy Bird Game 🐦

A retro arcade-style 2D side-scrolling game built from scratch using vanilla web technologies. Navigate the bird through an endless obstacle course of green pipes without colliding with them or hitting the ground!

## 🚀 Features

- **Classic Gameplay Mechanics:** gravity emulation, physics-based jumping and smooth obstacle collision boxes.
- **Procedural Obstacles:** Infinite, randomly generated pipe heights ensuring no two playthroughs are the same.
- **Real-Time Score Tracker:** Increments dynamically every time the bird successfully bypasses a set of pipes.
- **Pure Web Implementation:** Lightweight and dependency-free, running directly within any modern browser viewport using the HTML5.

---

## 🛠️ Technologies Used

- **HTML5:** Used for rendering the layout, canvas element structure, and layout viewports.
- **CSS3:** Handles responsive alignment, centering the game viewport, and embedding arcade typography.
- **JavaScript (ES6+):** Governs the core game logic, physics engine loops, animation framing (`requestAnimationFrame`), state management, and event listeners.

---

## 🕹️ How to Play

1. **Start:** Launch the game by opening `index.html` in your web browser.
2. **Flap:** Click anywhere on the game area or press the **Spacebar** to make the bird flap its wings and gain altitude.
3. **Descend:** Release controls to allow gravity to pull the bird back down.
4. **Goal:** Navigate cleanly through the vertical gaps between the pipes. Hitting a pipe or falling onto the ground triggers an immediate *Game Over*.

---

## 📂 Project Directory Structure

```text
flappy-bird-game/
├──BirdPop        
│   └── style.css         # Layout styling, centering and theme aesthetics
│   └── main.js           # Core physics loop, collisions and game state mechanics
|   └── index.html        # Main application landing
└── README.md             # Project documentation (this file)
└── LICENSE               # MIT 
└── .gitgnore             # web based (self-written)

```

---

## 🔧 Installation & Running Locally

Since this project relies completely on vanilla frontend code no complex package dependencies (`npm` / `yarn`) or build tools are required.

1. **Clone the repository:**
```bash
git clone [https://github.com/Kirti01-g/flappy-bird-game.git]

```


2. **Navigate into the directory:**
```bash
cd flappy-bird-game

```


3. **Launch the application:**
* Double-click the `index.html` file to open it directly in any modern browser.
* *Alternatively*, spin up a local development environment using the VS Code "Live Server" extension for hot-reloading capabilities.



---

## 🤝 Contributing

Contributions to improve gameplay loops, introduce power-ups, add sound cues, or optimize graphics rendering are highly welcome!

1. Fork the Project repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request detailing your updates.

---

## 📄 License

Distributed under the MIT License. Feel free to modify and expand upon this codebase for your personal or commercial applications.
