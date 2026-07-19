# Escritos Portadas

Generador de portadas para el blog **Escritos Ricardo Lopez Reyero**.

- Medida base: `600 x 400 px`.
- Exportacion retina: `1200 x 800 px` con la misma proporcion.
- Cada portada nace con una semilla unica basada en minuto, segundo, decima de segundo, milisegundo y contador local.
- Puede exportar solo el degradado premium o agregar titulo.
- Analiza el escrito y prepara titulo, slug, categoria, canonical, descripcion SEO, alt text y palabras clave.
- Genera palabras clave tipo Google: frases buscables, entidades, keyword principal e intencion de busqueda.
- Incluye botones de copiar por campo y un bloque completo en el orden de publicacion del blog.
- Guarda automaticamente el ultimo proyecto en este navegador para reabrirlo como lo dejaste.
- Inserta una firma invisible en pixeles: `Ricardo López Reyero` / `RLR`.
- Usa el logo de Ricardo Lopez Reyero y favicon RLR.
- Puede subir cada PNG descargado a GitHub mediante un Cloudflare Worker seguro.
- No requiere backend ni instalacion: abre `index.html` o publicalo en GitHub Pages.

## Uso

1. Pega el escrito completo.
2. Pulsa `Analizar y llenar SEO`.
3. Copia cada campo en el orden sugerido para tu CMS.
4. Ajusta el titulo de la portada si hace falta.
5. Mueve el titulo con la cuadricula, los sliders o clicando/arrastrando sobre la portada.
6. Descarga `1X`, `2X` o copia el PNG.

## Publicacion

Este repo puede publicarse directo en GitHub Pages porque es una pagina estatica.

## Subida segura a GitHub

La app estatica no guarda tokens. Para que cada descarga tambien suba la imagen al repo:

1. Crea un token fine-grained de GitHub con acceso solo a `ricardolopezreyero/Escritos_portadas` y permiso `Contents: Read and write`.
2. Entra a la carpeta `worker`.
3. Ejecuta:

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put UPLOAD_KEY
wrangler deploy
```

4. Copia la URL del Worker.
5. En la app pulsa `GitHub` y pega:
   - URL del Worker.
   - La misma `UPLOAD_KEY`.

Desde ese momento, `Descargar 1X` y `Descargar 2X` tambien intentan guardar el PNG en:

```text
portadas/YYYY/MM/DD-HHMMSS-ms-nombre-del-archivo.png
```
