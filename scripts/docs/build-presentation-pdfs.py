"""Offline presentation artifact preparation; not a production runtime."""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/pdf';OUT.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='PortoTitle',fontName='Helvetica-Bold',fontSize=26,leading=30,textColor=HexColor('#2443B8'),spaceAfter=18))
styles.add(ParagraphStyle(name='PortoHeading',fontName='Helvetica-Bold',fontSize=14,leading=18,textColor=HexColor('#2443B8'),spaceBefore=15,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='PortoBody',fontName='Helvetica',fontSize=10.5,leading=15,spaceAfter=10,textColor=HexColor('#243047')))
styles.add(ParagraphStyle(name='PortoBullet',parent=styles['PortoBody'],leftIndent=12,firstLineIndent=-12))
def inline(text):
 text=escape(text)
 text=re.sub(r'`([^`]+)`',r'<font name="Courier">\1</font>',text)
 return re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',text)
def footer(canvas,doc):
 canvas.saveState();w,h=A4
 canvas.setStrokeColor(HexColor('#D7DEF0'));canvas.line(43,37,w-43,37)
 canvas.setFont('Helvetica',8);canvas.setFillColor(HexColor('#53627C'))
 canvas.drawString(43,24,'PORTO-STAR  |  Round-1 presentation reference  |  8 October 2026')
 canvas.drawRightString(w-43,24,str(doc.page));canvas.restoreState()
for name,out in [('PROJECT_SUMMARY','porto-star-project-summary.pdf'),('SOLUTION_DESCRIPTION','porto-star-solution-description.pdf'),('OTHER_INFORMATION','porto-star-other-information.pdf')]:
 content=(ROOT/f'docs/presentation/{name}.md').read_text()
 blocks=content.split('\n\n');story=[]
 for block in blocks:
  block=block.strip()
  if not block:continue
  if block.startswith('# '):story.append(Paragraph(inline(block[2:]),styles['PortoTitle']))
  elif block.startswith('## '):story.append(Paragraph(inline(block[3:]),styles['PortoHeading']))
  elif re.match(r'^\d+\. ',block):
   for line in block.splitlines():story.append(Paragraph(inline(line),styles['PortoBullet']))
  else:story.append(Paragraph(inline(block.replace('\n',' ')),styles['PortoBody']))
 doc=SimpleDocTemplate(str(OUT/out),pagesize=A4,rightMargin=43,leftMargin=43,topMargin=43,bottomMargin=52,title='Porto-Star - '+name.replace('_',' ').title(),author='Porto-Star team')
 doc.build(story,onFirstPage=footer,onLaterPages=footer)
 print(out)
