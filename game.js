// ==== UTILITY FUNCTIONS ====
(function() {
    window.randRange = function(min, max) {
        return Math.random() * (max - min) + min;
    };
    window.clamp = function(val, min, max) {
        return Math.max(min, Math.min(max, val));
    };
})();

// ==== PLAYER ====
window.Player = class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 28;
        this.speed = 5.2;
        this.cooldown = 0; // shoot cooldown in frames
        this.colorStops = [
            {stop: 0, color: "#ffe082"},
            {stop: 0.7, color: "#ffd600"},
            {stop: 1, color: "#fffde7"}
        ];
        this.left = false;
        this.right = false;
        this.shoot = false;
        this.skin = Math.random() < 0.5 ? 'finn' : 'jake'; // for variety

        // --- Abilities ---
        this.abilities = [
            {
                name: "Burst Shot",
                key: "KeyE",
                cooldown: 300, // in frames (~5s)
                timer: 0,
                description: "Shoot a burst of 5 bullets in a spread."
            },
            {
                name: "Shield",
                key: "KeyQ",
                cooldown: 600, // in frames (~10s)
                timer: 0,
                description: "Become invulnerable for 2 seconds."
            }
        ];
        this.shieldActive = false;
        this.shieldTimer = 0;
    }

    move(dir, width) {
        if (dir === 'left') this.x -= this.speed;
        if (dir === 'right') this.x += this.speed;
        this.x = clamp(this.x, this.radius + 4, width - this.radius - 4);
    }

    update(width) {
        if (this.left) this.move('left', width);
        if (this.right) this.move('right', width);
        if (this.cooldown > 0) this.cooldown--;

        // Update abilities cooldowns and shield
        for (let ab of this.abilities) {
            if (ab.timer > 0) ab.timer--;
        }
        if (this.shieldActive) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }
    }

    tryShoot() {
        if (this.cooldown === 0) {
            this.cooldown = 18;
            return true;
        }
        return false;
    }

    tryAbility(idx, gameManager) {
        let ab = this.abilities[idx];
        if (ab && ab.timer === 0) {
            // Activate ability
            if (ab.name === "Burst Shot") {
                // 5 bullets in a spread
                let spread = [-0.30, -0.15, 0, 0.15, 0.30];
                for (let i = 0; i < 5; i++) {
                    let angle = spread[i];
                    let speed = -7;
                    let dx = Math.sin(angle) * 5;
                    gameManager.bullets.push(
                        new window.Bullet(this.x + dx * 2, this.y - 34, speed * Math.cos(angle), "#ffb300", true)
                    );
                }
            } else if (ab.name === "Shield") {
                this.shieldActive = true;
                this.shieldTimer = 120; // 2 seconds at 60fps
            }
            ab.timer = ab.cooldown;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw shield if active
        if (this.shieldActive) {
            ctx.save();
            ctx.globalAlpha = 0.32 + 0.08*Math.sin(Date.now()/120);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI*2);
            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 6;
            ctx.shadowColor = "#b3e5fc";
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.restore();
        }

        // Shape: Finn or Jake
        if (this.skin === 'finn') {
            // Body
            let grad = ctx.createRadialGradient(0,-8,8,0,0,30);
            grad.addColorStop(0, "#fffde7");
            grad.addColorStop(0.7, "#b3e5fc");
            grad.addColorStop(1, "#0288d1");
            ctx.beginPath();
            ctx.ellipse(0, 0, 27, 34, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 9;
            ctx.fill();

            // Face (Finn's face)
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -10, 15, 13, 0, 0, Math.PI*2);
            ctx.fillStyle = '#ffe082';
            ctx.fill();

            // Hood
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, -13, 17, 15, 0, 0, Math.PI*2);
            ctx.clip();
            ctx.beginPath();
            ctx.ellipse(0, -16, 16, 13, 0, 0, Math.PI*2);
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 0.95;
            ctx.fill();
            ctx.restore();

            // Ears
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.ellipse(-12, -24, 5, 7, 0, 0, Math.PI*2);
            ctx.ellipse(12, -24, 5, 7, 0, 0, Math.PI*2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = "#333";
            ctx.beginPath();
            ctx.arc(-5, -11, 1.6, 0, Math.PI*2);
            ctx.arc(5, -11, 1.6, 0, Math.PI*2);
            ctx.fill();

            // Smile
            ctx.strokeStyle = "#795548";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -7.5, 5, Math.PI*0.1, Math.PI*0.9, false);
            ctx.stroke();
        } else { // Jake
            // Body
            let grad = ctx.createRadialGradient(0,-10,6,0,0,30);
            grad.addColorStop(0, "#ffeb3b");
            grad.addColorStop(0.7, "#ffb300");
            grad.addColorStop(1, "#ffa000");
            ctx.beginPath();
            ctx.ellipse(0, 0, 27, 32, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#ffecb3";
            ctx.shadowBlur = 9;
            ctx.fill();

            // Face
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -8, 15, 12, 0, 0, Math.PI*2);
            ctx.fillStyle = '#ffe082';
            ctx.fill();

            // Eyes
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(-5.3, -10, 3.2, 0, Math.PI*2);
            ctx.arc(5.3, -10, 3.2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#333";
            ctx.beginPath();
            ctx.arc(-5.3, -10, 1.2, 0, Math.PI*2);
            ctx.arc(5.3, -10, 1.2, 0, Math.PI*2);
            ctx.fill();

            // Nose
            ctx.beginPath();
            ctx.ellipse(0, -7, 2.3, 1.3, 0, 0, Math.PI*2);
            ctx.fillStyle = "#795548";
            ctx.fill();

            // Smile
            ctx.strokeStyle = "#795548";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -5.5, 5, Math.PI*0.05, Math.PI*0.95, false);
            ctx.stroke();

            // Ears
            ctx.save();
            ctx.fillStyle = "#ffb300";
            ctx.rotate(-0.25);
            ctx.beginPath();
            ctx.ellipse(-13, -18, 5, 8, 0.5, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#ffb300";
            ctx.rotate(0.25);
            ctx.beginPath();
            ctx.ellipse(13, -18, 5, 8, -0.5, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
};

// ==== BULLET ====
window.Bullet = class Bullet {
    constructor(x, y, vy, color, isPlayer) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.vy = vy;
        this.color = color;
        this.isPlayer = !!isPlayer;
        this.alive = true;
    }

    update() {
        this.y += this.vy;
        if (this.y < -30 || this.y > 700) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        let grad = ctx.createRadialGradient(0,0,1,0,0,8);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "#fffde7");
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2);
        ctx.fillStyle = grad;
        ctx.shadowColor = this.isPlayer ? "#fff" : "#c62828";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
    }
};

