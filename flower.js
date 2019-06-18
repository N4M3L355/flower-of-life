
let config = {    //this won't stay constant like in original code, but config things are in config

    // The amount of circles around each "center"
    // For the flower of life this is 6, but other values can give interesting shapes too
    nodes: 6,

    // The distance between the circles
    // If set to `null`, will be automatically determined based on screen size
    rads: null,

    // How many levels deep do we keep creating "circles around centers"
    // If set to `null`, will be automatically determined based on screen size
    maxLevel: null,

    // The lower this number, the bigger the circles become when you move down with your mouse
    mouseYDivider: 2,

    noiseUsed: "original"

};



let moved = false;
let rings = [];
let grow = 3;
let colorShiftDirection = 1;
let mouseOffsetX = 0;
let mouseOffsetY = 0;



new p5((sketch) => {

    sketch.setup = () => {

        sketch.colorMode(sketch.HSB);
        sketch.noFill();
        document.addEventListener('dblclick', () => sketch.fullscreen(!sketch.fullscreen()));


        let largestScreenDimension = Math.max(sketch.windowWidth, sketch.windowHeight);

        if (!config.rads) {

            let dividingFactor = largestScreenDimension > 1000?5:3;

            config.rads = Math.round(largestScreenDimension / dividingFactor);

        }

        config.maxLevel = config.maxLevel||Math.min(7,Math.round(largestScreenDimension / config.rads) - 1);


        const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);

        recreateRings();
        flipGrowDirection();
        colorShiftFlipper();
        moveMouseAutomatically();

    };

    sketch.windowResized = () => {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
        recreateRings();
    };

    sketch.draw = () => {

        sketch.background(0, 0, 0, 0.08);

        rings.map(ring => ring.draw());

    };


    let intensity = 128;

    sketch.mouseWheel = (event) => {

        config.rads = sketch.constrain(config.rads-event.delta,0,500);
        recreateRings()

    };


    function recreateRings() {

        const startX = sketch.width / 2;
        const startY = sketch.height / 2;
        const addedCoords = [];

        rings = [];
        rings.push(new Circle(startX, startY, config.rads));

        function makeRings(x, y, level) {

            level = level || 0;

            for(let i = 0; i < config.nodes; i++) {

                let newX = x + config.rads / 2 * sketch.cos(2 * Math.PI * i / config.nodes);
                let newY = y + config.rads / 2 * sketch.sin(2 * Math.PI * i / config.nodes);

                let coords = newX + ',' + newY;

                if (addedCoords.indexOf(coords) === -1) {
                    rings.push(new Circle(newX, newY, config.rads));
                    addedCoords.push(coords)
                }

                if (level < config.maxLevel) {
                    makeRings(newX, newY, level + 1)
                }
            }
        }

        makeRings(startX, startY)

    }


    class Circle {

        constructor(x, y, r) {
            this.x = x;
            this.y = y;
            this.r = r;
        }

        draw() {
            let color = sketch.map(sketch.mouseX, 0, sketch.width, 0, 255);
            sketch.stroke(color, 150, intensity);
            sketch.ellipse(this.x, this.y, sketch.mouseY / config.mouseYDivider, sketch.mouseY / config.mouseYDivider);
            moved = false;
        }

    }

    function flipGrowDirection() {
        grow = Math.random() < .5;
        setTimeout(flipGrowDirection, sketch.random(400, 1200));
    }

    function colorShiftFlipper() {
        colorShiftDirection = sketch.random([-1, 1]);
        setTimeout(colorShiftFlipper, sketch.random(400, 1200));
    }

    function moveMouseAutomatically() {

        sketch.mouseY += grow?2:-2;
        sketch.mouseX += colorShiftDirection * sketch.width / 64;

    }

    setInterval(moveMouseAutomatically,50);

}, "container");
