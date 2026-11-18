from PIL import Image, ImageDraw, ImageFont
import os, math

os.makedirs('scratch', exist_ok=True)

# 1. Smart Board Texture (1024x576)
def draw_smart_board():
    im = Image.new('RGB', (1024, 576), '#0a0d12')
    d = ImageDraw.Draw(im)
    
    # Outer thin bezel
    d.rectangle([0, 0, 1024, 576], outline='#1f242d', width=6)
    
    # Screen background (dark tech blue/slate)
    d.rectangle([6, 6, 1018, 570], fill='#131c26')
    
    # Top title bar
    d.rectangle([6, 6, 1018, 48], fill='#0d141c')
    d.line([(6, 48), (1018, 48)], fill='#253242', width=2)
    
    try:
        f_title = ImageFont.truetype('arialbd.ttf', 20)
        f_diag = ImageFont.truetype('arial.ttf', 16)
        f_sub = ImageFont.truetype('arial.ttf', 14)
    except:
        f_title = f_diag = f_sub = None
        
    d.text((24, 26), "RCE SMART CLASSROOM - ENGINEERING GRAPHICS & DESIGN", fill="#38bdf8", font=f_title, anchor="lm")
    d.text((990, 26), "LECTURE 14", fill="#94a3b8", font=f_sub, anchor="rm")
    
    # Engineering Geometry / Projection Diagram (just like in the photo!)
    # Axis lines
    d.line([(100, 300), (900, 300)], fill='#475569', width=2) # X-Y line
    d.text((90, 300), "X", fill="#94a3b8", font=f_title, anchor="rm")
    d.text((910, 300), "Y", fill="#94a3b8", font=f_title, anchor="lm")
    
    # Geometric Projection Pyramids / Triangles in cyan and yellow
    pts1 = [(250, 140), (180, 280), (320, 280)]
    d.polygon(pts1, outline='#38bdf8', width=3)
    d.line([(250, 140), (250, 280)], fill='#facc15', width=2)
    
    # Projection lines downward
    d.line([(180, 280), (180, 440)], fill='#64748b', width=1)
    d.line([(250, 280), (250, 480)], fill='#64748b', width=1)
    d.line([(320, 280), (320, 440)], fill='#64748b', width=1)
    
    # Plan view in projection
    pts2 = [(250, 480), (180, 360), (320, 360)]
    d.polygon(pts2, outline='#4ade80', width=3)
    d.line([(250, 480), (250, 360)], fill='#facc15', width=2)
    
    # Second isometric figure on right
    pts3 = [(650, 120), (520, 260), (780, 260)]
    d.polygon(pts3, outline='#38bdf8', width=3)
    d.line([(650, 120), (600, 275)], fill='#f43f5e', width=2)
    d.line([(650, 120), (700, 275)], fill='#f43f5e', width=2)
    
    # Mathematical notations
    d.text((250, 115), "a' (Apex)", fill="#38bdf8", font=f_sub, anchor="mm")
    d.text((160, 285), "b'", fill="#facc15", font=f_sub, anchor="mm")
    d.text((340, 285), "c'", fill="#facc15", font=f_sub, anchor="mm")
    d.text((650, 95), "3D Projection", fill="#38bdf8", font=f_title, anchor="mm")
    
    # Bottom toolbar
    d.rectangle([6, 520, 1018, 570], fill='#0d141c')
    d.line([(6, 520), (1018, 520)], fill='#253242', width=2)
    tools = ["Select", "Pen", "Eraser", "Shapes", "Grid", "Clear", "Page 1/4"]
    for i, t in enumerate(tools):
        tx = 40 + i * 110
        d.rectangle([tx, 528, tx + 90, 560], fill='#1e293b', outline='#334155', width=1)
        d.text((tx + 45, 544), t, fill="#cbd5e1", font=f_sub, anchor="mm")
        
    im.save('scratch/smart_board.png')

