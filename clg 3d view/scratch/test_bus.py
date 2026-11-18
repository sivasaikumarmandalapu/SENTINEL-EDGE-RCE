from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('scratch', exist_ok=True)

def draw_bus_side(is_left=True):
    im = Image.new('RGB', (1024, 320), '#f6b800')
    d = ImageDraw.Draw(im)
    
    # Roof curve highlight
    d.rectangle([0, 0, 1024, 12], fill='#fcd040')
    d.line([(0, 12), (1024, 12)], fill='#dca000', width=2)
    
    # Window band (y: 28 to 135)
    win_y0, win_y1 = 28, 135
    d.rectangle([0, win_y0, 1024, win_y1], fill='#151d26')
    
    if is_left:
        # Front door (passenger boarding door - blue frame with two glass vertical panels)
        d.rectangle([45, win_y0 - 4, 155, 275], fill='#0047a0', outline='#002d66', width=2)
        d.rectangle([55, win_y0 + 10, 95, 135], fill='#1c2b3a', outline='#335577', width=1)
        d.rectangle([105, win_y0 + 10, 145, 135], fill='#1c2b3a', outline='#335577', width=1)
        d.rectangle([55, 160, 145, 220], fill='#003d8a')
        d.rectangle([55, 240, 145, 270], fill='#202020') # steps
        
        # Passenger windows (6 large windows)
        for i in range(6):
            wx0 = 180 + i * 135
            wx1 = wx0 + 120
            d.rectangle([wx0, win_y0 + 4, wx1, win_y1 - 4], fill='#1e2d3d', outline='#10151c', width=2)
            d.rectangle([wx0 + 3, win_y0 + 7, wx1 - 3, win_y0 + 20], fill='#2b4055')
            for by in [win_y0 + 42, win_y0 + 68, win_y0 + 94]:
                d.line([(wx0 + 2, by), (wx1 - 2, by)], fill='#d8dfe8', width=3)
                d.line([(wx0 + 2, by + 1), (wx1 - 2, by + 1)], fill='#889098', width=1)
    else:
        # Right side: driver window at front (x 870..980)
        d.rectangle([870, win_y0 + 4, 980, win_y1 - 4], fill='#1e2d3d', outline='#10151c', width=2)
        # 6 passenger windows towards rear
        for i in range(6):
            wx0 = 40 + i * 135
            wx1 = wx0 + 120
            d.rectangle([wx0, win_y0 + 4, wx1, win_y1 - 4], fill='#1e2d3d', outline='#10151c', width=2)
            d.rectangle([wx0 + 3, win_y0 + 7, wx1 - 3, win_y0 + 20], fill='#2b4055')
            for by in [win_y0 + 42, win_y0 + 68, win_y0 + 94]:
                d.line([(wx0 + 2, by), (wx1 - 2, by)], fill='#d8dfe8', width=3)
                d.line([(wx0 + 2, by + 1), (wx1 - 2, by + 1)], fill='#889098', width=1)
    
    # Body lower rubber rub rail
    d.rectangle([0, 275, 1024, 285], fill='#22262a')
    d.rectangle([0, 308, 1024, 320], fill='#181a1c') # chassis skirt
    
    # Blue college text
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 36)
        font_small = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_large = font_small = None

    text_x = 570 if is_left else 450
    d.text((text_x, 175), "RAMACHANDRA COLLEGE OF ENGINEERING", fill="#0047a0", font=font_large, anchor="mm")
    d.text((text_x, 220), "VATLURU (V), ELURU - 534007", fill="#0047a0", font=font_small, anchor="mm")
    
    # College emblem badge
    badge_x = 220 if is_left else 800
    badge_y = 200
    d.ellipse([badge_x - 30, badge_y - 30, badge_x + 30, badge_y + 30], fill="#0047a0", outline="#dca000", width=3)
    d.ellipse([badge_x - 22, badge_y - 22, badge_x + 22, badge_y + 22], fill="#f6b800", outline="#0047a0", width=2)
    d.text((badge_x, badge_y), "RCE", fill="#0047a0", font=font_small, anchor="mm")
    
    filename = "scratch/bus_side_left.png" if is_left else "scratch/bus_side_right.png"
    im.save(filename)

draw_bus_side(True)
draw_bus_side(False)
print("Generated side textures")

