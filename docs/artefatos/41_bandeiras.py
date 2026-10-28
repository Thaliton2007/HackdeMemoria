#!/usr/bin/env python3
"""Bandeiras como SVG inline (não emoji).

Emoji de bandeira (🇫🇷) não renderiza no Windows — aparece como "FR" em letras.
SVG inline funciona em qualquer sistema operacional e escala sem perder nitidez.
"""

FR = ('<svg class="bnd" viewBox="0 0 24 24" aria-label="Français">'
      '<defs><clipPath id="cF"><circle cx="12" cy="12" r="11"/></clipPath></defs>'
      '<g clip-path="url(#cF)">'
      '<rect x="0" y="0" width="8" height="24" fill="#002395"/>'
      '<rect x="8" y="0" width="8" height="24" fill="#fff"/>'
      '<rect x="16" y="0" width="8" height="24" fill="#ED2939"/></g>'
      '<circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.14)"/></svg>')

ES = ('<svg class="bnd" viewBox="0 0 24 24" aria-label="Español">'
      '<defs><clipPath id="cE"><circle cx="12" cy="12" r="11"/></clipPath></defs>'
      '<g clip-path="url(#cE)">'
      '<rect x="0" y="0" width="24" height="6" fill="#AA151B"/>'
      '<rect x="0" y="6" width="24" height="12" fill="#F1BF00"/>'
      '<rect x="0" y="18" width="24" height="6" fill="#AA151B"/></g>'
      '<circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.14)"/></svg>')

EN = ('<svg class="bnd" viewBox="0 0 24 24" aria-label="English">'
      '<defs><clipPath id="cU"><circle cx="12" cy="12" r="11"/></clipPath></defs>'
      '<g clip-path="url(#cU)">'
      '<rect width="24" height="24" fill="#fff"/>'
      '<rect y="0"  width="24" height="1.85" fill="#B22234"/>'
      '<rect y="3.7" width="24" height="1.85" fill="#B22234"/>'
      '<rect y="7.4" width="24" height="1.85" fill="#B22234"/>'
      '<rect y="11.1" width="24" height="1.85" fill="#B22234"/>'
      '<rect y="14.8" width="24" height="1.85" fill="#B22234"/>'
      '<rect y="18.5" width="24" height="1.85" fill="#B22234"/>'
      '<rect y="22.2" width="24" height="1.8" fill="#B22234"/>'
      '<rect x="0" y="0" width="11" height="9.25" fill="#3C3B6E"/></g>'
      '<circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.14)"/></svg>')

CSS = """
/* bandeiras: SVG inline para funcionar em Windows, macOS, Linux e mobile */
.bnd{width:20px;height:20px;flex-shrink:0;display:inline-block;vertical-align:middle}
.logo .bnd{width:22px;height:22px;margin-right:2px}
.avatar .bnd{width:26px;height:26px}
.avatar{background:transparent!important;padding:0;overflow:visible}
.avatar:hover .bnd{transform:scale(1.08);transition:.15s}
.abas .bnd{width:17px;height:17px}
"""

if __name__ == "__main__":
    import sys, re
    curso = sys.argv[1]          # fr | en | es
    shell = sys.argv[2]
    bandeira = {"fr": FR, "en": EN, "es": ES}[curso]
    idioma  = {"fr": "Français", "en": "English", "es": "Español"}[curso]
    sigla   = {"fr": "FR", "en": "EN", "es": "ES"}[curso]

    h = open(shell, encoding="utf-8").read()
    if 'class="bnd"' in h:
        print(f"  (bandeira já aplicada em {shell})"); sys.exit(0)

    # logo: a bandeira substitui o ponto colorido
    h = h.replace(f'<div class="logo"><span class="dot"></span>Memoria Hack<small>{idioma}</small></div>',
                  f'<div class="logo">{bandeira}Memoria Hack<small>{idioma}</small></div>', 1)
    # avatar: a bandeira no lugar da sigla
    h = h.replace(f'<span id="avInit">{sigla}</span>', bandeira, 1)
    h = h.replace(f'<span>{sigla}</span>', bandeira, 1)
    if ".bnd{" not in h:
        h = h.replace("</style>", CSS + "</style>", 1)
    open(shell, "w", encoding="utf-8").write(h)
    print(f"  bandeira {curso.upper()} aplicada em {shell}")
