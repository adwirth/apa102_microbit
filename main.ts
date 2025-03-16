namespace apa102 {
    export class p {
        private static defaultInstance: p; // Static instance for automatic usage

        NUM_PIXELS_X: number
        NUM_PIXELS_Y: number
        DAT: number
        CLK: number
        NUM_PIXELS: number
        BRIGHTNESS: number
        pixels: number[][]

        constructor() {
            this.NUM_PIXELS_X = 16;
            this.NUM_PIXELS_Y = 16;
            this.DAT = DigitalPin.P1;
            this.CLK = DigitalPin.P0;
            this.NUM_PIXELS = this.NUM_PIXELS_X * this.NUM_PIXELS_Y;
            this.BRIGHTNESS = 7;

            // Initialize pixel array
            this.pixels = this.init_pixels();
        }

        private init_pixels(): number[][] {
            let pixel_list: number[][] = [];
            for (let i = 0; i < this.NUM_PIXELS; i++) {
                pixel_list.push([100, 1, 1, this.BRIGHTNESS]);
            }
            return pixel_list;
        }

        //  Set the brightness of all pixels - 0 - 1.
        public set_brightness(brightness: number) {
            if (brightness < 0 || brightness > 1) {
            return
            }

            for (let x = 0; x < this.NUM_PIXELS; x++) {
                this.pixels[x][3] = Math.trunc(31.0 * brightness) & 0b11111
            }
        }

        //  Clear all of the pixels        
        public clear() {
            for (let x2 = 0; x2 < this.NUM_PIXELS; x2++) {
                for (let j = 0; j < 3; j++) {
                    this.pixels[x2][j] = 0
                }
            }
        }

        //  # Pulse a byte of data a bit at a time
        private write_byte(byte: number) {
            for (let k = 7; k > -1; k += -1) {
                //  MSB first
                if (byte >> k & 1) {
                    pins.digitalWritePin(this.DAT, 1)
                } else {
                    pins.digitalWritePin(this.DAT, 0)
                }

                pins.digitalWritePin(this.CLK, 1)
                pins.digitalWritePin(this.CLK, 0)
            }
        }

        //  Latch procedure - 36 clock pulses
        private eof() {
            pins.digitalWritePin(this.DAT, 0)
            for (let _ = 0; _ < Math.idiv(this.NUM_PIXELS, 16); _++) {
                //  Reduce unnecessary pulses
                pins.digitalWritePin(this.CLK, 1)
                pins.digitalWritePin(this.CLK, 0)
            }
        }

        //  Latch at start - 32 clock pulses
        private sof() {
            pins.digitalWritePin(this.DAT, 0)
            for (let x3 = 0; x3 < 32; x3++) {
                pins.digitalWritePin(this.CLK, 1)
                pins.digitalWritePin(this.CLK, 0)
            }
        }

        public xy_to_num(x: number, y: number)
        {
            if (y % 2 == 0)
                return x + y * this.NUM_PIXELS_X
            else
                return this.NUM_PIXELS_X - x - 1 + y * this.NUM_PIXELS_X
        }

        public set_pix_xy(x: number, y: number, r: number, g: number, b: number, brightness: number)
        {
            this.set_pix(this.xy_to_num(x,y), r, g, b, brightness)
        }

        public get_pix_xy(x: number, y: number) {
            return this.get_pix(this.xy_to_num(x, y))
        }

        //  Update colour and brightness values from pixels list
        //  Call this procedure to update the display
        public show() {
            this.sof()
            //  Start frame
            for (let pixel of this.pixels) {
                let [r, g, b, brightness] = pixel
                this.write_byte(0b11100000 | brightness)
                //  Brightness header
                this.write_byte(b)
                //  Send Blue
                this.write_byte(g)
                //  Send Green
                this.write_byte(r)
            }
            //  Send Red
            this.eof()
            //  End frame, ensuring the last pixels update properly
            //  Extra clock pulses to ensure all data is shifted out (APA102 requirement)
            for (let l = 0; l < Math.idiv(this.NUM_PIXELS, 2); l++) {
                pins.digitalWritePin(this.CLK, 1)
                pins.digitalWritePin(this.CLK, 0)
            }
        }

        //  Set the colour and brightness of an individual pixel
        public set_pix(x: number, rr: number, gg: number, bb: number, brightness: number = null) {
            if (brightness === null) {
                brightness = this.BRIGHTNESS
            } else {
                brightness = Math.trunc(31.0 * brightness) & 0b11111
            }
            this.pixels[x] = [rr & 0xff, gg & 0xff, bb & 0xff, brightness]
        }

        //  Get the colour and brightness of an individual pixel
        public get_pix(x: number) {
            return this.pixels[x]
        } 

        //  Set all of the pixels in the chain to the colour and brightness (optional)
        public set_all(r: number, g: number, b: number, brightness: number = null) {
            for (let x4 = 0; x4 < this.NUM_PIXELS; x4++) {
                this.set_pix(x4, r, g, b, brightness)
            }
        }


        public set_all_rand() {
            for (let x5 = 0; x5 < this.NUM_PIXELS; x5++) {
                this.set_pix(x5, randint(0, 255), randint(0, 255), randint(0, 255), randint(0, 255))
            }
        }

        public set_brightness_gradient() {
            for (let y = 0; y < 16; y++) {
                for (let x6 = 0; x6 < 16; x6++) {
                    this.set_pix(y * 16 + x6, 255, 255, 255, Math.abs(7.5 - y) / 8.)
                }
            }
        }

        public set_brightness_inv_gradient() {
            for (let y2 = 0; y2 < 16; y2++) {
                for (let x7 = 0; x7 < 16; x7++) {
                    this.set_pix(y2 * 16 + x7, 255, 255, 255, 1.0 - Math.abs(7.5 - y2) / 8.)
                }
            }
        }

        /**
         * Get the default instance (auto-created)
         */
        private static getInstance(): p {
            if (!this.defaultInstance) {
                this.defaultInstance = new p(); // Automatically create instance
            }
            return this.defaultInstance;
        }

        /** Internal method for getting instance */
        static instance(): p {
            return this.getInstance();
        }
    }

    /**
     * Plot a pixel at position X, Y
     */
    //% blockId=apa102plotat
    //% block="plot at $x $y"
    //% x.min=0 x.max=15
    //% y.min=0 y.max=15
    export function plotAt(x: number, y: number): void {
        let instance = p.instance();
        instance.set_pix_xy(x, y, 255., 255., 255., 1.)
        instance.show();
    }

    /**
     * Unplot a pixel at position X, Y
     */
    //% blockId=apa102unplotat
    //% block="unplot at $x $y"
    //% x.min=0 x.max=15
    //% y.min=0 y.max=15
    export function unplotAt(x: number, y: number): void {
        let instance = p.instance();
        instance.set_pix_xy(x, y, 0., 0., 0., 0.)
        instance.show();
    }

    /**
     * Toggle a pixel at position X, Y
     */
    //% blockId=apa102toggle
    //% block="toggle at $x $y"
    //% x.min=0 x.max=15
    //% y.min=0 y.max=15
    export function toggleAt(x: number, y: number): void {
        let instance = p.instance();
        let [r, g, b, br] = instance.get_pix_xy(x, y)
        if (br == 0)
            instance.set_pix_xy(x, y, 255, 255, 255, 1.)
        else
            instance.set_pix_xy(x, y, 0., 0., 0., 0.)
        instance.show();
    }

    /**
     * Colour a pixel at position X, Y
     */
    //% blockId=apa102colourat
    //% block="colour at $x $y"
    //% x.min=0 x.max=15
    //% y.min=0 y.max=15
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% br.min=0 br.max=7
    export function colourAt(x: number, y: number, r: number, g: number, b: number, br:number): void {
        let instance = p.instance();
        instance.set_pix_xy(x, y, r, g, b, br)
        instance.show();
    }


    /**
     * Line between X1, Y1 and X2, Y2
     */
    //% blockId=apa102line
    //% block="line from $x1, $y1 to $x2, $y2"
    //% x1.min=0 x1.max=15
    //% y1.min=0 y1.max=15
    //% x2.min=0 x2.max=15
    //% y2.min=0 y2.max=15
    export function line(x1: number, y1: number, x2: number, y2: number): void {
        let instance = p.instance();
        const stepnum = 32.0;
        let xstep = (x2 - x1) / stepnum;
        let ystep = (y2 - y1) / stepnum;
        for (let i = 0.0; i < stepnum; i = i + 1.0){
            //instance.set_pix_xy(x1 + i * xstep, y1 + i * ystep, 255., 255., 255., 1.);
            //serial.writeNumber((x1 + i * xstep));
            let xcurr = Math.round(x1 + i * xstep);
            let ycurr = Math.round(y1 + i * ystep);
            instance.set_pix_xy(xcurr, ycurr, 255., 255., 255., 1.);
            // plotAt(xcurr, ycurr);
        }
 
        instance.show();
    }

    /**
     * Paint random image
     */
    //% blockId=apa102fullrandom
    //% block="paint random image"
    export function fullRandom(): void {
        let instance = p.instance();
        instance.set_all_rand();
        instance.show();
    }

    /**
     * Clear image
     */
    //% blockId=apa102clearimage
    //% block="clear image"
    export function clearImage(): void {
        let instance = p.instance();
        instance.clear();
        instance.show();
    }

    /**
     * Get a pixel state at position X, Y
     */
    //% blockId=apa102point
    //% block="point at $x $y"
    //% x.min=0 x.max=15
    //% y.min=0 y.max=15
    export function pointAt(x: number, y: number): boolean {
        let instance = p.instance();
        let [r, g, b, br] = instance.get_pix_xy(x, y)
        if (br == 0)
            return false;
        else
            return true;
    }
}
