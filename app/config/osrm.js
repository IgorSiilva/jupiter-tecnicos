const API_URL = 'http://router.project-osrm.org'
const API_URL2 = 'https://api.mapbox.com/directions/v5/mapbox'
const access_token = "pk.eyJ1IjoianVwaXRlcnRpIiwiYSI6ImNqcnRsZzNleTAxNXE0NG1pZGd4OHpoc2wifQ.-YEtkLYr8ej4o-LMnbR5yA"
export const obterCoordenadaMaisProxima = ({latitude, longitude}) => {
  const coordenada = [longitude, latitude].join()
  const url = `${API_URL}/nearest/v1/driving/${coordenada}`
  return fetch(url, {
    method : 'GET'
  }).then(response => response.json())
}

export const obterRotaEntreDoisPontos = (coordenada1, coordenada2) => { // coordenada: [longitude, latitude]
  const param1 = [coordenada1.longitude, coordenada1.latitude].join()
  const param2 = [coordenada2.longitude, coordenada2.latitude].join()
  //const url = `${API_URL}/route/v1/driving/${param1};${param2}?alternatives=true&geometries=geojson&overview=full`
  const url = `${API_URL2}/walking/${param1};${param2}?access_token=${access_token}&geometries=geojson`
  return fetch(url, {
    method : 'GET'
  }).then(response => response.json())
}