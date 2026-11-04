import sys
from PIL import Image
d=sys.argv[1]; W=360;H=450
s=Image.new('RGB',(W*7+80,H+20),(40,40,40))
for i in range(7): s.paste(Image.open(f'{d}/0{i+1}.png').convert('RGB').resize((W,H)),(10+i*(W+10),10))
s.save(f'_work/strip-{d}.png')