// ==== ENEMY ====
// Define the Enemy class and attach to window
window.Enemy = class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 28;
        this.type = type; // 'iceking', 'lemongrab', 'marceline'
        this.alive = true;
        this.speed = 1.8 + randRange(0, 0.9);
        this.shootCooldown = 60 + Math.floor(randRange(0, 80));
        this.shootTimer = this.shootCooldown;
        // color/skin can be used for drawing
    }

    update() {
        this.y += this.speed;
        this.shootTimer--;
        if (this.y > 700) this.alive = false;
    }

    canShoot() {
        return this.shootTimer <= 0;
    }

    resetShoot() {
        this.shootTimer = this.shootCooldown + Math.floor(randRange(-12, 28));
    }

    draw(ctx, t) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Animate: simple bob
        let bob = Math.sin((this.x + t*3) * 0.022) * 3;

        if (this.type === 'iceking') {
            // Body
            let grad = ctx.createRadialGradient(0, -7, 8, 0, 0, 31);
            grad.addColorStop(0, "#fff");
            grad.addColorStop(0.6, "#b3e5fc");
            grad.addColorStop(1, "#1976d2");
            ctx.beginPath();
            ctx.ellipse(0, 0 + bob, 27, 34, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#90caf9";
            ctx.shadowBlur = 8;
            ctx.fill();

            // Face
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -9 + bob, 15, 13, 0, 0, Math.PI*2);
            ctx.fillStyle = '#ffe082';
            ctx.fill();

            // Crown
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-12, -29 + bob);
            ctx.lineTo(-7, -39 + bob);
            ctx.lineTo(0, -31 + bob - Math.abs(Math.sin(t/11))*6);
            ctx.lineTo(7, -39 + bob);
            ctx.lineTo(12, -29 + bob);
            ctx.closePath();
            ctx.fillStyle = "#ffd600";
            ctx.shadowColor = "#ffd600";
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();

            // Eyes
            ctx.fillStyle = "#1976d2";
            ctx.beginPath();
            ctx.arc(-5.5, -11 + bob, 1.3, 0, Math.PI*2);
            ctx.arc(5.5, -11 + bob, 1.3, 0, Math.PI*2);
            ctx.fill();

            // Smile
            ctx.strokeStyle = "#795548";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -7 + bob, 5, Math.PI*0.1, Math.PI*0.9, false);
            ctx.stroke();
        } else if (this.type === 'lemongrab') {
            // Body
            let grad = ctx.createRadialGradient(0, -8, 7, 0, 0, 28);
            grad.addColorStop(0, "#fffde7");
            grad.addColorStop(0.6, "#fff176");
            grad.addColorStop(1, "#fbc02d");
            ctx.beginPath();
            ctx.ellipse(0, 0 + bob, 24, 31, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#fffde7";
            ctx.shadowBlur = 8;
            ctx.fill();

            // Face
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -8 + bob, 13, 11, 0, 0, Math.PI*2);
            ctx.fillStyle = '#fffde7';
            ctx.fill();

            // Eyes
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.arc(-4.5, -10 + bob, 1.1, 0, Math.PI*2);
            ctx.arc(4.5, -10 + bob, 1.1, 0, Math.PI*2);
            ctx.fill();

            // Mouth (frown)
            ctx.strokeStyle = "#795548";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -5.5 + bob, 4, Math.PI*1.1, Math.PI*1.9, false);
            ctx.stroke();

            // Nose (lemony)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, -9 + bob, 2, 4, 0, 0, Math.PI*2);
            ctx.fillStyle = "#fbc02d";
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'marceline') {
            // Body
            let grad = ctx.createRadialGradient(0, -8, 7, 0, 0, 30);
            grad.addColorStop(0, "#fffde7");
            grad.addColorStop(0.6, "#e1bee7");
            grad.addColorStop(1, "#8e24aa");
            ctx.beginPath();
            ctx.ellipse(0, 0 + bob, 24, 31, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#ce93d8";
            ctx.shadowBlur = 8;
            ctx.fill();

            // Face
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -8 + bob, 13, 11, 0, 0, Math.PI*2);
            ctx.fillStyle = '#fffde7';
            ctx.fill();

            // Eyes (red)
            ctx.fillStyle = "#d32f2f";
            ctx.beginPath();
            ctx.arc(-4.5, -10 + bob, 1.2, 0, Math.PI*2);
            ctx.arc(4.5, -10 + bob, 1.2, 0, Math.PI*2);
            ctx.fill();

            // Smile (fangs)
            ctx.strokeStyle = "#795548";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -7.5 + bob, 5, Math.PI*0.1, Math.PI*0.9, false);
            ctx.stroke();

            // Fangs
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.moveTo(-2, -4 + bob);
            ctx.lineTo(-1, -2 + bob);
            ctx.lineTo(0, -4 + bob);
            ctx.closePath();
            ctx.moveTo(2, -4 + bob);
            ctx.lineTo(1, -2 + bob);
            ctx.lineTo(0, -4 + bob);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Hair
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(-9, -13 + bob, 8, 12, 0.3, 0, Math.PI*2);
            ctx.ellipse(9, -13 + bob, 8, 12, -0.3, 0, Math.PI*2);
            ctx.fillStyle = "#6d4c41";
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.restore();
        } else {
            // Default: gray blob
            ctx.beginPath();
            ctx.ellipse(0, 0 + bob, 24, 31, 0, 0, Math.PI*2);
            ctx.fillStyle = "#ccc";
            ctx.fill();
        }

        ctx.restore();
    }
};

