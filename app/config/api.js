export const apiUrl = 'https://api.jupiter.com.br'
export const loginUrl = 'https://api.jupiter.com.br'



const API_URL = 'https://api.jupiter.com.br/view/Geogrid'
const API_URL_V2 = 'http://10.1.2.217'

const configPostDefault = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

const formatarObjeto = params =>
  Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&')

export const obterTerminais = ({latitude, longitude}) => {
    return fetch(`${API_URL}/retornarTerminaisProximos?latitude=${latitude}&longitude=${longitude}`, {
        method: "GET",
    }).then((response) => {
        response => response.data
    })
/*   return axios.get(`${API_URL}/retornarTerminaisProximos?latitude=${latitude}&longitude=${longitude}`)
    .then(response => response.data) */
}

//export const obterTerminaisV2 = (latitude, longitude, distancia) => {
export const obterTerminaisV2 = (latitude, longitude, distancia) => {
/*   return axios.get(`${API_URL}/retornarTerminaisProximosV2?latitude=${latitude}&longitude=${longitude}&distancia=${distancia}`)
    .then(response => response.data) */
  return fetch(`${API_URL}/retornarTerminaisProximosV2?latitude=${latitude}&longitude=${longitude}&distancia=${distancia}`, {
      method: "GET",
  })
    .then(response => response.json())   
}

export const salvarConclusaoDeViabilidadeTecnica = (dados) => {
/*   const dadosFormatados = formatarObjeto(dados)
  return axios.post(`${API_URL_V2}/api/action/OrdemDeServico/salvarConclusaoViabilidadeTecnica`, dadosFormatados, configPostDefault)
    .then(response => response.data) */
}

export const obterCidadesPorEstado = id => 
/*   axios.get(`https://jupiter.com.br/2018/json/selecionar_localidades.php?codigoEstado=${id}`)
    .then(response => response.data) */
  fetch(`https://jupiter.com.br/2018/json/selecionar_localidades.php?codigoEstado=${id}`, {
      method: "GET"
  })
    .then(response => response.data)

export const obterBairrosPorCidade = id =>
/*   axios.get(`https://jupiter.com.br/2018/json/selecionar_bairros.php?codigoLocalidade=${id}`)
    .then(response => response.data) */
  fetch(`https://jupiter.com.br/2018/json/selecionar_bairros.php?codigoLocalidade=${id}`, {
      method: "GET"
  })
    .then(response => response.data)