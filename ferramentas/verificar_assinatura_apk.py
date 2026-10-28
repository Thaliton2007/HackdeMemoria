#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mostra a impressao digital do certificado de assinatura de um APK.

Nao precisa de Java/Android SDK: le direto o APK Signing Block (v2/v3).
Serve para conferir que dois builds diferentes usam a MESMA chave — se as
impressoes digitais forem iguais, o Android aceita instalar um por cima do
outro sem desinstalar.

    python3 ferramentas/verificar_assinatura_apk.py MemoriaHack.apk
    python3 ferramentas/verificar_assinatura_apk.py A.apk B.apk   # compara
"""
from __future__ import annotations

import hashlib
import struct
import sys
from pathlib import Path

MAGIC = b"APK Sig Block 42"
BLOCOS_DE_ASSINATURA = (0x7109871A, 0xF05368C0, 0x1B93AD61)  # v2, v3, v3.1


def certificados(caminho: Path) -> list[bytes]:
    dados = caminho.read_bytes()
    pos = dados.rfind(MAGIC)
    if pos < 0:
        raise ValueError("Sem APK Signing Block: APK nao assinado com v2/v3")

    tamanho = struct.unpack_from("<Q", dados, pos - 8)[0]
    inicio = pos + 16 - (8 + tamanho)
    if inicio < 0 or struct.unpack_from("<Q", dados, inicio)[0] != tamanho:
        raise ValueError("APK Signing Block invalido")

    p, fim = inicio + 8, pos - 8
    achados: list[bytes] = []
    while p + 12 <= fim:
        comprimento = struct.unpack_from("<Q", dados, p)[0]
        if comprimento < 4 or p + 8 + comprimento > fim:
            break
        id_bloco = struct.unpack_from("<I", dados, p + 8)[0]
        valor = dados[p + 12 : p + 8 + comprimento]

        if id_bloco in BLOCOS_DE_ASSINATURA:
            q = 0
            seq = struct.unpack_from("<I", valor, q)[0]
            q += 4
            fim_seq = min(len(valor), q + seq)
            while q + 4 <= fim_seq:
                n = struct.unpack_from("<I", valor, q)[0]
                q += 4
                assinante = valor[q : q + n]
                q += n
                try:
                    s = 0
                    nd = struct.unpack_from("<I", assinante, s)[0]
                    s += 4
                    sd = assinante[s : s + nd]
                    d = 0
                    n_digests = struct.unpack_from("<I", sd, d)[0]
                    d += 4 + n_digests
                    n_certs = struct.unpack_from("<I", sd, d)[0]
                    d += 4
                    fim_certs = min(len(sd), d + n_certs)
                    while d + 4 <= fim_certs:
                        nc = struct.unpack_from("<I", sd, d)[0]
                        d += 4
                        if nc and d + nc <= len(sd):
                            achados.append(sd[d : d + nc])
                        d += nc
                except struct.error:
                    continue
        p += 8 + comprimento
    return achados


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    impressoes = []
    for arg in sys.argv[1:]:
        caminho = Path(arg)
        cs = certificados(caminho)
        if not cs:
            print(f"{caminho}: nenhum certificado encontrado")
            return 1
        fp = hashlib.sha256(cs[0]).hexdigest()
        impressoes.append(fp)
        print(f"{caminho}: {fp}  (certificado de {len(cs[0])} bytes)")
    if len(impressoes) > 1:
        iguais = len(set(impressoes)) == 1
        print("MESMA chave de assinatura:" , "SIM — atualizacao sem desinstalar" if iguais else "NAO — o Android vai recusar instalar por cima")
        return 0 if iguais else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