def draw_bus_front():
    im = Image.new('RGB', (512, 512), '#f6b800')
    d = ImageDraw.Draw(im)
    
    # Roof curve highlight
    d.rectangle([0, 0, 512, 18], fill='#fcd040')
    
    # Top destination board (blue with RCE in yellow)
    d.rectangle([70, 24, 442, 95], fill='#0047a0', outline='#fcd040', width=3)
    try:
        font_dest = ImageFont.truetype("arialbd.ttf", 46)
        font_plate = ImageFont.truetype("arialbd.ttf", 22)
        font_label = ImageFont.truetype("arialbd.ttf", 18)
    except:
        font_dest = font_plate = font_label = None
    d.text((256, 56), "R C E", fill="#ffda44", font=font_dest, anchor="mm")
    
    # Windshield (y: 105 to 270)
    d.rectangle([35, 105, 477, 275], fill='#151d26', outline='#0a0f14', width=3)
    # Windshield glass reflection gradient
    d.polygon([(45, 115), (240, 115), (210, 265), (45, 265)], fill='#25384c')
    d.polygon([(270, 115), (467, 115), (437, 265), (270, 265)], fill='#25384c')
    # Center divider bar
    d.rectangle([250, 105, 262, 275], fill='#0a0f14')
    # Windshield wipers
    d.line([(100, 265), (170, 215)], fill='#0a0f14', width=4)
    d.line([(310, 265), (380, 215)], fill='#0a0f14', width=4)
    
    # RAMACHANDRA COLLEGE subtext below windshield
    d.text((256, 290), "RAMACHANDRA COLLEGE OF ENGINEERING", fill="#0047a0", font=font_label, anchor="mm")
    
    # Center radiator grille
    d.rectangle([160, 315, 352, 405], fill='#1c1f24', outline='#353a42', width=2)
    for gy in range(328, 400, 12):
        d.line([(165, gy), (347, gy)], fill='#c0c0c0', width=2)
    # College emblem badge on grille
    d.ellipse([240, 345, 272, 377], fill='#0047a0', outline='#ffda44', width=2)
    
    # Headlight assemblies
    for hx in [45, 395]:
        d.rectangle([hx, 325, hx + 72, 395], fill='#202428', outline='#3a4048', width=2)
        # Twin round lights
        d.ellipse([hx + 6, 332, hx + 36, 362], fill='#f5f8ff', outline='#a0aab5', width=2)
        d.ellipse([hx + 40, 332, hx + 66, 358], fill='#f5f8ff', outline='#a0aab5', width=2)
        # Amber turn indicator
        d.rectangle([hx + 8, 370, hx + 64, 388], fill='#ff9f00', outline='#b87000', width=1)
    
    # Front bumper
    d.rectangle([20, 420, 492, 480], fill='#1c1e22', outline='#101214', width=2)
    # Number plate (AP 39 Y 7329 - yellow commercial plate)
    d.rectangle([186, 435, 326, 468], fill='#ffce00', outline='#101214', width=2)
    d.text((256, 451), "AP 39 Y 7329", fill="#101214", font=font_plate, anchor="mm")
    
    # Chassis bottom
    d.rectangle([0, 485, 512, 512], fill='#121315')
    
    im.save("scratch/bus_front.png")

def draw_bus_rear():
    im = Image.new('RGB', (512, 512), '#f6b800')
    d = ImageDraw.Draw(im)
    
    # Roof curve
    d.rectangle([0, 0, 512, 18], fill='#fcd040')
    
    try:
        font_plate = ImageFont.truetype("arialbd.ttf", 22)
        font_label = ImageFont.truetype("arialbd.ttf", 20)
        font_sub = ImageFont.truetype("arialbd.ttf", 15)
    except:
        font_plate = font_label = font_sub = None
        
    d.text((256, 50), "RAMACHANDRA", fill="#0047a0", font=font_label, anchor="mm")
    d.text((256, 75), "COLLEGE OF ENGINEERING", fill="#0047a0", font=font_sub, anchor="mm")
    
    # Rear window (emergency exit)
    d.rectangle([65, 105, 447, 245], fill='#151d26', outline='#0a0f14', width=3)
    d.text((256, 175), "EMERGENCY EXIT", fill="#ffffff", font=font_sub, anchor="mm")
    
    # Rear caution / keep distance
    d.rectangle([120, 315, 392, 345], fill='#d82020')
    d.text((256, 330), "SCHOOL / COLLEGE BUS", fill="#ffffff", font=font_sub, anchor="mm")
    
    # Taillights
    for tx in [45, 415]:
        d.rectangle([tx, 275, tx + 52, 390], fill='#1a1c1e', outline='#30353c', width=2)
        # Red brake light
        d.rectangle([tx + 5, 282, tx + 47, 315], fill='#e01515', outline='#800a0a', width=1)
        # Amber turn signal
        d.rectangle([tx + 5, 320, tx + 47, 350], fill='#ff9f00', outline='#b87000', width=1)
        # White reverse light
        d.rectangle([tx + 5, 355, tx + 47, 383], fill='#f0f4f8', outline='#9098a0', width=1)
        
    # Rear bumper
    d.rectangle([20, 420, 492, 480], fill='#1c1e22', outline='#101214', width=2)
    # Number plate
    d.rectangle([186, 435, 326, 468], fill='#ffce00', outline='#101214', width=2)
    d.text((256, 451), "AP 39 Y 7329", fill="#101214", font=font_plate, anchor="mm")
    
    im.save("scratch/bus_rear.png")

draw_bus_front()
draw_bus_rear()
print("Generated front and rear textures")

def draw_wheel():
    im = Image.new('RGB', (128, 128), '#151618')
    d = ImageDraw.Draw(im)
    
    # Outer tyre rubber with tread grooves
    d.ellipse([4, 4, 124, 124], fill='#1e2024', outline='#121315', width=3)
    d.ellipse([18, 18, 110, 110], fill='#18191c', outline='#101112', width=2)
    
    # Yellow steel wheel rim
    d.ellipse([26, 26, 102, 102], fill='#f6b800', outline='#d09800', width=3)
    d.ellipse([34, 34, 94, 94], fill='#f9c21a', outline='#d09800', width=1)
    
    # Center dark hub
    d.ellipse([48, 48, 80, 80], fill='#282a2e', outline='#18191b', width=2)
    
    # Ring of lug nuts
    import math
    for i in range(6):
        angle = i * (2 * math.pi / 6)
        bx = 64 + 20 * math.cos(angle)
        by = 64 + 20 * math.sin(angle)
        d.ellipse([bx - 3, by - 3, bx + 3, by + 3], fill='#e0e4e8', outline='#111', width=1)
        
    d.ellipse([60, 60, 68, 68], fill='#111214')
    im.save("scratch/bus_wheel.png")

draw_wheel()
print("Generated wheel texture")
