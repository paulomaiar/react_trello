export function paraNumero(valor) {
    if (!valor || (typeof valor === 'string' && !valor.trim())) return null
    return Number(valor)
}