// ==== PARTICLE EFFECTS ====
// (Unchanged, see above)
window.Particle = class Particle {
    constructor(x, y, color, vx, vy, radius, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.985;
        this.vy *= 0.985;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
    }
};

// ==== GAME MANAGER ====
// (Unchanged, see above)
window.GameManager = class GameManager {
    constructor(canvas, uiLayer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.uiLayer = uiLayer;
        this.width = canvas.width;
        this.height = canvas.height;
        this.state = "menu"; // menu, playing, gameover
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.level = 1;
        this.time = 0;
        this.spawnTimer = 0;
        this.enemyTypes = ['iceking', 'lemongrab', 'marceline'];
        this.input = { left: false, right: false, shoot: false };
        this.errorMsg = '';

        this._bindUI();
        this._bindInput();
        this.render();
    }

    _bindUI() {
        try {
            this.mainMenu = document.getElementById('mainMenu');
            this.gameOverMenu = document.getElementById('gameOverMenu');
            this.startBtn = document.getElementById('startBtn');
            this.restartBtn = document.getElementById('restartBtn');
            this.finalScoreEl = document.getElementById('finalScore');
            this.startBtn.addEventListener('click', () => this.startGame());
            this.restartBtn.addEventListener('click', () => this.startGame());
        } catch (e) {
            this.errorMsg = 'UI elements missing';
        }
    }

    _bindInput() {
        window.addEventListener('keydown', e => {
            if (this.state !== 'playing') return;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
            if (e.code === 'Space') this.input.shoot = true;

            // Abilities
            if (this.player) {
                // Q for Shield, E for Burst Shot
                if (e.code === "KeyQ") this.player.tryAbility(1, this);
                if (e.code === "KeyE") this.player.tryAbility(0, this);
            }
        });
        window.addEventListener('keyup', e => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
            if (e.code === 'Space') this.input.shoot = false;
        });
        // Touch controls (rudimentary)
        this.canvas.addEventListener('touchstart', e => {
            let rect = this.canvas.getBoundingClientRect();
            for (let i = 0; i < e.touches.length; i++) {
                let tx = e.touches[i].clientX - rect.left;
                if (tx < this.width/2) this.input.left = true;
                else this.input.right = true;
            }
            this.input.shoot = true;
        });
        this.canvas.addEventListener('touchend', e => {
            this.input.left = false;
            this.input.right = false;
            this.input.shoot = false;
        });
    }

    startGame() {
        this.state = "playing";
        this.player = new window.Player(this.width/2, this.height-66);
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.level = 1;
        this.time = 0;
        this.spawnTimer = 0;
        this._showMenu('none');
    }

    gameOver() {
        this.state = "gameover";
        if (this.finalScoreEl)
            this.finalScoreEl.textContent = "Score: " + this.score;
        this._showMenu('gameover');
    }

    _showMenu(which) {
        if (!this.mainMenu || !this.gameOverMenu) return;
        this.mainMenu.classList.remove('active');
        this.gameOverMenu.classList.remove('active');
        if (which === 'menu') this.mainMenu.classList.add('active');
        if (which === 'gameover') this.gameOverMenu.classList.add('active');
    }

    _spawnEnemy() {
        let etype = this.enemyTypes[Math.floor(randRange(0, this.enemyTypes.length))];
        let ex = randRange(38, this.width-38);
        let ey = -30;
        this.enemies.push(new window.Enemy(ex, ey, etype));
    }

    update() {
        if (this.state !== "playing") return;

        this.time++;
        // Difficulty scaling
        let spawnDelay = clamp(60 - this.level*3, 18, 60);
        if (this.spawnTimer-- <= 0) {
            this._spawnEnemy();
            this.spawnTimer = spawnDelay + Math.floor(randRange(-10, 10));
        }
        // Level up
        if (this.time % 900 === 0) this.level++;

        // Player update
        if (this.player) {
            this.player.left = this.input.left;
            this.player.right = this.input.right;
            this.player.update(this.width);
            if (this.input.shoot && this.player.tryShoot()) {
                this.bullets.push(new window.Bullet(this.player.x, this.player.y-34, -7, "#ffb300", true));
            }
        }

        // Bullets update
        for (let b of this.bullets) b.update();
        this.bullets = this.bullets.filter(b => b.alive);

        // Enemies update
        for (let e of this.enemies) {
            e.update();

            // Enemy shooting
            if (e.canShoot()) {
                this.bullets.push(new window.Bullet(e.x, e.y+28, randRange(3,5), "#0288d1", false));
                e.resetShoot();
            }
        }
        this.enemies = this.enemies.filter(e => e.alive);

        // Particle update
        for (let p of this.particles) p.update();
        this.particles = this.particles.filter(p => p.life > 0);

        // Collision: bullets vs enemies
        for (let b of this.bullets) {
            if (!b.isPlayer) continue;
            for (let e of this.enemies) {
                if (this._collide(b, e, 0)) {
                    b.alive = false;
                    e.alive = false;
                    this.score += 10;
                    this._burst(e.x, e.y, e.type);
                    break;
                }
            }
        }
        // Collision: enemy bullets vs player
        for (let b of this.bullets) {
            if (b.isPlayer) continue;
            if (this.player && this._collide(b, this.player, 2)) {
                if (this.player.shieldActive) {
                    b.alive = false;
                    // Small burst effect for shield impact
                    for (let i=0; i<6; i++) {
                        let ang = randRange(0, Math.PI*2);
                        let spd = randRange(1, 3);
                        this.particles.push(new window.Particle(
                            this.player.x, this.player.y,
                            "#00e5ff",
                            Math.cos(ang)*spd, Math.sin(ang)*spd,
                            randRange(2, 4), randRange(10,18)
                        ));
                    }
                } else {
                    b.alive = false;
                    this._burst(this.player.x, this.player.y, this.player.skin);
                    setTimeout(() => this.gameOver(), 300);
                }
            }
        }
        // Collision: enemies vs player
        for (let e of this.enemies) {
            if (this.player && this._collide(e, this.player, 2)) {
                if (this.player.shieldActive) {
                    e.alive = false;
                    this.score += 10;
                    this._burst(e.x, e.y, e.type);
                    // Small burst for shield
                    for (let i=0; i<6; i++) {
                        let ang = randRange(0, Math.PI*2);
                        let spd = randRange(1, 3);
                        this.particles.push(new window.Particle(
                            this.player.x, this.player.y,
                            "#00e5ff",
                            Math.cos(ang)*spd, Math.sin(ang)*spd,
                            randRange(2, 4), randRange(10,18)
                        ));
                    }
                } else {
                    this._burst(this.player.x, this.player.y, this.player.skin);
                    setTimeout(() => this.gameOver(), 300);
                }
            }
        }
    }

    _collide(a, b, fudge) {
        let dx = a.x - b.x, dy = a.y - b.y;
        let r = (a.radius||8) + (b.radius||8) - (fudge||0);
        return dx*dx + dy*dy < r*r;
    }

    _burst(x, y, type) {
        let colors;
        if (type === 'iceking') colors = ['#1976d2','#fff','#ffd600'];
        else if (type === 'lemongrab') colors = ['#fbc02d','#fffde7','#fff176'];
        else if (type === 'marceline') colors = ['#8e24aa','#fffde7','#e1bee7'];
        else if (type === 'finn') colors = ['#fff','#0288d1','#ffe082'];
        else if (type === 'jake') colors = ['#ffb300','#fffde7','#ffeb3b'];
        else colors = ['#ccc','#fff'];

        for(let i=0; i<18; i++) {
            let ang = randRange(0, Math.PI*2);
            let spd = randRange(2, 6);
            this.particles.push(new window.Particle(
                x, y,
                colors[Math.floor(randRange(0, colors.length))],
                Math.cos(ang)*spd, Math.sin(ang)*spd,
                randRange(3, 7), randRange(22,36)
            ));
        }
    }

    render() {
        try {
            // BG
            this.ctx.clearRect(0,0,this.width,this.height);
            this._drawBackground();

            if (this.errorMsg) {
                this.ctx.save();
                this.ctx.fillStyle = "#c62828";
                this.ctx.font = "bold 28px sans-serif";
                this.ctx.textAlign = "center";
                this.ctx.fillText(this.errorMsg, this.width/2, this.height/2);
                this.ctx.restore();
                return;
            }

            if (this.state === "menu") {
                this._drawTitleScreen();
            }

            if (this.state === "playing" && this.player) {
                this.player.draw(this.ctx);
                for (let b of this.bullets) b.draw(this.ctx);
                for (let e of this.enemies) e.draw(this.ctx, this.time);
                for (let p of this.particles) p.draw(this.ctx);

                // Score UI
                this.ctx.save();
                this.ctx.font = "bold 22px Comic Sans MS, Comic Sans, cursive";
                this.ctx.fillStyle = "#fffde7";
                this.ctx.strokeStyle = "#0288d1";
                this.ctx.lineWidth = 3;
                this.ctx.textAlign = "left";
                this.ctx.strokeText("Score: " + this.score, 18, 38);
                this.ctx.fillText("Score: " + this.score, 18, 38);

                // Abilities UI
                let abilityY = 64;
                let abFont = "14px Comic Sans MS, Comic Sans, cursive";
                for (let i = 0; i < this.player.abilities.length; i++) {
                    let ab = this.player.abilities[i];
                    let ready = ab.timer === 0;
                    let cd = ab.timer > 0 ? Math.ceil(ab.timer/60) : 0;
                    // Show key, name, cooldown
                    let txt = `[${ab.key.replace("Key", "")}] ${ab.name}` + (ready ? "" : ` (${cd}s)`);
                    this.ctx.font = abFont;
                    this.ctx.globalAlpha = ready ? 1 : 0.5;
                    this.ctx.fillStyle = ready ? "#43a047" : "#888";
                    this.ctx.fillText(txt, 20, abilityY + i*22);
                    this.ctx.globalAlpha = 1;
                }
                this.ctx.restore();
            }
            if (this.state === "gameover") {
                for (let p of this.particles) p.draw(this.ctx);
            }
        } catch (e) {
            this.ctx.clearRect(0,0,this.width,this.height);
            this.ctx.save();
            this.ctx.fillStyle = "#d32f2f";
            this.ctx.font = "bold 22px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText('Game Error: ' + e.message, this.width/2, this.height/2);
            this.ctx.restore();
        }
        requestAnimationFrame(() => this.loop());
    }

    loop() {
        if (this.state === "playing") this.update();
        this.render();
    }

    _drawTitleScreen() {
        // Subtle animated BG - floating clouds
        let t = this.time/60;
        for(let i=0; i<6; i++) {
            let x = this.width * ((i*1.7 + Math.sin(t+i/2)*0.3)%1);
            let y = 80 + Math.sin(t*0.4 + i)*15 + i*60;
            this.ctx.save();
            this.ctx.globalAlpha = 0.18 + 0.07*Math.sin(t+i);
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 60+15*Math.sin(t+i*3), 32+10*Math.cos(t+i*2), 0, 0, Math.PI*2);
            this.ctx.fillStyle = "#fff";
            this.ctx.shadowColor = "#fff";
            this.ctx.shadowBlur = 18;
            this.ctx.fill();
            this.ctx.restore();
        }
        this.ctx.save();
        this.ctx.font = "bold 38px Comic Sans MS, Comic Sans, cursive";
        this.ctx.fillStyle = "#ffb300";
        this.ctx.textAlign = "center";
        this.ctx.shadowColor = "#fff59d";
        this.ctx.shadowBlur = 12;
        this.ctx.fillText("Adventure Time", this.width/2, 130);
        this.ctx.font = "bold 32px Comic Sans MS, Comic Sans, cursive";
        this.ctx.fillStyle = "#0288d1";
        this.ctx.shadowColor = "#b3e5fc";
        this.ctx.fillText("Space Shooter", this.width/2, 178);

        // Show abilities info
        this.ctx.font = "18px Comic Sans MS, Comic Sans, cursive";
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = "#222";
        this.ctx.fillText("Abilities:", this.width/2, 240);
        let abList = [
            "[Q] Shield: Temporary invulnerability",
            "[E] Burst Shot: Shoot 5 bullets in a spread"
        ];
        this.ctx.font = "15px Comic Sans MS, Comic Sans, cursive";
        this.ctx.fillStyle = "#388e3c";
        for (let i = 0; i < abList.length; i++) {
            this.ctx.fillText(abList[i], this.width/2, 266 + i*22);
        }
        this.ctx.restore();
    }

    _drawBackground() {
        // BG gradient
        let grad = this.ctx.createLinearGradient(0,0,0,this.height);
        grad.addColorStop(0, "#b3e5fc");
        grad.addColorStop(0.7, "#fffde7");
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0,0,this.width,this.height);

        // Stars (procedural, animated)
        let t = this.time/60;
        for (let i=0; i<22; i++) {
            let x = ((i*79 + Math.sin(t+i)*90) % this.width);
            let y = (((i*31 + t*30 + Math.cos(t+i)*17)%this.height));
            this.ctx.save();
            this.ctx.globalAlpha = 0.5 + 0.5*Math.sin(t*2 + i);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1.2 + 1.6*Math.abs(Math.sin(t+i*1.3)), 0, Math.PI*2);
            this.ctx.fillStyle = "#fff";
            this.ctx.shadowColor = "#fffde7";
            this.ctx.shadowBlur = 5;
            this.ctx.fill();
            this.ctx.restore();
        }
    }
};

// ==== INIT ====
function initGame() {
    try {
        const canvas = document.getElementById('gameCanvas');
        const uiLayer = document.getElementById('uiLayer');
        if (!canvas || !uiLayer) {
            let err = document.createElement('div');
            err.textContent = "Canvas or UI missing!";
            err.style.color = "#c62828";
            err.style.fontSize = "2em";
            document.body.appendChild(err);
            return;
        }
        window.mainGame = new window.GameManager(canvas, uiLayer);
        window.mainGame._showMenu('menu');
    } catch (e) {
        // Fallback error
        let err = document.createElement('div');
        err.textContent = "Game init failed: " + e.message;
        err.style.color = "#c62828";
        err.style.fontSize = "2em";
        document.body.appendChild(err);
    }
}
window.addEventListener('DOMContentLoaded', initGame);