# Landing-Page-CardiAjuda

Landing page do **CardiAjuda** — telemedicina de cuidado cardíaco contínuo.

## Como rodar

Qualquer servidor estático funciona (a página é HTML + CSS + JS puro):

```bash
python3 -m http.server 8080
# ou: npx serve .
```

Abra `http://localhost:8080`.

## Estrutura

```
index.html              página única (hero, recursos, demonstração, perfis, depoimentos, CTA, rodapé)
app.js                  módulos: header, menu mobile, acesso (demo), medição (demo), animações
src/styles/styles.css   design system (tokens da marca) + estilos, mobile-first
src/scripts/vendor/     GSAP 3.13 + ScrollTrigger (vendored, sem CDN)
src/imagens/            logo oficial
```

## Identidade

Paleta da marca (tokens em `:root`): `#8b008b` (principal), `#4b0049` / `#750075` (escuros/gradientes),
`#b13fb1`, `#f3d4ee` (apoio), fundos `#fdf7fb` / `#fdeff7` / `#f9d9ec`,
texto `#26122a` / `#6b5468`, status verde `#2e9e4f`, âmbar `#e09400`, vermelho `#d62839`.
Tipografia: Open Sans.

## Observações

- Animações sutis com GSAP + ScrollTrigger (fade/slide ≤ 0.8s, parallax leve, contadores) —
  respeitam `prefers-reduced-motion` e animam apenas `transform`/`opacity`.
- O modal de acesso e a classificação de medições são **demonstrações** (sem backend;
  dados locais em `localStorage`).
- A classificação usa a **Diretriz Brasileira de Hipertensão Arterial (SBC, 2020)** para
  medida de consultório — sempre a categoria mais alta entre sistólica e diastólica
  (ótima &lt; 120/80 · normal 120–129/80–84 · pré-hipertensão 130–139/85–89 ·
  estágios 1 a 3 a partir de 140/90 · hipotensão &lt; 90/60) — e os critérios da
  **SBD/OMS** para glicemia de jejum (normal 70–99 · pré-diabetes 100–125 ·
  diabetes ≥ 126 · hipoglicemia &lt; 70 mg/dL). As faixas também estão visíveis
  no próprio site, no bloco “Tabelas de referência usadas na classificação”.
- Conteúdo de demonstração (números, depoimentos, mockups) deve ser revisado antes da publicação.