# 2. Green Chalkboard
def draw_chalkboard():
    im = Image.new('RGB', (1024, 512), '#1b3b28')
    d = ImageDraw.Draw(im)
    
    # Wooden frame
    d.rectangle([0, 0, 1024, 512], outline='#8b5a2b', width=16)
    d.rectangle([16, 16, 1008, 496], outline='#5c3a1e', width=4)
    
    # Faint chalk texture / dust
    d.rectangle([20, 20, 1004, 492], fill='#1d3d2a')
    
    try:
        f_chalk = ImageFont.truetype('arialbd.ttf', 24)
        f_eq = ImageFont.truetype('arial.ttf', 20)
    except:
        f_chalk = f_eq = None
        
    d.text((50, 60), "RAMACHANDRA COLLEGE OF ENGINEERING", fill="#e0e8e0", font=f_chalk)
    d.text((50, 100), "Date: 03-11-2026   Subject: Engineering Graphics", fill="#c0cec0", font=f_eq)
    d.line([(50, 130), (500, 130)], fill="#809080", width=2)
    
    d.text((50, 160), "Problem 1: Projections of Solids", fill="#fef08a", font=f_chalk)
    d.text((70, 210), "1. True Length (TL) = 75 mm", fill="#e2e8f0", font=f_eq)
    d.text((70, 250), "2. Angle with HP (theta) = 45 deg", fill="#e2e8f0", font=f_eq)
    d.text((70, 290), "3. Angle with VP (phi) = 30 deg", fill="#e2e8f0", font=f_eq)
    d.text((70, 340), "Formula: Apparent angle beta = tan^-1(...)", fill="#fef08a", font=f_eq)
    
    # Chalk tray at bottom
    d.rectangle([0, 496, 1024, 512], fill='#a06530')
    d.rectangle([200, 492, 230, 502], fill='#f5f5f5') # chalk piece
    d.rectangle([240, 492, 270, 502], fill='#f5f5f5')
    d.rectangle([280, 490, 330, 504], fill='#4a301a') # duster
    
    im.save('scratch/chalkboard.png')

# 3. Vision / Mission Poster
def draw_poster():
    im = Image.new('RGB', (512, 768), '#ffffff')
    d = ImageDraw.Draw(im)
    
    # Frame
    d.rectangle([0, 0, 512, 768], outline='#334155', width=10)
    
    # Header banner
    d.rectangle([10, 10, 502, 110], fill='#0047a0')
    try:
        f_head = ImageFont.truetype('arialbd.ttf', 20)
        f_sub = ImageFont.truetype('arialbd.ttf', 13)
        f_body = ImageFont.truetype('arial.ttf', 13)
    except:
        f_head = f_sub = f_body = None
        
    d.text((256, 40), "RAMACHANDRA", fill="#ffffff", font=f_head, anchor="mm")
    d.text((256, 68), "COLLEGE OF ENGINEERING", fill="#ffda44", font=f_sub, anchor="mm")
    d.text((256, 92), "(AUTONOMOUS) - NBA & NAAC ACCREDITED", fill="#e2e8f0", font=f_sub, anchor="mm")
    
    # Vision & Mission
    d.rectangle([24, 130, 488, 170], fill='#f1f5f9')
    d.text((256, 150), "DEPARTMENT VISION & MISSION", fill="#0047a0", font=f_head, anchor="mm")
    
    d.text((36, 195), "VISION:", fill="#0047a0", font=f_head, anchor="lm")
    d.text((36, 225), "To emerge as a premier centre of excellence in", fill="#1e293b", font=f_body)
    d.text((36, 245), "technical education and innovative research,", fill="#1e293b", font=f_body)
    d.text((36, 265), "producing globally competent engineers.", fill="#1e293b", font=f_body)
    
    d.text((36, 310), "MISSION:", fill="#0047a0", font=f_head, anchor="lm")
    d.text((36, 340), "M1: Impart quality education through innovative", fill="#1e293b", font=f_body)
    d.text((36, 360), "    teaching-learning methodologies.", fill="#1e293b", font=f_body)
    d.text((36, 390), "M2: Foster state-of-the-art laboratory facilities", fill="#1e293b", font=f_body)
    d.text((36, 410), "    and interdisciplinary research.", fill="#1e293b", font=f_body)
    d.text((36, 440), "M3: Nurture ethical values and leadership skills.", fill="#1e293b", font=f_body)
    
    d.rectangle([24, 490, 488, 530], fill='#f1f5f9')
    d.text((256, 510), "PROGRAM OUTCOMES (POs)", fill="#0047a0", font=f_head, anchor="mm")
    
    pos = [
        "PO1: Engineering Knowledge & Analysis",
        "PO2: Problem Analysis & Design of Solutions",
        "PO3: Modern Tool Usage & Smart Technologies",
        "PO4: Ethics, Environment & Life-long Learning"
    ]
    for i, po in enumerate(pos):
        d.text((36, 550 + i * 32), po, fill="#334155", font=f_body)
        
    im.save('scratch/poster.png')

draw_smart_board()
draw_chalkboard()
draw_poster()
print("Generated classroom graphics")
