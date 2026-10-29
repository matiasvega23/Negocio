// Resume los eventos anónimos de la página por día y por período.
import { ahoraChile, sumarDias } from "./comun.mjs";

const sumar = (obj, k, n = 1) => { obj[k] = (obj[k] || 0) + n; };

// Resume los grupos de eventos de un día.
export function resumirLotes(lotes) {
  const ses = new Map(), vis = new Set(), nuevos = new Set();
  const r = {
    lotes: lotes.length, dispositivos: {}, fuentes: {}, paginas: {}, horas: {}, productos: {}, agregados: {},
    pedidos: { abiertos: 0, enviados: 0, prendas: 0, unidades: 0, con_envio: 0, con_regalo: 0, con_descuento: 0, recuperados: 0 },
    regalos_enviados: 0, wsp: {}, busquedas: {}, sin_resultado: {}, ayudante: { abiertos: 0, temas: {}, derivaciones: {} },
    faq: {}, errores: {}, registros: { ok: 0, fallidos: 0 }, tallas: 0, mayor: 0, textos_con_codigo: 0
  };
  const embudo = { producto: new Set(), agregar: new Set(), enviar: new Set() };
  for (const l of lotes) {
    vis.add(l.v); if (l.nv) nuevos.add(l.v);
    if (!ses.has(l.s)) ses.set(l.s, { d: l.d, o: l.o, r: l.r, h: l.h });
    else if (l.r) ses.get(l.s).r = true;
    for (const x of l.ev || []) {
      switch (x.e) {
        case "vista": sumar(r.paginas, x.pag); break;
        case "producto": sumar(r.productos, x.id); embudo.producto.add(l.s); break;
        case "agregar": sumar(r.agregados, x.id, x.n || 1); embudo.agregar.add(l.s); break;
        case "pedido_abrir": r.pedidos.abiertos++; break;
        case "pedido_enviar":
          r.pedidos.enviados++; r.pedidos.prendas += x.prendas || 0; r.pedidos.unidades += x.unidades || 0;
          if (x.envio) r.pedidos.con_envio++; if (x.regalo) r.pedidos.con_regalo++; if (x.descuento) r.pedidos.con_descuento++;
          embudo.enviar.add(l.s); break;
        case "pedido_recuperar": r.pedidos.recuperados++; break;
        case "buscar": sumar(x.res ? r.busquedas : r.sin_resultado, x.q); break;
        case "regalo_enviar": r.regalos_enviados++; break;
        case "registro": x.ok ? r.registros.ok++ : r.registros.fallidos++; break;
        case "ayudante_abrir": r.ayudante.abiertos++; break;
        case "ayudante_tema": sumar(r.ayudante.temas, x.tema); break;
        case "ayudante_derivar": sumar(r.ayudante.derivaciones, x.canal); break;
        case "faq": sumar(r.faq, x.id); break;
        case "wsp": sumar(r.wsp, x.lugar); break;
        case "error_js": sumar(r.errores, x.m); break;
        case "tallas": r.tallas++; break;
        case "mayor": r.mayor++; break;
        case "inyeccion": r.textos_con_codigo++; break;
      }
    }
  }
  for (const s of ses.values()) { sumar(r.dispositivos, s.d); sumar(r.fuentes, s.o); sumar(r.horas, s.h); }
  r.sesiones = ses.size;
  r.sesiones_registradas = [...ses.values()].filter(s => s.r).length;
  r.visitantes = vis.size;
  r.visitantes_nuevos = nuevos.size;
  r.embudo = { visitas: ses.size, vieron_un_producto: embudo.producto.size, agregaron_al_pedido: embudo.agregar.size, enviaron_pedido: embudo.enviar.size };
  r.vis = [...vis];
  return r;
}

const SUMABLES = ["dispositivos", "fuentes", "paginas", "horas", "productos", "agregados", "wsp", "busquedas", "sin_resultado", "faq", "errores"];

