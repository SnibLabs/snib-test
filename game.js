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
    }

    tryShoot() {
        if (this.cooldown === 0) {
            this.cooldown = 18;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

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
window.Enemy = class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 22;
        this.type = type; // 'iceking', 'lemongrab', 'marceline'
        this.speed = randRange(1.2, 2.2);
        this.alive = true;
        this.angle = randRange(0, Math.PI*2);
        this.osc = randRange(0, Math.PI*2);
        this.shootTimer = randRange(50, 140);
    }

    update() {
        this.y += this.speed;
        this.angle += 0.03 + Math.random()*0.02;
        this.x += Math.sin(this.angle) * 0.9;
        this.shootTimer--;
        if (this.y > 690) this.alive = false;
    }

    canShoot() {
        return this.shootTimer <= 0 && (this.type === 'iceking' || this.type === 'marceline');
    }

    resetShoot() {
        this.shootTimer = randRange(70, 130);
    }

    draw(ctx, time) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.type === 'iceking') {
            // Body
            let grad = ctx.createLinearGradient(-18,-25,18,40);
            grad.addColorStop(0.2, "#e1f5fe");
            grad.addColorStop(0.5, "#1976d2");
            grad.addColorStop(1, "#263238");
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 29, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#29b6f6";
            ctx.shadowBlur = 8;
            ctx.fill();

            // Beard
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, 12, 14, 16, 0, 0, Math.PI*2);
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 0.93;
            ctx.fill();

            // Nose
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.ellipse(0, -4, 4, 5, 0, 0, Math.PI*2);
            ctx.fillStyle = "#ffb300";
            ctx.fill();

            // Eyes & pupils
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.ellipse(-6, -9, 3.2, 3.6, 0, 0, Math.PI*2);
            ctx.ellipse(6, -9, 3.2, 3.6, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#0288d1";
            ctx.beginPath();
            ctx.arc(-6, -9, 1.3, 0, Math.PI*2);
            ctx.arc(6, -9, 1.3, 0, Math.PI*2);
            ctx.fill();

            // Crown
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-10, -28);
            ctx.lineTo(-4, -19);
            ctx.lineTo(0, -32);
            ctx.lineTo(4, -19);
            ctx.lineTo(10, -28);
            ctx.lineTo(0, -36);
            ctx.closePath();
            ctx.fillStyle = "#ffb300";
            ctx.shadowColor = "#ffd600";
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.restore();

        } else if (this.type === 'lemongrab') {
            // Body
            let grad = ctx.createRadialGradient(0,0,8,0,0,25);
            grad.addColorStop(0, "#fffde7");
            grad.addColorStop(0.6, "#fff176");
            grad.addColorStop(1, "#fbc02d");
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 27, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#fffde7";
            ctx.shadowBlur = 8;
            ctx.fill();

            // Face
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -7, 12, 11, 0, 0, Math.PI*2);
            ctx.fillStyle = '#fffde7';
            ctx.fill();

            // Nose (pointy)
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, -9);
            ctx.lineTo(0, -3);
            ctx.lineTo(7, -8);
            ctx.closePath();
            ctx.fillStyle = "#fbc02d";
            ctx.restore();
            ctx.fill();

            // Eyes
            ctx.fillStyle = "#666";
            ctx.beginPath();
            ctx.arc(-4, -10, 1.3, 0, Math.PI*2);
            ctx.arc(4, -10, 1.3, 0, Math.PI*2);
            ctx.fill();

            // Mouth
            ctx.strokeStyle = "#795548";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-2, -5.5);
            ctx.lineTo(0, -6.5);
            ctx.lineTo(2, -5.5);
            ctx.stroke();

        } else if (this.type === 'marceline') {
            // Body
            let grad = ctx.createRadialGradient(0,0,8,0,0,23);
            grad.addColorStop(0, "#e1bee7");
            grad.addColorStop(0.6, "#8e24aa");
            grad.addColorStop(1, "#4527a0");
            ctx.beginPath();
            ctx.ellipse(0, 0, 19, 24, 0, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#fff59d";
            ctx.shadowBlur = 7;
            ctx.fill();

            // Face
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(0, -7, 12, 10, 0, 0, Math.PI*2);
            ctx.fillStyle = '#fffde7';
            ctx.fill();

            // Eyes (red dots)
            ctx.fillStyle = "#e53935";
            ctx.beginPath();
            ctx.arc(-4, -9, 1.2, 0, Math.PI*2);
            ctx.arc(4, -9, 1.2, 0, Math.PI*2);
            ctx.fill();

            // Fangy smile
            ctx.strokeStyle = "#222";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-3, -4);
            ctx.quadraticCurveTo(0, -2, 3, -4);
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.fillRect(-1.5, -3.5, 1, 2);
            ctx.fillRect(0.5, -3.5, 1, 2);

            // Hair (wavy)
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-15, -17);
            ctx.bezierCurveTo(-23, 0, -10, 24, 1, 20);
            ctx.bezierCurveTo(11, 24, 21, 0, 12, -17);
            ctx.closePath();
            ctx.globalAlpha = 0.22 + 0.05 * Math.sin(time/17 + this.osc);
            ctx.fillStyle = "#212121";
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
};

// ==== PARTICLE EFFECTS ====
window.Particle = class Particle {
    constructor(x, y, color, vx, vy, r, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.radius = r;
        this.life = life;
        this.maxLife = life;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04;
        this.life--;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life/this.maxLife;
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
            if (this._collide(b, this.player, 2)) {
                b.alive = false;
                this._burst(this.player.x, this.player.y, this.player.skin);
                setTimeout(() => this.gameOver(), 300);
            }
        }
        // Collision: enemies vs player
        for (let e of this.enemies) {
            if (this._collide(e, this.player, 2)) {
                this._burst(this.player.x, this.player.y, this.player.skin);
                setTimeout(() => this.gameOver(), 300);
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