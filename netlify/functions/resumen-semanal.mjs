// Resumen semanal de cómo se usó la página, por correo, cada lunes temprano (antes de la gerencia semanal).
// Netlify ejecuta las tareas programadas solo en el sitio publicado. El correo sale como un formulario
// "resumen" del propio sitio, que Netlify reenvía al correo configurado en Forms > Form notifications.
import { getStore } from "@netlify/blobs";
import { resumenPeriodo, combinar, presentar } from "../lib/resumen.mjs";
import { ahoraChile, sumarDias } from "../lib/comun.mjs";

// Limpieza: lo que promete el aviso de privacidad (resúmenes de uso hasta 24 meses) y registros de seguridad de más de 90 días.
async function limpiar() {
  const hoy = ahoraChile().fecha;
  const borrarAntes = async (store, prefijo, limite) => {
    for await (const p of store.list({ prefix: prefijo, paginate: true })) {
      for (const b of p.blobs) { const f = (b.key.match(/\d{4}-\d{2}-\d{2}/) || [])[0]; if (f && f < limite) await store.delete(b.key); }
    }
  };
  for (const amb of ["prod", "prueba", "preview", "local"]) {
    await borrarAntes(getStore("eventos"), `r/${amb}/`, sumarDias(hoy, -730));
    await borrarAntes(getStore("eventos"), `e/${amb}/`, sumarDias(hoy, -730));
    for (const tipo of ["sondeo", "csp", "inyeccion", "alertas"]) await borrarAntes(getStore("vigia"), `${tipo}/${amb}/`, sumarDias(hoy, -90));
    await borrarAntes(getStore("bienvenida"), `altas/${amb}/`, sumarDias(hoy, -400));
  }
}

const lista = pares => pares.length ? pares.map(([k, v]) => `${k} (${v})`).join(", ") : "sin datos";

export default async () => {
  try { await limpiar(); } catch (e) {}
  const sitio = process.env.URL || "https://angiessecret.netlify.app";
  const porDia = await resumenPeriodo(getStore("eventos"), "prod", 7);
  const t = presentar(combinar(porDia));
  const lineas = [
    `Semana: ${porDia[0].fecha} al ${porDia[porDia.length - 1].fecha}`,
    `Visitas: ${t.visitas} (personas distintas: ${t.visitantes}; nuevas: ${t.visitantes_nuevos}; visitas de registradas: ${t.visitas_de_registradas})`,
    `Pedidos enviados a WhatsApp desde la página: ${t.pedidos_enviados} (${t.conversion_pct}% de las visitas). Con envío: ${t.pedidos.con_envio}; para regalo: ${t.pedidos.con_regalo}; pidiendo descuento: ${t.pedidos.con_descuento}. Regalos armados: ${t.regalos_enviados}`,
    `Registros nuevos: ${t.registros.ok}`,
    `Camino de compra: ${t.embudo.visitas} visitas > ${t.embudo.vieron_un_producto} vieron un producto > ${t.embudo.agregaron_al_pedido} agregaron > ${t.embudo.enviaron_pedido} enviaron`,
    `De dónde llegan: ${lista(Object.entries(t.fuentes))}`,
    `Celular / computador: ${t.dispositivos.movil || 0} / ${t.dispositivos.pc || 0}`,
    `Más vistos: ${lista(t.productos_mas_vistos.slice(0, 5))}`,
    `Más agregados al pedido: ${lista(t.productos_mas_agregados.slice(0, 5))}`,
    `Lo que más buscan: ${lista(t.busquedas.slice(0, 8))}`,
    `Buscan y no encuentran (oportunidad de compra): ${lista(t.busquedas_sin_resultado)}`,
    `Ayudante: ${t.ayudante.abiertos} conversaciones; temas: ${lista(t.ayudante.temas.slice(0, 6))}; derivadas a una persona: ${Object.values(t.ayudante.derivaciones).reduce((a, b) => a + b, 0)}`,
    `Errores de la página: ${lista(t.errores_de_la_pagina.slice(0, 5))}`,
    `Panel completo: ${sitio}/panel.html`
  ];
  await fetch(sitio + "/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": "resumen", subject: "Resumen semanal de la página - Angie's Secret", semana: `${porDia[0].fecha} al ${porDia[porDia.length - 1].fecha}`, resumen: lineas.join("\n") }).toString()
  });
};

// Lunes a las 10:50 UTC (7:50 en Chile con horario de verano, 6:50 en invierno).
export const config = { schedule: "50 10 * * 1" };
