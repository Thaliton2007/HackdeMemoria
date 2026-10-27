#!/usr/bin/env python3
"""Réplica fiel do RELATORIO_ESTRUTURA_INGLES.txt do 2º download (20/09/2026 20:55).
Blocos críticos: Welcome (00_Welcome organizada), U1.1 semi-organizada (baldes),
U1.2 (NN_ completas + cópia crua re-baixada). Resto = mesmo modelo do FIXV21."""
import shutil
from pathlib import Path
R = Path("/home/user/_teste_master/FIX3")
if R.exists():
    shutil.rmtree(R)

def t(p):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.touch()

# ---- #01 Welcome: conteúdo completo JÁ organizado dentro da casca 00_Welcome/
w = R / "#01 Welcome" / "00_Welcome"
t(w / "ORGANIZAR_EN_WELCOME.py")
for sl, vid in [("01_Bem_vindos", "Bem_vindos"), ("02_A_plataforma", "A_plataforma"),
                ("05_Canais_de_comunicacao", "Canais_comunicacao"),
                ("06_O_Metodo", "O_Metodo"), ("07_MemHack", "MemHack")]:
    t(w / sl / "Video" / f"{vid}.mp4")
    t(w / sl / "HTML" / f"{sl}.html")
t(w / "03_Cronograma_de_estudos/HTML/03_Cronograma_de_estudos.html")
t(w / "03_Cronograma_de_estudos/PDF/Meu_primeiro_cronograma.pdf")
t(w / "04_Cadastro_do_aluno/HTML/04_Cadastro_do_aluno.html")
t(w / "08_Warm_up_01/HTML/08_Warm_up_01.html")
t(w / "09_Warm_up_02/HTML/09_Warm_up_02.html")
for i, pal in enumerate(["Step", "Climb", "Charger", "Work", "Aisle", "Toasters",
                         "Candy", "Register", "Employee", "Life", "Honest"], 1):
    t(w / "10_Audios_WarmUp" / f"{i:02d}_{pal}.mp3")
for sl in ["01_Bem_vindos", "02_A_plataforma", "03_Cronograma_de_estudos",
           "04_Cadastro_do_aluno", "05_Canais_de_comunicacao", "06_O_Metodo",
           "07_MemHack", "08_Warm_up_01", "09_Warm_up_02"]:
    t(w / "HTMLs" / f"{sl}.html")

# ---- #02 Mission 1 ------------------------------------------------------------
# 1 - Unit 01 part I: SEMI-ORGANIZADA v1 (baldes + soltos renomeados + HTMLs/ vazia)
u11 = R / "#02 Mission 1" / "1 - Unit 01 part I"
t(u11 / "ORGANIZAR_EN_U1_1.py")                       # outros:1
for h in ["01_Journey_Schedule_part_I", "02_Opening_Class", "03_MemHack_Cadastro",
          "04_Small_Talk", "05_GForce_Simple_Present_I", "06_GForce_Simple_Present_II",
          "07_MicUp_20_Accent_Reduction", "08_Wrap_up_part_I", "09_Journey_Logbook_part_I"]:
    t(u11 / f"{h}.html")                              # 9 html soltos
for v in ["Opening_Class", "MemHack_Cadastro", "Small_Talk_Young_Gavin",
          "05_GForce_Simple_Present_I", "06_GForce_Simple_Present_II",
          "07_MicUp_20_Accent_Reduction"]:
    t(u11 / f"{v}.mp4")                               # 6 mp4 soltos
for a in ["04_Small_Talk_-_Audio_aula", "05_GForce_Simple_Present_I_-_Audio_aula",
          "06_GForce_Simple_Present_II_-_Audio_aula", "07_MicUp_-_Audio_aula"]:
    t(u11 / f"{a}.mp3")                               # 4 mp3 soltos
for m in ("6", "9", "12"):
    t(u11 / f"01_Journey_Schedule_{m}_meses.pdf")     # 3 pdf
