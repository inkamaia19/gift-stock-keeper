import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'es' | 'en'
type Dict = Record<string, string>

const dicts: Record<Lang, Dict> = {
  es: {
    app_title: 'Panel',
    loading_session: 'Cargando sesión…',
    logout: 'Cerrar sesión',
    home: 'Inicio',
    settings_language: 'Idioma',
    sidebar_catalog: 'Catálogo',
    catalog_title: 'Catálogo',
    catalog_subtitle: 'Gestiona tus productos y servicios con una vista mínima y clara.',
    search_items: 'Buscar ítems...',
    filter_all: 'Todos',
    filter_available: 'Disponibles',
    filter_out: 'Agotados',
    filter_services: 'Servicios',
    view_grid: 'Cuadrícula',
    view_list: 'Lista',
    add_item: 'Agregar ítem',
    add_to_catalog: 'Agregar al catálogo',
    add_to_catalog_hint: 'Agrega un producto (con stock) o servicio (sin stock).',
    item_type: 'Tipo de ítem',
    product: 'Producto',
    service: 'Servicio',
    item_name: 'Nombre del ítem',
    item_name_ph_product: 'Ej., Polo Talla M',
    item_name_ph_service: 'Ej., Servicio de ventas',
    initial_stock: 'Stock inicial',
    item_photo: 'Foto del ítem',
    drag_or_select: 'Arrastra una imagen aquí o selecciona un archivo',
    select_file: 'selecciona un archivo',
    cancel: 'Cancelar',
    save: 'Guardar',
    results: 'resultado(s)'
    ,
    // Login
    login_title: 'Iniciar sesión',
    login_user: 'Usuario',
    login_code: 'Código de 6 dígitos',
    login_continue: 'Continuar',
    login_validating: 'Validando…',
    blocked_msg: 'Bloqueado por intentos fallidos. Inténtalo en',
    attempts_left: 'Te quedan {n} intento(s) antes del bloqueo.'
    ,
    // Index/Dashboard
    tx_history: 'Historial de transacciones',
    card_total_revenue: 'Ingresos Totales',
    card_commissions: 'Comisiones',
    card_sales_count: 'Ventas registradas',
    card_stock: 'Stock disponible',
    card_total_revenue_desc: 'Acumulado período actual',
    card_commissions_desc: 'Todas las ventas',
    card_sales_count_desc: 'Conteo de transacciones',
    card_stock_desc: 'Solo productos'
  },
  en: {
    app_title: 'Dashboard',
    loading_session: 'Loading session…',
    logout: 'Log out',
    home: 'Home',
    settings_language: 'Language',
    sidebar_catalog: 'Catalog',
    catalog_title: 'Catalog',
    catalog_subtitle: 'Manage your products and services with a clean view.',
    search_items: 'Search items...',
    filter_all: 'All',
    filter_available: 'Available',
    filter_out: 'Out of stock',
    filter_services: 'Services',
    view_grid: 'Grid',
    view_list: 'List',
    add_item: 'Add item',
    add_to_catalog: 'Add to Catalog',
    add_to_catalog_hint: 'Add a new product (with stock) or service (no stock).',
    item_type: 'Item Type',
    product: 'Product',
    service: 'Service',
    item_name: 'Item Name',
    item_name_ph_product: 'e.g., T-Shirt Size M',
    item_name_ph_service: 'e.g., Sales Consulting',
    initial_stock: 'Initial Stock',
    item_photo: 'Item Photo',
    drag_or_select: 'Drag an image here or select a file',
    select_file: 'select a file',
    cancel: 'Cancel',
    save: 'Save',
    results: 'result(s)'
    ,
    // Login
    login_title: 'Sign in',
    login_user: 'Username',
    login_code: '6-digit code',
    login_continue: 'Continue',
    login_validating: 'Validating…',
    blocked_msg: 'Locked due to failed attempts. Try in',
    attempts_left: '{n} attempt(s) left before lock.'
    ,
    // Index/Dashboard
    tx_history: 'Transactions History',
    card_total_revenue: 'Total Revenue',
    card_commissions: 'Commissions',
    card_sales_count: 'Recorded sales',
    card_stock: 'Available stock',
    card_total_revenue_desc: 'Current period total',
    card_commissions_desc: 'All sales',
    card_sales_count_desc: 'Transactions count',
    card_stock_desc: 'Products only'
  }
}

const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang)=>void; t: (k: string)=>string }>({ lang: 'es', setLang: () => {}, t: (k) => k })

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try { const v = localStorage.getItem('ui.lang') as Lang | null; return v === 'en' ? 'en' : 'es' } catch { return 'es' }
  })
  useEffect(() => { try { localStorage.setItem('ui.lang', lang) } catch {} }, [lang])
  const t = useMemo(() => (k: string) => dicts[lang][k] ?? k, [lang])
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
