# to remind us which pin serves which function
DAT = DigitalPin.P1
CLK = DigitalPin.P0
# number of pixels in the chain
NUM_PIXELS = 256
# default brightness setting
BRIGHTNESS = 7
# list of pixels
# pixels = [[1,2,3,4], [1,2,3,4], [1,2,3,4]]
# Initialize pixel list manually (avoiding list comprehensions)
def init_pixels():
    pixel_list = []
    for i in range(NUM_PIXELS):
        pixel_list.append([0, 0, 0, BRIGHTNESS])  # Each pixel is a list of [R, G, B, Brightness]
    return pixel_list

# Initialize pixels list
pixels = init_pixels()

# Set the brightness of all pixels - 0 - 1.
def set_brightness(brightness):
    if brightness < 0 or brightness > 1:
        return
    for x in range(NUM_PIXELS):
        pixels[x][3] = int(31.0 * brightness) & 0b11111

# Clear all of the pixels        
def clear():
    for x in range(NUM_PIXELS):
        for i in range(0, 3):
            pixels[x][i] = 0

# # Pulse a byte of data a bit at a time
# def write_byte(byte):
#     bits = []
#     for i in range(7, -1, -1):
#         bits.append((byte >> i) & 1)

#     for x in range(8):
#         pins.digital_write_pin(DAT, bits[x])
#         pins.digital_write_pin(CLK,1)
#         pins.digital_write_pin(CLK,0)
        

# Pulse a byte of data a bit at a time (optimized)
# def write_byte(byte):
#     for i in range(7, -1, -1):  # Send 8 bits, MSB first
#         pins.digital_write_pin(DAT, (byte >> i) & 1)
#         pins.digital_write_pin(CLK, 1)
#         pins.digital_write_pin(CLK, 0)

def write_byte(byte):
    for i in range(7, -1, -1):  # MSB first
        if (byte >> i) & 1:
            pins.digital_write_pin(DAT, 1)
        else:
            pins.digital_write_pin(DAT, 0)

        pins.digital_write_pin(CLK, 1)
        pins.digital_write_pin(CLK, 0)

# Latch procedure - 36 clock pulses        
# def eof():
#     pins.digital_write_pin(DAT, 0)
#     for x in range(36):
#         pins.digital_write_pin(CLK,1)
#         pins.digital_write_pin(CLK,0)

def eof():
    pins.digital_write_pin(DAT, 0)
    for _ in range(NUM_PIXELS // 16):  # Reduce unnecessary pulses
        pins.digital_write_pin(CLK, 1)
        pins.digital_write_pin(CLK, 0)

# Latch at start - 32 clock pulses
def sof():
    pins.digital_write_pin(DAT, 0)
    for x in range(32):
        pins.digital_write_pin(CLK,1)
        pins.digital_write_pin(CLK,0)

# Update colour and brightness values from pixels list
# Call this procedure to update the display
def show():
    sof()  # Start frame

    for pixel in pixels:
        r, g, b, brightness = pixel
        write_byte(0b11100000 | brightness)  # Brightness header
        write_byte(b)  # Send Blue
        write_byte(g)  # Send Green
        write_byte(r)  # Send Red

    eof()  # End frame, ensuring the last pixels update properly

    # Extra clock pulses to ensure all data is shifted out (APA102 requirement)
    for i in range(NUM_PIXELS // 2):
        pins.digital_write_pin(CLK, 1)
        pins.digital_write_pin(CLK, 0)

# def show():
#     sof()  # Start frame

#     for pixel in pixels:
#         brightness = 0b11100000 | pixel[3]  # Brightness header
#         data = [brightness, pixel[2], pixel[1], pixel[0]]  # [Brightness, B, G, R]

#         # Write all 4 bytes in one loop (faster)
#         for byte in data:
#             for i in range(7, -1, -1):
#                 pins.digital_write_pin(DAT, (byte >> i) & 1)
#                 pins.digital_write_pin(CLK, 1)
#                 pins.digital_write_pin(CLK, 0)

#     eof()


# Set the colour and brightness of an individual pixel
def set_pix(x, rr, gg, bb, brightness=None):
    if brightness is None:
        brightness = BRIGHTNESS
    else:
        brightness = int(31.0 * brightness) & 0b11111
    pixels[x] = [rr & 0xff,gg & 0xff,bb & 0xff,brightness]

# Set all of the pixels in the chain to the colour and brightness (optional)
def set_all(r, g, b, brightness=None):
    for x in range(NUM_PIXELS):
        set_pix(x, r, g, b, brightness)

def set_all_rand():
    for x in range(NUM_PIXELS):
        set_pix(x, randint(0,255), randint(0,255), randint(0,255), randint(0,255))

def set_brightness_gradient():
    for y in range(16):
        for x in range(16):
            set_pix(y*16 + x, 255, 255, 255, abs(7.5 - y)/8.)

def set_brightness_inv_gradient():
    for y in range(16):
        for x in range(16):
            set_pix(y*16 + x, 255, 255, 255, 1.0 - abs(7.5 - y)/8.)



# Test code and example use
while True:
    # all off
    # clear()
    # show()
    # basic.pause(1000)
    # on red individually
    # for i in range(NUM_PIXELS):
    #     set_pix(i, 255, 0, 0)
    #     show()
    # #     basic.pause(100)
    # set_all(255,0,0,7)
    # show()
    # # basic.pause(1000)
    # # all green
    # set_all(0,255,0,7)
    # show()
    # # basic.pause(1000)
    # # all blue
    # set_all(0,0,255,7)
    # show()
    # set_all(255,255,255,7)
    # show()
    # # basic.pause(1000)

    # # set_all_rand()
    # set_brightness_gradient()
    # # basic.pause(10)
    # show()
    # # basic.pause(1500)
    # set_brightness_inv_gradient()
    # # basic.pause(10)
    # show()
    # # basic.pause(1500)

    set_all_rand()
    show()

    # set_all(255,255,255,0.2)
    # show()
    # basic.pause(1500)
    # set_all(0,0,0,0.)
    # show()
    # basic.pause(1500)
    # set_all(0,255,0,1.)
    # show()
            