t(u11 / "Material_de_apoio_Unit_011.pdf")             # pdf 4 → detecção U1_1
u11.joinpath("HTMLs").mkdir(parents=True)             # HTMLs/ VAZIA (fiel ao scan)
for i in range(1, 10):
    t(u11 / "SmallTalk" / f"frase st {i}.mp3")        # 9 frases Small Talk
for i in range(1, 15):
    t(u11 / "GForce_I" / f"frase gf1 {i}.mp3")        # 14 frases Simple Present I
    t(u11 / "GForce_II" / f"frase gf2 {i}.mp3")       # 14 frases Simple Present II
t(u11 / "MicUp" / "Does she use that notebook.mp3")   # 8 frases MicUp (c/ as 2 "soltas")
t(u11 / "MicUp" / "You are spending too much time.mp3")
for i in range(1, 7):
    t(u11 / "MicUp" / f"frase mic {i}.mp3")
for a in ["ÁUDIO GAVIN", "ÁUDIO LAUREN", "ÁUDIO 01", "ÁUDIO 02"]:
    t(u11 / "12_Audios_Dialogo" / f"{a}.mp3")         # balde NN_ (trava!) c/ 4 itens

# 2 - Unit 01 part II: NN_ COMPLETAS (legado) + cópia crua re-baixada solta ao lado
u12 = R / "#02 Mission 1" / "2 - Unit 01 part II"
t(u12 / "ORGANIZAR_EN_U1_2.py")
t(u12 / "01_Journey_Schedule/HTML/01_Journey_Schedule_part_II.html")
t(u12 / "01_Journey_Schedule/PDF/Journey_Schedule_part_II_6_meses.pdf")
for sl, nfr in [("02_GForce_Verb_to_be_I", 16), ("03_GForce_Verb_to_be_II", 9),
                ("04_Born_in_the_USA_Greetings", 14), ("05_Phrasal_Paradise_At_the_Store", 9),
                ("06_How_to_Fly_Hello_World", 5)]:
    nome = sl[3:]
    t(u12 / sl / "Video" / f"{nome}.mp4")
    t(u12 / sl / "HTML" / f"{sl}.html")
    t(u12 / sl / "Audio" / f"{nome}_Audio_aula.mp3")
    for i in range(1, nfr + 1):
        t(u12 / sl / "Frases" / f"Frase {i:02d}.mp3")
t(u12 / "07_Wrap_up_part_II/HTML/07_Wrap_up_part_II.html")
t(u12 / "08_Journey_Logbook_part_II/HTML/08_Journey_Logbook_part_II.html")
t(u12 / "09_Material_de_Apoio/Material_de_apoio_Unit_012.pdf")
t(u12 / "10_Audios_Dialogo/Audio_GAVIN.mp3")
t(u12 / "10_Audios_Dialogo/Audio_LAUREN.mp3")
for i in range(1, 7):
    t(u12 / "HTMLs" / f"backup_{i}.html")
# restos do re-download (cópia crua = duplicata das NN_)
loose12 = ["#01  Journey Schedule part II.html",
           "#01  G-Force - Verb to be (part I).mp4", "#01  G-Force - Verb to be (part II).mp4",
           "#01  G-Force - Verb to be (part I).html", "#01  G-Force - Verb to be (part II).html",
           "#01  Born in the USA - Greetings.mp4", "#01  Born in the USA - Greetings.html",
           "#01  Phrasal Paradise - At the store.mp4", "#01  Phrasal Paradise - At the store.html",
           "#01  How to Fly - Hello, world.mp4", "#01  How to Fly - Hello, world.html",
           "#01  Wrap up part II.html", "#01  Journey Logbook part II.html",
           "#01  Born in the USA - Greetings - Áudio aula.mp3",
           "#01  G-Force - Verb to be (part I) - Áudio aula.mp3",
           "#01  G-Force - Verb to be (part II) - Áudio aula.mp3",
           "#01  How to Fly - Hello, world - Áudio aula.mp3",
           "#01  Phrasal Paradise - At the store - Áudio aula.mp3",
           "#01  Journey Schedule - 6 meses.pdf", "#01  Journey Schedule - 9 meses.pdf",
           "#01  Journey Schedule - 12 meses.pdf", "#01  Material de apoio - Unit 012.pdf"]