// Junta varios días en un solo resumen.
export function combinar(dias) {
  const t = resumirLotes([]);
  const vis = new Set();
  for (const r of dias) {
    t.lotes += r.lotes; t.sesiones += r.sesiones; t.sesiones_registradas += r.sesiones_registradas; t.visitantes_nuevos += r.visitantes_nuevos;
    (r.vis || []).forEach(v => vis.add(v));
    for (const k of SUMABLES) for (const [a, n] of Object.entries(r[k] || {})) sumar(t[k], a, n);
    for (const k of Object.keys(t.pedidos)) t.pedidos[k] += (r.pedidos || {})[k] || 0;
    for (const k of Object.keys(t.embudo)) t.embudo[k] += (r.embudo || {})[k] || 0;
    t.regalos_enviados += r.regalos_enviados || 0; t.tallas += r.tallas || 0; t.mayor += r.mayor || 0; t.textos_con_codigo += r.textos_con_codigo || 0;
    t.registros.ok += (r.registros || {}).ok || 0; t.registros.fallidos += (r.registros || {}).fallidos || 0;
    t.ayudante.abiertos += (r.ayudante || {}).abiertos || 0;
    for (const k of ["temas", "derivaciones"]) for (const [a, n] of Object.entries((r.ayudante || {})[k] || {})) sumar(t.ayudante[k], a, n);
  }
  t.visitantes = vis.size;
  delete t.vis;
  return t;
}

// Para la familia: lo más útil primero, y las búsquedas sin resultado solo si se repiten (protege la privacidad).
export function presentar(t) {
  const top = (o, n = 10, min = 1) => Object.entries(o).filter(([, v]) => v >= min).sort((a, b) => b[1] - a[1]).slice(0, n);
  const conversion = t.sesiones ? Math.round((t.pedidos.enviados / t.sesiones) * 1000) / 10 : 0;
  const sinResultado = top(t.sin_resultado, 15, 2);
  const otras = Object.values(t.sin_resultado).filter(v => v < 2).length;
  return {
    visitas: t.sesiones, visitantes: t.visitantes, visitantes_nuevos: t.visitantes_nuevos, visitas_de_registradas: t.sesiones_registradas,
    pedidos_enviados: t.pedidos.enviados, conversion_pct: conversion, pedidos: t.pedidos, regalos_enviados: t.regalos_enviados,
    registros: t.registros, embudo: t.embudo, dispositivos: t.dispositivos, fuentes: t.fuentes, horas: t.horas, paginas: t.paginas,
    productos_mas_vistos: top(t.productos), productos_mas_agregados: top(t.agregados), busquedas: top(t.busquedas, 15),
    busquedas_sin_resultado: sinResultado, busquedas_sin_resultado_unicas: otras,
    ayudante: { abiertos: t.ayudante.abiertos, temas: top(t.ayudante.temas, 15), derivaciones: t.ayudante.derivaciones },
    preguntas_frecuentes: top(t.faq, 15), clics_whatsapp: t.wsp, guia_tallas: t.tallas, consultas_por_mayor: t.mayor,
    errores_de_la_pagina: top(t.errores, 10), textos_con_codigo: t.textos_con_codigo
  };
}

// Lee (y guarda resumido) cada día del período.
export async function resumenPeriodo(store, amb, dias) {
  const hoy = ahoraChile().fecha;
  const porDia = [];
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = sumarDias(hoy, -i);
    const guardado = fecha < hoy ? await store.get(`r/${amb}/${fecha}`, { type: "json" }) : null;
    if (guardado) { porDia.push({ fecha, ...guardado }); continue; }
    const claves = [];
    for await (const p of store.list({ prefix: `e/${amb}/${fecha}/`, paginate: true })) p.blobs.forEach(b => claves.push(b.key));
    const lotes = (await Promise.all(claves.map(k => store.get(k, { type: "json" })))).filter(Boolean);
    const r = resumirLotes(lotes);
    if (fecha < hoy) {
      // Un día cerrado se guarda resumido y se borran los eventos sueltos (menos espacio, menos datos guardados).
      await store.setJSON(`r/${amb}/${fecha}`, r);
      for (const k of claves) await store.delete(k);
    }
    porDia.push({ fecha, ...r });
  }
  return porDia;
}
