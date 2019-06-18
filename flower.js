// The amount of circles around each "center"
// For the flower of life this is 6, but other values can give interesting shapes too
const nodes = 6;

// The distance between the circles
// If set to `null`, will be automatically determined based on screen size
let rads = null;

// How many levels deep do we keep creating "circles around centers"
// If set to `null`, will be automatically determined based on screen size
let maxLevel = null;

// The lower this number, the bigger the circles become when you move down with your mouse
const mouseYDivider = 2;

let moved = false;
let rings = [];
let grow = 3;
let colorShiftDirection = 1;


new p5((sketch) => {

    sketch.setup = () => {

        sketch.colorMode(sketch.HSB);
        sketch.noFill();
        document.addEventListener('dblclick', () => sketch.fullscreen(!sketch.fullscreen()));


        let largestScreenDimension = Math.max(sketch.windowWidth, sketch.windowHeight);

        if (!rads) {

            let dividingFactor = largestScreenDimension > 1000?5:3;

            rads = Math.round(largestScreenDimension / dividingFactor);

        }

        if (!maxLevel) {
            maxLevel = Math.min(7,Math.round(largestScreenDimension / rads) - 1);
        }

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

        rads = sketch.constrain(rads-event.delta,0,500);
        recreateRings()

    };


    function recreateRings() {

        const startX = sketch.width / 2;
        const startY = sketch.height / 2;
        const addedCoords = [];

        rings = [];
        rings.push(new Circle(startX, startY, rads));

        function makeRings(x, y, level) {

            level = level || 0;

            for(let i = 0; i < nodes; i++) {

                let newX = x + rads / 2 * sketch.cos(2 * Math.PI * i / nodes);
                let newY = y + rads / 2 * sketch.sin(2 * Math.PI * i / nodes);

                let coords = newX + ',' + newY;

                if (addedCoords.indexOf(coords) === -1) {
                    rings.push(new Circle(newX, newY, rads));
                    addedCoords.push(coords)
                }

                if (level < maxLevel) {
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
            sketch.ellipse(this.x, this.y, sketch.mouseY / mouseYDivider, sketch.mouseY / mouseYDivider);
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

        if (sketch.mouseX < 0 || sketch.mouseX > sketch.width) {
            sketch.constrain(sketch.mouseX,0,sketch.width);
            colorShiftDirection = !colorShiftDirection;
        }

        sketch.constrain(sketch.mouseY,0,sketch.height);
    }

    setInterval(moveMouseAutomatically,50);

}, "container");