for f in loose12:
    t(u12 / f)
for d, n in [("#01  Born in the USA - Greetings - Áudios frases", 14),
             ("#01  G-Force - Verb to be (part I) - Áudios frases", 16),
             ("#01  G-Force - Verb to be (part II) - Áudios frases", 9),
             ("#01  How to Fly - Hello, world - Áudios frases", 5),
             ("#01  Phrasal Paradise - At the store - Áudios frases", 9)]:
    for i in range(1, n + 1):
        t(u12 / d / f"frase {i}.mp3")

# helper: estrutura crua padrão Drive para U2+ (igual ao dry-run real)
def unit_drive(base, nn, lessons, opening_audio=False, ftd=None, extras=(), soltos_audio=0,
               bye=False):
    t(base / f"1 - #{nn}  Journey Schedule.html")
    for m in ("6", "9", "12"):
        t(base / f"#{nn}  Journey Schedule - {m} meses.pdf")
    t(base / f"2 - #{nn}  Opening Class.mp4")
    t(base / f"2 - #{nn}  Opening Class.html")
    if opening_audio:
        t(base / f"#{nn}  Opening Class - Áudio aula.mp3")
    k = 3
    for fam, tit, nfr in lessons:
        t(base / f"{k} - #{nn}  {fam} - {tit}.mp4")
        t(base / f"{k} - #{nn}  {fam} - {tit}.html")
        t(base / f"#{nn}  {fam} - {tit} - Áudio aula.mp3")
        for i in range(1, nfr + 1):
            t(base / f"#{nn}  {fam} - {tit} - Áudios frases" / f"frase {i}.mp3")
        k += 1
    t(base / f"{k} - #{nn}  Wrap-up.html")
    if ftd:
        f = ftd
        t(base / f"10 - #{f:02d}  Fast Thinking Drill.html")
        if f == 1:
            t(base / f"10 - #{f:02d}  Fast Thinking Drill.mp4")
        for i in range(1, 36):
            t(base / f"#{f:02d}  FTD - Áudios frases" / f"frase {i}.mp3")
        t(base / f"#{f:02d}  FTD - Material de apoio.pdf")
    t(base / f"{k+1} - #{nn}  Journey Logbook.html")
    if bye:
        t(base / "9 - Bye for now.mp4")
    t(base / f"Material de apoio - Unit {nn}.pdf")
    for e in extras:
        t(base / e)
    t(base / "ÁUDIO GAVIN.mp3")
    t(base / "ÁUDIO LAUREN.mp3")
    for i in range(1, soltos_audio + 1):
        t(base / f"ÁUDIO {i:02d}.mp3")

L02 = [("Small Talk", "City Tour", 9), ("G-Force", "Pronouns", 12),
       ("G-Force", "Present Continuous", 25), ("Mic Up", "Linking sounds", 10),
       ("Born in the USA", "Invitations", 18), ("Phrasal Paradise", "Talking about family", 14),
       ("How to Fly", "Study Habits", 7)]
unit_drive(R / "#02 Mission 1" / "3 - Unit 02", "02", L02, opening_audio=True, soltos_audio=1)
L03 = [("Small Talk", "Brazilian - Beginner", 7), ("G-Force", "Possessives", 20),
       ("G-Force", "Will", 9), ("Mic Up", "Schwa", 10),
       ("Born in the USA", "Thank you", 10), ("Phrasal Paradise", "On a trail run at sunset", 14),
       ("How to Fly", "10,000 words", 5)]
unit_drive(R / "#02 Mission 1" / "4 - Unit 03", "03", L03, opening_audio=False, soltos_audio=1,
           extras=("Imagine our little brother as the president of the company.mp3",
                   "You can't go out and about like that.mp3"))

