//% blockId=apa102p
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
                pixel_list.push([0, 0, 0, this.BRIGHTNESS]);
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
            for (let x = 0; x < this.NUM_PIXELS; x++) {
                for (let i = 0; i < 3; i++) {
                    this.pixels[x][i] = 0
                }
            }
        }

        //  # Pulse a byte of data a bit at a time
        private write_byte(byte: number) {
            for (let i = 7; i > -1; i += -1) {
                //  MSB first
                if (byte >> i & 1) {
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
            for (let x = 0; x < 32; x++) {
                pins.digitalWritePin(this.CLK, 1)
                pins.digitalWritePin(this.CLK, 0)
            }
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
            for (let i = 0; i < Math.idiv(this.NUM_PIXELS, 2); i++) {
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
            this.pixels[x] = [0, 0, 0, 0]
            // pixels[x] = [rr & 0xff, gg & 0xff, bb & 0xff, brightness]
        }
        

        //  Set all of the pixels in the chain to the colour and brightness (optional)
        public set_all(r: number, g: number, b: number, brightness: number = null) {
            for (let x = 0; x < this.NUM_PIXELS; x++) {
                this.set_pix(x, r, g, b, brightness)
            }
        }


        public set_all_rand() {
            for (let x = 0; x < this.NUM_PIXELS; x++) {
                this.set_pix(x, randint(0, 255), randint(0, 255), randint(0, 255), randint(0, 255))
            }
        }

        public set_brightness_gradient() {
            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    this.set_pix(y * 16 + x, 255, 255, 255, Math.abs(7.5 - y) / 8.)
                }
            }
        }

        public set_brightness_inv_gradient() {
            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    this.set_pix(y * 16 + x, 255, 255, 255, 1.0 - Math.abs(7.5 - y) / 8.)
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
        let instance = p.instance(); // Get or create instance
        console.log("NUM_PIXELS_X: " + instance.NUM_PIXELS_X);
        led.plot(x, y);
        instance.set_brightness_gradient();
        instance.show();
        basic.pause(500);
        instance.set_brightness_inv_gradient();
        instance.show();

    }
}
