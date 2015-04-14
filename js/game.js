var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {preload: preload, create: create, update: update});

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'assets/baddie.png', 32, 48);
}

var platforms;
var player;
var enemies;
var stars;
var scoreText;
var score;

var cursors;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // create sky
    game.add.sprite(0, 0, 'sky');

    platforms = game.add.group();
    platforms.enableBody = true;
    
    // create ground
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    ground.scale.setTo(2, 2);

    ground.body.immovable = true;
    
    // create ledges for the character to jump on!
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    
    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // create player
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

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

    for (i = 0; i < 6; i ++) {
        var enemy = enemies.create(i * 140, 0, 'enemy');
        enemy.body.gravity.y = 300;
        
        enemy.animations.add('left', [0, 1], 10, true);
    }

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(enemies, platforms);

    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    player.body.velocity.x = 0;
    if (cursors.left.isDown) {
        player.body.velocity.x = -300;
        player.animations.play('left');
    }else if (cursors.right.isDown) {
        player.body.velocity.x = 300;
        player.animations.play('right');
    }else {
        player.animations.stop();
        player.frame = 4;
    }

    if ((cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) && player.body.touching.down) {
        player.body.velocity.y = -350;
    }
}

function collectStar(player, star) {
    score += 10;

    star.kill();
    console.log(score);
    scoreText.text = 'score: ' + score;
}