def review(base, n, bye=False, lesson_b1=False):
    t(base / f"1 - Review week #0{n}  Journey Schedule.html")
    t(base / f"Review week #0{n}  Journey Schedule - PDF.pdf")
    for letra, sl in [("A", "2"), ("B", "4"), ("C", "6")]:
        t(base / f"{sl} - Review week #0{n}  Lesson {letra}.mp4")
        t(base / f"{sl} - Review week #0{n}  Lesson {letra}.html")
        t(base / f"Review week #0{n}  Lesson {letra} - Áudio aula.mp3")
        ha = {"A": "3", "B": "5", "C": "7"}[letra]
        t(base / f"{ha} - Hands-on Activity #0{n}  Activity {letra}.html")
    if lesson_b1:
        t(base / f"4 - Review week #0{n}  Lesson B (1).mp4")
    t(base / f"8 - Review week #0{n}  Journey Logbook.html")
    if bye:
        t(base / "9 - Bye for now.html")
    t(base / f"Material de apoio - Review week #0{n}.pdf")

review(R / "#02 Mission 1" / "9 - Review week #01", 1, lesson_b1=True)

# ---- #03 Mission 2 / #04 Mission 3 (mesmos blocos-representantes do FIXV21) ----
L08 = [("Small Talk", "Older Gavin", 15), ("G-Force", "Simple Past", 30),
       ("Mic Up", "-ed sound", 12), ("Born in the USA", "Your first conversation", 21),
       ("Phrasal Paradise", "Phrasal verbs with get", 25), ("How to Fly", "Don't Freeze", 13)]
unit_drive(R / "#03 Mission 2" / "1 - Unit 08", "08", L08, ftd=1,
           extras=("Material extra - Irregular verbs.pdf",
                   "I decided to start running on Monday.mp3",
                   "The dog cried until I allowed him in.mp3"))
L14 = [("Small Talk", "British English", 15), ("G-Force", "Present Perfect", 24),
       ("Mic Up", "Contractions 4 - 've", 13), ("Born in the USA", "Suffixes", 17),
       ("Phrasal Paradise", "My first job", 24), ("How to Fly", "Change everything", 7)]
unit_drive(R / "#03 Mission 2" / "7 - Unit 14", "14", L14, ftd=7,
           extras=("Material extra - Irregular verbs.pdf",
                   "Material complementar irregular verbs.pdf"))
review(R / "#03 Mission 2" / "8 - Review #02", 2)
L21 = [("Small Talk", "Frisbee Golf", 17), ("G-Force", "Continuous tenses", 20),
       ("Mic Up", "Not homophones", 12), ("Born in the USA", "Shall we", 21),
       ("Phrasal Paradise", "Total Eclipse", 12), ("How to Fly", "What now", 14)]
unit_drive(R / "#04 Mission 3" / "7 - Unit 21", "21", L21, ftd=14, bye=True, soltos_audio=10)
review(R / "#04 Mission 3" / "8 - Review #03", 3, bye=True)

# ---- #05 Live Classes ----------------------------------------------------------
cl = R / "#05 Live Classes"
(cl / "12 - Novembro").mkdir(parents=True)
t(cl / "11 - Dezembro" / "1 - 3011 - Live Essentials - Likes & Dislikes + Hobbies.mp4")
jan = cl / "22 - Janeiro"
for zp in ("Mission_1_-_Azip", "Mission_1_-_Bzip", "Mission_2_-_Azip", "Reviewszip"):
    t(jan / zp / "x.mp3")

# ---- #06 Extras -----------------------------------------------------------------
f15 = R / "#06 Extras" / "1 - FTD #15"
t(f15 / "1 - FTD #15.html")
t(f15 / "downloads" / "#15  FTD - Material de apoio.pdf")
t(f15 / "downloads" / "#15  Fast Thinking Drill - Áudios frases.zip")
for i in range(1, 36):
    t(f15 / "downloads" / "áudios" / f"{i:02d}_frase.mp3")

# script mestre no lugar
shutil.copy("/home/user/ORGANIZAR_EN_MESTRE.py", R / "ORGANIZAR_EN_MESTRE.py")
print("Fixture FIX3 criada:", sum(1 for _ in R.rglob("*")), "itens")
