pandoc -s cv.md -o cv.docx
python3 md_to_tex.py cv.md english
pdflatex cv.tex
cp cv.pdf ../cv.pdf