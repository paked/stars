var game = new Phaser.Game(800, 608, Phaser.CANVAS, '', {preload: preload, create: create, update: update});

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'assets/baddie.png', 32, 32);
    game.load.image('tilesheet', 'assets/generic_platformer_tiles.png');
    game.load.tilemap('map', 'maps/basic.v3.json', null, Phaser.Tilemap.TILED_JSON);
}

var platforms;
var player;
var enemies;
var stars;
var scoreText;
var score;
var map;
var cursors;

function create() {
    game.stage.backgroundColor = '#47A3FF';
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // create map
    map = game.add.tilemap('map');
    map.addTilesetImage('generic', 'tilesheet');
    map.setCollisionBetween(0, 45);

    platforms = map.createLayer('Ground');
    platforms.resizeWorld();
    var stops = map.createLayer('Stoppers');
    var background = map.createLayer('Background');

    // create player
    player = new Player(game, 0, game.world.height - 150);
    game.add.existing(player);

    // create stars
    stars = game.add.group();
    stars.enableBody = true;

    for (var i = 0; i < 12; i ++) {
        var star = stars.create(i * 70, 0, 'star');
        star.body.gravity.y = 300;
        star.body.bounce.y = 0.7 + Math.random() * 0.2; 
    }

    // create score
    score = 0;
    scoreText = game.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});
    
    // create enemies
    enemies = game.add.group();
    enemies.enableBody = true;

    for (i = 0; i < 3; i ++) {
        var enemy = new Enemy(game, i * 240 + 48, 0);
        enemies.add(enemy);
    }

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(enemies, platforms);

    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, enemies, killPlayer, null, this);
}

function collectStar(player, star) {
    score += 10;

    star.kill();
    scoreText.text = 'score: ' + score;
}

function killPlayer(player, star) {
    player.kill();
    game.state.start(game.state.current);
}

Player = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'dude');
    game.physics.arcade.enable(this);

    this.x = (game.world.width - this.body.width) / 2;
    this.body.bounce.y = 0.1;
    this.body.gravity.y = 400;
    this.body.collideWorldBounds = true;

    this.animations.add('left', [0, 1, 2, 3], 10, true);
    this.animations.add('right', [5, 6, 7, 8], 10, true);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() { 
    this.body.velocity.x = 0;
    if (cursors.left.isDown) {
        this.body.velocity.x = -300;
        this.animations.play('left');
    }else if (cursors.right.isDown) {
        this.body.velocity.x = 300;
        this.animations.play('right');
    }else {
        this.animations.stop();
        this.frame = 4;
    }  

    if ((cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) && player.body.onFloor()) {
        player.body.velocity.y = -350;
    }
};

Enemy = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'enemy');
    game.physics.arcade.enable(this);
    this.body.gravity.y = 300;

    this.animations.add('right', [0, 1], 5, true);
    this.animations.add('left', [2, 3], 5, true);
    this.animations.frame = 2;
    
    this.grounded = false;

};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
    if (this.body.onFloor()) {
        if (!this.grounded) {
            this.body.velocity.x = 100;
            this.grounded = true;
            this.animations.play('left');
        }
        return;
    }

    if (!this.grounded) {
        return;
    }

    this.body.velocity.x *= -1;

    if (this.animations.currentAnim.name == 'left') {
        this.animations.play('right');
        return;
    }

    this.animations.play('left');
};

